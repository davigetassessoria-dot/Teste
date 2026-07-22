import { useState, useCallback, useRef, useEffect } from 'react'
import { Header } from './components/Header'
import { ChatColumn } from './components/ChatColumn'
import { CodeColumn } from './components/CodeColumn'
import { PreviewColumn } from './components/PreviewColumn'
import { generateStream } from './lib/groq'
import { parseGeneratedFiles, buildPreviewHtml } from './lib/fileUtils'
import { loadProject, saveProject } from './lib/storage'
import type { ChatMessage, GeneratedFile, GenerationStatus } from './types'

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [files, setFiles] = useState<GeneratedFile[]>([])
  const [status, setStatus] = useState<GenerationStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [activeColumn, setActiveColumn] = useState<'chat' | 'code' | 'preview'>('chat')
  const [projectTitle, setProjectTitle] = useState('Untitled Project')
  const projectIdRef = useRef<string>(crypto.randomUUID())

  useEffect(() => {
    loadProject(projectIdRef.current).then((p) => {
      if (p) {
        setMessages(p.messages || [])
        setFiles(p.files || [])
        setProjectTitle(p.title || 'Untitled Project')
        if (p.files && p.files.length > 0) {
          setSelectedFile(p.files[0].path)
          setPreviewHtml(buildPreviewHtml(p.files))
        }
      }
    })
  }, [])

  useEffect(() => {
    if (messages.length > 0 || files.length > 0) {
      saveProject({
        id: projectIdRef.current,
        title: projectTitle,
        messages,
        files,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }
  }, [messages, files, projectTitle])

  const handleGenerate = useCallback(async (prompt: string) => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: prompt,
      createdAt: Date.now(),
    }
    setMessages(prev => [...prev, userMsg])
    setStatus('thinking')
    setError(null)

    const assistantMsgId = crypto.randomUUID()
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
    }
    setMessages(prev => [...prev, assistantMsg])

    try {
      let fullContent = ''
      const stream = generateStream(prompt, messages)
      
      setStatus('generating')
      
      for await (const chunk of stream) {
        fullContent += chunk
        setMessages(prev => prev.map(m => 
          m.id === assistantMsgId ? { ...m, content: fullContent } : m
        ))
      }

      const newFiles = parseGeneratedFiles(fullContent)
      if (newFiles.length > 0) {
        setFiles(newFiles)
        setSelectedFile(newFiles[0].path)
        setPreviewHtml(buildPreviewHtml(newFiles))
      }

      if (messages.length === 0) {
        setProjectTitle(prompt.slice(0, 30) + (prompt.length > 30 ? '...' : ''))
      }

      setStatus('done')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Generation failed'
      setError(msg)
      setStatus('error')
    }
  }, [messages, files])

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-[#e4e4e7] overflow-hidden">
      <Header 
        title={projectTitle} 
        status={status} 
        files={files} 
      />
      
      <main className="flex-1 flex gap-4 p-4 overflow-hidden">
        <ChatColumn 
          messages={messages}
          status={status}
          error={error}
          onGenerate={handleGenerate}
          className="w-[30%] flex-shrink-0"
        />
        
        <CodeColumn 
          files={files}
          selectedFile={selectedFile}
          onSelectFile={setSelectedFile}
          className="flex-1"
        />
        
        <PreviewColumn 
          html={previewHtml}
          hasFiles={files.length > 0}
          className="w-[32%] flex-shrink-0"
        />
      </main>
    </div>
  )
}

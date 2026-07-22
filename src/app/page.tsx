
'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { ChatPanel } from '@/components/chat-panel';
import { EditorPanel } from '@/components/editor-panel';
import { PreviewPanel } from '@/components/preview-panel';
import { FileTree } from '@/components/file-tree';
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  Code2, 
  Play, 
  Download,
  Zap
} from 'lucide-react';
import JSZip from 'jszip';

export default function AppForgeDashboard() {
  const { files, activeFile } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [view, setView] = useState<'code' | 'preview'>('code');

  const downloadProject = async () => {
    const zip = new JSZip();
    Object.entries(files).forEach(([path, file]) => {
      zip.file(path, file.content);
    });
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'appforge-project.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-zinc-300 overflow-hidden font-sans">
      {/* Sidebar - Chat */}
      <aside className={`${sidebarOpen ? 'w-[400px]' : 'w-0'} border-r border-zinc-800 transition-all duration-300 flex flex-col bg-[#0d0d0d]`}>
        {sidebarOpen && <ChatPanel />}
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col relative">
        {/* Toolbar */}
        <header className="h-12 border-b border-zinc-800 flex items-center justify-between px-4 bg-[#0d0d0d]">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-zinc-800 rounded-md transition-colors text-zinc-400"
            >
              {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>
            <div className="h-4 w-[1px] bg-zinc-800" />
            <div className="flex bg-zinc-900 rounded-lg p-1">
              <button 
                onClick={() => setView('code')}
                className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium transition-all ${view === 'code' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Code2 size={14} /> Code
              </button>
              <button 
                onClick={() => setView('preview')}
                className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium transition-all ${view === 'preview' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Play size={14} /> Preview
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold flex items-center gap-1.5">
              <Zap size={10} className="text-yellow-500" /> Grok Build Engine
            </span>
            <button 
              onClick={downloadProject}
              className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md text-xs transition-colors"
            >
              <Download size={14} /> Export
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {view === 'code' ? (
            <>
              <div className="w-64 border-r border-zinc-800 bg-[#0a0a0a]">
                <FileTree />
              </div>
              <div className="flex-1 overflow-hidden">
                <EditorPanel />
              </div>
            </>
          ) : (
            <div className="flex-1 bg-white">
              <PreviewPanel />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

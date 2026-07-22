
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { generateStream } from '@/lib/groq';

export function ChatPanel() {
  const { messages, addMessage, isGenerating, setIsGenerating, setFiles } = useAppStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, isGenerating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userPrompt = input.trim();
    setInput('');
    addMessage({ role: 'user', content: userPrompt });
    setIsGenerating(true);

    try {
      let fullResponse = '';
      const stream = generateStream(userPrompt, messages);
      
      for await (const chunk of stream) {
        fullResponse += chunk;
      }

      // Basic artifact parsing
      const fileRegex = /<appforgeAction type="file" filePath="([^"]+)">([\s\S]*?)<\/appforgeAction>/g;
      let match;
      const newFiles: any = { ...useAppStore.getState().files };
      
      while ((match = fileRegex.exec(fullResponse)) !== null) {
        const path = match[1];
        const content = match[2].trim();
        newFiles[path] = {
          name: path,
          content,
          language: path.endsWith('.css') ? 'css' : 'typescript'
        };
      }

      setFiles(newFiles);
      
      const explanation = fullResponse.split('<appforgeArtifact')[0].trim() || "App updated successfully!";
      addMessage({ role: 'assistant', content: explanation });

    } catch (err) {
      addMessage({ role: 'assistant', content: "Failed to generate response. Check your API key." });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="h-12 border-b border-zinc-800 flex items-center px-4 gap-2 bg-[#0b0b0d]">
        <Sparkles size={16} className="text-purple-500" />
        <span className="text-sm font-semibold text-zinc-100">AppForge Assistant</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${m.role === 'assistant' ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
              {m.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
            </div>
            <div className={`p-3 rounded-xl text-sm max-w-[85%] ${m.role === 'assistant' ? 'bg-zinc-900 border border-zinc-800 text-zinc-300' : 'bg-purple-600 text-white'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="flex gap-3 animate-pulse">
            <div className="w-7 h-7 rounded bg-purple-600 flex items-center justify-center">
              <Bot size={14} className="text-white" />
            </div>
            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs flex items-center gap-2">
              <Loader2 size={12} className="animate-spin" />
              Forging application...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-zinc-800">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Build me a weather dashboard..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-purple-500 resize-none min-h-[80px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
          />
          <button type="submit" disabled={isGenerating || !input.trim()} className="absolute bottom-3 right-3 p-1.5 bg-purple-600 text-white rounded-lg disabled:opacity-50">
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}

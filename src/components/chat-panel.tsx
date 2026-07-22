
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { generateApp } from '@/lib/puter';
import { Send, Bot, User, Sparkles } from 'lucide-react';

export function ChatPanel() {
  const { messages, addMessage, isGenerating, setIsGenerating, setFiles } = useAppStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userMsg = input.trim();
    setInput('');
    addMessage({ role: 'user', content: userMsg });
    setIsGenerating(true);

    try {
      const stream = await generateApp(userMsg, messages);
      let fullResponse = '';
      
      // Temporary: collect full response to parse JSON
      // In a real agent, we'd update files incrementally
      for await (const part of stream) {
        fullResponse += part.text;
      }

      try {
        // Find JSON in the response (Grok might add some text)
        const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.files) {
            const newFiles: any = {};
            Object.entries(parsed.files).forEach(([path, content]) => {
              newFiles[path] = {
                name: path,
                content: content as string,
                language: path.endsWith('.css') ? 'css' : 'typescript'
              };
            });
            setFiles(newFiles);
          }
          addMessage({ role: 'assistant', content: parsed.explanation || "App updated successfully." });
        } else {
          addMessage({ role: 'assistant', content: fullResponse });
        }
      } catch (e) {
        addMessage({ role: 'assistant', content: fullResponse });
      }
    } catch (err) {
      addMessage({ role: 'assistant', content: "Sorry, I encountered an error during generation." });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
        <Sparkles className="text-indigo-500 w-5 h-5" />
        <h2 className="font-semibold text-zinc-100">AppForge Assistant</h2>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
              <Bot className="text-indigo-500 w-6 h-6" />
            </div>
            <div>
              <h3 className="text-zinc-200 font-medium">Build your next idea</h3>
              <p className="text-sm text-zinc-500 mt-1">Describe the app you want to build and let Grok do the heavy lifting.</p>
            </div>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'assistant' ? 'items-start' : 'items-start flex-row-reverse'}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-indigo-600' : 'bg-zinc-800'}`}>
              {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className={`p-3 rounded-2xl text-sm leading-relaxed max-w-[85%] ${msg.role === 'assistant' ? 'bg-zinc-900 border border-zinc-800' : 'bg-indigo-600 text-white'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
              <Bot size={16} />
            </div>
            <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs">
              Grok is forging your application...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-zinc-800 bg-[#0a0a0a]">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your app..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-indigo-500 min-h-[100px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button 
            type="submit"
            disabled={isGenerating}
            className="absolute bottom-3 right-3 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
        <p className="text-[10px] text-zinc-600 mt-2 text-center uppercase tracking-tighter">
          Powered by Puter.js & xAI Grok Build
        </p>
      </div>
    </div>
  );
}

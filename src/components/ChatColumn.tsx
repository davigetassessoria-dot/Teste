
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, Loader2, RefreshCw } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { puter } from '@heyputer/puter.js';

export function ChatColumn({ className }: { className?: string }) {
  const { messages, addMessage, updateLastMessage, isGenerating, setIsGenerating, setFiles, files, setActiveFile } = useAppStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [messages, isGenerating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userPrompt = input.trim();
    setInput('');
    addMessage({ role: 'user', content: userPrompt });
    setIsGenerating(true);

    // Adiciona mensagem vazia do assistente para o stream
    addMessage({ role: 'assistant', content: '' });

    try {
      const systemPrompt = `Você é um expert em criar interfaces React + Tailwind de alta qualidade através do AppForge.
Sempre gere código completo, moderno e visualmente polido. Nunca entregue interfaces pobres ou básicas.
Use espaçamentos bons, cores elegantes, bordas arredondadas e hierarquia visual clara.
Gere APENAS JavaScript + JSX (sem TypeScript).

IMPORTANTE: Toda a sua resposta deve ser um objeto JSON puro no seguinte formato, sem textos explicativos fora do JSON:
{
  "explanation": "Breve descrição das melhorias",
  "files": [
    { "path": "App.tsx", "content": "Código JSX completo aqui" }
  ]
}`;

      // Prepara o contexto
      const currentFilesContext = Object.keys(files).length > 0 
        ? `\nCÓDIGO ATUAL:\n${JSON.stringify(Object.entries(files).map(([p, f]) => ({ path: p, content: f.content })))}`
        : "";

      const historyContext = messages.slice(-4).map(m => ({ role: m.role, content: m.content }));

      const messagesForPuter = [
        { role: "system", content: systemPrompt },
        ...historyContext,
        { role: "user", content: `Ação: ${userPrompt}${currentFilesContext}` }
      ];

      // Chamada via Puter.js com Streaming e Grok Build 0.1
      const response = await puter.ai.chat(messagesForPuter, {
        model: 'x-ai/grok-build-0.1',
        stream: true,
        temperature: 0.3
      });

      let fullContent = '';
      for await (const part of response) {
        if (part.text) {
          fullContent += part.text;
          updateLastMessage(fullContent);
        }
      }

      // Tenta extrair e parsear o JSON da resposta
      try {
        // Encontra o JSON dentro de blocos de código ou na string pura
        const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          const artifacts: Record<string, any> = {};
          
          if (result.files && Array.isArray(result.files)) {
            result.files.forEach((file: any) => {
              const path = file.path.replace(/^src\//, '').replace(/^\//, '');
              artifacts[path] = {
                name: path,
                content: file.content,
                language: path.endsWith('.css') ? 'css' : 'javascript'
              };
            });

            if (Object.keys(artifacts).length > 0) {
              setFiles(artifacts);
              const firstFile = Object.keys(artifacts)[0];
              if (firstFile) setActiveFile(firstFile);
            }
          }
          
          if (result.explanation) {
             updateLastMessage(result.explanation);
          }
        }
      } catch (parseErr) {
        console.warn("Falha ao parsear artefatos, mas a mensagem foi mantida.", parseErr);
      }

    } catch (err: any) {
      console.error(err);
      updateLastMessage(`Erro ao forjar aplicação: ${err.message}. Verifique sua conexão ou limite do Puter.`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`flex flex-col bg-[#111113] rounded-xl border border-[#27272a] overflow-hidden shadow-2xl ${className}`}>
      <div className="h-12 border-b border-[#27272a] flex items-center justify-between px-4 bg-[#1a1a1f]/40">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-purple-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Grok Build 0.1 (via Puter)</span>
        </div>
        {isGenerating && (
          <div className="flex items-center gap-2 text-[10px] text-purple-400 font-bold uppercase animate-pulse">
            <RefreshCw size={10} className="animate-spin" />
            Forging
          </div>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 forge-scroll">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
              <Bot size={32} />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-200">Pronto para Forjar</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-[200px] mx-auto">
                Descreva o app e o Grok Build 0.1 irá construí-lo em tempo real.
              </p>
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
              m.role === 'assistant' 
                ? 'bg-[#1a1a1f] border-[#27272a] text-purple-400' 
                : 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/10'
            }`}>
              {m.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
            </div>
            <div className={`p-3 rounded-2xl text-[13px] max-w-[85%] leading-relaxed ${
              m.role === 'assistant' 
                ? 'bg-[#1a1a1f] border border-[#27272a] text-zinc-300' 
                : 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
            }`}>
              {m.content || (isGenerating && i === messages.length - 1 ? "..." : "")}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-[#09090b]">
        <form onSubmit={handleSubmit} className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { 
              if (e.key === 'Enter' && !e.shiftKey) { 
                e.preventDefault(); 
                handleSubmit(e as any); 
              } 
            }}
            placeholder="Forje seu próximo app..."
            className="w-full bg-[#111113] border border-[#27272a] rounded-xl px-4 py-3 pr-10 text-[13px] text-zinc-200 focus:outline-none focus:border-purple-600/50 transition-all resize-none min-h-[80px] placeholder:text-zinc-600"
          />
          <button 
            type="submit" 
            disabled={isGenerating || !input.trim()} 
            className="absolute bottom-3 right-3 p-1.5 bg-purple-600 text-white rounded-lg disabled:opacity-30 hover:bg-purple-500 transition-all shadow-lg shadow-purple-900/20"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}

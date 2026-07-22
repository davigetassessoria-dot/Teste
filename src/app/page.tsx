'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ChatColumn } from '@/components/ChatColumn';
import { CodeColumn } from '@/components/CodeColumn';
import { PreviewColumn } from '@/components/PreviewColumn';
import { ActivityBar } from '@/components/ActivityBar';
import { useAppStore } from '@/lib/store';
import { buildPreviewHtml } from '@/lib/fileUtils';
import { Settings, X, Cpu, Palette, Zap } from 'lucide-react';

export default function AppForge() {
  const { 
    files, 
    isGenerating, 
    messages, 
    showChat, 
    showCode, 
    showPreview, 
    activePanel, 
    setActivePanel 
  } = useAppStore();
  
  const [previewHtml, setPreviewHtml] = useState('');
  const [projectTitle, setProjectTitle] = useState('Novo Projeto AppForge');

  useEffect(() => {
    const firstUserMsg = messages.find(m => m.role === 'user');
    if (firstUserMsg && projectTitle === 'Novo Projeto AppForge') {
      const title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '');
      setProjectTitle(title);
    }
  }, [messages, projectTitle]);

  useEffect(() => {
    const fileList = Object.values(files);
    if (fileList.length > 0) {
      setPreviewHtml(buildPreviewHtml(fileList));
    }
  }, [files]);

  const status = isGenerating ? 'generating' : messages.length > 0 ? 'done' : 'idle';

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-[#e4e4e7] overflow-hidden">
      <Header 
        title={projectTitle} 
        status={status} 
        files={Object.values(files)} 
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar (IDE Navigation) */}
        <ActivityBar />

        <main className="flex-1 flex bg-[#1a1a1f] gap-[1px] overflow-hidden">
          {/* Coluna de Chat/AI */}
          {showChat && (
            <div className="w-[28%] min-w-[320px] bg-[#09090b] flex flex-col shadow-xl z-10">
              <ChatColumn className="flex-1 rounded-none border-0" />
            </div>
          )}
          
          {/* Coluna de Código (Editor IDE) */}
          {showCode && (
            <div className="flex-1 min-w-[400px] bg-[#09090b] flex flex-col relative">
              <CodeColumn className="flex-1 rounded-none border-0" />
            </div>
          )}
          
          {/* Coluna de Preview */}
          {showPreview && (
            <div className={`bg-[#09090b] ${showCode ? 'w-[38%]' : 'flex-1'} min-w-[350px] flex flex-col`}>
              <PreviewColumn 
                html={previewHtml} 
                className="flex-1 rounded-none border-0" 
              />
            </div>
          )}
        </main>
      </div>

      {/* Modal de Configurações Estilo IDE */}
      {activePanel === 'settings' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#111113] border border-[#27272a] rounded-3xl w-full max-w-lg overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] transform animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-[#27272a] bg-[#1a1a1f]/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600/20 rounded-xl">
                  <Settings size={20} className="text-purple-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-100">Configurações da IDE</h2>
                  <p className="text-[10px] text-zinc-500 font-medium">Personalize seu ambiente de forja</p>
                </div>
              </div>
              <button onClick={() => setActivePanel('chat')} className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-500 transition-all hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto forge-scroll">
              {/* Nome do Projeto */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <Palette size={14} className="text-zinc-500" />
                  <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Projeto</h3>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-500 uppercase block mb-2 px-1">Nome da Aplicação</label>
                  <input 
                    type="text" 
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600/50 transition-all"
                  />
                </div>
              </section>

              {/* Inteligência Artificial */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <Cpu size={14} className="text-zinc-500" />
                  <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Motor de IA</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="p-4 rounded-2xl bg-purple-600/5 border border-purple-600/20 flex items-center justify-between group hover:border-purple-600/40 transition-all">
                    <div className="flex items-center gap-3">
                      <Zap size={16} className="text-purple-400" />
                      <div>
                        <p className="text-xs font-bold text-zinc-200">Llama 3.3 70B (Groq)</p>
                        <p className="text-[10px] text-zinc-500">Ultra veloz, ideal para iterações</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  </div>
                </div>
              </section>
            </div>

            <div className="p-6 bg-[#09090b] border-t border-[#27272a] flex justify-end gap-3">
              <button 
                onClick={() => setActivePanel('chat')}
                className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-bold rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={() => setActivePanel('chat')}
                className="px-8 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold rounded-xl transition-all shadow-lg shadow-purple-900/20"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

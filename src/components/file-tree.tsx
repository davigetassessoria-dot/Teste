
'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { FileCode, Hash, ChevronRight } from 'lucide-react';

export function FileTree() {
  const { files, activeFile, setActiveFile } = useAppStore();

  return (
    <div className="p-2 space-y-1">
      <div className="px-3 py-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2">
        <ChevronRight size={12} /> Project Files
      </div>
      {Object.keys(files).map((path) => (
        <button
          key={path}
          onClick={() => setActiveFile(path)}
          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors ${
            activeFile === path 
              ? 'bg-indigo-600/10 text-indigo-400' 
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
          }`}
        >
          {path.endsWith('.css') ? <Hash size={14} /> : <FileCode size={14} />}
          {path}
        </button>
      ))}
    </div>
  );
}

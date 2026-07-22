
'use client';

import React from 'react';
import { Files, MessageSquare, Settings, Github, Boxes } from 'lucide-react';

export function ActivityBar() {
  return (
    <div className="w-12 border-r border-zinc-800 flex flex-col items-center py-4 gap-4 bg-[#09090b]">
      <div className="w-8 h-8 rounded bg-purple-600 flex items-center justify-center mb-2">
        <Boxes size={20} className="text-white" />
      </div>
      
      <button className="p-2 text-zinc-400 hover:text-purple-400 transition-colors bg-zinc-800/50 rounded">
        <MessageSquare size={20} />
      </button>
      
      <button className="p-2 text-zinc-600 hover:text-zinc-400 transition-colors">
        <Files size={20} />
      </button>

      <div className="mt-auto flex flex-col gap-4">
        <button className="p-2 text-zinc-600 hover:text-zinc-400 transition-colors">
          <Github size={20} />
        </button>
        <button className="p-2 text-zinc-600 hover:text-zinc-400 transition-colors">
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
}

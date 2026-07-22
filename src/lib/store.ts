
import { create } from 'zustand';

export interface FileSystemItem {
  name: string;
  content: string;
  language: string;
}

interface AppForgeState {
  files: Record<string, FileSystemItem>;
  activeFile: string | null;
  isGenerating: boolean;
  messages: { role: 'user' | 'assistant'; content: string }[];
  
  setFiles: (files: Record<string, FileSystemItem>) => void;
  updateFile: (path: string, content: string) => void;
  setActiveFile: (path: string) => void;
  addMessage: (message: { role: 'user' | 'assistant'; content: string }) => void;
  setIsGenerating: (status: boolean) => void;
}

export const useAppStore = create<AppForgeState>((set) => ({
  files: {
    'App.tsx': {
      name: 'App.tsx',
      content: 'import React from "react";\n\nexport default function App() {\n  return (\n    <div className="p-8 text-center">\n      <h1 className="text-4xl font-bold text-indigo-600">Hello AppForge!</h1>\n      <p className="mt-4 text-zinc-500">Describe your next big idea in the chat to start forging.</p>\n    </div>\n  );\n}',
      language: 'typescript'
    }
  },
  activeFile: 'App.tsx',
  isGenerating: false,
  messages: [],

  setFiles: (newFiles) => set({ files: newFiles }),
  updateFile: (path, content) => set((state) => ({
    files: {
      ...state.files,
      [path]: { ...state.files[path], content }
    }
  })),
  setActiveFile: (path) => set({ activeFile: path }),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
}));

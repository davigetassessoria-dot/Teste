
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FileContent {
  name: string;
  content: string;
  language: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AppState {
  files: Record<string, FileContent>;
  messages: ChatMessage[];
  activeFile: string | null;
  isGenerating: boolean;
  // UI States
  activePanel: 'chat' | 'code' | 'preview' | 'settings';
  showChat: boolean;
  showCode: boolean;
  showPreview: boolean;
  
  setFiles: (files: Record<string, FileContent>) => void;
  updateFile: (path: string, content: string) => void;
  addMessage: (message: ChatMessage) => void;
  updateLastMessage: (content: string) => void;
  setActiveFile: (path: string | null) => void;
  setIsGenerating: (status: boolean) => void;
  setActivePanel: (panel: 'chat' | 'code' | 'preview' | 'settings') => void;
  togglePanel: (panel: 'chat' | 'code' | 'preview') => void;
  resetApp: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      files: {},
      messages: [],
      activeFile: null,
      isGenerating: false,
      activePanel: 'chat',
      showChat: true,
      showCode: true,
      showPreview: true,

      setFiles: (newFiles) => set((state) => {
        const mergedFiles = { ...state.files, ...newFiles };
        const paths = Object.keys(mergedFiles);
        return { 
          files: mergedFiles,
          activeFile: state.activeFile && mergedFiles[state.activeFile] ? state.activeFile : paths[0] || null
        };
      }),
      updateFile: (path, content) =>
        set((state) => ({
          files: {
            ...state.files,
            [path]: { ...state.files[path], content },
          },
        })),
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      updateLastMessage: (content) =>
        set((state) => {
          const newMessages = [...state.messages];
          if (newMessages.length > 0) {
            newMessages[newMessages.length - 1].content = content;
          }
          return { messages: newMessages };
        }),
      setActiveFile: (path) => set({ activeFile: path }),
      setIsGenerating: (status) => set({ isGenerating: status }),
      setActivePanel: (panel) => set({ activePanel: panel }),
      togglePanel: (panel) => set((state) => {
        if (panel === 'chat') return { showChat: !state.showChat };
        if (panel === 'code') return { showCode: !state.showCode };
        if (panel === 'preview') return { showPreview: !state.showPreview };
        return {};
      }),
      resetApp: () => set({ files: {}, messages: [], activeFile: null, isGenerating: false }),
    }),
    {
      name: 'appforge-storage-v4',
      partialize: (state) => ({ 
        files: state.files, 
        messages: state.messages, 
        activeFile: state.activeFile,
        showChat: state.showChat,
        showCode: state.showCode,
        showPreview: state.showPreview
      }),
    }
  )
);

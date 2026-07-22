
'use client';

import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { css } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';
import { useAppStore } from '@/lib/store';
import { FileCode, X } from 'lucide-react';

export function EditorPanel() {
  const { files, activeFile, updateFile, setActiveFile } = useAppStore();
  const currentFile = activeFile ? files[activeFile] : null;

  if (!currentFile) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm italic">
        Select a file to edit
      </div>
    );
  }

  const getExtensions = () => {
    if (currentFile.language === 'css') {
      return [css()];
    }
    // No CodeMirror 6, o suporte a TypeScript e JSX é feito via @codemirror/lang-javascript
    const isTS = currentFile.name.endsWith('.ts') || currentFile.name.endsWith('.tsx');
    const isJSX = currentFile.name.endsWith('.jsx') || currentFile.name.endsWith('.tsx');
    return [javascript({ jsx: isJSX, typescript: isTS })];
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="h-10 border-b border-zinc-800 bg-[#0b0b0d] flex overflow-x-auto">
        {Object.keys(files).map((path) => (
          <div
            key={path}
            onClick={() => setActiveFile(path)}
            className={`group px-3 flex items-center gap-2 text-xs border-r border-zinc-800 cursor-pointer h-full transition-colors ${
              activeFile === path ? 'bg-[#111113] text-purple-400' : 'text-zinc-500 hover:bg-zinc-800/50'
            }`}
          >
            <FileCode size={12} />
            {path}
            {Object.keys(files).length > 1 && (
               <X size={10} className="ml-1 opacity-0 group-hover:opacity-100 hover:text-white" />
            )}
          </div>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <CodeMirror
          value={currentFile.content}
          theme={oneDark}
          height="100%"
          extensions={getExtensions()}
          onChange={(value) => updateFile(activeFile!, value)}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLine: true,
          }}
          className="h-full text-[13px]"
        />
      </div>
    </div>
  );
}

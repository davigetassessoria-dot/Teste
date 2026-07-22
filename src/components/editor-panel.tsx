
'use client';

import React from 'react';
import Editor from '@monaco-editor/react';
import { useAppStore } from '@/lib/store';

export function EditorPanel() {
  const { files, activeFile, updateFile } = useAppStore();
  const file = activeFile ? files[activeFile] : null;

  if (!file) return null;

  return (
    <Editor
      height="100%"
      theme="vs-dark"
      language={file.language}
      value={file.content}
      onChange={(value) => updateFile(activeFile!, value || '')}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        padding: { top: 20 },
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
    />
  );
}

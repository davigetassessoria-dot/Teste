
'use client';

import React, { useMemo, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { RotateCw, ExternalLink, Globe, AlertCircle } from 'lucide-react';

export function PreviewPanel() {
  const { files } = useAppStore();
  const [key, setKey] = useState(0);

  const srcDoc = useMemo(() => {
    const appFile = files['App.tsx']?.content || '';
    const cssFile = files['index.css']?.content || '';

    // Transform App.tsx to valid script
    let transformedCode = appFile
      .replace(/import\s+.*?\s+from\s+['"][^'"]+['"];?\n?/g, '') // Remove imports
      .replace(/export\s+default\s+function\s+App/, 'function App')
      .replace(/export\s+default\s+App/, '');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            ${cssFile}
            body { margin: 0; padding: 0; background: #fff; }
            .error-container { 
              padding: 20px; 
              background: #fef2f2; 
              color: #991b1b; 
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
              border: 1px solid #fee2e2;
              border-radius: 8px;
              margin: 20px;
            }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="module">
            import React, { useState, useEffect, useMemo, useCallback, useRef } from 'https://esm.sh/react@18.2.0';
            import { createRoot } from 'https://esm.sh/react-dom@18.2.0/client';

            // Make hooks available globally within the preview
            window.React = React;
            window.useState = useState;
            window.useEffect = useEffect;
            window.useMemo = useMemo;
            window.useCallback = useCallback;
            window.useRef = useRef;

            const rootElement = document.getElementById('root');

            function ErrorDisplay({ message }) {
              return React.createElement('div', { className: 'error-container' }, 
                React.createElement('h2', { style: { marginTop: 0, fontSize: '18px' } }, '⚠️ Runtime Error'),
                React.createElement('pre', { style: { whiteSpace: 'pre-wrap', fontSize: '14px' } }, message)
              );
            }

            try {
              ${transformedCode}
              
              if (typeof App !== 'function') {
                throw new Error('Component "App" was not found or is not a valid function. Ensure your code defines and exports an App function.');
              }

              const root = createRoot(rootElement);
              root.render(React.createElement(App));
            } catch (err) {
              const root = createRoot(rootElement);
              root.render(React.createElement(ErrorDisplay, { message: err.stack || err.message }));
            }
          </script>
        </body>
      </html>
    `;
  }, [files]);

  return (
    <div className="flex flex-col h-full bg-[#09090b]">
      <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-4 bg-[#0b0b0d]">
        <div className="flex items-center gap-2 text-zinc-400">
           <Globe size={14} />
           <span className="text-[11px] font-medium tracking-wide uppercase">Browser Preview</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setKey(k => k + 1)} 
            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-500 transition-colors"
            title="Refresh Preview"
          >
            <RotateCw size={14} />
          </button>
          <button className="p-1.5 hover:bg-zinc-800 rounded text-zinc-500 transition-colors">
            <ExternalLink size={14} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-3 flex flex-col overflow-hidden">
        <div className="flex-1 bg-white rounded-lg overflow-hidden shadow-2xl border border-zinc-800/50 relative">
          <iframe
            key={key}
            srcDoc={srcDoc}
            title="Preview"
            className="w-full h-full border-none"
            sandbox="allow-scripts"
          />
        </div>
      </div>
    </div>
  );
}

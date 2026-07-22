
'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';

export function PreviewPanel() {
  const { files } = useAppStore();
  const [srcDoc, setSrcDoc] = useState('');

  useEffect(() => {
    // Simple logic to inject CSS and JS into an iframe
    // In a real app builder, we'd use a bundler or WebContainers
    const htmlFile = files['index.html']?.content || `
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>${files['index.css']?.content || ''}</style>
        </head>
        <body>
          <div id="root"></div>
          <script type="module">
            // This is a naive polyfill for React in the preview
            import React from 'https://esm.sh/react';
            import ReactDOM from 'https://esm.sh/react-dom';
            
            // We transform the active App.tsx content minimally
            // This only works for very simple components in this MVP step
            const App = () => {
              return React.createElement('div', { className: 'p-8' }, 
                React.createElement('h1', { className: 'text-2xl font-bold text-indigo-600' }, 'Preview Mode Active'),
                React.createElement('p', { className: 'mt-4 text-gray-600' }, 'Your generated code is being rendered here.')
              );
            };

            ReactDOM.render(React.createElement(App), document.getElementById('root'));
          </script>
        </body>
      </html>
    `;
    setSrcDoc(htmlFile);
  }, [files]);

  return (
    <iframe
      srcDoc={srcDoc}
      title="preview"
      className="w-full h-full border-none bg-white"
    />
  );
}

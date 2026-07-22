import { FileContent } from './store';

/**
 * Constrói um documento HTML robusto para o Live Preview.
 * Suporta múltiplos arquivos e injeta Lucide Icons e Framer Motion (opcional).
 */
export function buildPreviewHtml(files: FileContent[] | Record<string, FileContent>): string {
  const fileList = Array.isArray(files) ? files : Object.values(files);
  const appFile = fileList.find(f => f.name.toLowerCase().includes('app'));
  if (!appFile) return '';

  const cssFiles = fileList.filter(f => f.name.endsWith('.css'));
  const cssContent = cssFiles.map(f => f.content).join('\n\n');

  // Limpa imports/exports para execução direta no Babel Standalone
  const componentCode = appFile.content
    .replace(/import\s+.*?\s+from\s+['"][^'"]+['"];?\n?/g, '')
    .replace(/export\s+default\s+function\s+App/g, 'function App')
    .replace(/export\s+default\s+App/g, '')
    .replace(/export\s+function\s+/g, 'function ')
    .trim();

  return `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    ${cssContent}
    body { 
      margin: 0; 
      padding: 0; 
      background: #f8fafc; 
      min-height: 100vh; 
      font-family: 'Inter', system-ui, -apple-system, sans-serif; 
    }
    #root { min-height: 100vh; }
    /* Estilização para o scrollbar no preview */
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #f1f1f1; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { 
      useState, useEffect, useMemo, useCallback, useRef, useReducer, useContext, useLayoutEffect 
    } = React;

    // Injeção global para o código gerado
    window.useState = useState;
    window.useEffect = useEffect;
    window.useMemo = useMemo;
    window.useCallback = useCallback;
    window.useRef = useRef;
    window.useReducer = useReducer;
    window.useContext = useContext;
    window.useLayoutEffect = useLayoutEffect;
    window.React = React;

    try {
      ${componentCode}

      if (typeof App !== 'function') {
        throw new Error('O componente "App" não foi definido. Certifique-se de definir uma function App().');
      }

      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(<App />);
      
      // Inicializa ícones lucide se houver
      setTimeout(() => {
        if (window.lucide) {
          window.lucide.createIcons();
        }
      }, 100);

    } catch (err) {
      console.error('Preview Runtime Error:', err);
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(
        <div style={{ 
          padding: '32px', 
          color: '#991b1b', 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fee2e2', 
          borderRadius: '16px', 
          margin: '24px', 
          fontFamily: 'monospace',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
        }}>
          <h2 style={{ marginTop: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠️</span> Erro de Renderização
          </h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.5', background: '#00000005', padding: '16px', borderRadius: '8px' }}>
            {err.message}
          </pre>
          <p style={{ fontSize: '13px', opacity: 0.8, marginTop: '16px' }}>
            Dica: Verifique se todos os hooks estão sendo usados corretamente e se não há erros de sintaxe no código gerado.
          </p>
        </div>
      );
    }
  </script>
</body>
</html>`;
}

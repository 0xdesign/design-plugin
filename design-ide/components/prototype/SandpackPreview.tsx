'use client';

import { useMemo } from 'react';
import {
  SandpackProvider,
  SandpackPreview as SandpackPreviewComponent,
  SandpackCodeEditor,
} from '@codesandbox/sandpack-react';
import { cn } from '@/lib/utils';

interface SandpackPreviewProps {
  code: string;
  showCode?: boolean;
  className?: string;
}

export function SandpackPreview({
  code,
  showCode = false,
  className,
}: SandpackPreviewProps) {
  // Wrap the component code in App.tsx structure
  const files = useMemo(() => {
    // Check if code already has a default export
    const hasDefaultExport = code.includes('export default');

    let componentCode = code;

    // If no default export, wrap it
    if (!hasDefaultExport) {
      componentCode = `${code}\n\nexport default function App() {\n  return <Component />;\n}`;
    }

    return {
      '/App.tsx': {
        code: componentCode,
        active: true,
      },
      '/index.tsx': {
        code: `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
      },
      '/styles.css': {
        code: `@import url('https://cdn.jsdelivr.net/npm/tailwindcss@3.4.1/src/css/preflight.css');

/* Tailwind utilities - using CDN for preview */
@import url('https://cdn.tailwindcss.com');

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}`,
      },
      '/public/index.html': {
        code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
      },
    };
  }, [code]);

  return (
    <div className={cn('h-full w-full rounded-lg overflow-hidden border', className)}>
      <SandpackProvider
        template="react-ts"
        files={files}
        theme="light"
        options={{
          externalResources: ['https://cdn.tailwindcss.com'],
          classes: {
            'sp-wrapper': 'h-full',
            'sp-layout': 'h-full',
            'sp-stack': 'h-full',
          },
        }}
        customSetup={{
          dependencies: {
            'lucide-react': 'latest',
          },
        }}
      >
        <div className={cn('h-full flex', showCode ? 'flex-row' : 'flex-col')}>
          {showCode && (
            <div className="w-1/2 h-full border-r">
              <SandpackCodeEditor
                showTabs={false}
                showLineNumbers
                showInlineErrors
                style={{ height: '100%' }}
              />
            </div>
          )}
          <div className={cn('h-full', showCode ? 'w-1/2' : 'w-full')}>
            <SandpackPreviewComponent
              showNavigator={false}
              showRefreshButton
              style={{ height: '100%' }}
            />
          </div>
        </div>
      </SandpackProvider>
    </div>
  );
}

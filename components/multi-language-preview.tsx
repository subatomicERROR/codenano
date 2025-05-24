"use client"

import { useState, useEffect, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { RefreshCw, X } from "lucide-react"

interface MultiLanguagePreviewProps {
  mode: string
  files: Array<{ name: string; content: string; path: string }>
  consoleOutput?: Array<{ type: string; content: string }>
  onClearConsole?: () => void
}

export default function MultiLanguagePreview({
  mode,
  files,
  consoleOutput = [],
  onClearConsole = () => {},
}: MultiLanguagePreviewProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "console">("preview")
  const [isLoading, setIsLoading] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Update preview when files change
  useEffect(() => {
    const debounce = setTimeout(() => {
      updatePreview()
    }, 1000)

    return () => clearTimeout(debounce)
  }, [files, mode])

  // Update preview based on mode
  const updatePreview = () => {
    setIsLoading(true)

    switch (mode) {
      case "html":
        updateHtmlPreview()
        break
      case "react":
        updateReactPreview()
        break
      case "python":
        updatePythonPreview()
        break
      case "markdown":
        updateMarkdownPreview()
        break
      case "nextjs":
        updateNextJsPreview()
        break
      default:
        updateHtmlPreview()
    }

    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }

  // Update HTML preview
  const updateHtmlPreview = () => {
    const htmlFile = files.find((file) => file.path.endsWith(".html"))
    const cssFile = files.find((file) => file.path.endsWith(".css"))
    const jsFile = files.find((file) => file.path.endsWith(".js"))

    const previewContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>${cssFile?.content || ""}</style>
        <script>
          const originalConsole = console.log;
          console.log = (...args) => {
            window.parent.postMessage({ 
              type: 'console-log', 
              content: args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
              ).join(' ') 
            }, '*');
            originalConsole.apply(console, args);
          };
          
          window.onerror = (message, source, lineno, colno, error) => {
            window.parent.postMessage({ 
              type: 'console-error', 
              content: message
            }, '*');
            return true;
          };
        </script>
      </head>
      <body>
        ${htmlFile?.content || ""}
        <script>${jsFile?.content || ""}</script>
      </body>
      </html>
    `

    if (iframeRef.current) {
      iframeRef.current.srcdoc = previewContent
    }
  }

  // Update React preview
  const updateReactPreview = () => {
    const jsxFile = files.find((file) => file.path.endsWith(".jsx"))
    const cssFile = files.find((file) => file.path.endsWith(".css"))

    const previewContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>${cssFile?.content || ""}</style>
        <script src="https://unpkg.com/react@17/umd/react.development.js"></script>
        <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <script>
          const originalConsole = console.log;
          console.log = (...args) => {
            window.parent.postMessage({ 
              type: 'console-log', 
              content: args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
              ).join(' ') 
            }, '*');
            originalConsole.apply(console, args);
          };
          
          window.onerror = (message, source, lineno, colno, error) => {
            window.parent.postMessage({ 
              type: 'console-error', 
              content: message
            }, '*');
            return true;
          };
        </script>
      </head>
      <body>
        <div id="root"></div>
        <script type="text/babel">
          ${jsxFile?.content || ""}
          
          // Try to find the default export or a component named App
          const App = typeof default_export !== 'undefined' ? default_export : 
                     typeof App !== 'undefined' ? App : 
                     () => React.createElement('div', null, 'No component found');
          
          ReactDOM.render(React.createElement(App), document.getElementById('root'));
        </script>
      </body>
      </html>
    `

    if (iframeRef.current) {
      iframeRef.current.srcdoc = previewContent
    }
  }

  // Update Python preview
  const updatePythonPreview = () => {
    const pyFile = files.find((file) => file.path.endsWith(".py"))

    const previewContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <script src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"></script>
        <script>
          const originalConsole = console.log;
          console.log = (...args) => {
            window.parent.postMessage({ 
              type: 'console-log', 
              content: args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
              ).join(' ') 
            }, '*');
            originalConsole.apply(console, args);
          };
          
          window.onerror = (message, source, lineno, colno, error) => {
            window.parent.postMessage({ 
              type: 'console-error', 
              content: message
            }, '*');
            return true;
          };
        </script>
      </head>
      <body>
        <div id="output" style="white-space: pre-wrap; font-family: monospace;"></div>
        <script>
          async function main() {
            let pyodide = await loadPyodide();
            
            // Redirect Python stdout to our output div
            pyodide.runPython(\`
              import sys
              from pyodide.ffi import create_proxy
              
              class StdoutCatcher:
                  def __init__(self):
                      self.content = ""
                  
                  def write(self, text):
                      self.content += text
                      element = document.getElementById('output')
                      if (element) {
                          element.textContent = self.content
                      }
                      console.log(text)
                  
                  def flush(self):
                      pass
              
              sys.stdout = StdoutCatcher()
            \`);
            
            try {
              await pyodide.runPythonAsync(\`${pyFile?.content || ""}\`);
            } catch (error) {
              console.error(error);
              document.getElementById('output').textContent += "\\n\\nError: " + error.message;
            }
          }
          
          main();
        </script>
      </body>
      </html>
    `

    if (iframeRef.current) {
      iframeRef.current.srcdoc = previewContent
    }
  }

  // Update Markdown preview
  const updateMarkdownPreview = () => {
    const mdFile = files.find((file) => file.path.endsWith(".md"))

    const previewContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/dompurify/dist/purify.min.js"></script>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          pre {
            background-color: #f6f8fa;
            border-radius: 3px;
            padding: 16px;
            overflow: auto;
          }
          code {
            font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
            background-color: rgba(27, 31, 35, 0.05);
            border-radius: 3px;
            padding: 0.2em 0.4em;
          }
          pre code {
            background-color: transparent;
            padding: 0;
          }
          blockquote {
            border-left: 4px solid #ddd;
            padding-left: 16px;
            color: #666;
            margin: 0;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          table, th, td {
            border: 1px solid #ddd;
          }
          th, td {
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f6f8fa;
          }
          img {
            max-width: 100%;
          }
          .dark-mode {
            background-color: #1a1a1a;
            color: #eee;
          }
          .dark-mode pre {
            background-color: #2d2d2d;
          }
          .dark-mode code {
            background-color: rgba(255, 255, 255, 0.1);
          }
          .dark-mode blockquote {
            border-left-color: #444;
            color: #aaa;
          }
          .dark-mode table, .dark-mode th, .dark-mode td {
            border-color: #444;
          }
          .dark-mode th {
            background-color: #2d2d2d;
          }
        </style>
      </head>
      <body class="dark-mode">
        <div id="content"></div>
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            const markdown = \`${mdFile?.content.replace(/`/g, "\\`") || ""}\`;
            const html = marked.parse(markdown);
            const sanitizedHtml = DOMPurify.sanitize(html);
            document.getElementById('content').innerHTML = sanitizedHtml;
          });
        </script>
      </body>
      </html>
    `

    if (iframeRef.current) {
      iframeRef.current.srcdoc = previewContent
    }
  }

  // Update Next.js preview
  const updateNextJsPreview = () => {
    // For Next.js, we'll just show a simplified React preview
    const jsxFile = files.find((file) => file.path.includes("index.jsx"))

    const previewContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <script src="https://unpkg.com/react@17/umd/react.development.js"></script>
        <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <script>
          // Mock Next.js components
          window.Head = ({ children }) => null;
          window.Link = ({ href, children }) => React.createElement('a', { href }, children);
          
          const originalConsole = console.log;
          console.log = (...args) => {
            window.parent.postMessage({ 
              type: 'console-log', 
              content: args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
              ).join(' ') 
            }, '*');
            originalConsole.apply(console, args);
          };
          
          window.onerror = (message, source, lineno, colno, error) => {
            window.parent.postMessage({ 
              type: 'console-error', 
              content: message
            }, '*');
            return true;
          };
        </script>
      </head>
      <body>
        <div id="root"></div>
        <script type="text/babel">
          // Mock Next.js imports
          const Head = window.Head;
          const Link = window.Link;
          
          ${jsxFile?.content || ""}
          
          // Render the component
          const App = typeof Home !== 'undefined' ? Home : () => React.createElement('div', null, 'No Home component found');
          ReactDOM.render(React.createElement(App), document.getElementById('root'));
        </script>
      </body>
      </html>
    `

    if (iframeRef.current) {
      iframeRef.current.srcdoc = previewContent
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-[#0a0a0a] border-b border-[#333333]">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "preview" | "console")}>
          <div className="flex items-center justify-between px-2">
            <TabsList className="bg-transparent h-9">
              <TabsTrigger
                value="preview"
                className="data-[state=active]:bg-[#1a1a1a] data-[state=active]:border-t-2 data-[state=active]:border-t-[#00ff88] data-[state=active]:border-b-0 rounded-none px-4 h-9"
              >
                Preview
              </TabsTrigger>
              <TabsTrigger
                value="console"
                className="data-[state=active]:bg-[#1a1a1a] data-[state=active]:border-t-2 data-[state=active]:border-t-[#00ff88] data-[state=active]:border-b-0 rounded-none px-4 h-9"
              >
                Console
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-white hover:bg-[#252525]" onClick={updatePreview}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Tabs>
      </div>

      <div className="flex-grow">
        <TabsContent value="preview" className="h-full m-0 p-0">
          <div className="relative h-full bg-white">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00ff88]"></div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              title="Preview"
              className="w-full h-full border-none"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          </div>
        </TabsContent>

        <TabsContent value="console" className="h-full m-0 p-0">
          <div className="flex flex-col h-full bg-[#1a1a1a] text-white">
            <div className="flex items-center justify-between p-2 border-b border-[#333333]">
              <span className="text-sm font-medium">Console Output</span>
              <Button variant="ghost" size="sm" className="text-white hover:bg-[#252525]" onClick={onClearConsole}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
            <div className="flex-grow overflow-auto p-2 font-mono text-sm">
              {consoleOutput.length > 0 ? (
                consoleOutput.map((output, index) => (
                  <div key={index} className={`mb-1 ${output.type === "error" ? "text-red-400" : "text-green-400"}`}>
                    {output.type === "error" ? "❌ " : "✓ "}
                    {output.content}
                  </div>
                ))
              ) : (
                <div className="text-gray-400">No output yet</div>
              )}
            </div>
          </div>
        </TabsContent>
      </div>
    </div>
  )
}

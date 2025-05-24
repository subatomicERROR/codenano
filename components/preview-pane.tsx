"use client"

import { useState, useEffect, useRef } from "react"
import { useEditorStore } from "@/lib/editor-store"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, ExternalLink, Smartphone, Tablet, Monitor, Settings } from "lucide-react"

export default function PreviewPane() {
  const { currentProject } = useEditorStore()
  const [isLoading, setIsLoading] = useState(false)
  const [viewportSize, setViewportSize] = useState<"mobile" | "tablet" | "desktop">("desktop")
  const [activeTab, setActiveTab] = useState<"preview" | "responsive">("preview")
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const updatePreview = () => {
    if (!currentProject || !iframeRef.current) return

    setIsLoading(true)

    try {
      let previewContent = ""

      switch (currentProject.mode) {
        case "html":
          previewContent = generateHtmlPreview()
          break
        case "react":
          previewContent = generateReactPreview()
          break
        case "vue":
          previewContent = generateVuePreview()
          break
        case "svelte":
          previewContent = generateSveltePreview()
          break
        case "python":
          previewContent = generatePythonPreview()
          break
        case "markdown":
          previewContent = generateMarkdownPreview()
          break
        default:
          previewContent = generateHtmlPreview()
      }

      iframeRef.current.srcdoc = previewContent
    } catch (error) {
      console.error("Preview generation failed:", error)
    } finally {
      setTimeout(() => setIsLoading(false), 500)
    }
  }

  const generateHtmlPreview = () => {
    const htmlFile = currentProject?.files.find((f) => f.language === "html")
    const cssFile = currentProject?.files.find((f) => f.language === "css")
    const jsFile = currentProject?.files.find((f) => f.language === "javascript")

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CodeNANO Preview</title>
        <style>
          ${cssFile?.content || ""}
        </style>
        <script>
          // Console integration
          const originalConsole = console;
          ['log', 'error', 'warn', 'info'].forEach(method => {
            console[method] = (...args) => {
              window.parent.postMessage({
                type: 'console-' + method,
                content: args.map(arg => 
                  typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ).join(' ')
              }, '*');
              originalConsole[method].apply(console, args);
            };
          });

          // Error handling
          window.onerror = (message, source, lineno, colno, error) => {
            window.parent.postMessage({
              type: 'console-error',
              content: \`Error at line \${lineno}: \${message}\`
            }, '*');
            return true;
          };

          window.addEventListener('unhandledrejection', event => {
            window.parent.postMessage({
              type: 'console-error',
              content: \`Unhandled Promise Rejection: \${event.reason}\`
            }, '*');
          });
        </script>
      </head>
      <body>
        ${htmlFile?.content || '<div style="padding: 2rem; text-align: center; color: #666;">No HTML content found</div>'}
        <script>
          ${jsFile?.content || ""}
        </script>
      </body>
      </html>
    `
  }

  const generateReactPreview = () => {
    const jsxFile = currentProject?.files.find((f) => f.language === "jsx")
    const cssFile = currentProject?.files.find((f) => f.language === "css")

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>React Preview</title>
        <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <style>
          body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
          ${cssFile?.content || ""}
        </style>
        <script>
          // Console integration
          const originalConsole = console;
          ['log', 'error', 'warn', 'info'].forEach(method => {
            console[method] = (...args) => {
              window.parent.postMessage({
                type: 'console-' + method,
                content: args.map(arg => 
                  typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ).join(' ')
              }, '*');
              originalConsole[method].apply(console, args);
            };
          });

          window.onerror = (message, source, lineno, colno, error) => {
            window.parent.postMessage({
              type: 'console-error',
              content: \`Error at line \${lineno}: \${message}\`
            }, '*');
            return true;
          };
        </script>
      </head>
      <body>
        <div id="root"></div>
        <script type="text/babel">
          ${jsxFile?.content || 'ReactDOM.render(<div style={{padding: "2rem", textAlign: "center", color: "#666"}}>No React component found</div>, document.getElementById("root"));'}
        </script>
      </body>
      </html>
    `
  }

  const generatePythonPreview = () => {
    const pyFile = currentProject?.files.find((f) => f.language === "python")

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Python Preview</title>
        <script src="https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"></script>
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: 'Consolas', 'Monaco', monospace;
            background: #0a0a0a;
            color: #fff;
          }
          #output {
            white-space: pre-wrap;
            background: #1a1a1a;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #333;
            min-height: 200px;
          }
          .loading {
            text-align: center;
            color: #00ff88;
            padding: 40px;
          }
        </style>
      </head>
      <body>
        <div id="loading" class="loading">🐍 Loading Python environment...</div>
        <div id="output" style="display: none;"></div>
        
        <script>
          async function runPython() {
            try {
              const pyodide = await loadPyodide();
              document.getElementById('loading').style.display = 'none';
              document.getElementById('output').style.display = 'block';
              
              // Redirect Python stdout
              pyodide.runPython(\`
                import sys
                from io import StringIO
                
                class OutputCapture:
                    def __init__(self):
                        self.output = StringIO()
                    
                    def write(self, text):
                        self.output.write(text)
                        element = document.getElementById('output')
                        if element:
                            element.textContent += text
                        console.log(text.strip())
                    
                    def flush(self):
                        pass
                
                sys.stdout = OutputCapture()
                sys.stderr = OutputCapture()
              \`);
              
              // Run user code
              await pyodide.runPythonAsync(\`${pyFile?.content || 'print("No Python code found")'}\`);
              
            } catch (error) {
              document.getElementById('loading').style.display = 'none';
              document.getElementById('output').style.display = 'block';
              document.getElementById('output').textContent = 'Error: ' + error.message;
              console.error(error);
            }
          }
          
          runPython();
        </script>
      </body>
      </html>
    `
  }

  const generateMarkdownPreview = () => {
    const mdFile = currentProject?.files.find((f) => f.language === "markdown")

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Markdown Preview</title>
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/dompurify/dist/purify.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-core.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
        <link href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.css" rel="stylesheet">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #e1e1e1;
            background: #0a0a0a;
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          
          h1, h2, h3, h4, h5, h6 {
            color: #00ff88;
            margin-top: 2rem;
            margin-bottom: 1rem;
          }
          
          h1 { font-size: 2.5rem; border-bottom: 2px solid #333; padding-bottom: 0.5rem; }
          h2 { font-size: 2rem; border-bottom: 1px solid #333; padding-bottom: 0.3rem; }
          
          code {
            background: #1a1a1a;
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: 'Consolas', 'Monaco', monospace;
            color: #00ff88;
          }
          
          pre {
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 1rem;
            overflow-x: auto;
            margin: 1rem 0;
          }
          
          pre code {
            background: none;
            padding: 0;
            color: inherit;
          }
          
          blockquote {
            border-left: 4px solid #00ff88;
            padding-left: 1rem;
            margin: 1rem 0;
            color: #ccc;
            background: #111;
            padding: 1rem;
            border-radius: 0 8px 8px 0;
          }
          
          table {
            border-collapse: collapse;
            width: 100%;
            margin: 1rem 0;
          }
          
          th, td {
            border: 1px solid #333;
            padding: 0.75rem;
            text-align: left;
          }
          
          th {
            background: #1a1a1a;
            color: #00ff88;
            font-weight: 600;
          }
          
          tr:nth-child(even) {
            background: #111;
          }
          
          a {
            color: #00d4ff;
            text-decoration: none;
          }
          
          a:hover {
            text-decoration: underline;
          }
          
          ul, ol {
            padding-left: 2rem;
          }
          
          li {
            margin: 0.5rem 0;
          }
          
          img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }
          
          hr {
            border: none;
            border-top: 2px solid #333;
            margin: 2rem 0;
          }
        </style>
      </head>
      <body>
        <div id="content"></div>
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            const markdown = \`${mdFile?.content.replace(/`/g, "\\`").replace(/\$/g, "\\$") || "# No Markdown Content\\n\\nCreate a markdown file to see the preview."}\`;
            
            // Configure marked
            marked.setOptions({
              highlight: function(code, lang) {
                if (Prism.languages[lang]) {
                  return Prism.highlight(code, Prism.languages[lang], lang);
                }
                return code;
              },
              breaks: true,
              gfm: true
            });
            
            const html = marked.parse(markdown);
            const sanitizedHtml = DOMPurify.sanitize(html);
            document.getElementById('content').innerHTML = sanitizedHtml;
            
            // Highlight code blocks
            Prism.highlightAll();
          });
        </script>
      </body>
      </html>
    `
  }

  const generateVuePreview = () => {
    const vueFile = currentProject?.files.find((f) => f.language === "vue")

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vue Preview</title>
        <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
        <style>
          body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        </style>
      </head>
      <body>
        <div id="app"></div>
        <script>
          ${vueFile?.content || 'Vue.createApp({ template: "<div style=\\"padding: 2rem; text-align: center; color: #666;\\">No Vue component found</div>" }).mount("#app");'}
        </script>
      </body>
      </html>
    `
  }

  const generateSveltePreview = () => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Svelte Preview</title>
      </head>
      <body>
        <div style="padding: 2rem; text-align: center; color: #666;">
          Svelte preview requires compilation. Use the build system for full Svelte support.
        </div>
      </body>
      </html>
    `
  }

  useEffect(() => {
    updatePreview()
  }, [currentProject?.files])

  const getViewportStyles = () => {
    switch (viewportSize) {
      case "mobile":
        return { width: "375px", height: "667px" }
      case "tablet":
        return { width: "768px", height: "1024px" }
      default:
        return { width: "100%", height: "100%" }
    }
  }

  const openInNewTab = () => {
    if (iframeRef.current?.srcdoc) {
      const newWindow = window.open()
      if (newWindow) {
        newWindow.document.write(iframeRef.current.srcdoc)
        newWindow.document.close()
      }
    }
  }

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a]">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-[#0a0a0a] border-b border-[#333333] p-2">
          <div className="flex items-center justify-between">
            <TabsList className="bg-transparent">
              <TabsTrigger value="preview" className="data-[state=active]:bg-[#333333]">
                Preview
              </TabsTrigger>
              <TabsTrigger value="responsive" className="data-[state=active]:bg-[#333333]">
                Responsive
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={updatePreview}
                disabled={isLoading}
                className="text-gray-400 hover:text-white"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>

              <Button variant="ghost" size="sm" onClick={openInNewTab} className="text-gray-400 hover:text-white">
                <ExternalLink className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 relative">
          <TabsContent value="preview" className="h-full m-0">
            <div className="h-full bg-white">
              {isLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00ff88] mx-auto mb-2"></div>
                    <p>Updating preview...</p>
                  </div>
                </div>
              )}
              <iframe
                ref={iframeRef}
                title="Preview"
                className="w-full h-full border-none"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              />
            </div>
          </TabsContent>

          <TabsContent value="responsive" className="h-full m-0">
            <div className="h-full bg-[#2a2a2a] p-4">
              {/* Viewport Controls */}
              <div className="mb-4 flex items-center justify-center space-x-4">
                <Button
                  variant={viewportSize === "mobile" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewportSize("mobile")}
                  className={viewportSize === "mobile" ? "bg-[#00ff88] text-black" : "border-[#333333] text-white"}
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  Mobile
                </Button>
                <Button
                  variant={viewportSize === "tablet" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewportSize("tablet")}
                  className={viewportSize === "tablet" ? "bg-[#00ff88] text-black" : "border-[#333333] text-white"}
                >
                  <Tablet className="h-4 w-4 mr-2" />
                  Tablet
                </Button>
                <Button
                  variant={viewportSize === "desktop" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewportSize("desktop")}
                  className={viewportSize === "desktop" ? "bg-[#00ff88] text-black" : "border-[#333333] text-white"}
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  Desktop
                </Button>
              </div>

              {/* Responsive Preview */}
              <div className="flex justify-center">
                <div
                  className="bg-white border-8 border-gray-800 rounded-lg shadow-2xl overflow-hidden"
                  style={getViewportStyles()}
                >
                  <iframe
                    title="Responsive Preview"
                    className="w-full h-full border-none"
                    srcDoc={iframeRef.current?.srcdoc}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

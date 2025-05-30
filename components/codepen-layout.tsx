"use client"

import { useState, useEffect, useMemo } from "react"
import { useEditorStore } from "@/lib/editor-store"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Code, Eye } from "lucide-react"
import MonacoEditor from "./monaco-editor"

export default function CodePenLayout() {
  const [viewMode, setViewMode] = useState<"editor" | "preview">("editor")
  const [layout, setLayout] = useState<"horizontal" | "vertical">("horizontal")

  const { currentProject, activeFileId, setActiveFile, updateFile, addConsoleMessage } = useEditorStore()

  const htmlFile = useMemo(() => currentProject?.files.find((f) => f.name.endsWith(".html")), [currentProject?.files])

  const cssFile = useMemo(() => currentProject?.files.find((f) => f.name.endsWith(".css")), [currentProject?.files])

  const jsFile = useMemo(() => currentProject?.files.find((f) => f.name.endsWith(".js")), [currentProject?.files])

  const [htmlContent, setHtmlContent] = useState(htmlFile?.content || "")
  const [cssContent, setCssContent] = useState(cssFile?.content || "")
  const [jsContent, setJsContent] = useState(jsFile?.content || "")

  useEffect(() => {
    if (htmlFile) setHtmlContent(htmlFile.content)
  }, [htmlFile])

  useEffect(() => {
    if (cssFile) setCssContent(cssFile.content)
  }, [cssFile])

  useEffect(() => {
    if (jsFile) setJsContent(jsFile.content)
  }, [jsFile])

  const handleHtmlChange = (value: string) => {
    setHtmlContent(value)
    if (htmlFile) updateFile(htmlFile.id, value)
  }

  const handleCssChange = (value: string) => {
    setCssContent(value)
    if (cssFile) updateFile(cssFile.id, value)
  }

  const handleJsChange = (value: string) => {
    setJsContent(value)
    if (jsFile) updateFile(jsFile.id, value)
  }

  const generatePreviewContent = () => {
    const html = htmlContent || ""
    const css = cssContent || ""
    const js = jsContent || ""

    // Extract body content if full HTML document
    let bodyContent = html
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    if (bodyMatch) {
      bodyContent = bodyMatch[1]
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeNANO Preview</title>
    <style>
        ${css}
    </style>
</head>
<body>
    ${bodyContent}
    <script>
        // Console override to send messages to parent
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        
        console.log = function(...args) {
            originalLog.apply(console, args);
            window.parent.postMessage({
                type: 'console-log',
                content: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ')
            }, '*');
        };
        
        console.error = function(...args) {
            originalError.apply(console, args);
            window.parent.postMessage({
                type: 'console-error',
                content: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ')
            }, '*');
        };
        
        console.warn = function(...args) {
            originalWarn.apply(console, args);
            window.parent.postMessage({
                type: 'console-warn',
                content: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ')
            }, '*');
        };

        // Error handling
        window.addEventListener('error', function(e) {
            window.parent.postMessage({
                type: 'console-error',
                content: e.message + ' at line ' + e.lineno
            }, '*');
        });

        try {
            ${js}
        } catch (error) {
            console.error('JavaScript Error:', error.message);
        }
    </script>
</body>
</html>`
  }

  const handleRun = () => {
    addConsoleMessage("info", "🚀 Code executed!")
    // Force iframe refresh
    const iframe = document.querySelector("#preview-iframe") as HTMLIFrameElement
    if (iframe) {
      iframe.src = "data:text/html;charset=utf-8," + encodeURIComponent(generatePreviewContent())
    }
  }

  if (!currentProject) return null

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {/* CodePen-style Header */}
      <div className="h-12 bg-[#1a1a1a] border-b border-[#333333] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "editor" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("editor")}
            className={viewMode === "editor" ? "bg-[#00ff88] text-black" : "text-gray-400"}
          >
            <Code className="w-4 h-4 mr-2" />
            Editor
          </Button>
          <Button
            variant={viewMode === "preview" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("preview")}
            className={viewMode === "preview" ? "bg-[#00ff88] text-black" : "text-gray-400"}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLayout(layout === "horizontal" ? "vertical" : "horizontal")}
            className="text-gray-400 hover:text-white"
          >
            {layout === "horizontal" ? "⬌" : "⬍"} Layout
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRun}
            className="border-[#333333] hover:bg-[#252525] text-[#e0e0e0]"
          >
            <Play className="w-4 h-4 mr-2" />
            Run
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex ${layout === "horizontal" ? "flex-row" : "flex-col"}`}>
        {/* Editor Section */}
        {viewMode === "editor" && (
          <div className={`${layout === "horizontal" ? "w-1/2" : "h-1/2"} border-r border-[#333333]`}>
            <Tabs defaultValue="html" className="h-full flex flex-col">
              <TabsList className="bg-[#1a1a1a] border-b border-[#333333] rounded-none justify-start">
                <TabsTrigger
                  value="html"
                  className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black"
                  onClick={() => htmlFile && setActiveFile(htmlFile.id)}
                >
                  HTML
                </TabsTrigger>
                <TabsTrigger
                  value="css"
                  className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black"
                  onClick={() => cssFile && setActiveFile(cssFile.id)}
                >
                  CSS
                </TabsTrigger>
                <TabsTrigger
                  value="js"
                  className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black"
                  onClick={() => jsFile && setActiveFile(jsFile.id)}
                >
                  JS
                </TabsTrigger>
              </TabsList>

              <TabsContent value="html" className="flex-1 m-0">
                <MonacoEditor value={htmlContent} language="html" onChange={handleHtmlChange} />
              </TabsContent>

              <TabsContent value="css" className="flex-1 m-0">
                <MonacoEditor value={cssContent} language="css" onChange={handleCssChange} />
              </TabsContent>

              <TabsContent value="js" className="flex-1 m-0">
                <MonacoEditor value={jsContent} language="javascript" onChange={handleJsChange} />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Preview Section */}
        <div
          className={`${
            viewMode === "editor" ? (layout === "horizontal" ? "w-1/2" : "h-1/2") : "w-full h-full"
          } bg-white`}
        >
          <iframe
            id="preview-iframe"
            src={`data:text/html;charset=utf-8,${encodeURIComponent(generatePreviewContent())}`}
            className="w-full h-full border-0"
            title="Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </div>
  )
}

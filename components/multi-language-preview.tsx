"use client"

import { useState, useMemo } from "react"
import { useEditorStore } from "@/lib/editor-store"
import { Button } from "@/components/ui/button"
import { Monitor, Smartphone, Tablet, RotateCcw } from "lucide-react"

export default function MultiLanguagePreview() {
  const { currentProject } = useEditorStore()
  const [deviceMode, setDeviceMode] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [key, setKey] = useState(0)

  const htmlContent = useMemo(() => {
    if (!currentProject?.files) return ""

    const htmlFile = currentProject.files.find((file) => file.name.endsWith(".html") || file.language === "html")
    const cssFile = currentProject.files.find((file) => file.name.endsWith(".css") || file.language === "css")
    const jsFile = currentProject.files.find((file) => file.name.endsWith(".js") || file.language === "javascript")

    const html = htmlFile?.content || "<div>No HTML content</div>"
    const css = cssFile?.content || ""
    const js = jsFile?.content || ""

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Preview</title>
        <style>${css}</style>
      </head>
      <body>
        ${html}
        <script>
          // Override console methods to send messages to parent
          const originalLog = console.log;
          const originalError = console.error;
          const originalWarn = console.warn;
          const originalInfo = console.info;

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

          console.info = function(...args) {
            originalInfo.apply(console, args);
            window.parent.postMessage({
              type: 'console-info',
              content: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ')
            }, '*');
          };

          // Catch runtime errors
          window.addEventListener('error', function(e) {
            console.error('Runtime Error:', e.message, 'at', e.filename + ':' + e.lineno);
          });

          try {
            ${js}
          } catch (error) {
            console.error('JavaScript Error:', error.message);
          }
        </script>
      </body>
      </html>
    `
  }, [currentProject])

  const getDeviceStyles = () => {
    switch (deviceMode) {
      case "mobile":
        return "w-[375px] h-[667px]"
      case "tablet":
        return "w-[768px] h-[1024px]"
      default:
        return "w-full h-full"
    }
  }

  const refreshPreview = () => {
    setKey((prev) => prev + 1)
  }

  if (!currentProject?.files || currentProject.files.length === 0) {
    return (
      <div className="h-full bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center text-gray-400">
          <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No preview available</p>
          <p className="text-sm">Create some files to see the preview</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-[#1a1a1a] flex flex-col">
      {/* Preview Controls */}
      <div className="flex items-center justify-between p-3 border-b border-[#333333]">
        <div className="flex items-center space-x-2">
          <Button
            variant={deviceMode === "desktop" ? "default" : "ghost"}
            size="sm"
            onClick={() => setDeviceMode("desktop")}
            className={deviceMode === "desktop" ? "bg-[#00ff88] text-black" : "text-gray-400 hover:text-white"}
          >
            <Monitor className="w-4 h-4" />
          </Button>
          <Button
            variant={deviceMode === "tablet" ? "default" : "ghost"}
            size="sm"
            onClick={() => setDeviceMode("tablet")}
            className={deviceMode === "tablet" ? "bg-[#00ff88] text-black" : "text-gray-400 hover:text-white"}
          >
            <Tablet className="w-4 h-4" />
          </Button>
          <Button
            variant={deviceMode === "mobile" ? "default" : "ghost"}
            size="sm"
            onClick={() => setDeviceMode("mobile")}
            className={deviceMode === "mobile" ? "bg-[#00ff88] text-black" : "text-gray-400 hover:text-white"}
          >
            <Smartphone className="w-4 h-4" />
          </Button>
        </div>

        <Button variant="ghost" size="sm" onClick={refreshPreview} className="text-gray-400 hover:text-white">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Preview Area */}
      <div className="flex-1 p-4 overflow-auto">
        <div className={`mx-auto bg-white rounded-lg shadow-lg overflow-hidden ${getDeviceStyles()}`}>
          <iframe
            key={key}
            srcDoc={htmlContent}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
            title="Preview"
          />
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"

interface FrameworkPreviewProps {
  mode: string
  files: Array<{ name: string; content: string; language: string }>
}

export function FrameworkPreview({ mode, files }: FrameworkPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!iframeRef.current) return

    setIsLoading(true)
    setError(null)

    try {
      const iframe = iframeRef.current
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document

      if (!iframeDoc) return

      let htmlContent = ""

      switch (mode) {
        case "react":
          htmlContent = generateReactPreview(files)
          break
        case "vue":
          htmlContent = generateVuePreview(files)
          break
        case "nextjs":
          htmlContent = generateNextJSPreview(files)
          break
        case "html":
        default:
          htmlContent = generateHTMLPreview(files)
          break
      }

      iframeDoc.open()
      iframeDoc.write(htmlContent)
      iframeDoc.close()

      // Handle iframe load
      iframe.onload = () => {
        setIsLoading(false)
      }
    } catch (err) {
      setError(`Preview error: ${err instanceof Error ? err.message : "Unknown error"}`)
      setIsLoading(false)
    }
  }, [mode, files])

  const generateHTMLPreview = (files: Array<{ name: string; content: string; language: string }>) => {
    const htmlFile = files.find((f) => f.name.endsWith(".html") || f.language === "html")
    const cssFile = files.find((f) => f.name.endsWith(".css") || f.language === "css")
    const jsFile = files.find((f) => f.name.endsWith(".js") || f.language === "javascript")

    let html = htmlFile?.content || "<div>No HTML file found</div>"

    // Inject CSS
    if (cssFile) {
      html = html.replace("</head>", `<style>${cssFile.content}</style></head>`)
    }

    // Inject JavaScript
    if (jsFile) {
      html = html.replace("</body>", `<script>${jsFile.content}</script></body>`)
    }

    return html
  }

  const generateReactPreview = (files: Array<{ name: string; content: string; language: string }>) => {
    const appFile = files.find((f) => f.name === "App.jsx" || f.language === "jsx")

    if (!appFile) {
      return "<div>No React App.jsx file found</div>"
    }

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
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        ${appFile.content}
    </script>
</body>
</html>`
  }

  const generateVuePreview = (files: Array<{ name: string; content: string; language: string }>) => {
    const vueFile = files.find((f) => f.name === "App.vue" || f.language === "vue")

    if (!vueFile) {
      return "<div>No Vue App.vue file found</div>"
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vue Preview</title>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
</head>
<body>
    <div id="app"></div>
    <script>
        ${vueFile.content}
    </script>
</body>
</html>`
  }

  const generateNextJSPreview = (files: Array<{ name: string; content: string; language: string }>) => {
    const pageFile = files.find((f) => f.name === "page.js" || f.name === "page.jsx")
    const layoutFile = files.find((f) => f.name === "layout.js")

    if (!pageFile) {
      return "<div>No Next.js page.js file found</div>"
    }

    // Extract the component from the page file
    let pageContent = pageFile.content

    // Simple transformation to make it work in browser
    pageContent = pageContent
      .replace("'use client'", "")
      .replace(/import.*from.*['"]react['"];?/g, "")
      .replace(/export default function (\w+)/, "function $1")

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Next.js Preview</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        const { useState, useEffect } = React;
        
        ${pageContent}
        
        ReactDOM.render(React.createElement(Home), document.getElementById('root'));
    </script>
</body>
</html>`
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-red-50 text-red-600 p-4">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">Preview Error</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ff88] mx-auto mb-2"></div>
            <div className="text-sm text-gray-600">Loading {mode} preview...</div>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin"
        title={`${mode} Preview`}
      />
    </div>
  )
}

// Add a default export for backward compatibility
export default FrameworkPreview

"use client"

import { useEffect, useRef } from "react"

interface PreviewFrameProps {
  html: string
  css: string
  js: string
  onLoad?: () => void
}

export default function PreviewFrame({ html, css, js, onLoad }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // Create the preview content
    const previewContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>${css}</style>
        <script>
          window.onerror = (message, source, lineno, colno, error) => {
            console.error(message);
            return true;
          };
        </script>
      </head>
      <body>
        ${html}
        <script>${js}</script>
      </body>
      </html>
    `

    // Set the iframe content
    if (iframeRef.current) {
      iframeRef.current.srcdoc = previewContent
    }
  }, [html, css, js])

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full border-none"
      title="Preview"
      sandbox="allow-scripts allow-same-origin"
      onLoad={onLoad}
    />
  )
}

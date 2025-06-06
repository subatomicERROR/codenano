"use client"

import { useEffect, useState } from "react"
import { FrameworkPreview } from "./framework-preview"

interface MultiLanguagePreviewProps {
  mode: string
  files: Array<{ name: string; content: string; language: string }>
}

export function MultiLanguagePreview({ mode, files }: MultiLanguagePreviewProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ff88] mx-auto mb-2"></div>
          <div className="text-sm text-gray-600">Loading preview...</div>
        </div>
      </div>
    )
  }

  return <FrameworkPreview mode={mode} files={files} />
}

// Add a default export for backward compatibility
export default MultiLanguagePreview

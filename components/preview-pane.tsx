"use client"

import { useEffect, useState } from "react"
import { Maximize2, Minimize2, RefreshCw } from "lucide-react"
import { MultiLanguagePreview } from "./multi-language-preview"
import { useEditorStore } from "@/lib/editor-store"

export function PreviewPane() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const { currentProject } = useEditorStore()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const refreshPreview = () => {
    window.dispatchEvent(new CustomEvent("refreshPreview"))
  }

  if (!isClient || !currentProject) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ff88] mx-auto mb-2"></div>
          <div className="text-sm text-gray-600">Loading preview...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-full flex flex-col ${isFullscreen ? "fixed inset-0 z-50 bg-white" : ""}`}>
      <div className="flex justify-between items-center px-4 py-2 bg-[#f5f5f5] border-b border-[#e0e0e0]">
        <h3 className="text-sm font-medium text-gray-700">Preview</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshPreview}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            title="Refresh preview"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen preview"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-gray-600" />
            ) : (
              <Maximize2 className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>
      <div className="flex-grow">
        <MultiLanguagePreview mode={currentProject.mode} files={currentProject.files} />
      </div>
    </div>
  )
}

// Default export for backward compatibility
export default PreviewPane

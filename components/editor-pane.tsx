"use client"

import { useState, useEffect } from "react"
import { Maximize2, ChevronDown, ChevronUp, Plus } from "lucide-react"
import { useEditorStore } from "@/lib/editor-store"
import { SimpleEditor } from "./simple-editor"
import { CreateFileModal } from "./create-file-modal"

export function EditorPane() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Properly destructure from the editor store
  const { currentProject, activeFileId, setActiveFile, updateFile, createFile } = useEditorStore()

  // Get files from currentProject safely
  const files = currentProject?.files || []
  const activeFile = files.find((f) => f.id === activeFileId) || files[0]

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  const handleCodeChange = (value: string) => {
    if (activeFile) {
      updateFile(activeFile.id, value)
    }
  }

  const handleCreateDefaultFiles = () => {
    createFile("index.html")
    createFile("style.css")
    createFile("script.js")
  }

  // Show loading state if no project is loaded
  if (!currentProject) {
    return (
      <div className="flex flex-col bg-[#0a0a0a] border-r border-[#333333] items-center justify-center h-full">
        <div className="text-[#e0e0e0]/70 text-center">
          <p className="mb-2">Loading project...</p>
          <div className="w-6 h-6 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  // Show empty state if no files
  if (files.length === 0) {
    return (
      <div className="flex flex-col bg-[#0a0a0a] border-r border-[#333333] items-center justify-center h-full">
        <div className="text-[#e0e0e0]/70 text-center max-w-md px-4">
          <p className="mb-4 text-xl font-semibold">No files in this project</p>
          <p className="mb-6">Create HTML, CSS, and JavaScript files to start coding</p>
          <div className="flex flex-col gap-4">
            <button
              onClick={handleCreateDefaultFiles}
              className="px-4 py-2 bg-[#00ff88] text-black font-medium rounded-md hover:bg-[#00cc6a] transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create HTML, CSS, JS Files
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Create Custom File
            </button>
          </div>
        </div>
        <CreateFileModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      </div>
    )
  }

  return (
    <div
      className={`flex flex-col bg-[#0a0a0a] border-r border-[#333333] h-full ${
        isFullscreen ? "fixed inset-0 z-50" : ""
      } ${isCollapsed ? "w-12" : ""} transition-all duration-300`}
    >
      <div className="flex justify-between items-center px-4 py-3 bg-[#1a1a1a] border-b border-[#333333] flex-shrink-0">
        <div className={`flex gap-2 overflow-x-auto ${isCollapsed ? "hidden" : ""}`}>
          {files.map((file) => (
            <button
              key={file.id}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                activeFile?.id === file.id
                  ? "bg-[#00ff88] text-black"
                  : "bg-[#0a0a0a] text-[#e0e0e0] hover:bg-[#252525]"
              }`}
              onClick={() => setActiveFile(file.id)}
            >
              {file.name}
              {file.isModified && <span className="ml-1 text-xs">•</span>}
            </button>
          ))}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap bg-[#0a0a0a] text-[#e0e0e0] hover:bg-[#252525] flex items-center"
          >
            <Plus className="w-3 h-3 mr-1" />
            New
          </button>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-[#e0e0e0] hover:text-[#00ff88] transition-colors"
            title={isCollapsed ? "Expand editor" : "Collapse editor"}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="text-[#e0e0e0] hover:text-[#00ff88] transition-colors"
            title="Toggle fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className={`flex-grow relative ${isCollapsed ? "hidden" : ""}`}>
        {activeFile ? (
          <SimpleEditor
            value={activeFile.content}
            onChange={handleCodeChange}
            language={activeFile.language as "javascript" | "htmlmixed" | "css"}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-[#e0e0e0]/70">
            <p>Select a file to start editing</p>
          </div>
        )}
      </div>
      <CreateFileModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  )
}

// Default export for backward compatibility
export default EditorPane

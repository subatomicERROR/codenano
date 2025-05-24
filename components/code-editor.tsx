"use client"

import { useEffect, useCallback, useMemo } from "react"
import { useEditorStore, initializeStore } from "@/lib/editor-store"
import FileExplorer from "./file-explorer"
import MonacoEditor from "./monaco-editor"
import PreviewPane from "./preview-pane"
import TopMenuBar from "./top-menu-bar"
import StatusBar from "./status-bar"
import ConsolePanel from "./console-panel"

export default function CodeEditor() {
  const {
    currentProject,
    activeFileId,
    sidebarOpen,
    previewMode,
    consoleOpen,
    updateFile,
    setSaveState,
    addConsoleMessage,
  } = useEditorStore()

  // Initialize store on mount
  useEffect(() => {
    initializeStore()
  }, [])

  // Listen for console messages from preview
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin && event.origin !== "null") return

      if (event.data.type === "console-log") {
        addConsoleMessage("log", event.data.content)
      } else if (event.data.type === "console-error") {
        addConsoleMessage("error", event.data.content)
      } else if (event.data.type === "console-warn") {
        addConsoleMessage("warn", event.data.content)
      } else if (event.data.type === "console-info") {
        addConsoleMessage("info", event.data.content)
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [addConsoleMessage])

  const activeFile = useMemo(() => {
    return currentProject?.files.find((file) => file.id === activeFileId)
  }, [currentProject?.files, activeFileId])

  const handleSave = useCallback(async () => {
    setSaveState("saving")

    try {
      // Simulate save operation - in real app, this would save to Supabase
      await new Promise((resolve) => setTimeout(resolve, 500))
      setSaveState("saved")
      addConsoleMessage("info", "💾 Project saved successfully!")
    } catch (error) {
      setSaveState("error")
      addConsoleMessage("error", "❌ Failed to save project")
    }
  }, [setSaveState, addConsoleMessage])

  const handleFileChange = useCallback(
    (content: string) => {
      if (activeFileId && activeFile && content !== activeFile.content) {
        updateFile(activeFileId, content)
      }
    },
    [activeFileId, activeFile, updateFile],
  )

  if (!currentProject) {
    return (
      <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold mb-2">Welcome to CodeNANO</h2>
          <p className="text-gray-400">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a] text-white">
      <TopMenuBar onSave={handleSave} />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-80 border-r border-[#333333] bg-[#1a1a1a]">
            <FileExplorer />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex">
            {/* Editor */}
            {(previewMode === "editor" || previewMode === "split") && (
              <div className={previewMode === "split" ? "flex-1" : "w-full"}>
                {activeFile ? (
                  <MonacoEditor
                    value={activeFile.content}
                    language={activeFile.language}
                    onChange={handleFileChange}
                    onSave={handleSave}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-[#0a0a0a] text-gray-400">
                    <div className="text-center">
                      <div className="text-4xl mb-4">📄</div>
                      <p>Select a file to start editing</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Preview */}
            {(previewMode === "preview" || previewMode === "split") && (
              <div className={previewMode === "split" ? "flex-1 border-l border-[#333333]" : "w-full"}>
                <PreviewPane />
              </div>
            )}
          </div>

          {/* Console */}
          {consoleOpen && (
            <div className="h-48 border-t border-[#333333]">
              <ConsolePanel />
            </div>
          )}
        </div>
      </div>

      <StatusBar />
    </div>
  )
}

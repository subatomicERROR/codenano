"use client"

import { useEditorStore } from "@/lib/editor-store"

interface StatusBarProps {
  currentFile?: any
  layout?: "horizontal" | "vertical"
  onLayoutChange?: (layout: "horizontal" | "vertical") => void
}

export function StatusBar({ currentFile, layout, onLayoutChange }: StatusBarProps) {
  const { currentProject, activeFileId, saveState } = useEditorStore()

  const activeFile = currentProject?.files.find((f) => f.id === activeFileId) || currentFile

  return (
    <div className="h-6 bg-[#1a1a1a] border-t border-[#333333] flex items-center justify-between px-4 text-xs text-gray-400">
      <div className="flex items-center space-x-4">
        <span>CodeNANO</span>
        {activeFile && (
          <>
            <span>•</span>
            <span>{activeFile.name}</span>
            <span>•</span>
            <span className="capitalize">{activeFile.language}</span>
          </>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <span>UTF-8</span>
        <span>LF</span>
        {layout && (
          <>
            <span>•</span>
            <button
              onClick={() => onLayoutChange?.(layout === "horizontal" ? "vertical" : "horizontal")}
              className="hover:text-white transition-colors capitalize"
              title={`Switch to ${layout === "horizontal" ? "vertical" : "horizontal"} layout`}
            >
              {layout}
            </button>
          </>
        )}
        <span className="capitalize">{saveState}</span>
      </div>
    </div>
  )
}

// Default export for backward compatibility
export default StatusBar

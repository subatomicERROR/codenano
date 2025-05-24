"use client"

import { useEditorStore } from "@/lib/editor-store"

export default function StatusBar() {
  const { currentProject, activeFileId, saveState } = useEditorStore()

  const activeFile = currentProject?.files.find((f) => f.id === activeFileId)

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
        <span className="capitalize">{saveState}</span>
      </div>
    </div>
  )
}

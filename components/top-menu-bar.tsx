"use client"

import { useEditorStore } from "@/lib/editor-store"
import { Button } from "@/components/ui/button"
import { Save, Download, Github, Play, Sidebar, Terminal, Monitor, Code, Eye } from "lucide-react"

interface TopMenuBarProps {
  onSave: () => void
}

export default function TopMenuBar({ onSave }: TopMenuBarProps) {
  const { saveState, sidebarOpen, setSidebarOpen, consoleOpen, setConsoleOpen, previewMode, setPreviewMode } =
    useEditorStore()

  return (
    <div className="h-12 bg-[#1a1a1a] border-b border-[#333333] flex items-center justify-between px-4">
      {/* Left Section */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-400 hover:text-white"
        >
          <Sidebar className="w-4 h-4" />
        </Button>

        <div className="h-4 w-px bg-[#333333]" />

        <Button
          variant="ghost"
          size="sm"
          onClick={onSave}
          disabled={saveState === "saving"}
          className="text-gray-400 hover:text-white"
        >
          <Save className="w-4 h-4 mr-2" />
          {saveState === "saving" ? "Saving..." : "Save"}
        </Button>

        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>

        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <Github className="w-4 h-4 mr-2" />
          GitHub
        </Button>
      </div>

      {/* Center Section */}
      <div className="flex items-center space-x-1 bg-[#2a2a2a] rounded-md p-1">
        <Button
          variant={previewMode === "editor" ? "default" : "ghost"}
          size="sm"
          onClick={() => setPreviewMode("editor")}
          className={previewMode === "editor" ? "bg-[#00ff88] text-black" : "text-gray-400 hover:text-white"}
        >
          <Code className="w-4 h-4" />
        </Button>
        <Button
          variant={previewMode === "split" ? "default" : "ghost"}
          size="sm"
          onClick={() => setPreviewMode("split")}
          className={previewMode === "split" ? "bg-[#00ff88] text-black" : "text-gray-400 hover:text-white"}
        >
          <Monitor className="w-4 h-4" />
        </Button>
        <Button
          variant={previewMode === "preview" ? "default" : "ghost"}
          size="sm"
          onClick={() => setPreviewMode("preview")}
          className={previewMode === "preview" ? "bg-[#00ff88] text-black" : "text-gray-400 hover:text-white"}
        >
          <Eye className="w-4 h-4" />
        </Button>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConsoleOpen(!consoleOpen)}
          className={`${consoleOpen ? "text-[#00ff88]" : "text-gray-400"} hover:text-white`}
        >
          <Terminal className="w-4 h-4" />
        </Button>

        <div className="h-4 w-px bg-[#333333]" />

        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <Play className="w-4 h-4 mr-2" />
          Run
        </Button>

        <div className="flex items-center space-x-2 text-xs">
          <div
            className={`w-2 h-2 rounded-full ${
              saveState === "saved"
                ? "bg-green-400"
                : saveState === "saving"
                  ? "bg-yellow-400"
                  : saveState === "unsaved"
                    ? "bg-orange-400"
                    : "bg-red-400"
            }`}
          />
          <span className="text-gray-400 capitalize">{saveState}</span>
        </div>
      </div>
    </div>
  )
}

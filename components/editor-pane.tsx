"use client"

import { useState, useEffect } from "react"
import { Maximize2, ChevronDown, ChevronUp } from "lucide-react"
import type { EditorTab } from "./code-editor"
import SimpleEditor from "./simple-editor"

interface EditorPaneProps {
  activeTab: EditorTab
  setActiveTab: (tab: EditorTab) => void
  code: Record<EditorTab, string>
  onCodeChange: (type: EditorTab, value: string) => void
}

export default function EditorPane({ activeTab, setActiveTab, code, onCodeChange }: EditorPaneProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

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

  return (
    <div
      className={`flex flex-col bg-[#0a0a0a] border-r border-[#333333] ${isFullscreen ? "fixed inset-0 z-50" : ""} ${isCollapsed ? "w-12" : ""} transition-all duration-300`}
    >
      <div className="flex justify-between items-center px-4 py-3 bg-[#1a1a1a] border-b border-[#333333]">
        <div className={`flex gap-2 ${isCollapsed ? "hidden" : ""}`}>
          {(["html", "css", "js"] as const).map((tab) => (
            <button
              key={tab}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                activeTab === tab ? "bg-[#00ff88] text-black" : "bg-[#0a0a0a] text-[#e0e0e0] hover:bg-[#252525]"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-[#e0e0e0] hover:text-[#00ff88] transition-colors"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button onClick={toggleFullscreen} className="text-[#e0e0e0] hover:text-[#00ff88] transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className={`flex-grow relative ${isCollapsed ? "hidden" : ""}`}>
        {activeTab === "html" && (
          <SimpleEditor value={code.html} onChange={(value) => onCodeChange("html", value)} language="htmlmixed" />
        )}

        {activeTab === "css" && (
          <SimpleEditor value={code.css} onChange={(value) => onCodeChange("css", value)} language="css" />
        )}

        {activeTab === "js" && (
          <SimpleEditor value={code.js} onChange={(value) => onCodeChange("js", value)} language="javascript" />
        )}
      </div>
    </div>
  )
}

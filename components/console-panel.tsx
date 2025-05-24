"use client"

import { useEditorStore } from "@/lib/editor-store"
import { Button } from "@/components/ui/button"
import { Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

export default function ConsolePanel() {
  const { consoleMessages, clearConsole } = useEditorStore()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "error":
        return "❌"
      case "warn":
        return "⚠️"
      case "info":
        return "ℹ️"
      default:
        return "📝"
    }
  }

  const getMessageColor = (type: string) => {
    switch (type) {
      case "error":
        return "text-red-400"
      case "warn":
        return "text-yellow-400"
      case "info":
        return "text-blue-400"
      default:
        return "text-green-400"
    }
  }

  return (
    <div
      className={`bg-[#0a0a0a] border-t border-[#333333] ${isCollapsed ? "h-10" : "h-full"} transition-all duration-200`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-[#333333] cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-white">Console</span>
          <span className="text-xs text-gray-400">({consoleMessages.length})</span>
        </div>

        <div className="flex items-center space-x-2">
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                clearConsole()
              }}
              className="h-6 px-2 text-gray-400 hover:text-white"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
          {isCollapsed ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="h-full overflow-auto p-2 font-mono text-sm">
          {consoleMessages.length === 0 ? (
            <div className="text-gray-500 italic text-center py-8">Console output will appear here...</div>
          ) : (
            <div className="space-y-1">
              {consoleMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-2 p-2 rounded hover:bg-[#1a1a1a] ${getMessageColor(message.type)}`}
                >
                  <span className="flex-shrink-0 mt-0.5">{getMessageIcon(message.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="break-words">{message.content}</div>
                    <div className="text-xs text-gray-500 mt-1">{message.timestamp.toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

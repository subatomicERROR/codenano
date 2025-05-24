"use client"

import type React from "react"

import { useState } from "react"
import { useEditorStore } from "@/lib/editor-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { File, Folder, Plus, Search, MoreHorizontal, FileText, Code, ImageIcon, Settings } from "lucide-react"

export default function FileExplorer() {
  const { currentProject, activeFileId, setActiveFile, createFile, deleteFile } = useEditorStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreatingFile, setIsCreatingFile] = useState(false)
  const [newFileName, setNewFileName] = useState("")

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase()
    switch (ext) {
      case "html":
      case "htm":
        return <FileText className="w-4 h-4 text-orange-400" />
      case "css":
        return <Code className="w-4 h-4 text-blue-400" />
      case "js":
      case "jsx":
        return <Code className="w-4 h-4 text-yellow-400" />
      case "ts":
      case "tsx":
        return <Code className="w-4 h-4 text-blue-500" />
      case "py":
        return <Code className="w-4 h-4 text-green-400" />
      case "md":
        return <FileText className="w-4 h-4 text-gray-400" />
      case "json":
        return <Settings className="w-4 h-4 text-yellow-600" />
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "svg":
        return <ImageIcon className="w-4 h-4 text-purple-400" />
      default:
        return <File className="w-4 h-4 text-gray-400" />
    }
  }

  const filteredFiles =
    currentProject?.files.filter((file) => file.name.toLowerCase().includes(searchTerm.toLowerCase())) || []

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      createFile(newFileName.trim())
      setNewFileName("")
      setIsCreatingFile(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreateFile()
    } else if (e.key === "Escape") {
      setIsCreatingFile(false)
      setNewFileName("")
    }
  }

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a]">
      {/* Header */}
      <div className="p-3 border-b border-[#333333]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white">Explorer</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCreatingFile(true)}
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-7 h-7 bg-[#2a2a2a] border-[#333333] text-white text-xs"
          />
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-auto">
        <div className="p-2">
          {/* Project Name */}
          <div className="flex items-center space-x-2 mb-2 p-1">
            <Folder className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white truncate">
              {currentProject?.name || "Untitled Project"}
            </span>
          </div>

          {/* New File Input */}
          {isCreatingFile && (
            <div className="ml-6 mb-2">
              <Input
                placeholder="filename.ext"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={() => {
                  if (!newFileName.trim()) {
                    setIsCreatingFile(false)
                  }
                }}
                className="h-6 text-xs bg-[#2a2a2a] border-[#333333] text-white"
                autoFocus
              />
            </div>
          )}

          {/* Files */}
          <div className="space-y-1">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className={`flex items-center space-x-2 p-1 rounded cursor-pointer group ${
                  activeFileId === file.id
                    ? "bg-[#2a2a2a] text-white"
                    : "text-gray-300 hover:bg-[#252525] hover:text-white"
                }`}
                onClick={() => setActiveFile(file.id)}
              >
                <div className="ml-6 flex items-center space-x-2 flex-1 min-w-0">
                  {getFileIcon(file.name)}
                  <span className="text-xs truncate">{file.name}</span>
                  {file.isModified && <div className="w-1.5 h-1.5 bg-[#00ff88] rounded-full flex-shrink-0" />}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteFile(file.id)
                  }}
                  className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400"
                >
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>

          {filteredFiles.length === 0 && searchTerm && (
            <div className="text-center py-8 text-gray-500 text-xs">No files found matching "{searchTerm}"</div>
          )}

          {filteredFiles.length === 0 && !searchTerm && !isCreatingFile && (
            <div className="text-center py-8 text-gray-500 text-xs">
              <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No files yet</p>
              <p>Click + to create your first file</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

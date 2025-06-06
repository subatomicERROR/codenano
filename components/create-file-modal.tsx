"use client"

import type React from "react"

import { useState } from "react"
import { useEditorStore } from "@/lib/editor-store"

interface CreateFileModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateFileModal({ isOpen, onClose }: CreateFileModalProps) {
  const [fileName, setFileName] = useState("")
  const { createFile } = useEditorStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (fileName.trim()) {
      createFile(fileName.trim())
      setFileName("")
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Create New File</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="fileName" className="block text-sm font-medium text-gray-300 mb-1">
              File Name
            </label>
            <input
              type="text"
              id="fileName"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00ff88]"
              placeholder="e.g., index.html, style.css, script.js"
              autoFocus
            />
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#00ff88] text-black font-medium rounded-md hover:bg-[#00cc6a] transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateFileModal

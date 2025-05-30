"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SimpleCodeEditor from "./simple-code-editor"

interface MultiLanguageEditorProps {
  mode: string
  files: Array<{ name: string; content: string; path: string }>
  onFileChange: (path: string, content: string) => void
}

export default function MultiLanguageEditor({ mode, files, onFileChange }: MultiLanguageEditorProps) {
  const [activeFile, setActiveFile] = useState<string>("")

  // Update active file when files change
  useEffect(() => {
    if (files.length > 0) {
      if (!activeFile || !files.some((file) => file.path === activeFile)) {
        setActiveFile(files[0].path)
      }
    } else {
      setActiveFile("")
    }
  }, [files, activeFile])

  const getFileExtension = (filename: string) => {
    return filename.split(".").pop() || ""
  }

  const getEditorMode = (filename: string) => {
    const ext = getFileExtension(filename)

    switch (ext) {
      case "html":
        return "html"
      case "css":
        return "css"
      case "js":
        return "javascript"
      case "jsx":
        return "jsx"
      case "tsx":
        return "jsx"
      case "py":
        return "python"
      case "md":
      case "markdown":
        return "markdown"
      default:
        return "javascript"
    }
  }

  const handleCodeChange = (value: string) => {
    if (activeFile) {
      onFileChange(activeFile, value)
    }
  }

  // If no files, show empty state
  if (!files || files.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0a0a] text-gray-400">
        <div className="text-center">
          <p>No files to edit</p>
        </div>
      </div>
    )
  }

  // If no active file is set, use the first file
  const currentActiveFile = activeFile || files[0]?.path || ""
  const activeFileContent = files.find((file) => file.path === currentActiveFile)?.content || ""

  return (
    <div className="flex flex-col h-full">
      <Tabs value={currentActiveFile} onValueChange={setActiveFile} className="h-full flex flex-col">
        <div className="bg-[#0a0a0a] border-b border-[#333333] overflow-x-auto">
          <TabsList className="bg-transparent h-9">
            {files.map((file) => (
              <TabsTrigger
                key={file.path}
                value={file.path}
                className="data-[state=active]:bg-[#1a1a1a] data-[state=active]:border-t-2 data-[state=active]:border-t-[#00ff88] data-[state=active]:border-b-0 rounded-none px-4 h-9"
              >
                {file.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {files.map((file) => (
          <TabsContent key={file.path} value={file.path} className="flex-grow mt-0 h-full">
            <SimpleCodeEditor value={file.content} onChange={handleCodeChange} mode={getEditorMode(file.path)} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

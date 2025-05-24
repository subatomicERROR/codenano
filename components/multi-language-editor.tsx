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
  const [activeFile, setActiveFile] = useState<string>(files[0]?.path || "")

  // Update active file when files change
  useEffect(() => {
    if (files.length > 0 && !files.some((file) => file.path === activeFile)) {
      setActiveFile(files[0].path)
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
    onFileChange(activeFile, value)
  }

  const activeFileContent = files.find((file) => file.path === activeFile)?.content || ""
  const editorMode = getEditorMode(activeFile)

  return (
    <div className="flex flex-col h-full">
      <Tabs value={activeFile} onValueChange={setActiveFile} className="h-full flex flex-col">
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

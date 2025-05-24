"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"

interface SimpleCodeEditorProps {
  value: string
  onChange: (value: string) => void
  mode: string
}

export default function SimpleCodeEditor({ value, onChange, mode }: SimpleCodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [lineNumbers, setLineNumbers] = useState<number[]>([])

  useEffect(() => {
    const lines = value.split("\n").length
    setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1))
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = value.substring(0, start) + "  " + value.substring(end)
      onChange(newValue)

      // Set cursor position after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      }, 0)
    }
  }

  const getLanguageClass = () => {
    switch (mode) {
      case "html":
      case "htmlmixed":
        return "language-html"
      case "css":
        return "language-css"
      case "javascript":
      case "jsx":
        return "language-javascript"
      case "python":
        return "language-python"
      case "markdown":
        return "language-markdown"
      default:
        return "language-javascript"
    }
  }

  return (
    <div className="flex h-full bg-[#1e1e1e] text-white font-mono text-sm">
      {/* Line numbers */}
      <div className="bg-[#252526] px-2 py-4 text-[#858585] text-right min-w-[50px] select-none">
        {lineNumbers.map((num) => (
          <div key={num} className="leading-6">
            {num}
          </div>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={`w-full h-full p-4 bg-transparent text-white font-mono text-sm resize-none outline-none leading-6 ${getLanguageClass()}`}
          style={{
            tabSize: 2,
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          }}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
    </div>
  )
}

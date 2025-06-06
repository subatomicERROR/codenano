"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface SimpleEditorProps {
  value: string
  onChange: (value: string) => void
  language: "javascript" | "htmlmixed" | "css"
}

export function SimpleEditor({ value, onChange, language }: SimpleEditorProps) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    onChange(newValue)
  }

  // Set language-specific styling
  const getLanguageStyle = () => {
    switch (language) {
      case "javascript":
        return "bg-[#1e1e1e] text-[#e0e0e0]"
      case "htmlmixed":
        return "bg-[#1e1e1e] text-[#e0e0e0]"
      case "css":
        return "bg-[#1e1e1e] text-[#e0e0e0]"
      default:
        return "bg-[#1e1e1e] text-[#e0e0e0]"
    }
  }

  return (
    <div className="h-full w-full relative">
      <div className="absolute top-2 right-2 text-xs px-2 py-1 bg-[#333333] rounded text-[#e0e0e0]/70 z-10">
        {language === "htmlmixed" ? "HTML" : language.toUpperCase()}
      </div>
      <textarea
        value={localValue}
        onChange={handleChange}
        className={`h-full w-full overflow-auto font-mono text-sm p-4 resize-none outline-none border-none ${getLanguageStyle()}`}
        spellCheck="false"
        data-language={language}
        placeholder={`Paste your ${language === "htmlmixed" ? "HTML" : language.toUpperCase()} code here...`}
        style={{ minHeight: "300px" }}
      />
    </div>
  )
}

// Default export for backward compatibility
export default SimpleEditor

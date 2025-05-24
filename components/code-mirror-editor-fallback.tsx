"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface CodeMirrorEditorProps {
  value: string
  onChange: (value: string) => void
  language: "javascript" | "htmlmixed" | "css"
}

export default function CodeMirrorEditor({ value, onChange, language }: CodeMirrorEditorProps) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    onChange(newValue)
  }

  return (
    <textarea
      value={localValue}
      onChange={handleChange}
      className="h-full w-full overflow-auto font-mono text-sm bg-[#1e1e1e] text-[#e0e0e0] p-4 resize-none outline-none border-none"
      spellCheck="false"
      data-language={language}
    />
  )
}

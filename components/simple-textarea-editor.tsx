"use client"

import { useEffect, useRef } from "react"

interface SimpleTextareaEditorProps {
  value: string
  onChange: (value: string) => void
}

export default function SimpleTextareaEditor({ value, onChange }: SimpleTextareaEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.value = value
    }
  }, [value])

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-full p-4 font-mono text-sm bg-[#1e1e1e] text-white resize-none"
      spellCheck={false}
    />
  )
}

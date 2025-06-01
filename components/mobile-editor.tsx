"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Scissors, Clipboard, Undo, Redo, ZoomIn, ZoomOut, Play, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MobileEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  onSave?: () => void
  onRun?: () => void
}

export default function MobileEditor({ value, onChange, language, onSave, onRun }: MobileEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [fontSize, setFontSize] = useState(14)
  const [showKeyboard, setShowKeyboard] = useState(false)
  const [history, setHistory] = useState<string[]>([value])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [selection, setSelection] = useState({ start: 0, end: 0 })
  const { toast } = useToast()

  // Handle text selection
  const handleSelectionChange = useCallback(() => {
    if (textareaRef.current) {
      setSelection({
        start: textareaRef.current.selectionStart,
        end: textareaRef.current.selectionEnd,
      })
    }
  }, [])

  // Add to history for undo/redo
  const addToHistory = useCallback(
    (newValue: string) => {
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(newValue)
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    },
    [history, historyIndex],
  )

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    addToHistory(newValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = value.substring(0, start) + "  " + value.substring(end)
      onChange(newValue)
      addToHistory(newValue)

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      }, 0)
    }
  }

  // Mobile-friendly copy/cut/paste functions
  const handleCopy = async () => {
    if (selection.start !== selection.end) {
      const selectedText = value.substring(selection.start, selection.end)
      try {
        await navigator.clipboard.writeText(selectedText)
        toast({ title: "Copied to clipboard! 📋" })
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement("textarea")
        textArea.value = selectedText
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
        toast({ title: "Copied to clipboard! 📋" })
      }
    }
  }

  const handleCut = async () => {
    if (selection.start !== selection.end) {
      const selectedText = value.substring(selection.start, selection.end)
      const newValue = value.substring(0, selection.start) + value.substring(selection.end)

      try {
        await navigator.clipboard.writeText(selectedText)
        onChange(newValue)
        addToHistory(newValue)
        toast({ title: "Cut to clipboard! ✂️" })
      } catch (err) {
        // Fallback
        const textArea = document.createElement("textarea")
        textArea.value = selectedText
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
        onChange(newValue)
        addToHistory(newValue)
        toast({ title: "Cut to clipboard! ✂️" })
      }
    }
  }

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText()
      const newValue = value.substring(0, selection.start) + clipboardText + value.substring(selection.end)
      onChange(newValue)
      addToHistory(newValue)
      toast({ title: "Pasted from clipboard! 📌" })
    } catch (err) {
      toast({
        title: "Paste failed",
        description: "Please use Ctrl+V or long press to paste",
        variant: "destructive",
      })
    }
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      onChange(history[newIndex])
      toast({ title: "Undone! ↶" })
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      onChange(history[newIndex])
      toast({ title: "Redone! ↷" })
    }
  }

  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + 2, 24))
  }

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 2, 10))
  }

  // Insert common code snippets
  const insertSnippet = (snippet: string) => {
    const newValue = value.substring(0, selection.start) + snippet + value.substring(selection.end)
    onChange(newValue)
    addToHistory(newValue)
  }

  const commonSnippets = {
    html: [
      { name: "Div", code: "<div></div>" },
      { name: "Button", code: "<button></button>" },
      { name: "Input", code: '<input type="text" />' },
      { name: "Link", code: '<a href=""></a>' },
    ],
    css: [
      { name: "Flex", code: "display: flex;\njustify-content: center;\nalign-items: center;" },
      { name: "Grid", code: "display: grid;\ngrid-template-columns: 1fr 1fr;" },
      { name: "Center", code: "margin: 0 auto;\ntext-align: center;" },
    ],
    javascript: [
      { name: "Function", code: "function name() {\n  \n}" },
      { name: "Arrow", code: "const name = () => {\n  \n}" },
      { name: "Console", code: "console.log();" },
      { name: "Event", code: 'addEventListener("click", () => {\n  \n});' },
    ],
  }

  const currentSnippets = commonSnippets[language as keyof typeof commonSnippets] || []

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {/* Mobile Toolbar */}
      <div className="bg-[#1a1a1a] border-b border-[#333333] p-2">
        {/* Top Row - Main Actions */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1">
            <Button size="sm" variant="ghost" onClick={onRun} className="text-[#00ff88]">
              <Play className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onSave} className="text-blue-400">
              <Save className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-1">
            <Button size="sm" variant="ghost" onClick={decreaseFontSize}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs text-gray-400 px-2">{fontSize}px</span>
            <Button size="sm" variant="ghost" onClick={increaseFontSize}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Second Row - Edit Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Button size="sm" variant="ghost" onClick={handleCopy} disabled={selection.start === selection.end}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCut} disabled={selection.start === selection.end}>
              <Scissors className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handlePaste}>
              <Clipboard className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-1">
            <Button size="sm" variant="ghost" onClick={handleUndo} disabled={historyIndex <= 0}>
              <Undo className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleRedo} disabled={historyIndex >= history.length - 1}>
              <Redo className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Code Snippets */}
        {currentSnippets.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {currentSnippets.map((snippet, index) => (
              <Button
                key={index}
                size="sm"
                variant="outline"
                onClick={() => insertSnippet(snippet.code)}
                className="text-xs h-6 px-2 border-[#333333] text-gray-300"
              >
                {snippet.name}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onSelect={handleSelectionChange}
          onMouseUp={handleSelectionChange}
          onTouchEnd={handleSelectionChange}
          className="w-full h-full p-4 bg-[#0a0a0a] text-white font-mono resize-none outline-none leading-relaxed"
          style={{
            fontSize: `${fontSize}px`,
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            tabSize: 2,
            touchAction: "manipulation",
            WebkitTouchCallout: "none",
            WebkitUserSelect: "text",
            userSelect: "text",
          }}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          placeholder={`Start coding in ${language}...`}
        />

        {/* Selection Info */}
        {selection.start !== selection.end && (
          <div className="absolute bottom-4 right-4 bg-[#1a1a1a] border border-[#333333] rounded px-2 py-1 text-xs text-gray-400">
            {selection.end - selection.start} chars selected
          </div>
        )}
      </div>

      {/* Mobile Keyboard Helper */}
      <div className="bg-[#1a1a1a] border-t border-[#333333] p-2">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button size="sm" variant="ghost" onClick={() => insertSnippet("()")}>
              ( )
            </Button>
            <Button size="sm" variant="ghost" onClick={() => insertSnippet("{}")}>
              {`{ }`}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => insertSnippet("[]")}>
              [ ]
            </Button>
            <Button size="sm" variant="ghost" onClick={() => insertSnippet('"')}>
              "
            </Button>
            <Button size="sm" variant="ghost" onClick={() => insertSnippet("'")}>
              '
            </Button>
          </div>

          <div className="flex space-x-2">
            <Button size="sm" variant="ghost" onClick={() => insertSnippet("\n")}>
              ↵
            </Button>
            <Button size="sm" variant="ghost" onClick={() => insertSnippet("  ")}>
              Tab
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

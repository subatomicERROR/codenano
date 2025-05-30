"use client"

import { useRef, useState, useCallback } from "react"
import { Editor } from "@monaco-editor/react"
import { useTheme } from "next-themes"

interface MonacoEditorProps {
  value: string
  language: string
  onChange: (value: string) => void
  options?: any
}

export default function MonacoEditor({ value, language, onChange, options = {} }: MonacoEditorProps) {
  const editorRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { theme } = useTheme()

  const handleEditorDidMount = useCallback(
    (editor: any, monaco: any) => {
      editorRef.current = editor
      setIsLoading(false)

      // Define custom CodeNANO theme
      monaco.editor.defineTheme("codenano-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "6A9955", fontStyle: "italic" },
          { token: "keyword", foreground: "569CD6", fontStyle: "bold" },
          { token: "string", foreground: "CE9178" },
          { token: "number", foreground: "B5CEA8" },
          { token: "regexp", foreground: "D16969" },
          { token: "type", foreground: "4EC9B0" },
          { token: "class", foreground: "4EC9B0" },
          { token: "function", foreground: "DCDCAA" },
          { token: "variable", foreground: "9CDCFE" },
          { token: "constant", foreground: "4FC1FF" },
          { token: "property", foreground: "9CDCFE" },
          { token: "operator", foreground: "D4D4D4" },
          { token: "tag", foreground: "569CD6" },
          { token: "attribute.name", foreground: "92C5F8" },
          { token: "attribute.value", foreground: "CE9178" },
        ],
        colors: {
          "editor.background": "#0a0a0a",
          "editor.foreground": "#e0e0e0",
          "editor.lineHighlightBackground": "#1a1a1a",
          "editor.selectionBackground": "#00ff8830",
          "editor.selectionHighlightBackground": "#00ff8820",
          "editor.findMatchBackground": "#00ff8840",
          "editor.findMatchHighlightBackground": "#00ff8820",
          "editorCursor.foreground": "#00ff88",
          "editorLineNumber.foreground": "#666666",
          "editorLineNumber.activeForeground": "#00ff88",
          "editorIndentGuide.background": "#333333",
          "editorIndentGuide.activeBackground": "#00ff88",
          "editorWhitespace.foreground": "#333333",
          "editorBracketMatch.background": "#00ff8830",
          "editorBracketMatch.border": "#00ff88",
          "scrollbarSlider.background": "#33333380",
          "scrollbarSlider.hoverBackground": "#555555",
          "scrollbarSlider.activeBackground": "#00ff88",
        },
      })

      // Set the custom theme
      monaco.editor.setTheme("codenano-dark")

      // Enhanced editor configuration
      editor.updateOptions({
        fontSize: 14,
        lineHeight: 1.6,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
        fontLigatures: true,
        smoothScrolling: true,
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: "on",
        lineNumbers: "on",
        glyphMargin: false,
        folding: true,
        lineDecorationsWidth: 0,
        lineNumbersMinChars: 3,
        renderLineHighlight: "gutter",
        selectOnLineNumbers: true,
        automaticLayout: true,
        tabSize: 2,
        insertSpaces: true,
        detectIndentation: true,
        trimAutoWhitespace: true,
        formatOnPaste: true,
        formatOnType: true,
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnEnter: "on",
        acceptSuggestionOnCommitCharacter: true,
        snippetSuggestions: "top",
        emptySelectionClipboard: false,
        copyWithSyntaxHighlighting: true,
        multiCursorModifier: "ctrlCmd",
        accessibilitySupport: "auto",
        ...options,
      })

      // Add enhanced keyboard shortcuts
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        // Trigger save
        window.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "s",
            ctrlKey: true,
            metaKey: true,
          }),
        )
      })

      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR, () => {
        // Trigger run
        window.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "r",
            ctrlKey: true,
            metaKey: true,
          }),
        )
      })

      // Enhanced auto-completion for HTML
      if (language === "html") {
        monaco.languages.registerCompletionItemProvider("html", {
          provideCompletionItems: (model, position) => {
            const suggestions = [
              {
                label: "tailwind-container",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: '<div class="container mx-auto px-4">\n\t$0\n</div>',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "Tailwind CSS container with auto margins and padding",
              },
              {
                label: "tailwind-flex-center",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: '<div class="flex items-center justify-center">\n\t$0\n</div>',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "Flexbox container with centered content",
              },
              {
                label: "tailwind-grid",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">\n\t$0\n</div>',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "Responsive grid layout",
              },
              {
                label: "tailwind-button",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText:
                  '<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300">\n\t$0\n</button>',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "Styled button with hover effects",
              },
              {
                label: "tailwind-card",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText:
                  '<div class="bg-white rounded-lg shadow-lg p-6 transition-transform duration-300 hover:scale-105">\n\t$0\n</div>',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "Card component with shadow and hover effect",
              },
            ]
            return { suggestions }
          },
        })
      }

      // Enhanced auto-completion for CSS
      if (language === "css") {
        monaco.languages.registerCompletionItemProvider("css", {
          provideCompletionItems: (model, position) => {
            const suggestions = [
              {
                label: "smooth-transition",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: "transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);",
                documentation: "Smooth transition with easing",
              },
              {
                label: "glass-effect",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText:
                  "backdrop-filter: blur(10px);\nbackground: rgba(255, 255, 255, 0.1);\nborder: 1px solid rgba(255, 255, 255, 0.2);",
                documentation: "Glass morphism effect",
              },
              {
                label: "gradient-text",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText:
                  "background: linear-gradient(45deg, #00ff88, #00ccff);\n-webkit-background-clip: text;\n-webkit-text-fill-color: transparent;",
                documentation: "Gradient text effect",
              },
            ]
            return { suggestions }
          },
        })
      }

      // Enhanced auto-completion for JavaScript
      if (language === "javascript") {
        monaco.languages.registerCompletionItemProvider("javascript", {
          provideCompletionItems: (model, position) => {
            const suggestions = [
              {
                label: "console-group",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: 'console.group("$1");\n$0\nconsole.groupEnd();',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "Console group for organized logging",
              },
              {
                label: "async-function",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText:
                  'async function $1() {\n\ttry {\n\t\t$0\n\t} catch (error) {\n\t\tconsole.error("Error:", error);\n\t}\n}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "Async function with error handling",
              },
              {
                label: "dom-ready",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: 'document.addEventListener("DOMContentLoaded", function() {\n\t$0\n});',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "DOM ready event listener",
              },
            ]
            return { suggestions }
          },
        })
      }

      // Add smooth scrolling behavior
      editor.onDidScrollChange(() => {
        const scrollTop = editor.getScrollTop()
        editor.setScrollTop(scrollTop, 1) // Smooth scroll
      })

      // Enhanced error handling
      editor.onDidChangeModelContent(() => {
        const model = editor.getModel()
        if (model) {
          const value = model.getValue()
          onChange(value)
        }
      })
    },
    [onChange, language, options],
  )

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) {
        onChange(value)
      }
    },
    [onChange],
  )

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 bg-[#0a0a0a] flex items-center justify-center z-10">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00ff88] mx-auto mb-2"></div>
            <p className="text-sm text-gray-400">Loading editor...</p>
          </div>
        </div>
      )}

      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme="codenano-dark"
        loading={
          <div className="flex items-center justify-center h-full bg-[#0a0a0a]">
            <div className="text-center text-white">
              <div className="animate-pulse text-[#00ff88] text-2xl mb-2">⚡</div>
              <p className="text-sm text-gray-400">Initializing Monaco Editor...</p>
            </div>
          </div>
        }
        options={{
          fontSize: 14,
          lineHeight: 1.6,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: "on",
          automaticLayout: true,
          ...options,
        }}
      />
    </div>
  )
}

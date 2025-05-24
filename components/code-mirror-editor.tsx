"use client"

import { useEffect, useRef } from "react"

interface CodeMirrorEditorProps {
  value: string
  onChange: (value: string) => void
  mode: string
}

export default function CodeMirrorEditor({ value, onChange, mode }: CodeMirrorEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const editorInstanceRef = useRef<any>(null)

  useEffect(() => {
    // Import CodeMirror dynamically to avoid SSR issues
    const initCodeMirror = async () => {
      if (!editorRef.current) return

      // Clean up previous editor instance
      if (editorInstanceRef.current) {
        editorInstanceRef.current.destroy()
      }

      try {
        // Import all required modules
        const { EditorState } = await import("@codemirror/state")
        const { EditorView } = await import("@codemirror/view")
        const { basicSetup } = await import("@codemirror/basic-setup")
        const { oneDark } = await import("@codemirror/theme-one-dark")

        // Import language packages based on mode
        let languageExtension
        switch (mode) {
          case "javascript":
            const { javascript } = await import("@codemirror/lang-javascript")
            languageExtension = javascript()
            break
          case "jsx":
            const { javascript: jsxLang } = await import("@codemirror/lang-javascript")
            languageExtension = jsxLang({ jsx: true })
            break
          case "html":
          case "htmlmixed":
            const { html } = await import("@codemirror/lang-html")
            languageExtension = html()
            break
          case "css":
            const { css } = await import("@codemirror/lang-css")
            languageExtension = css()
            break
          case "markdown":
            const { markdown } = await import("@codemirror/lang-markdown")
            languageExtension = markdown()
            break
          case "python":
            const { python } = await import("@codemirror/lang-python")
            languageExtension = python()
            break
          default:
            const { javascript: defaultLang } = await import("@codemirror/lang-javascript")
            languageExtension = defaultLang()
        }

        // Create editor view
        const view = new EditorView({
          state: EditorState.create({
            doc: value,
            extensions: [
              basicSetup,
              languageExtension,
              oneDark,
              EditorView.updateListener.of((update) => {
                if (update.docChanged) {
                  onChange(update.state.doc.toString())
                }
              }),
            ],
          }),
          parent: editorRef.current,
        })

        editorInstanceRef.current = view
      } catch (error) {
        console.error("Error initializing CodeMirror:", error)

        // Fallback to a simple textarea if CodeMirror fails
        if (editorRef.current) {
          const textarea = document.createElement("textarea")
          textarea.value = value
          textarea.className = "w-full h-full p-4 font-mono text-sm bg-[#1e1e1e] text-white"
          textarea.style.height = "100%"
          textarea.addEventListener("input", (e) => {
            onChange((e.target as HTMLTextAreaElement).value)
          })

          editorRef.current.innerHTML = ""
          editorRef.current.appendChild(textarea)
        }
      }
    }

    initCodeMirror()

    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.destroy()
      }
    }
  }, [mode])

  // Update editor content when value prop changes
  useEffect(() => {
    if (editorInstanceRef.current) {
      const currentValue = editorInstanceRef.current.state.doc.toString()
      if (value !== currentValue) {
        editorInstanceRef.current.dispatch({
          changes: {
            from: 0,
            to: currentValue.length,
            insert: value,
          },
        })
      }
    }
  }, [value])

  return <div ref={editorRef} className="h-full overflow-auto font-mono text-sm" />
}

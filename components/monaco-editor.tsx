"use client"

import { useEffect, useRef, useCallback } from "react"
import { loader } from "@monaco-editor/react"

interface MonacoEditorProps {
  value: string
  language: string
  onChange: (value: string) => void
  onSave: () => void
}

export default function MonacoEditor({ value, language, onChange, onSave }: MonacoEditorProps) {
  const editorRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isUpdatingRef = useRef(false)
  const lastValueRef = useRef(value)

  const handleEditorChange = useCallback(
    (newValue: string) => {
      if (isUpdatingRef.current) return
      if (newValue === lastValueRef.current) return

      lastValueRef.current = newValue
      onChange(newValue)
    },
    [onChange],
  )

  const handleSave = useCallback(() => {
    onSave()
  }, [onSave])

  useEffect(() => {
    if (!containerRef.current) return

    let editor: any = null

    // Configure Monaco loader
    loader.config({
      paths: {
        vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs",
      },
    })

    loader.init().then((monaco) => {
      if (!containerRef.current) return

      // Define custom theme
      monaco.editor.defineTheme("codenano-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "6A9955" },
          { token: "keyword", foreground: "569CD6" },
          { token: "string", foreground: "CE9178" },
          { token: "number", foreground: "B5CEA8" },
          { token: "type", foreground: "4EC9B0" },
          { token: "class", foreground: "4EC9B0" },
          { token: "function", foreground: "DCDCAA" },
          { token: "variable", foreground: "9CDCFE" },
        ],
        colors: {
          "editor.background": "#0a0a0a",
          "editor.foreground": "#d4d4d4",
          "editorLineNumber.foreground": "#858585",
          "editorLineNumber.activeForeground": "#c6c6c6",
          "editor.selectionBackground": "#264f78",
          "editor.selectionHighlightBackground": "#add6ff26",
          "editorCursor.foreground": "#00ff88",
          "editor.findMatchBackground": "#515c6a",
          "editor.findMatchHighlightBackground": "#ea5c0055",
          "editor.findRangeHighlightBackground": "#3a3d4166",
          "editorHoverWidget.background": "#252526",
          "editorHoverWidget.border": "#454545",
          "editorSuggestWidget.background": "#252526",
          "editorSuggestWidget.border": "#454545",
          "editorSuggestWidget.selectedBackground": "#094771",
          "editorWidget.background": "#252526",
          "editorWidget.border": "#454545",
          "input.background": "#3c3c3c",
          "input.border": "#3c3c3c",
          "inputOption.activeBorder": "#007acc",
          "scrollbarSlider.background": "#79797966",
          "scrollbarSlider.hoverBackground": "#646464b3",
          "scrollbarSlider.activeBackground": "#bfbfbf66",
          "progressBar.background": "#0e70c0",
        },
      })

      // Create editor
      editor = monaco.editor.create(containerRef.current, {
        value,
        language: getMonacoLanguage(language),
        theme: "codenano-dark",
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace",
        lineNumbers: "on",
        roundedSelection: false,
        scrollBeyondLastLine: false,
        minimap: { enabled: true },
        automaticLayout: true,
        tabSize: 2,
        insertSpaces: true,
        wordWrap: "on",
        contextmenu: true,
        mouseWheelZoom: true,
        smoothScrolling: true,
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        renderLineHighlight: "gutter",
        selectOnLineNumbers: true,
        glyphMargin: true,
        folding: true,
        foldingHighlight: true,
        showFoldingControls: "always",
        unfoldOnClickAfterEndOfLine: true,
        bracketPairColorization: { enabled: true },
        guides: {
          bracketPairs: true,
          bracketPairsHorizontal: true,
          highlightActiveBracketPair: true,
          indentation: true,
        },
      })

      editorRef.current = editor
      lastValueRef.current = value

      // Handle content changes with debouncing
      let changeTimeout: NodeJS.Timeout
      editor.onDidChangeModelContent(() => {
        if (isUpdatingRef.current) return

        clearTimeout(changeTimeout)
        changeTimeout = setTimeout(() => {
          const newValue = editor.getValue()
          handleEditorChange(newValue)
        }, 100)
      })

      // Add save shortcut
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        handleSave()
      })

      // Add format shortcut
      editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
        editor.getAction("editor.action.formatDocument")?.run()
      })

      // Add comment toggle shortcut
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash, () => {
        editor.getAction("editor.action.commentLine")?.run()
      })

      // Configure language-specific features
      configureLanguageFeatures(monaco, language)
    })

    return () => {
      if (editor) {
        editor.dispose()
      }
    }
  }, []) // Only run once on mount

  // Update editor value when prop changes (but prevent loops)
  useEffect(() => {
    if (editorRef.current && value !== lastValueRef.current) {
      isUpdatingRef.current = true
      editorRef.current.setValue(value)
      lastValueRef.current = value
      setTimeout(() => {
        isUpdatingRef.current = false
      }, 50)
    }
  }, [value])

  // Update editor language when prop changes
  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel()
      if (model) {
        loader.init().then((monaco) => {
          monaco.editor.setModelLanguage(model, getMonacoLanguage(language))
          configureLanguageFeatures(monaco, language)
        })
      }
    }
  }, [language])

  return <div ref={containerRef} className="w-full h-full" />
}

function getMonacoLanguage(language: string): string {
  switch (language) {
    case "jsx":
      return "javascript"
    case "tsx":
      return "typescript"
    case "vue":
      return "html"
    case "svelte":
      return "html"
    default:
      return language
  }
}

function configureLanguageFeatures(monaco: any, language: string) {
  // Configure TypeScript/JavaScript
  if (language === "javascript" || language === "jsx" || language === "typescript" || language === "tsx") {
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: "React",
      allowJs: true,
      typeRoots: ["node_modules/@types"],
    })

    // Add React types
    const reactTypes = `
      declare module 'react' {
        export interface Component<P = {}, S = {}> {}
        export function useState<T>(initialState: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
        export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
        export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
        export function useMemo<T>(factory: () => T, deps: any[]): T;
        export function useRef<T>(initialValue: T): { current: T };
        export const createElement: any;
        export default any;
      }
    `

    monaco.languages.typescript.javascriptDefaults.addExtraLib(reactTypes, "react.d.ts")
  }

  // Configure HTML
  if (language === "html") {
    monaco.languages.html.htmlDefaults.setOptions({
      format: {
        tabSize: 2,
        insertSpaces: true,
        wrapLineLength: 120,
        unformatted: "default",
        contentUnformatted: "pre,code,textarea",
        indentInnerHtml: false,
        preserveNewLines: true,
        maxPreserveNewLines: 2,
        indentHandlebars: false,
        endWithNewline: false,
        extraLiners: "head, body, /html",
        wrapAttributes: "auto",
      },
      suggest: { html5: true },
      validate: true,
    })
  }

  // Configure CSS
  if (language === "css") {
    monaco.languages.css.cssDefaults.setOptions({
      validate: true,
      lint: {
        compatibleVendorPrefixes: "ignore",
        vendorPrefix: "warning",
        duplicateProperties: "warning",
        emptyRules: "warning",
        importStatement: "ignore",
        boxModel: "ignore",
        universalSelector: "ignore",
        zeroUnits: "ignore",
        fontFaceProperties: "warning",
        hexColorLength: "error",
        argumentsInColorFunction: "error",
        unknownProperties: "warning",
        ieHack: "ignore",
        unknownVendorSpecificProperties: "ignore",
        propertyIgnoredDueToDisplay: "warning",
        important: "ignore",
        float: "ignore",
        idSelector: "ignore",
      },
    })
  }
}

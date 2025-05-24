"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface EditorFile {
  id: string
  name: string
  content: string
  language: string
  isModified: boolean
}

export interface Project {
  id: string
  name: string
  description: string
  mode: "html" | "react" | "vue" | "svelte" | "python" | "markdown" | "nextjs"
  files: EditorFile[]
  createdAt: Date
  updatedAt: Date
}

export interface ConsoleMessage {
  id: string
  type: "log" | "error" | "warn" | "info"
  content: string
  timestamp: Date
}

interface EditorState {
  // Project state
  currentProject: Project | null
  projects: Project[]

  // UI state
  activeFileId: string | null
  sidebarOpen: boolean
  consoleOpen: boolean
  previewMode: "editor" | "preview" | "split"

  // Console state
  consoleMessages: ConsoleMessage[]

  // Save state
  saveState: "saved" | "unsaved" | "saving" | "error"

  // Actions
  setCurrentProject: (project: Project) => void
  createProject: (name: string, mode: Project["mode"]) => void
  setActiveFile: (fileId: string) => void
  createFile: (name: string) => void
  updateFile: (fileId: string, content: string) => void
  deleteFile: (fileId: string) => void
  renameFile: (fileId: string, newName: string) => void

  // UI actions
  setSidebarOpen: (open: boolean) => void
  setConsoleOpen: (open: boolean) => void
  setPreviewMode: (mode: "editor" | "preview" | "split") => void

  // Console actions
  addConsoleMessage: (type: ConsoleMessage["type"], content: string) => void
  clearConsole: () => void

  // Save actions
  setSaveState: (state: "saved" | "unsaved" | "saving" | "error") => void
}

const getLanguageFromFileName = (fileName: string): string => {
  const ext = fileName.split(".").pop()?.toLowerCase()

  switch (ext) {
    case "html":
    case "htm":
      return "html"
    case "css":
      return "css"
    case "js":
      return "javascript"
    case "jsx":
      return "jsx"
    case "ts":
      return "typescript"
    case "tsx":
      return "tsx"
    case "py":
      return "python"
    case "md":
      return "markdown"
    case "vue":
      return "vue"
    case "svelte":
      return "svelte"
    case "json":
      return "json"
    default:
      return "plaintext"
  }
}

const createDefaultProject = (): Project => ({
  id: "default",
  name: "My Project",
  description: "A new CodeNANO project",
  mode: "html",
  files: [
    {
      id: "html-1",
      name: "index.html",
      content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeNANO Project</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>🚀 Welcome to CodeNANO</h1>
        <p>The most advanced code editor for modern developers</p>
        <button onclick="greet()" class="btn">Click me!</button>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
      language: "html",
      isModified: false,
    },
    {
      id: "css-1",
      name: "style.css",
      content: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
    color: #ffffff;
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.container {
    text-align: center;
    max-width: 600px;
    padding: 2rem;
}

h1 {
    font-size: 3rem;
    background: linear-gradient(45deg, #00ff88, #00ccff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 1rem;
    font-weight: 700;
}

p {
    font-size: 1.2rem;
    color: #cccccc;
    margin-bottom: 2rem;
    line-height: 1.6;
}

.btn {
    background: linear-gradient(45deg, #00ff88, #00ccff);
    color: #000;
    border: none;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(0, 255, 136, 0.3);
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 255, 136, 0.4);
}`,
      language: "css",
      isModified: false,
    },
    {
      id: "js-1",
      name: "script.js",
      content: `// Welcome to CodeNANO - The future of coding!

function greet() {
    const messages = [
        "🚀 Welcome to the future of coding!",
        "💡 CodeNANO: Where ideas become reality",
        "⚡ Lightning-fast development at your fingertips",
        "🎯 Precision coding for modern developers",
        "🌟 Your next breakthrough starts here!"
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    alert(randomMessage);
    
    console.log("🎉 CodeNANO is ready for action!");
    console.log("✨ Start building something amazing!");
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 CodeNANO Editor Loaded Successfully!");
    console.log("💻 Happy coding!");
});

// Example of modern JavaScript features
const features = {
    editor: "Monaco Editor",
    languages: ["HTML", "CSS", "JavaScript", "TypeScript", "Python", "React"],
    preview: "Real-time",
    performance: "Lightning fast"
};

console.table(features);`,
      language: "javascript",
      isModified: false,
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
})

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentProject: null,
      projects: [],
      activeFileId: null,
      sidebarOpen: true,
      consoleOpen: false,
      previewMode: "split",
      consoleMessages: [],
      saveState: "saved",

      // Project actions
      setCurrentProject: (project) => {
        set({
          currentProject: project,
          activeFileId: project.files[0]?.id || null,
        })
      },

      createProject: (name, mode) => {
        const newProject: Project = {
          id: Date.now().toString(),
          name,
          description: `A new ${mode} project`,
          mode,
          files: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        set((state) => ({
          projects: [...state.projects, newProject],
          currentProject: newProject,
          activeFileId: null,
        }))
      },

      setActiveFile: (fileId) => {
        const state = get()
        if (state.activeFileId !== fileId) {
          set({ activeFileId: fileId })
        }
      },

      createFile: (name) => {
        const state = get()
        if (!state.currentProject) return

        const newFile: EditorFile = {
          id: Date.now().toString(),
          name,
          content: "",
          language: getLanguageFromFileName(name),
          isModified: false,
        }

        const updatedProject = {
          ...state.currentProject,
          files: [...state.currentProject.files, newFile],
          updatedAt: new Date(),
        }

        set({
          currentProject: updatedProject,
          activeFileId: newFile.id,
          saveState: "unsaved",
        })
      },

      updateFile: (fileId, content) => {
        const state = get()
        if (!state.currentProject) return

        // Check if content actually changed to prevent unnecessary updates
        const currentFile = state.currentProject.files.find((f) => f.id === fileId)
        if (currentFile && currentFile.content === content) return

        const updatedFiles = state.currentProject.files.map((file) =>
          file.id === fileId ? { ...file, content, isModified: true } : file,
        )

        const updatedProject = {
          ...state.currentProject,
          files: updatedFiles,
          updatedAt: new Date(),
        }

        set({
          currentProject: updatedProject,
          saveState: "unsaved",
        })
      },

      deleteFile: (fileId) => {
        const state = get()
        if (!state.currentProject) return

        const updatedFiles = state.currentProject.files.filter((file) => file.id !== fileId)
        const newActiveFileId = state.activeFileId === fileId ? updatedFiles[0]?.id || null : state.activeFileId

        const updatedProject = {
          ...state.currentProject,
          files: updatedFiles,
          updatedAt: new Date(),
        }

        set({
          currentProject: updatedProject,
          activeFileId: newActiveFileId,
          saveState: "unsaved",
        })
      },

      renameFile: (fileId, newName) => {
        const state = get()
        if (!state.currentProject) return

        const updatedFiles = state.currentProject.files.map((file) =>
          file.id === fileId
            ? { ...file, name: newName, language: getLanguageFromFileName(newName), isModified: true }
            : file,
        )

        const updatedProject = {
          ...state.currentProject,
          files: updatedFiles,
          updatedAt: new Date(),
        }

        set({
          currentProject: updatedProject,
          saveState: "unsaved",
        })
      },

      // UI actions
      setSidebarOpen: (open) => {
        const state = get()
        if (state.sidebarOpen !== open) {
          set({ sidebarOpen: open })
        }
      },

      setConsoleOpen: (open) => {
        const state = get()
        if (state.consoleOpen !== open) {
          set({ consoleOpen: open })
        }
      },

      setPreviewMode: (mode) => {
        const state = get()
        if (state.previewMode !== mode) {
          set({ previewMode: mode })
        }
      },

      // Console actions
      addConsoleMessage: (type, content) => {
        const state = get()
        const message: ConsoleMessage = {
          id: Date.now().toString() + Math.random(),
          type,
          content,
          timestamp: new Date(),
        }

        // Prevent duplicate messages
        const isDuplicate = state.consoleMessages.some(
          (msg) => msg.content === content && msg.type === type && Date.now() - msg.timestamp.getTime() < 1000,
        )

        if (!isDuplicate) {
          set({
            consoleMessages: [...state.consoleMessages.slice(-99), message], // Keep last 100 messages
          })
        }
      },

      clearConsole: () => set({ consoleMessages: [] }),

      // Save actions
      setSaveState: (saveState) => {
        const state = get()
        if (state.saveState !== saveState) {
          set({ saveState })
        }
      },
    }),
    {
      name: "codenano-editor-store",
      partialize: (state) => ({
        currentProject: state.currentProject,
        projects: state.projects,
        sidebarOpen: state.sidebarOpen,
        consoleOpen: state.consoleOpen,
        previewMode: state.previewMode,
      }),
    },
  ),
)

// Initialize with default project if none exists
export const initializeStore = () => {
  const store = useEditorStore.getState()
  if (!store.currentProject && store.projects.length === 0) {
    const defaultProject = createDefaultProject()
    useEditorStore.setState({
      currentProject: defaultProject,
      projects: [defaultProject],
      activeFileId: defaultProject.files[0]?.id || null,
    })
  }
}

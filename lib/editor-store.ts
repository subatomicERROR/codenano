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
  description: "A clean HTML, CSS, and JavaScript project with Tailwind CSS",
  mode: "html",
  files: [
    {
      id: "html-1",
      name: "index.html",
      content: `<div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
  <div class="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
    <h1 class="text-3xl font-bold text-gray-800 mb-4 text-center">
      Welcome to CodeNANO
    </h1>
    <p class="text-gray-600 mb-6 text-center">
      Start building amazing projects with HTML, CSS, JavaScript, and Tailwind CSS!
    </p>
    <button 
      onclick="showMessage()" 
      class="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition duration-300 transform hover:scale-105"
    >
      Click Me!
    </button>
    <div id="message" class="mt-4 p-4 bg-green-100 text-green-800 rounded-lg hidden">
      🎉 Great! You can copy-paste any code from ChatGPT here!
    </div>
  </div>
</div>`,
      language: "html",
      isModified: false,
    },
    {
      id: "css-1",
      name: "style.css",
      content: `/* Custom CSS - Tailwind CSS is already included! */

/* You can add custom styles here */
.custom-animation {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Custom hover effects */
.hover-glow:hover {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
}

/* Responsive utilities */
@media (max-width: 640px) {
  .mobile-text {
    font-size: 1.25rem;
  }
}`,
      language: "css",
      isModified: false,
    },
    {
      id: "js-1",
      name: "script.js",
      content: `// JavaScript with Tailwind CSS integration
console.log('🚀 CodeNANO loaded with Tailwind CSS!');

function showMessage() {
  const messageDiv = document.getElementById('message');
  messageDiv.classList.remove('hidden');
  messageDiv.classList.add('custom-animation');
  
  // Add some interactive effects
  setTimeout(() => {
    messageDiv.style.background = 'linear-gradient(45deg, #10b981, #3b82f6)';
    messageDiv.style.color = 'white';
  }, 500);
  
  console.log('✨ Message shown!');
}

// Example: Dynamic Tailwind classes
function addDynamicContent() {
  const container = document.querySelector('.bg-white');
  
  const newElement = document.createElement('div');
  newElement.className = 'mt-4 p-4 bg-yellow-100 text-yellow-800 rounded-lg border-l-4 border-yellow-500';
  newElement.innerHTML = '💡 <strong>Tip:</strong> You can copy-paste any HTML/CSS/JS code here!';
  
  container.appendChild(newElement);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  console.log('📝 Ready for copy-paste coding!');
  
  // Example of using Tailwind classes dynamically
  const button = document.querySelector('button');
  button.addEventListener('mouseenter', () => {
    button.classList.add('shadow-lg');
  });
  
  button.addEventListener('mouseleave', () => {
    button.classList.remove('shadow-lg');
  });
});`,
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
      sidebarOpen: false,
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

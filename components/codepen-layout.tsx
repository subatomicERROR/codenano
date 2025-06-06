"use client"

import { useState, useEffect } from "react"
import { useEditorStore } from "@/lib/editor-store"
import { TopMenuBar } from "./top-menu-bar"
import { EditorPane } from "./editor-pane"
import { PreviewPane } from "./preview-pane"
import { StatusBar } from "./status-bar"
import { ProfessionalLoading } from "./professional-loading"

interface CodepenLayoutProps {
  user?: any
}

export function CodepenLayout({ user }: CodepenLayoutProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [layout, setLayout] = useState<"horizontal" | "vertical">("horizontal")

  // Properly destructure from the editor store
  const { currentProject, activeFileId, setCurrentProject } = useEditorStore()

  // Get files from currentProject
  const files = currentProject?.files || []
  const currentFile = files.find((f) => f.id === activeFileId)

  useEffect(() => {
    // Initialize with a default project if none exists
    if (!currentProject) {
      const defaultProject = {
        id: "default",
        name: "My Project",
        description: "A clean HTML, CSS, and JavaScript project with Tailwind CSS",
        mode: "html" as const,
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
      }

      setCurrentProject(defaultProject)
    }

    // Simulate loading time for editor initialization
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [currentProject, setCurrentProject])

  const handleRun = () => {
    // Trigger preview refresh
    window.dispatchEvent(new CustomEvent("refreshPreview"))
  }

  const handleSave = () => {
    // Save functionality will be handled by the TopMenuBar
    console.log("Save triggered")
  }

  const handleShare = () => {
    // Share functionality will be handled by the TopMenuBar
    console.log("Share triggered")
  }

  const handleSettings = () => {
    // Toggle layout or open settings
    setLayout(layout === "horizontal" ? "vertical" : "horizontal")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <ProfessionalLoading variant="progress" size="xl" text="Initializing Editor" showProgress={true} />
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#0a0a0a] flex flex-col overflow-hidden">
      {/* Top Menu Bar */}
      <TopMenuBar user={user} onRun={handleRun} onSave={handleSave} onShare={handleShare} onSettings={handleSettings} />

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {layout === "horizontal" ? (
          <>
            {/* Left Panel - Editor */}
            <div className="w-1/2 border-r border-gray-800">
              <EditorPane />
            </div>

            {/* Right Panel - Preview */}
            <div className="w-1/2">
              <PreviewPane />
            </div>
          </>
        ) : (
          <div className="flex flex-col w-full">
            {/* Top Panel - Editor */}
            <div className="h-1/2 border-b border-gray-800">
              <EditorPane />
            </div>

            {/* Bottom Panel - Preview */}
            <div className="h-1/2">
              <PreviewPane />
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <StatusBar currentFile={currentFile} layout={layout} onLayoutChange={setLayout} />
    </div>
  )
}

// Default export for backward compatibility
export default CodepenLayout

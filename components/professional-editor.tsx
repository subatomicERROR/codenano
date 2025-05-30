"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useEditorStore, initializeStore } from "@/lib/editor-store"
import { getBrowserClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Save,
  Download,
  Settings,
  LogOut,
  User,
  Play,
  Sidebar,
  Terminal,
  Monitor,
  Code,
  Eye,
  Plus,
  FileText,
  Loader2,
  Home,
  Compass,
  BookOpen,
} from "lucide-react"
import { Logo } from "./logo"
import FileExplorer from "./file-explorer"
import MonacoEditor from "./monaco-editor"
import PreviewPane from "./preview-pane"
import ConsolePanel from "./console-panel"
import Link from "next/link"
import CreateProjectModal from "./create-project-modal"
import CodePenLayout from "./codepen-layout"

export default function ProfessionalEditor() {
  const [user, setUser] = useState<any>(null)
  const [projectTitle, setProjectTitle] = useState("Untitled Project")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [tempTitle, setTempTitle] = useState(projectTitle)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveDescription, setSaveDescription] = useState("")
  const [saveTags, setSaveTags] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const router = useRouter()
  const { toast } = useToast()
  const supabase = getBrowserClient()

  const {
    currentProject,
    activeFileId,
    sidebarOpen,
    setSidebarOpen,
    consoleOpen,
    setConsoleOpen,
    previewMode,
    setPreviewMode,
    saveState,
    setSaveState,
    createFile,
    updateFile,
    addConsoleMessage,
  } = useEditorStore()

  // Initialize store on mount
  useEffect(() => {
    initializeStore()
  }, [])

  // Get active file using the same pattern as code-editor.tsx
  const activeFile = useMemo(() => {
    return currentProject?.files.find((file) => file.id === activeFileId)
  }, [currentProject?.files, activeFileId])

  // Check authentication
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }

    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    })
    router.push("/")
  }

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save your project",
        variant: "destructive",
      })
      return
    }

    setShowSaveDialog(true)
  }

  const handleSaveProject = async () => {
    if (!currentProject || !user) return

    setIsSaving(true)
    setSaveState("saving")

    try {
      const projectData = {
        title: projectTitle,
        description: saveDescription,
        tags: saveTags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        is_public: isPublic,
        files: currentProject.files,
        user_id: user.id,
      }

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      })

      if (!response.ok) {
        throw new Error("Failed to save project")
      }

      const result = await response.json()

      toast({
        title: "Project saved! 🎉",
        description: `"${projectTitle}" has been saved successfully`,
      })

      setSaveState("saved")
      setShowSaveDialog(false)
      setSaveDescription("")
      setSaveTags("")

      // Update URL with project ID
      router.push(`/project/${result.id}`)
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message || "Failed to save project",
        variant: "destructive",
      })
      setSaveState("error")
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = () => {
    if (!currentProject) return

    const projectData = {
      name: projectTitle,
      files: currentProject.files,
    }

    const blob = new Blob([JSON.stringify(projectData, null, 2)], {
      type: "application/json",
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${projectTitle.replace(/\s+/g, "-").toLowerCase()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Project exported! 📦",
      description: "Your project has been downloaded as a JSON file",
    })
  }

  const handleRun = () => {
    // Trigger preview refresh
    const iframe = document.querySelector("iframe")
    if (iframe) {
      iframe.src = iframe.src
    }

    addConsoleMessage("info", "🚀 Code executed successfully!")

    toast({
      title: "Code executed! ⚡",
      description: "Your code is running in the preview",
    })
  }

  const handleCreateFile = () => {
    const fileName = prompt("Enter file name (e.g., script.js, style.css):")
    if (fileName && fileName.trim()) {
      createFile(fileName.trim())
      toast({
        title: "File created! 📄",
        description: `${fileName} has been added to your project`,
      })
    }
  }

  const handleTitleSave = () => {
    setProjectTitle(tempTitle)
    setIsEditingTitle(false)
    toast({
      title: "Project renamed",
      description: `Project renamed to "${tempTitle}"`,
    })
  }

  const handleFileChange = useCallback(
    (content: string) => {
      if (activeFileId && activeFile && content !== activeFile.content) {
        updateFile(activeFileId, content)
      }
    },
    [activeFileId, activeFile, updateFile],
  )

  if (!currentProject) {
    return (
      <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold mb-2">Welcome to CodeNANO</h2>
          <p className="text-gray-400">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#0a0a0a] flex flex-col">
      {/* Top Navigation */}
      <nav className="flex items-center justify-between h-[60px] bg-[#1a1a1a] px-6 border-b border-[#333333]">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Logo size="sm" />
          </Link>

          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTitleSave()
                  if (e.key === "Escape") {
                    setTempTitle(projectTitle)
                    setIsEditingTitle(false)
                  }
                }}
                className="h-8 w-48 bg-[#0a0a0a] border-[#333333] text-white"
                autoFocus
              />
              <Button size="sm" onClick={handleTitleSave} className="bg-[#00ff88] text-black hover:bg-[#00cc77]">
                Save
              </Button>
            </div>
          ) : (
            <div
              className="text-[#e0e0e0] font-medium cursor-pointer hover:text-[#00ff88] transition-colors"
              onClick={() => setIsEditingTitle(true)}
            >
              {projectTitle}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Action Buttons */}
          <Button
            variant="outline"
            size="sm"
            className="border-[#333333] hover:bg-[#252525] text-[#e0e0e0]"
            onClick={handleRun}
          >
            <Play className="mr-2 h-4 w-4" /> Run
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="border-[#333333] hover:bg-[#252525] text-[#e0e0e0]"
            onClick={handleSave}
          >
            <Save className="mr-2 h-4 w-4" /> Save
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="border-[#333333] hover:bg-[#252525] text-[#e0e0e0]"
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>

          {/* Profile Dropdown */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#1a1a1a] border-[#333333] text-[#e0e0e0]">
                <div className="px-2 py-1.5 text-sm font-medium">{user.email}</div>
                <DropdownMenuSeparator className="bg-[#333333]" />
                <Link href="/dashboard">
                  <DropdownMenuItem className="cursor-pointer hover:bg-[#252525]">
                    <Home className="mr-2 h-4 w-4" /> Dashboard
                  </DropdownMenuItem>
                </Link>
                <Link href="/explore">
                  <DropdownMenuItem className="cursor-pointer hover:bg-[#252525]">
                    <Compass className="mr-2 h-4 w-4" /> Explore
                  </DropdownMenuItem>
                </Link>
                <Link href="/reels">
                  <DropdownMenuItem className="cursor-pointer hover:bg-[#252525]">
                    <BookOpen className="mr-2 h-4 w-4" /> Reels
                  </DropdownMenuItem>
                </Link>
                <Link href="/settings">
                  <DropdownMenuItem className="cursor-pointer hover:bg-[#252525]">
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator className="bg-[#333333]" />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-400 hover:bg-[#252525]">
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/login">
              <Button size="sm" className="bg-[#00ff88] text-black hover:bg-[#00cc77]">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </nav>

      {/* Editor Controls */}
      <div className="h-12 bg-[#1a1a1a] border-b border-[#333333] flex items-center justify-between px-4">
        {/* Left Controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`${sidebarOpen ? "text-[#00ff88]" : "text-gray-400"} hover:text-white`}
          >
            <Sidebar className="w-4 h-4" />
          </Button>

          <div className="h-4 w-px bg-[#333333]" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="text-gray-400 hover:text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Center - View Mode Toggle */}
        <div className="flex items-center space-x-1 bg-[#2a2a2a] rounded-md p-1">
          <Button
            variant={previewMode === "editor" ? "default" : "ghost"}
            size="sm"
            onClick={() => setPreviewMode("editor")}
            className={previewMode === "editor" ? "bg-[#00ff88] text-black" : "text-gray-400 hover:text-white"}
          >
            <Code className="w-4 h-4" />
          </Button>
          <Button
            variant={previewMode === "split" ? "default" : "ghost"}
            size="sm"
            onClick={() => setPreviewMode("split")}
            className={previewMode === "split" ? "bg-[#00ff88] text-black" : "text-gray-400 hover:text-white"}
          >
            <Monitor className="w-4 h-4" />
          </Button>
          <Button
            variant={previewMode === "preview" ? "default" : "ghost"}
            size="sm"
            onClick={() => setPreviewMode("preview")}
            className={previewMode === "preview" ? "bg-[#00ff88] text-black" : "text-gray-400 hover:text-white"}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConsoleOpen(!consoleOpen)}
            className={`${consoleOpen ? "text-[#00ff88]" : "text-gray-400"} hover:text-white`}
          >
            <Terminal className="w-4 h-4" />
          </Button>

          <div className="flex items-center space-x-2 text-xs">
            <div
              className={`w-2 h-2 rounded-full ${
                saveState === "saved"
                  ? "bg-green-400"
                  : saveState === "saving"
                    ? "bg-yellow-400"
                    : saveState === "unsaved"
                      ? "bg-orange-400"
                      : "bg-red-400"
              }`}
            />
            <span className="text-gray-400 capitalize">{saveState}</span>
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-64 border-r border-[#333333] bg-[#1a1a1a]">
            <FileExplorer />
          </div>
        )}

        {/* Editor and Preview */}
        <div className="flex-1 flex flex-col">
          {currentProject?.mode === "html" ? (
            <CodePenLayout />
          ) : (
            <div className="flex-1 flex">
              {/* Code Editor */}
              {(previewMode === "editor" || previewMode === "split") && (
                <div className={previewMode === "split" ? "w-1/2 border-r border-[#333333]" : "w-full"}>
                  {activeFile ? (
                    <MonacoEditor
                      value={activeFile.content}
                      language={activeFile.language}
                      onChange={handleFileChange}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-[#1a1a1a] text-gray-400">
                      <div className="text-center">
                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2">No file selected</p>
                        <p className="text-sm">Create a new file or select one from the explorer</p>
                        <Button onClick={handleCreateFile} className="mt-4 bg-[#00ff88] text-black hover:bg-[#00cc77]">
                          <Plus className="w-4 h-4 mr-2" />
                          Create File
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Preview */}
              {(previewMode === "preview" || previewMode === "split") && (
                <div className={previewMode === "split" ? "w-1/2" : "w-full"}>
                  <PreviewPane />
                </div>
              )}
            </div>
          )}

          {/* Console */}
          {consoleOpen && (
            <div className="h-48 border-t border-[#333333]">
              <ConsolePanel />
            </div>
          )}
        </div>
      </div>

      {/* Save Project Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="bg-[#1a1a1a] border-[#333333] text-white">
          <DialogHeader>
            <DialogTitle>Save Project</DialogTitle>
            <DialogDescription className="text-gray-400">
              Save your project to your CodeNANO account and share it with the community.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="bg-[#0a0a0a] border-[#333333] text-white"
                placeholder="Enter project title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={saveDescription}
                onChange={(e) => setSaveDescription(e.target.value)}
                className="bg-[#0a0a0a] border-[#333333] text-white"
                placeholder="Describe your project..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags (optional)</Label>
              <Input
                id="tags"
                value={saveTags}
                onChange={(e) => setSaveTags(e.target.value)}
                className="bg-[#0a0a0a] border-[#333333] text-white"
                placeholder="javascript, react, css (comma separated)"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="public"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded border-[#333333]"
              />
              <Label htmlFor="public">Make this project public</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)} className="border-[#333333]">
              Cancel
            </Button>
            <Button
              onClick={handleSaveProject}
              disabled={isSaving}
              className="bg-[#00ff88] text-black hover:bg-[#00cc77]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Project
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Project Modal */}
      <CreateProjectModal open={showCreateModal} onOpenChange={setShowCreateModal} />
    </div>
  )
}

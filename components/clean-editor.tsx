"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useEditorStore, initializeStore } from "@/lib/editor-store"
import { getBrowserClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Code,
  Eye,
  Monitor,
  Home,
  Compass,
  Zap,
  Sparkles,
  Maximize2,
  Minimize2,
  RotateCcw,
  Copy,
  Check,
  Share2,
  Globe,
  Lock,
  ExternalLink,
} from "lucide-react"
import { Logo } from "./logo"
import { EnhancedLogoLoading } from "./logo-loading"
import MonacoEditor from "./monaco-editor"
import Link from "next/link"

export default function CleanEditor() {
  const [user, setUser] = useState<any>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [projectTitle, setProjectTitle] = useState("My Project")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [tempTitle, setTempTitle] = useState(projectTitle)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [saveDescription, setSaveDescription] = useState("")
  const [saveTags, setSaveTags] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [viewMode, setViewMode] = useState<"editor" | "preview" | "split">("split")
  const [layout, setLayout] = useState<"horizontal" | "vertical">("horizontal")
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("html")
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const router = useRouter()
  const { toast } = useToast()
  const supabase = getBrowserClient()
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()
  const previewRef = useRef<HTMLIFrameElement>(null)

  const { currentProject, updateFile, setSaveState, saveState } = useEditorStore()

  // Initialize with clean HTML/CSS/JS project
  useEffect(() => {
    initializeStore()
  }, [])

  // Get files with memoization for performance
  const htmlFile = useMemo(() => currentProject?.files.find((f) => f.name.endsWith(".html")), [currentProject?.files])
  const cssFile = useMemo(() => currentProject?.files.find((f) => f.name.endsWith(".css")), [currentProject?.files])
  const jsFile = useMemo(() => currentProject?.files.find((f) => f.name.endsWith(".js")), [currentProject?.files])

  const [htmlContent, setHtmlContent] = useState("")
  const [cssContent, setCssContent] = useState("")
  const [jsContent, setJsContent] = useState("")

  // Update content when files change with smooth transitions
  useEffect(() => {
    if (htmlFile && htmlFile.content !== htmlContent) {
      setHtmlContent(htmlFile.content)
    }
  }, [htmlFile, htmlContent])

  useEffect(() => {
    if (cssFile && cssFile.content !== cssContent) {
      setCssContent(cssFile.content)
    }
  }, [cssFile, cssContent])

  useEffect(() => {
    if (jsFile && jsFile.content !== jsContent) {
      setJsContent(jsFile.content)
    }
  }, [jsFile, jsContent])

  // Enhanced authentication check with better error handling
  useEffect(() => {
    const checkUser = async () => {
      try {
        setIsAuthLoading(true)
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Auth session error:", error)
          setUser(null)
        } else {
          setUser(session?.user || null)
          console.log("Auth check - User:", session?.user ? "Authenticated" : "Not authenticated")
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        setUser(null)
      } finally {
        setIsAuthLoading(false)
      }
    }

    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user ? "User present" : "No user")
      setUser(session?.user || null)
      setIsAuthLoading(false)

      if (event === "SIGNED_IN") {
        toast({
          title: "✅ Signed in successfully!",
          description: "You can now save and share your projects",
          duration: 3000,
        })
      } else if (event === "SIGNED_OUT") {
        toast({
          title: "👋 Signed out",
          description: "Your work is saved locally",
          duration: 2000,
        })
      }
    })

    return () => authListener.subscription.unsubscribe()
  }, [supabase, toast])

  // Enhanced auto-save functionality with better auth checking
  const triggerAutoSave = useCallback(async () => {
    if (!user || !hasUnsavedChanges || !currentProject) {
      console.log("Auto-save skipped:", {
        hasUser: !!user,
        hasChanges: hasUnsavedChanges,
        hasProject: !!currentProject,
      })
      return
    }

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      setIsAutoSaving(true)
      try {
        // Double-check auth before saving
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) {
          console.log("Auto-save failed: No active session")
          throw new Error("No active session")
        }

        const projectData = {
          id: currentProjectId,
          title: projectTitle || "Untitled Project",
          description: saveDescription || "Auto-saved project",
          html: htmlContent,
          css: cssContent,
          js: jsContent,
          is_public: false, // Auto-saves are private by default
          tags: saveTags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }

        console.log("Auto-saving project data:", {
          ...projectData,
          html: projectData.html.length,
          css: projectData.css.length,
          js: projectData.js.length,
        })

        const response = await fetch("/api/projects", {
          method: currentProjectId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(projectData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("Auto-save API error:", errorData)
          throw new Error(`Auto-save failed: ${response.status} - ${errorData.error || "Unknown error"}`)
        }

        const result = await response.json()

        if (!currentProjectId) {
          setCurrentProjectId(result.id)
          // Update URL without page reload
          window.history.replaceState({}, "", `/editor?project=${result.id}`)
        }

        setHasUnsavedChanges(false)
        setLastSaved(new Date())
        setSaveState("saved")

        // Store in localStorage as backup
        localStorage.setItem("codenano-project-id", result.id)
        localStorage.setItem("codenano-last-saved", new Date().toISOString())

        console.log("Auto-save successful:", result.id)
      } catch (error: any) {
        console.error("Auto-save failed:", error)
        setSaveState("error")

        // Enhanced fallback to localStorage with better error handling
        try {
          localStorage.setItem("codenano-html", htmlContent)
          localStorage.setItem("codenano-css", cssContent)
          localStorage.setItem("codenano-js", jsContent)
          localStorage.setItem("codenano-title", projectTitle)
          localStorage.setItem("codenano-backup-timestamp", new Date().toISOString())

          console.warn("Auto-save failed, saved to localStorage as backup")
        } catch (storageError) {
          console.error("Failed to save to localStorage:", storageError)
        }
      } finally {
        setIsAutoSaving(false)
      }
    }, 3000)
  }, [
    user,
    hasUnsavedChanges,
    currentProject,
    currentProjectId,
    projectTitle,
    saveDescription,
    htmlContent,
    cssContent,
    jsContent,
    saveTags,
    setSaveState,
    supabase,
  ])

  // Enhanced content change handlers with auto-save
  const handleHtmlChange = useCallback(
    (value: string) => {
      setHtmlContent(value)
      setHasUnsavedChanges(true)
      if (htmlFile) {
        updateFile(htmlFile.id, value)
      }
      triggerAutoSave()
    },
    [htmlFile, updateFile, triggerAutoSave],
  )

  const handleCssChange = useCallback(
    (value: string) => {
      setCssContent(value)
      setHasUnsavedChanges(true)
      if (cssFile) {
        updateFile(cssFile.id, value)
      }
      triggerAutoSave()
    },
    [cssFile, updateFile, triggerAutoSave],
  )

  const handleJsChange = useCallback(
    (value: string) => {
      setJsContent(value)
      setHasUnsavedChanges(true)
      if (jsFile) {
        updateFile(jsFile.id, value)
      }
      triggerAutoSave()
    },
    [jsFile, updateFile, triggerAutoSave],
  )

  // Enhanced preview generation with better performance
  const generatePreviewContent = useCallback(() => {
    let bodyContent = htmlContent
    const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    if (bodyMatch) {
      bodyContent = bodyMatch[1]
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeNANO Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        'codenano': {
                            'dark': '#0a0a0a',
                            'accent': '#1a1a1a',
                            'primary': '#00ff88',
                            'secondary': '#00ccff',
                            'text': '#e0e0e0',
                            'border': '#333333'
                        }
                    },
                    animation: {
                        'fade-in': 'fadeIn 0.5s ease-in-out',
                        'slide-up': 'slideUp 0.3s ease-out',
                        'pulse-glow': 'pulseGlow 2s infinite',
                    },
                    keyframes: {
                        fadeIn: {
                            '0%': { opacity: '0', transform: 'translateY(10px)' },
                            '100%': { opacity: '1', transform: 'translateY(0)' }
                        },
                        slideUp: {
                            '0%': { transform: 'translateY(20px)', opacity: '0' },
                            '100%': { transform: 'translateY(0)', opacity: '1' }
                        },
                        pulseGlow: {
                            '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)' },
                            '50%': { boxShadow: '0 0 30px rgba(0, 255, 136, 0.6)' }
                        }
                    }
                }
            }
        }
    </script>
    <style>
        body {
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            min-height: 100vh;
            transition: all 0.3s ease;
        }
        
        .smooth-transition {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .glass-effect {
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .glow-effect:hover {
            box-shadow: 0 0 30px rgba(0, 255, 136, 0.4);
            transform: translateY(-2px);
        }
        
        ${cssContent}
    </style>
</head>
<body class="dark">
    <div class="animate-fade-in">
        ${bodyContent}
    </div>
    <script>
        // Enhanced console override with better formatting
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        
        console.log = function(...args) {
            originalLog.apply(console, args);
            window.parent.postMessage({
                type: 'console-log',
                content: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' '),
                timestamp: new Date().toISOString()
            }, '*');
        };
        
        console.error = function(...args) {
            originalError.apply(console, args);
            window.parent.postMessage({
                type: 'console-error',
                content: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' '),
                timestamp: new Date().toISOString()
            }, '*');
        };

        window.addEventListener('error', function(e) {
            window.parent.postMessage({
                type: 'console-error',
                content: \`❌ \${e.message} at line \${e.lineno}:\${e.colno}\`,
                timestamp: new Date().toISOString()
            }, '*');
        });

        // Performance monitoring
        window.addEventListener('load', function() {
            const loadTime = performance.now();
            console.log(\`⚡ Page loaded in \${Math.round(loadTime)}ms\`);
        });

        try {
            ${jsContent}
        } catch (error) {
            console.error('🚨 JavaScript Error:', error.message);
        }
    </script>
</body>
</html>`
  }, [htmlContent, cssContent, jsContent])

  // Enhanced run function with smooth loading
  const handleRun = useCallback(async () => {
    setIsPreviewLoading(true)

    // Add a small delay for smooth transition
    await new Promise((resolve) => setTimeout(resolve, 200))

    const iframe = previewRef.current
    if (iframe) {
      const content = generatePreviewContent()
      iframe.src = "data:text/html;charset=utf-8," + encodeURIComponent(content)
    }

    setTimeout(() => {
      setIsPreviewLoading(false)
      toast({
        title: "⚡ Code executed!",
        description: "Your code is running with enhanced Tailwind CSS",
        duration: 2000,
      })
    }, 500)
  }, [generatePreviewContent, toast])

  // Auto-run on content change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleRun()
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [htmlContent, cssContent, jsContent, handleRun])

  // Enhanced save functionality with better auth checking
  const handleSave = useCallback(async () => {
    console.log("Save button clicked - User state:", !!user, "Auth loading:", isAuthLoading)

    if (isAuthLoading) {
      toast({
        title: "⏳ Please wait",
        description: "Checking authentication status...",
        duration: 2000,
      })
      return
    }

    if (!user) {
      toast({
        title: "🔐 Sign in required",
        description: "Please sign in to save your project",
        variant: "destructive",
        action: (
          <Button variant="outline" size="sm" onClick={() => router.push("/auth/login")}>
            Sign In
          </Button>
        ),
      })
      return
    }

    // Double-check auth before opening save dialog
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        toast({
          title: "🔐 Session expired",
          description: "Please sign in again to save your project",
          variant: "destructive",
        })
        setUser(null)
        return
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      toast({
        title: "❌ Authentication error",
        description: "Please try signing in again",
        variant: "destructive",
      })
      return
    }

    setShowSaveDialog(true)
  }, [user, isAuthLoading, toast, router, supabase])

  // Quick share to explore with enhanced auth checking
  const handleQuickShare = useCallback(async () => {
    if (isAuthLoading) {
      toast({
        title: "⏳ Please wait",
        description: "Checking authentication status...",
        duration: 2000,
      })
      return
    }

    if (!user) {
      toast({
        title: "🔐 Sign in required",
        description: "Please sign in to share your project",
        variant: "destructive",
        action: (
          <Button variant="outline" size="sm" onClick={() => router.push("/auth/login")}>
            Sign In
          </Button>
        ),
      })
      return
    }

    setIsSharing(true)
    try {
      // Double-check auth before sharing
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        throw new Error("No active session")
      }

      const projectData = {
        id: currentProjectId,
        title: projectTitle || "Shared Project",
        description: "Shared from CodeNANO Editor",
        html: htmlContent,
        css: cssContent,
        js: jsContent,
        is_public: true, // Make it public for explore
        tags: ["html", "css", "javascript", "shared"],
      }

      console.log("Sharing project data:", {
        ...projectData,
        html: projectData.html.length,
        css: projectData.css.length,
        js: projectData.js.length,
      })

      const response = await fetch("/api/projects", {
        method: currentProjectId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(projectData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Share API error:", errorData)
        throw new Error(errorData.error || `Failed to share: ${response.status}`)
      }

      const result = await response.json()
      setCurrentProjectId(result.id)
      setHasUnsavedChanges(false)
      setLastSaved(new Date())

      toast({
        title: "🌟 Shared to Explore!",
        description: "Your project is now visible to everyone",
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/project/${result.id}`, "_blank")}
            className="ml-2"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            View
          </Button>
        ),
        duration: 5000,
      })

      // Update URL
      window.history.replaceState({}, "", `/editor?project=${result.id}`)
    } catch (error: any) {
      console.error("Share error:", error)
      toast({
        title: "❌ Share failed",
        description: error.message || "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }, [user, isAuthLoading, currentProjectId, projectTitle, htmlContent, cssContent, jsContent, toast, router, supabase])

  // Copy project URL
  const handleCopyUrl = useCallback(async () => {
    try {
      const url = currentProjectId ? `${window.location.origin}/project/${currentProjectId}` : window.location.href

      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast({
        title: "📋 Copied!",
        description: "Project URL copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "❌ Copy failed",
        description: "Could not copy URL to clipboard",
        variant: "destructive",
      })
    }
  }, [currentProjectId, toast])

  // Enhanced save project with better UX and auth checking
  const handleSaveProject = useCallback(async () => {
    if (!currentProject || !user) return

    setIsSaving(true)
    setSaveState("saving")

    try {
      // Triple-check auth before saving
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        throw new Error("No active session - please sign in again")
      }

      const projectData = {
        id: currentProjectId,
        title: projectTitle,
        description: saveDescription,
        html: htmlContent,
        css: cssContent,
        js: jsContent,
        is_public: isPublic,
        tags: saveTags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      }

      console.log("Saving project data:", {
        ...projectData,
        html: projectData.html.length,
        css: projectData.css.length,
        js: projectData.js.length,
      })

      const response = await fetch("/api/projects", {
        method: currentProjectId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(projectData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Save API error:", errorData)
        throw new Error(errorData.error || "Failed to save project")
      }

      const result = await response.json()

      if (!currentProjectId) {
        setCurrentProjectId(result.id)
        // Update URL without page reload
        window.history.replaceState({}, "", `/editor?project=${result.id}`)
      }

      setHasUnsavedChanges(false)
      setLastSaved(new Date())
      setSaveState("saved")
      setShowSaveDialog(false)
      setSaveDescription("")
      setSaveTags("")

      toast({
        title: "🎉 Project saved!",
        description: `"${projectTitle}" has been saved successfully`,
        action: (
          <Button variant="outline" size="sm" onClick={() => router.push(`/project/${result.id}`)} className="ml-2">
            <ExternalLink className="w-4 h-4 mr-1" />
            View
          </Button>
        ),
        duration: 5000,
      })
    } catch (error: any) {
      console.error("Save error:", error)
      toast({
        title: "❌ Save failed",
        description: error.message || "Failed to save project",
        variant: "destructive",
      })
      setSaveState("error")
    } finally {
      setIsSaving(false)
    }
  }, [
    currentProject,
    user,
    currentProjectId,
    projectTitle,
    saveDescription,
    htmlContent,
    cssContent,
    jsContent,
    isPublic,
    saveTags,
    toast,
    setSaveState,
    router,
    supabase,
  ])

  // Enhanced export with better formatting
  const handleExport = useCallback(() => {
    if (!currentProject) return

    const projectData = {
      name: projectTitle,
      html: htmlContent,
      css: cssContent,
      js: jsContent,
      exportedAt: new Date().toISOString(),
      version: "2.0.0",
      createdBy: "subatomicERROR",
    }

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${projectTitle.replace(/\s+/g, "-").toLowerCase()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "📦 Project exported!",
      description: "Your project has been downloaded as a JSON file",
      duration: 3000,
    })
  }, [currentProject, projectTitle, htmlContent, cssContent, jsContent, toast])

  // Enhanced sign out
  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut()
    toast({
      title: "👋 Signed out",
      description: "You have been signed out successfully",
      duration: 2000,
    })
    router.push("/")
  }, [supabase, toast, router])

  // Enhanced title save
  const handleTitleSave = useCallback(() => {
    setProjectTitle(tempTitle)
    setIsEditingTitle(false)
    setHasUnsavedChanges(true)
    toast({
      title: "✏️ Project renamed",
      description: `Project renamed to "${tempTitle}"`,
      duration: 2000,
    })
  }, [tempTitle, toast])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "s":
            e.preventDefault()
            handleSave()
            break
          case "r":
            e.preventDefault()
            handleRun()
            break
          case "e":
            e.preventDefault()
            handleExport()
            break
          case "1":
            e.preventDefault()
            setActiveTab("html")
            break
          case "2":
            e.preventDefault()
            setActiveTab("css")
            break
          case "3":
            e.preventDefault()
            setActiveTab("js")
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleSave, handleRun, handleExport])

  // Enhanced view mode transitions
  const handleViewModeChange = useCallback(
    (mode: "editor" | "preview" | "split") => {
      setViewMode(mode)
      toast({
        title: `👁️ View mode: ${mode}`,
        description: `Switched to ${mode} view`,
        duration: 1500,
      })
    },
    [toast],
  )

  if (!currentProject) {
    return (
      <div className="h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] flex items-center justify-center">
        <EnhancedLogoLoading size="xl" text="Loading your workspace..." />
      </div>
    )
  }

  return (
    <div
      className={`h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] flex flex-col transition-all duration-500 ${isFullscreen ? "fixed inset-0 z-50" : ""}`}
    >
      {/* Enhanced Header */}
      <header className="h-14 bg-[#1a1a1a]/80 backdrop-blur-md border-b border-[#333333]/50 flex items-center justify-between px-6 transition-all duration-300">
        <div className="flex items-center gap-4">
          <Link href="/" className="transition-transform hover:scale-105">
            <Logo size="sm" />
          </Link>

          {isEditingTitle ? (
            <div className="flex items-center gap-2 animate-slide-up">
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
                className="h-8 w-48 bg-[#0a0a0a]/80 border-[#333333] text-white focus:border-[#00ff88] transition-all duration-300"
                autoFocus
              />
              <Button
                size="sm"
                onClick={handleTitleSave}
                className="bg-gradient-to-r from-[#00ff88] to-[#00ccff] text-black hover:from-[#00cc77] to-[#0099cc] transition-all duration-300 transform hover:scale-105"
              >
                <Check className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div
              className="text-[#e0e0e0] font-medium cursor-pointer hover:text-[#00ff88] transition-all duration-300 hover:scale-105"
              onClick={() => setIsEditingTitle(true)}
            >
              {projectTitle}
            </div>
          )}

          {/* Enhanced Status Indicators */}
          <div className="flex items-center gap-2">
            {isAutoSaving && (
              <div className="flex items-center gap-2 text-[#00ff88] animate-pulse">
                <EnhancedLogoLoading size="sm" />
                <span className="text-sm">Auto-saving...</span>
              </div>
            )}

            {hasUnsavedChanges && !isAutoSaving && (
              <div className="flex items-center gap-2 text-yellow-400">
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-sm">Unsaved changes</span>
              </div>
            )}

            {lastSaved && !hasUnsavedChanges && !isAutoSaving && (
              <div className="flex items-center gap-2 text-green-400">
                <Check className="w-4 h-4" />
                <span className="text-sm">Saved {lastSaved.toLocaleTimeString()}</span>
              </div>
            )}

            {/* Auth status indicator */}
            {isAuthLoading && (
              <div className="flex items-center gap-2 text-blue-400">
                <EnhancedLogoLoading size="sm" />
                <span className="text-sm">Checking auth...</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Enhanced View Mode Toggle */}
          <div className="flex items-center bg-[#2a2a2a]/80 backdrop-blur-sm rounded-lg p-1 border border-[#333333]/50">
            <Button
              variant={viewMode === "editor" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewModeChange("editor")}
              className={`transition-all duration-300 ${
                viewMode === "editor"
                  ? "bg-gradient-to-r from-[#00ff88] to-[#00ccff] text-black shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-[#333333]/50"
              }`}
            >
              <Code className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "split" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewModeChange("split")}
              className={`transition-all duration-300 ${
                viewMode === "split"
                  ? "bg-gradient-to-r from-[#00ff88] to-[#00ccff] text-black shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-[#333333]/50"
              }`}
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "preview" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewModeChange("preview")}
              className={`transition-all duration-300 ${
                viewMode === "preview"
                  ? "bg-gradient-to-r from-[#00ff88] to-[#00ccff] text-black shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-[#333333]/50"
              }`}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>

          {/* Enhanced Action Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRun}
            disabled={isPreviewLoading}
            className="border-[#333333]/50 hover:bg-[#252525] text-[#e0e0e0] hover:border-[#00ff88] transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            {isPreviewLoading ? <EnhancedLogoLoading size="sm" className="mr-2" /> : <Play className="mr-2 h-4 w-4" />}
            Run
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving || isAuthLoading}
            className="border-[#333333]/50 hover:bg-[#252525] text-[#e0e0e0] hover:border-[#00ff88] transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            {isSaving ? <EnhancedLogoLoading size="sm" className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
            Save
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleQuickShare}
            disabled={isSharing || isAuthLoading}
            className="border-[#00ff88]/50 text-[#00ff88] hover:bg-[#00ff88] hover:text-black transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            {isSharing ? <EnhancedLogoLoading size="sm" className="mr-2" /> : <Share2 className="mr-2 h-4 w-4" />}
            Share to Explore
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyUrl}
            className="border-[#333333]/50 hover:bg-[#252525] text-[#e0e0e0] hover:border-[#00ff88] transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            {copied ? <Check className="mr-2 h-4 w-4 text-[#00ff88]" /> : <Copy className="mr-2 h-4 w-4" />}
            Copy URL
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="border-[#333333]/50 hover:bg-[#252525] text-[#e0e0e0] hover:border-[#00ff88] transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          {/* Fullscreen toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-gray-400 hover:text-white hover:bg-[#333333]/50 transition-all duration-300"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>

          {/* Enhanced Profile Dropdown */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-gradient-to-r from-[#00ff88] to-[#00ccff] text-black hover:from-[#00cc77] hover:to-[#0099cc] transition-all duration-300 transform hover:scale-110"
                >
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-[#1a1a1a]/95 backdrop-blur-md border-[#333333]/50 text-[#e0e0e0] animate-slide-up"
              >
                <div className="px-2 py-1.5 text-sm font-medium text-[#00ff88]">{user.email}</div>
                <DropdownMenuSeparator className="bg-[#333333]/50" />
                <Link href="/dashboard">
                  <DropdownMenuItem className="cursor-pointer hover:bg-[#252525]/50 transition-all duration-200">
                    <Home className="mr-2 h-4 w-4" /> Dashboard
                  </DropdownMenuItem>
                </Link>
                <Link href="/explore">
                  <DropdownMenuItem className="cursor-pointer hover:bg-[#252525]/50 transition-all duration-200">
                    <Compass className="mr-2 h-4 w-4" /> Explore
                  </DropdownMenuItem>
                </Link>
                <Link href="/settings">
                  <DropdownMenuItem className="cursor-pointer hover:bg-[#252525]/50 transition-all duration-200">
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator className="bg-[#333333]/50" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-red-400 hover:bg-red-500/10 transition-all duration-200"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/login">
              <Button
                size="sm"
                className="bg-gradient-to-r from-[#00ff88] to-[#00ccff] text-black hover:from-[#00cc77] hover:to-[#0099cc] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Enhanced Main Content */}
      <div
        className={`flex-1 flex transition-all duration-500 ease-in-out ${layout === "horizontal" ? "flex-row" : "flex-col"}`}
      >
        {/* Enhanced Editor Section */}
        {(viewMode === "editor" || viewMode === "split") && (
          <div
            className={`${
              viewMode === "split" ? (layout === "horizontal" ? "w-1/2" : "h-1/2") : "w-full h-full"
            } border-r border-[#333333]/50 transition-all duration-500 ease-in-out`}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="bg-[#1a1a1a]/80 backdrop-blur-sm border-b border-[#333333]/50 rounded-none justify-start h-12">
                <TabsTrigger
                  value="html"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00ff88] data-[state=active]:to-[#00ccff] data-[state=active]:text-black px-6 transition-all duration-300 hover:bg-[#333333]/30"
                >
                  <Code className="mr-2 h-4 w-4" />
                  HTML
                </TabsTrigger>
                <TabsTrigger
                  value="css"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00ff88] data-[state=active]:to-[#00ccff] data-[state=active]:text-black px-6 transition-all duration-300 hover:bg-[#333333]/30"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  CSS
                </TabsTrigger>
                <TabsTrigger
                  value="js"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00ff88] data-[state=active]:to-[#00ccff] data-[state=active]:text-black px-6 transition-all duration-300 hover:bg-[#333333]/30"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  JS
                </TabsTrigger>
                <div className="ml-auto flex items-center px-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLayout(layout === "horizontal" ? "vertical" : "horizontal")}
                    className="text-gray-400 hover:text-white hover:bg-[#333333]/50 transition-all duration-300"
                    title={`Switch to ${layout === "horizontal" ? "vertical" : "horizontal"} layout`}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </TabsList>

              <TabsContent value="html" className="flex-1 m-0 transition-all duration-300">
                <MonacoEditor
                  value={htmlContent}
                  language="html"
                  onChange={handleHtmlChange}
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
                    lineNumbers: "on",
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 0,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: "gutter",
                    selectOnLineNumbers: true,
                    automaticLayout: true,
                  }}
                />
              </TabsContent>

              <TabsContent value="css" className="flex-1 m-0 transition-all duration-300">
                <MonacoEditor
                  value={cssContent}
                  language="css"
                  onChange={handleCssChange}
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
                    lineNumbers: "on",
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 0,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: "gutter",
                    selectOnLineNumbers: true,
                    automaticLayout: true,
                  }}
                />
              </TabsContent>

              <TabsContent value="js" className="flex-1 m-0 transition-all duration-300">
                <MonacoEditor
                  value={jsContent}
                  language="javascript"
                  onChange={handleJsChange}
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
                    lineNumbers: "on",
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 0,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: "gutter",
                    selectOnLineNumbers: true,
                    automaticLayout: true,
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Enhanced Preview Section */}
        {(viewMode === "preview" || viewMode === "split") && (
          <div
            className={`${
              viewMode === "split" ? (layout === "horizontal" ? "w-1/2" : "h-1/2") : "w-full h-full"
            } bg-white transition-all duration-500 ease-in-out relative`}
          >
            <div className="h-full flex flex-col">
              <div className="h-12 bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] border-b border-[#e9ecef] flex items-center justify-between px-4 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-gray-600 ml-2">Preview (Enhanced with Tailwind CSS)</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRun}
                  disabled={isPreviewLoading}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 transition-all duration-300"
                >
                  {isPreviewLoading ? (
                    <EnhancedLogoLoading size="sm" className="mr-2" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  Refresh
                </Button>
              </div>

              {/* Loading overlay */}
              {isPreviewLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 transition-all duration-300">
                  <EnhancedLogoLoading size="xl" text="Compiling your masterpiece..." />
                </div>
              )}

              <iframe
                ref={previewRef}
                src={`data:text/html;charset=utf-8,${encodeURIComponent(generatePreviewContent())}`}
                className="flex-1 border-0 transition-all duration-300"
                title="Enhanced Preview"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              />
            </div>
          </div>
        )}
      </div>

      {/* Credits Footer */}
      <footer className="h-8 bg-[#0a0a0a] border-t border-[#333333]/30 flex items-center justify-center">
        <p className="text-xs text-[#666666]">
          Created by <span className="text-[#00ff88] font-medium">subatomicERROR</span> • CodeNANO v2.0
        </p>
      </footer>

      {/* Enhanced Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border-[#333333]/50 text-white backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-[#00ff88] to-[#00ccff] bg-clip-text text-transparent">
              Save Project
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Save your project to your CodeNANO account and share it with the world.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-[#00ff88]">
                Project Title
              </Label>
              <Input
                id="title"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="bg-[#0a0a0a]/80 border-[#333333]/50 text-white focus:border-[#00ff88] transition-all duration-300"
                placeholder="Enter project title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-[#00ff88]">
                Description (optional)
              </Label>
              <Textarea
                id="description"
                value={saveDescription}
                onChange={(e) => setSaveDescription(e.target.value)}
                className="bg-[#0a0a0a]/80 border-[#333333]/50 text-white focus:border-[#00ff88] transition-all duration-300"
                placeholder="Describe your project..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags" className="text-[#00ff88]">
                Tags (optional)
              </Label>
              <Input
                id="tags"
                value={saveTags}
                onChange={(e) => setSaveTags(e.target.value)}
                className="bg-[#0a0a0a]/80 border-[#333333]/50 text-white focus:border-[#00ff88] transition-all duration-300"
                placeholder="html, css, javascript, tailwind"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-[#0a0a0a]/50 rounded-lg border border-[#333333]/30">
              <div className="flex items-center space-x-3">
                {isPublic ? <Globe className="w-5 h-5 text-[#00ff88]" /> : <Lock className="w-5 h-5 text-gray-400" />}
                <div>
                  <p className="text-sm font-medium text-white">{isPublic ? "Public Project" : "Private Project"}</p>
                  <p className="text-xs text-gray-400">
                    {isPublic ? "Visible to everyone in Explore" : "Only visible to you"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPublic(!isPublic)}
                className="border-[#333333]/50 hover:bg-[#333333]/30 transition-all duration-300"
              >
                {isPublic ? "Make Private" : "Make Public"}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSaveDialog(false)}
              className="border-[#333333]/50 hover:bg-[#333333]/30 transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProject}
              disabled={isSaving}
              className="bg-gradient-to-r from-[#00ff88] to-[#00ccff] text-black hover:from-[#00cc77] hover:to-[#0099cc] transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              {isSaving ? (
                <>
                  <EnhancedLogoLoading size="sm" className="mr-2" />
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
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { getBrowserClient } from "@/lib/supabase"
import { AlertTriangle, Share } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { EnhancedLogoLoading } from "@/components/logo-loading"

interface SaveProjectModalProps {
  isOpen: boolean
  onClose: () => void
  projectData: {
    id?: string
    title: string
    description: string
    html: string
    css: string
    js: string
    is_public: boolean
  }
  onSaveSuccess: (projectId: string) => void
}

export default function SaveProjectModal({ isOpen, onClose, projectData, onSaveSuccess }: SaveProjectModalProps) {
  const [title, setTitle] = useState(projectData.title || "")
  const [description, setDescription] = useState(projectData.description || "")
  const [isPublic, setIsPublic] = useState(projectData.is_public || false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tablesExist, setTablesExist] = useState(true)
  const { toast } = useToast()
  const supabase = getBrowserClient()

  // Update state when projectData changes
  useEffect(() => {
    if (isOpen) {
      setTitle(projectData.title || "")
      setDescription(projectData.description || "")
      setIsPublic(projectData.is_public || false)
      checkTables()
    }
  }, [isOpen, projectData])

  const checkTables = async () => {
    try {
      // Check if projects table exists
      const { error: projectsError } = await supabase.from("projects").select("id").limit(1)

      if (projectsError && projectsError.message.includes("does not exist")) {
        setTablesExist(false)
        setError("Required database tables are missing. Please initialize the database first.")
        return
      }

      setTablesExist(true)
      setError(null)
    } catch (err) {
      console.error("Error checking tables:", err)
    }
  }

  const initializeDatabase = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/init-db", {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to initialize database")
      }

      toast({
        title: "Database initialized",
        description: "Database tables have been created successfully",
      })

      setTablesExist(true)
    } catch (err: any) {
      console.error("Database initialization error:", err)
      setError(err.message || "Failed to initialize database")
      toast({
        title: "Error",
        description: err.message || "Failed to initialize database",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!tablesExist) {
      toast({
        title: "Database tables missing",
        description: "Please initialize the database first",
        variant: "destructive",
      })
      return
    }

    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for your project",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Check if user is authenticated
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to save your project",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Prepare project data with proper structure
      const projectPayload = {
        title: title.trim(),
        description: description.trim(),
        html: projectData.html || "",
        css: projectData.css || "",
        js: projectData.js || "",
        is_public: isPublic,
        user_id: session.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      let response
      let projectId = projectData.id

      if (projectId && !projectId.startsWith("local-")) {
        // Update existing project
        response = await fetch(`/api/projects?id=${projectId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: projectId,
            ...projectPayload,
          }),
        })
      } else {
        // Create new project
        response = await fetch("/api/projects", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(projectPayload),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to save project`)
      }

      const result = await response.json()
      projectId = result.id

      if (!projectId) {
        throw new Error("Failed to save project: No project ID returned")
      }

      toast({
        title: "Project saved successfully! 🎉",
        description: `"${title}" has been saved to your dashboard`,
      })

      // Also save to localStorage for redundancy
      localStorage.setItem("code-nano-html", projectData.html)
      localStorage.setItem("code-nano-css", projectData.css)
      localStorage.setItem("code-nano-js", projectData.js)
      localStorage.setItem("code-nano-title", title)
      localStorage.setItem("code-nano-project-id", projectId)

      onSaveSuccess(projectId)
      onClose()
    } catch (error: any) {
      console.error("Save error:", error)
      setError(error.message || "Something went wrong")
      toast({
        title: "Failed to save project",
        description: error.message || "Please try again or check your connection",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const shareToExplore = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title before sharing",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // First save the project
      await handleSave()

      // Then share to explore (make it public)
      setIsPublic(true)

      toast({
        title: "Shared to Explore! 🌟",
        description: "Your project is now visible in the explore page",
      })
    } catch (error: any) {
      toast({
        title: "Failed to share",
        description: error.message || "Please try again",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1a] border-[#333333] text-[#e0e0e0]">
        <DialogHeader>
          <DialogTitle>{projectData.id ? "Update Project" : "Save Project"}</DialogTitle>
          <DialogDescription className="text-[#e0e0e0]/70">Fill in the details to save your project.</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="bg-red-900/20 border-red-900">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            {!tablesExist && (
              <Button
                onClick={initializeDatabase}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <EnhancedLogoLoading size="sm" className="mr-2" />
                    Initializing...
                  </>
                ) : (
                  "Initialize Database"
                )}
              </Button>
            )}
          </Alert>
        )}

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Awesome Project"
              className="bg-[#0a0a0a] border-[#333333]"
              disabled={loading || !tablesExist}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of your project"
              className="bg-[#0a0a0a] border-[#333333] min-h-[80px]"
              disabled={loading || !tablesExist}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="is-public" className="mr-2">
                Make project public
              </Label>
              <p className="text-xs text-[#e0e0e0]/60">Public projects will appear in the explore page</p>
            </div>
            <Switch
              id="is-public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
              disabled={loading || !tablesExist}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="border-[#333333] hover:bg-[#252525]">
            Cancel
          </Button>
          <Button
            onClick={shareToExplore}
            variant="outline"
            className="border-[#00ff88] text-[#00ff88] hover:bg-[#00ff88] hover:text-black"
            disabled={loading || !tablesExist}
          >
            {loading ? (
              <>
                <EnhancedLogoLoading size="sm" className="mr-2" /> Sharing...
              </>
            ) : (
              <>
                <Share className="mr-2 h-4 w-4" /> Share to Explore
              </>
            )}
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#00ff88] text-black hover:bg-[#00cc77]"
            disabled={loading || !tablesExist}
          >
            {loading ? (
              <>
                <EnhancedLogoLoading size="sm" className="mr-2" /> Saving...
              </>
            ) : (
              "Save Project"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { getBrowserClient } from "@/lib/supabase"
import { GitFork, Loader2 } from "lucide-react"

interface ForkProjectProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  projectTitle: string
  projectDescription: string
  code: {
    html: string
    css: string
    js: string
  }
}

export default function ForkProject({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  projectDescription,
  code,
}: ForkProjectProps) {
  const [title, setTitle] = useState(`${projectTitle} (Fork)`)
  const [description, setDescription] = useState(projectDescription)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = getBrowserClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to fork this project",
          variant: "destructive",
        })
        router.push("/auth/login")
        return
      }

      // Create a new project as a fork
      const { data, error } = await supabase
        .from("projects")
        .insert({
          title,
          description,
          html: code.html,
          css: code.css,
          js: code.js,
          user_id: session.user.id,
          forked_from: projectId || null,
          is_public: false,
        })
        .select()

      if (error) throw error

      toast({
        title: "Project forked",
        description: "The project has been forked successfully",
      })

      // Navigate to the new project
      if (data && data.length > 0) {
        router.push(`/editor?project=${data[0].id}`)
      }

      onClose()
    } catch (error: any) {
      console.error("Error forking project:", error)
      toast({
        title: "Error",
        description: "Failed to fork project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1a] border-[#333333] text-[#e0e0e0] max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitFork className="h-5 w-5 text-[#00ff88]" /> Fork Project
          </DialogTitle>
          <DialogDescription className="text-[#e0e0e0]/70">
            Create your own copy of this project to modify and experiment with
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter project title"
              required
              className="bg-[#0a0a0a] border-[#333333]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description"
              className="bg-[#0a0a0a] border-[#333333]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="border-[#333333] hover:bg-[#252525]">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="bg-[#00ff88] text-black hover:bg-[#00cc77]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Forking...
                </>
              ) : (
                <>
                  <GitFork className="mr-2 h-4 w-4" /> Fork Project
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

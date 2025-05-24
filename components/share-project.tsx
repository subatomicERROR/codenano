"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { getBrowserClient } from "@/lib/supabase"
import { Share2, Copy, Twitter, Facebook, Linkedin, Globe, Lock } from "lucide-react"

interface ShareProjectProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  projectTitle: string
  isPublic: boolean
  onVisibilityChange: (isPublic: boolean) => void
}

export default function ShareProject({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  isPublic,
  onVisibilityChange,
}: ShareProjectProps) {
  const [shareUrl, setShareUrl] = useState("")
  const [embedCode, setEmbedCode] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [publicToggle, setPublicToggle] = useState(isPublic)
  const { toast } = useToast()
  const supabase = getBrowserClient()

  useEffect(() => {
    if (projectId) {
      const baseUrl = window.location.origin
      setShareUrl(`${baseUrl}/project/${projectId}`)
      setEmbedCode(`<iframe src="${baseUrl}/embed/${projectId}" width="100%" height="500" frameborder="0"></iframe>`)
    }
  }, [projectId])

  useEffect(() => {
    setPublicToggle(isPublic)
  }, [isPublic])

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    })
  }

  const handleVisibilityChange = async () => {
    if (!projectId) return

    setIsUpdating(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to change project visibility",
          variant: "destructive",
        })
        return
      }

      const newVisibility = !publicToggle

      const { error } = await supabase
        .from("projects")
        .update({ is_public: newVisibility })
        .eq("id", projectId)
        .eq("user_id", session.user.id)

      if (error) throw error

      setPublicToggle(newVisibility)
      onVisibilityChange(newVisibility)
      toast({
        title: "Visibility updated",
        description: `Project is now ${newVisibility ? "public" : "private"}`,
      })
    } catch (error: any) {
      console.error("Error updating visibility:", error)
      toast({
        title: "Error",
        description: "Failed to update project visibility",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const shareOnTwitter = () => {
    const text = `Check out my project "${projectTitle}" on CodeNANO!`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, "_blank")
  }

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(url, "_blank")
  }

  const shareOnLinkedIn = () => {
    const title = encodeURIComponent(projectTitle)
    const summary = encodeURIComponent(`Check out my project "${projectTitle}" on CodeNANO!`)
    const url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
      shareUrl,
    )}&title=${title}&summary=${summary}`
    window.open(url, "_blank")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1a] border-[#333333] text-[#e0e0e0] max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-[#00ff88]" /> Share Project
          </DialogTitle>
          <DialogDescription className="text-[#e0e0e0]/70">
            Share your project with others or embed it on your website
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {publicToggle ? (
                <Globe className="h-4 w-4 text-[#00ff88]" />
              ) : (
                <Lock className="h-4 w-4 text-[#e0e0e0]" />
              )}
              <Label htmlFor="public-toggle" className="cursor-pointer">
                {publicToggle ? "Public project" : "Private project"}
              </Label>
            </div>
            <Switch
              id="public-toggle"
              checked={publicToggle}
              onCheckedChange={handleVisibilityChange}
              disabled={isUpdating}
              className="data-[state=checked]:bg-[#00ff88]"
            />
          </div>

          {!publicToggle && (
            <div className="bg-[#0a0a0a] border border-[#333333] rounded-md p-3 text-sm text-[#e0e0e0]/70">
              <p>
                <Lock className="h-4 w-4 inline mr-1" /> This project is private. Make it public to share with others.
              </p>
            </div>
          )}

          {publicToggle && (
            <>
              <div className="space-y-2">
                <Label htmlFor="share-url">Share URL</Label>
                <div className="flex gap-2">
                  <Input id="share-url" value={shareUrl} readOnly className="bg-[#0a0a0a] border-[#333333]" />
                  <Button
                    size="icon"
                    variant="outline"
                    className="border-[#333333] hover:bg-[#252525]"
                    onClick={() => handleCopy(shareUrl, "URL")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="embed-code">Embed Code</Label>
                <div className="flex gap-2">
                  <Input id="embed-code" value={embedCode} readOnly className="bg-[#0a0a0a] border-[#333333]" />
                  <Button
                    size="icon"
                    variant="outline"
                    className="border-[#333333] hover:bg-[#252525]"
                    onClick={() => handleCopy(embedCode, "Embed code")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full border-[#333333] hover:bg-[#252525] hover:text-[#1DA1F2]"
                  onClick={shareOnTwitter}
                >
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full border-[#333333] hover:bg-[#252525] hover:text-[#4267B2]"
                  onClick={shareOnFacebook}
                >
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full border-[#333333] hover:bg-[#252525] hover:text-[#0077B5]"
                  onClick={shareOnLinkedIn}
                >
                  <Linkedin className="h-5 w-5" />
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

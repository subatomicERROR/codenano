"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Heart, Share2, MessageSquare, Code } from "lucide-react"
import DashboardNavbar from "@/components/dashboard-navbar"
import { useToast } from "@/hooks/use-toast"

export default function ReelPage({ params }: { params: { id: string } }) {
  const [reel, setReel] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const { toast } = useToast()
  const reelId = params.id

  useEffect(() => {
    // In a real app, we would fetch the reel from the database
    // For now, we'll use mock data
    setTimeout(() => {
      setReel({
        id: reelId,
        title: "CSS Animation Demo",
        description: "A simple CSS animation demo showing hover effects and transitions",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        thumbnail: "/placeholder.svg?height=400&width=600",
        videoUrl: "/placeholder.svg?height=400&width=600", // In a real app, this would be a video URL
        views: 120,
        likes: 45,
        comments: 8,
        author: {
          name: "Alex Quantum",
          username: "quantum_coder",
          avatar: "/placeholder.svg?height=100&width=100",
        },
      })
      setLoading(false)
    }, 1000)
  }, [reelId])

  const handleLike = () => {
    setLiked(!liked)
    toast({
      title: liked ? "Removed like" : "Added like",
      description: liked ? "You've removed your like from this reel" : "You've liked this reel",
    })
  }

  const handleShare = () => {
    // Copy the URL to clipboard
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "Link copied",
      description: "Reel link has been copied to clipboard",
    })
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0]">
        <DashboardNavbar />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-[400px]">
            <p>Loading reel...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!reel) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0]">
        <DashboardNavbar />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-[400px]">
            <p>Reel not found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0]">
      <DashboardNavbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/reels">
            <Button variant="ghost" size="sm" className="text-[#e0e0e0]/70 hover:bg-[#252525]">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Reels
            </Button>
          </Link>
        </div>

        <div className="aspect-video bg-[#1a1a1a] rounded-lg overflow-hidden mb-6">
          <img src={reel.videoUrl || "/placeholder.svg"} alt={reel.title} className="w-full h-full object-contain" />
        </div>

        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{reel.title}</h1>
            <div className="flex items-center gap-4 text-sm text-[#e0e0e0]/70 mb-4">
              <span>{reel.views} views</span>
              <span>•</span>
              <span>{formatDate(reel.createdAt)}</span>
            </div>

            <p className="text-[#e0e0e0]/90 mb-6">{reel.description}</p>

            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                size="sm"
                className={`hover:bg-[#252525] ${liked ? "text-[#00ff88]" : "text-[#e0e0e0]/70"}`}
                onClick={handleLike}
              >
                <Heart className={`h-5 w-5 mr-2 ${liked ? "fill-[#00ff88]" : ""}`} />
                {reel.likes + (liked ? 1 : 0)}
              </Button>

              <Button variant="ghost" size="sm" className="text-[#e0e0e0]/70 hover:bg-[#252525]">
                <MessageSquare className="h-5 w-5 mr-2" />
                {reel.comments}
              </Button>

              <Button variant="ghost" size="sm" className="text-[#e0e0e0]/70 hover:bg-[#252525]" onClick={handleShare}>
                <Share2 className="h-5 w-5 mr-2" />
                Share
              </Button>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <img
                src={reel.author.avatar || "/placeholder.svg"}
                alt={reel.author.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="font-medium">{reel.author.name}</div>
                <Link href={`/user/${reel.author.username}`} className="text-sm text-[#00ff88]">
                  @{reel.author.username}
                </Link>
              </div>
            </div>

            <Link href={`/editor?project=${reel.id}`}>
              <Button className="bg-[#00ff88] text-black hover:bg-[#00cc77]">
                <Code className="h-4 w-4 mr-2" /> Open in Editor
              </Button>
            </Link>
          </div>

          <div className="w-full md:w-80 bg-[#1a1a1a] rounded-lg p-4">
            <h3 className="font-medium mb-4">Comments</h3>
            <div className="space-y-4">
              {reel.comments > 0 ? (
                <div className="text-center py-4">
                  <p className="text-[#e0e0e0]/70 text-sm">Comments coming soon!</p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-[#e0e0e0]/70 text-sm">No comments yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

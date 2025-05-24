"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Play, Clock, Share2, Trash2 } from "lucide-react"
import DashboardNavbar from "@/components/dashboard-navbar"
import { useToast } from "@/hooks/use-toast"
import { getBrowserClient } from "@/lib/supabase"

export default function ReelsPage() {
  const [reels, setReels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = getBrowserClient()

  useEffect(() => {
    // In a real app, we would fetch reels from the database
    // For now, we'll use mock data
    setTimeout(() => {
      setReels([
        {
          id: "1",
          title: "CSS Animation Demo",
          description: "A simple CSS animation demo",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          thumbnail: "/placeholder.svg?height=200&width=300",
          views: 120,
        },
        {
          id: "2",
          title: "Interactive Form Validation",
          description: "Form validation with JavaScript",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          thumbnail: "/placeholder.svg?height=200&width=300",
          views: 85,
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return "Today"
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0]">
      <DashboardNavbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Reels</h1>
          <Link href="/reels/create">
            <Button className="bg-[#00ff88] text-black hover:bg-[#00cc77]">
              <Plus className="mr-2 h-4 w-4" /> Create Reel
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="my-reels" className="w-full">
          <TabsList className="bg-[#1a1a1a] border border-[#333333]">
            <TabsTrigger value="my-reels" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">
              My Reels
            </TabsTrigger>
            <TabsTrigger value="discover" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">
              Discover
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-reels" className="mt-6">
            {loading ? (
              <div className="text-center py-12">Loading reels...</div>
            ) : reels.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#e0e0e0]/70 mb-4">You haven't created any reels yet.</p>
                <Link href="/reels/create">
                  <Button className="bg-[#00ff88] text-black hover:bg-[#00cc77]">Create Your First Reel</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reels.map((reel) => (
                  <ReelCard
                    key={reel.id}
                    reel={{
                      id: reel.id,
                      title: reel.title,
                      description: reel.description,
                      createdAt: formatDate(reel.createdAt),
                      views: reel.views,
                      thumbnail: reel.thumbnail,
                    }}
                    onDelete={() => {
                      setReels(reels.filter((r) => r.id !== reel.id))
                      toast({
                        title: "Reel deleted",
                        description: "Your reel has been deleted successfully",
                      })
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="discover" className="mt-6">
            <div className="text-center py-12">
              <p className="text-[#e0e0e0]/70 mb-4">Discover feature coming soon!</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

interface ReelCardProps {
  reel: {
    id: string
    title: string
    description: string
    createdAt: string
    views: number
    thumbnail: string
  }
  onDelete: () => void
}

function ReelCard({ reel, onDelete }: ReelCardProps) {
  return (
    <Card className="bg-[#1a1a1a] border-[#333333] overflow-hidden">
      <div className="h-40 overflow-hidden relative group">
        <img
          src={reel.thumbnail || "/placeholder.svg"}
          alt={reel.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button variant="ghost" size="icon" className="rounded-full bg-white/20 hover:bg-white/30">
            <Play className="h-6 w-6 text-white" fill="white" />
          </Button>
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{reel.title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-[#e0e0e0]/70">{reel.description}</p>
        <div className="flex items-center gap-4 mt-4 text-xs text-[#e0e0e0]/60">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {reel.createdAt}
          </div>
          <div className="flex items-center">
            <span>{reel.views} views</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link href={`/reels/${reel.id}`}>
          <Button variant="outline" size="sm" className="border-[#333333] hover:bg-[#252525]">
            <Play className="h-4 w-4 mr-2" /> Watch
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="text-[#e0e0e0]/70 hover:bg-[#252525]">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-500/10" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

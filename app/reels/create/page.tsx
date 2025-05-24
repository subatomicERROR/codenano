"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Video, Camera, Loader2 } from "lucide-react"
import DashboardNavbar from "@/components/dashboard-navbar"
import { useToast } from "@/hooks/use-toast"

export default function CreateReelPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const startRecording = () => {
    setIsRecording(true)
    setRecordingTime(0)

    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)

    // In a real implementation, we would start recording the preview pane here
    toast({
      title: "Recording started",
      description: "Your screen recording has started. Click Stop when finished.",
    })
  }

  const stopRecording = () => {
    setIsRecording(false)

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // In a real implementation, we would stop recording and get the video file
    // For now, we'll just use a placeholder
    setPreviewUrl("/placeholder.svg?height=400&width=600")

    toast({
      title: "Recording stopped",
      description: "Your screen recording has been captured.",
    })
  }

  const takeScreenshot = () => {
    // In a real implementation, we would capture the current state of the preview pane
    // For now, we'll just use a placeholder
    setPreviewUrl("/placeholder.svg?height=400&width=600")

    toast({
      title: "Screenshot taken",
      description: "Your screenshot has been captured.",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for your reel",
        variant: "destructive",
      })
      return
    }

    if (!previewUrl) {
      toast({
        title: "Media required",
        description: "Please record a video or take a screenshot first",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // In a real implementation, we would upload the video/image and create a reel in the database
      // For now, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Reel created",
        description: "Your reel has been created successfully",
      })

      router.push("/reels")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create reel",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
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

        <h1 className="text-3xl font-bold mb-8">Create New Reel</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Awesome Reel"
                  className="bg-[#1a1a1a] border-[#333333]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A brief description of your reel"
                  className="bg-[#1a1a1a] border-[#333333] min-h-[100px]"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is-public">Make reel public</Label>
                <Switch id="is-public" checked={isPublic} onCheckedChange={setIsPublic} />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-[#00ff88] text-black hover:bg-[#00cc77]"
                  disabled={loading || !previewUrl}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Reel...
                    </>
                  ) : (
                    "Create Reel"
                  )}
                </Button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <Card className="bg-[#1a1a1a] border-[#333333]">
              <CardContent className="p-6">
                <div className="aspect-video bg-[#0a0a0a] rounded-md overflow-hidden mb-4">
                  {previewUrl ? (
                    <img
                      src={previewUrl || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#e0e0e0]/50">
                      No media captured yet
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  {isRecording ? (
                    <Button type="button" variant="destructive" className="flex-1" onClick={stopRecording}>
                      Stop Recording ({formatTime(recordingTime)})
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-[#333333] hover:bg-[#252525]"
                      onClick={startRecording}
                    >
                      <Video className="mr-2 h-4 w-4" /> Record Video
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-[#333333] hover:bg-[#252525]"
                    onClick={takeScreenshot}
                    disabled={isRecording}
                  >
                    <Camera className="mr-2 h-4 w-4" /> Take Screenshot
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="text-sm text-[#e0e0e0]/70">
              <p className="mb-2">Tips for creating great reels:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Keep videos under 60 seconds for better engagement</li>
                <li>Showcase the most interesting parts of your code</li>
                <li>Add a descriptive title and tags to help others find your reel</li>
                <li>Make sure your code is readable in the recording</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

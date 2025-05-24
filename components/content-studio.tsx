"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Video, Download, Loader2, X, Maximize2, Minimize2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import html2canvas from "html2canvas"

interface ContentStudioProps {
  isOpen: boolean
  onClose: () => void
  previewRef: React.RefObject<HTMLIFrameElement>
  projectTitle: string
}

export default function ContentStudio({ isOpen, onClose, previewRef, projectTitle }: ContentStudioProps) {
  const [activeTab, setActiveTab] = useState<"post" | "reel">("post")
  const [aspectRatio, setAspectRatio] = useState<"portrait" | "square" | "landscape">("portrait")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [maxRecordingTime, setMaxRecordingTime] = useState(15) // Default 15 seconds
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [capturedVideo, setCapturedVideo] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fileName, setFileName] = useState("")
  const [iframeSrc, setIframeSrc] = useState<string | null>(null)

  const canvasRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const { toast } = useToast()

  // Set default filename based on project title
  useEffect(() => {
    const sanitizedTitle = projectTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()
    setFileName(sanitizedTitle || "codenano_export")
  }, [projectTitle])

  // Get the iframe src when the dialog opens
  useEffect(() => {
    if (isOpen && previewRef.current && previewRef.current.src) {
      setIframeSrc(previewRef.current.src)
    }
  }, [isOpen, previewRef])

  // Clean up on unmount or when dialog closes
  useEffect(() => {
    return () => {
      stopRecording()
      if (capturedImage) {
        URL.revokeObjectURL(capturedImage)
      }
      if (capturedVideo) {
        URL.revokeObjectURL(capturedVideo)
      }
    }
  }, [capturedImage, capturedVideo])

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null)
      setCapturedVideo(null)
      setIsRecording(false)
      setRecordingTime(0)
      setIsCapturing(false)
    }
  }, [isOpen])

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "portrait":
        return "portrait-frame"
      case "square":
        return "square-frame"
      case "landscape":
        return "landscape-frame"
      default:
        return "portrait-frame"
    }
  }

  const captureImage = async () => {
    if (!previewRef.current || !previewRef.current.contentWindow) {
      toast({
        title: "Error",
        description: "Preview not available. Please try again.",
        variant: "destructive",
      })
      return
    }

    setIsCapturing(true)

    try {
      // Get the iframe document
      const iframe = previewRef.current
      const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document

      if (!iframeDocument) {
        throw new Error("Cannot access iframe content")
      }

      // Use html2canvas to capture the iframe content
      const canvas = await html2canvas(iframeDocument.body, {
        allowTaint: true,
        useCORS: true,
        logging: false,
        scale: 2, // Higher quality
      })

      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL("image/png")
      setCapturedImage(dataUrl)

      toast({
        title: "Success",
        description: "Image captured successfully!",
      })
    } catch (error) {
      console.error("Error capturing image:", error)
      toast({
        title: "Error",
        description: "Failed to capture image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCapturing(false)
    }
  }

  const startRecording = async () => {
    if (!previewRef.current || !previewRef.current.contentWindow) {
      toast({
        title: "Error",
        description: "Preview not available. Please try again.",
        variant: "destructive",
      })
      return
    }

    try {
      // Reset state
      setIsRecording(true)
      setRecordingTime(0)
      setCapturedVideo(null)
      recordedChunksRef.current = []

      // Get the iframe element
      const iframe = previewRef.current

      // Create a canvas element to capture the iframe content
      const tempCanvas = document.createElement("canvas")
      const ctx = tempCanvas.getContext("2d")

      if (!ctx) {
        throw new Error("Could not get canvas context")
      }

      // Set canvas dimensions based on aspect ratio
      let width = 720
      let height = 1280

      if (aspectRatio === "square") {
        width = height = 1080
      } else if (aspectRatio === "landscape") {
        width = 1280
        height = 720
      }

      tempCanvas.width = width
      tempCanvas.height = height

      // Get the stream from the canvas
      const stream = tempCanvas.captureStream(30) // 30 FPS
      streamRef.current = stream

      // Create media recorder
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: 2500000, // 2.5 Mbps
      })

      // Handle data available event
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }

      // Handle recording stop
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" })
        const url = URL.createObjectURL(blob)
        setCapturedVideo(url)
        setIsRecording(false)

        toast({
          title: "Success",
          description: "Video recorded successfully!",
        })
      }

      // Start the recording
      mediaRecorderRef.current.start(100) // Collect data every 100ms

      // Start the timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1
          if (newTime >= maxRecordingTime) {
            stopRecording()
          }
          return newTime
        })

        // Draw the iframe content to the canvas on each frame
        if (iframe.contentDocument) {
          ctx.fillStyle = "white"
          ctx.fillRect(0, 0, width, height)

          // Draw the iframe content
          ctx.drawImage(iframe, 0, 0, iframe.offsetWidth, iframe.offsetHeight, 0, 0, width, height)
        }
      }, 1000)
    } catch (error) {
      console.error("Error starting recording:", error)
      setIsRecording(false)
      toast({
        title: "Error",
        description: "Failed to start recording. Please try again.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    // Clear the timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // Stop the media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }

    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    setIsRecording(false)
  }

  const downloadImage = () => {
    if (!capturedImage) return

    const link = document.createElement("a")
    link.href = capturedImage
    link.download = `${fileName}_post.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Success",
      description: "Image downloaded successfully!",
    })
  }

  const downloadVideo = () => {
    if (!capturedVideo) return

    const link = document.createElement("a")
    link.href = capturedVideo
    link.download = `${fileName}_reel.webm`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Success",
      description: "Video downloaded successfully!",
    })
  }

  const toggleFullscreen = () => {
    const container = canvasRef.current

    if (!container) return

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen()
      }
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
      setIsFullscreen(false)
    }
  }

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Create a fallback preview content
  const fallbackPreview = `
    <html>
      <head>
        <style>
          body {
            font-family: sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f0f0f0;
            color: #333;
          }
        </style>
      </head>
      <body>
        <div>Preview not available</div>
      </body>
    </html>
  `

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1a] border-[#333333] text-[#e0e0e0] max-w-4xl">
        <DialogHeader>
          <DialogTitle>Content Studio</DialogTitle>
          <DialogDescription className="text-[#e0e0e0]/70">
            Convert your code preview into Instagram-ready content.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="post" value={activeTab} onValueChange={(value) => setActiveTab(value as "post" | "reel")}>
          <TabsList className="bg-[#0a0a0a] border border-[#333333]">
            <TabsTrigger value="post" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">
              Create Post (PNG)
            </TabsTrigger>
            <TabsTrigger value="reel" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">
              Create Reel (MP4)
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center justify-between mt-4 mb-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="aspect-ratio">Aspect Ratio:</Label>
              <Select
                value={aspectRatio}
                onValueChange={(value) => setAspectRatio(value as "portrait" | "square" | "landscape")}
              >
                <SelectTrigger className="w-[180px] bg-[#0a0a0a] border-[#333333]">
                  <SelectValue placeholder="Select aspect ratio" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#333333]">
                  <SelectItem value="portrait">Portrait (9:16)</SelectItem>
                  <SelectItem value="square">Square (1:1)</SelectItem>
                  <SelectItem value="landscape">Landscape (16:9)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={toggleFullscreen}
              className="border-[#333333] hover:bg-[#252525]"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>

          <div
            ref={canvasRef}
            className="canvas-container bg-[#0a0a0a] border border-[#333333] rounded-md p-4 flex items-center justify-center min-h-[400px]"
          >
            <div className={`${getAspectRatioClass()} w-full max-w-md mx-auto relative`}>
              {isRecording && <div className="recording-indicator"></div>}

              {activeTab === "post" && capturedImage ? (
                <img
                  src={capturedImage || "/placeholder.svg"}
                  alt="Captured preview"
                  className="w-full h-full object-contain"
                />
              ) : activeTab === "reel" && capturedVideo ? (
                <video src={capturedVideo} controls className="w-full h-full object-contain" />
              ) : iframeSrc ? (
                <iframe
                  src={iframeSrc}
                  className="w-full h-full border-none"
                  title="Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : (
                <iframe srcDoc={fallbackPreview} className="w-full h-full border-none" title="Preview Fallback" />
              )}
            </div>
          </div>

          <TabsContent value="post" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-name">File Name</Label>
              <Input
                id="file-name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter file name"
                className="bg-[#0a0a0a] border-[#333333]"
              />
            </div>

            <div className="flex justify-between">
              <Button
                onClick={captureImage}
                disabled={isCapturing}
                className="bg-[#00ff88] text-black hover:bg-[#00cc77]"
              >
                {isCapturing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Capturing...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-4 w-4" /> Capture Image
                  </>
                )}
              </Button>

              {capturedImage && (
                <Button onClick={downloadImage} variant="outline" className="border-[#333333] hover:bg-[#252525]">
                  <Download className="mr-2 h-4 w-4" /> Download PNG
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reel" className="mt-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="recording-duration">Max Recording Duration: {maxRecordingTime}s</Label>
                {isRecording && (
                  <span className="text-[#00ff88] font-mono">
                    {formatTime(recordingTime)} / {formatTime(maxRecordingTime)}
                  </span>
                )}
              </div>
              <Slider
                id="recording-duration"
                min={5}
                max={60}
                step={5}
                value={[maxRecordingTime]}
                onValueChange={(value) => setMaxRecordingTime(value[0])}
                disabled={isRecording}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-name">File Name</Label>
              <Input
                id="file-name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter file name"
                className="bg-[#0a0a0a] border-[#333333]"
                disabled={isRecording}
              />
            </div>

            <div className="flex justify-between">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  disabled={!!capturedVideo}
                  className="bg-[#00ff88] text-black hover:bg-[#00cc77]"
                >
                  <Video className="mr-2 h-4 w-4" /> Start Recording
                </Button>
              ) : (
                <Button onClick={stopRecording} variant="destructive">
                  <X className="mr-2 h-4 w-4" /> Stop Recording
                </Button>
              )}

              {capturedVideo && (
                <Button onClick={downloadVideo} variant="outline" className="border-[#333333] hover:bg-[#252525]">
                  <Download className="mr-2 h-4 w-4" /> Download Video
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-[#333333] hover:bg-[#252525]">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

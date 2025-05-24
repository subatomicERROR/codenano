"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Video, X, Download, Save, Loader2, Info, Camera, Sparkles } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { getBrowserClient } from "@/lib/supabase"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import html2canvas from "html2canvas"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Innovative multi-method recording approach
const RECORDING_METHODS = {
  CANVAS_CAPTURE: "canvas_capture",
  FRAME_SEQUENCE: "frame_sequence",
  HYBRID: "hybrid",
}

export default function ConvertToReelPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [maxRecordingTime, setMaxRecordingTime] = useState(15) // Default 15 seconds
  const [capturedVideo, setCapturedVideo] = useState<string | null>(null)
  const [capturedThumbnail, setCapturedThumbnail] = useState<string | null>(null)
  const [fileName, setFileName] = useState("codenano_reel")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [aspectRatio, setAspectRatio] = useState<"portrait" | "square" | "landscape">("portrait")
  const [fps, setFps] = useState(30)
  const [code, setCode] = useState({ html: "", css: "", js: "" })
  const [isLoading, setIsLoading] = useState(true)
  const [supportedMimeTypes, setSupportedMimeTypes] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [platform, setPlatform] = useState<"instagram" | "youtube" | "tiktok">("instagram")
  const [quality, setQuality] = useState<"ultra" | "high" | "standard">("high")
  const [recordingMethod, setRecordingMethod] = useState<string>(RECORDING_METHODS.HYBRID)
  const [capturedFrames, setCapturedFrames] = useState<string[]>([])
  const [processingVideo, setProcessingVideo] = useState(false)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [videoEnhancement, setVideoEnhancement] = useState(true)
  const [smoothAnimation, setSmoothAnimation] = useState(true)
  const [stabilization, setStabilization] = useState(false)
  const [colorBoost, setColorBoost] = useState(true)

  const previewRef = useRef<HTMLIFrameElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const framesRef = useRef<string[]>([])
  const { toast } = useToast()
  const supabase = getBrowserClient()

  // Check supported mime types with advanced detection
  useEffect(() => {
    const checkSupportedMimeTypes = async () => {
      // Try to detect supported formats
      const formats = [
        { mimeType: "video/mp4", codecs: ["h264", "avc1.42E01E", "avc1.42001E", "avc1.640028"] },
        { mimeType: "video/webm", codecs: ["vp9", "vp9.0", "vp8", "vp8.0"] },
        { mimeType: "video/x-matroska", codecs: ["vp9", "vp8"] },
      ]

      const supported: string[] = []

      // Test each format and codec combination
      for (const format of formats) {
        // Try without codec first
        try {
          if (MediaRecorder.isTypeSupported(format.mimeType)) {
            supported.push(format.mimeType)
          }
        } catch (e) {
          console.warn(`Format ${format.mimeType} not supported`)
        }

        // Try with each codec
        for (const codec of format.codecs) {
          const mimeString = `${format.mimeType};codecs=${codec}`
          try {
            if (MediaRecorder.isTypeSupported(mimeString)) {
              supported.push(mimeString)
            }
          } catch (e) {
            console.warn(`Format ${mimeString} not supported`)
          }
        }
      }

      // If no formats are supported, add a fallback
      if (supported.length === 0) {
        supported.push("video/webm") // Most basic fallback
      }

      setSupportedMimeTypes(supported)
      console.log("Supported MIME types:", supported)

      // Set the best recording method based on browser capabilities
      const hasMP4Support = supported.some((type) => type.includes("mp4"))
      const hasVP9Support = supported.some((type) => type.includes("vp9"))

      if (hasMP4Support) {
        setRecordingMethod(RECORDING_METHODS.HYBRID)
      } else if (hasVP9Support) {
        setRecordingMethod(RECORDING_METHODS.CANVAS_CAPTURE)
      } else {
        setRecordingMethod(RECORDING_METHODS.FRAME_SEQUENCE)
      }
    }

    checkSupportedMimeTypes()
  }, [])

  // Load code from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTitle = localStorage.getItem("code-nano-title") || "Untitled Reel"
      setTitle(savedTitle)
      setFileName(savedTitle.toLowerCase().replace(/\s+/g, "_"))

      setCode({
        html: localStorage.getItem("code-nano-html") || "",
        css: localStorage.getItem("code-nano-css") || "",
        js: localStorage.getItem("code-nano-js") || "",
      })
      setIsLoading(false)
    }
  }, [])

  // Update preview with current code
  useEffect(() => {
    if (isLoading) return

    const previewContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            width: 100%;
            height: 100%;
            background-color: white;
          }
          ${code.css}
        </style>
        <script>
          window.onerror = (message, source, lineno, colno, error) => {
            console.error(message);
            return true;
          };
        </script>
      </head>
      <body>
        ${code.html}
        <script>${code.js}</script>
      </body>
      </html>
    `

    if (previewRef.current) {
      previewRef.current.srcdoc = previewContent
    }
  }, [code, isLoading])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopRecording()
      if (capturedVideo) {
        URL.revokeObjectURL(capturedVideo)
      }
      if (capturedThumbnail) {
        URL.revokeObjectURL(capturedThumbnail)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      // Clean up captured frames
      capturedFrames.forEach((frame) => {
        try {
          URL.revokeObjectURL(frame)
        } catch (e) {
          console.warn("Error revoking URL:", e)
        }
      })
    }
  }, [capturedVideo, capturedThumbnail, capturedFrames])

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

  const getAspectRatioDimensions = () => {
    // Platform-specific dimensions
    if (platform === "instagram") {
      switch (aspectRatio) {
        case "portrait":
          return { width: 1080, height: 1920 } // 9:16 ratio for Instagram Reels
        case "square":
          return { width: 1080, height: 1080 } // 1:1 ratio for Instagram posts
        case "landscape":
          return { width: 1080, height: 608 } // Instagram landscape (close to 16:9)
        default:
          return { width: 1080, height: 1920 }
      }
    } else if (platform === "tiktok") {
      return { width: 1080, height: 1920 } // TikTok is always 9:16
    } else {
      // YouTube
      switch (aspectRatio) {
        case "portrait":
          return { width: 1080, height: 1920 } // 9:16 ratio for YouTube Shorts
        case "square":
          return { width: 1080, height: 1080 } // 1:1 ratio
        case "landscape":
          return { width: 1920, height: 1080 } // 16:9 ratio for standard YouTube
        default:
          return { width: 1080, height: 1920 }
      }
    }
  }

  const captureThumbnail = async () => {
    if (!previewRef.current) {
      toast({
        title: "Error",
        description: "Preview not available. Please try again.",
        variant: "destructive",
      })
      return null
    }

    setIsCapturing(true)

    try {
      // Wait for iframe to load completely
      await new Promise((resolve) => {
        if (previewRef.current?.contentDocument?.readyState === "complete") {
          resolve(true)
        } else {
          previewRef.current?.addEventListener("load", () => resolve(true), { once: true })
        }
      })

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
        backgroundColor: "white",
        scale: quality === "ultra" ? 3 : quality === "high" ? 2 : 1, // Higher quality for better settings
      })

      // Apply color enhancement if enabled
      if (colorBoost) {
        const ctx = canvas.getContext("2d")
        if (ctx) {
          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data

          // Apply vibrance and saturation boost
          for (let i = 0; i < data.length; i += 4) {
            // Increase saturation
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]

            // Convert RGB to HSL
            const max = Math.max(r, g, b)
            const min = Math.min(r, g, b)
            let h,
              s,
              l = (max + min) / 2

            if (max === min) {
              h = s = 0 // achromatic
            } else {
              const d = max - min
              s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

              switch (max) {
                case r:
                  h = (g - b) / d + (g < b ? 6 : 0)
                  break
                case g:
                  h = (b - r) / d + 2
                  break
                case b:
                  h = (r - g) / d + 4
                  break
                default:
                  h = 0
              }

              h /= 6
            }

            // Increase saturation by 20%
            s = Math.min(s * 1.2, 1)

            // Convert back to RGB
            const hue2rgb = (p: number, q: number, t: number) => {
              if (t < 0) t += 1
              if (t > 1) t -= 1
              if (t < 1 / 6) return p + (q - p) * 6 * t
              if (t < 1 / 2) return q
              if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
              return p
            }

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s
            const p = 2 * l - q

            data[i] = Math.round(hue2rgb(p, q, h + 1 / 3) * 255)
            data[i + 1] = Math.round(hue2rgb(p, q, h) * 255)
            data[i + 2] = Math.round(hue2rgb(p, q, h - 1 / 3) * 255)
          }

          // Put the modified image data back
          ctx.putImageData(imageData, 0, 0)
        }
      }

      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL("image/png")
      setCapturedThumbnail(dataUrl)

      return dataUrl
    } catch (error) {
      console.error("Error capturing thumbnail:", error)
      toast({
        title: "Error",
        description: "Failed to capture thumbnail. Please try again.",
        variant: "destructive",
      })
      return null
    } finally {
      setIsCapturing(false)
    }
  }

  const captureManualThumbnail = async () => {
    const thumbnail = await captureThumbnail()
    if (thumbnail) {
      toast({
        title: "Success",
        description: "Thumbnail captured successfully!",
      })
    }
  }

  // Innovative frame capture function
  const captureFrame = async () => {
    if (!previewRef.current) return null

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
        backgroundColor: "white",
        scale: 1, // Use 1 for performance during recording
      })

      return canvas
    } catch (error) {
      console.error("Error capturing frame:", error)
      return null
    }
  }

  // Advanced frame-by-frame recording method
  const recordFrameSequence = async () => {
    framesRef.current = []
    const dimensions = getAspectRatioDimensions()
    const frameInterval = 1000 / fps
    let frameCount = 0
    const maxFrames = maxRecordingTime * fps

    // Create a canvas for compositing frames
    const canvas = document.createElement("canvas")
    canvas.width = dimensions.width
    canvas.height = dimensions.height
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      throw new Error("Could not get canvas context")
    }

    // Start capturing frames
    const captureNextFrame = async () => {
      if (!isRecording || frameCount >= maxFrames) {
        // Finish recording
        if (isRecording) {
          stopRecording()
        }
        return
      }

      try {
        const frameCanvas = await captureFrame()

        if (frameCanvas) {
          // Draw the frame on our canvas
          ctx.fillStyle = "white"
          ctx.fillRect(0, 0, dimensions.width, dimensions.height)
          ctx.drawImage(frameCanvas, 0, 0, dimensions.width, dimensions.height)

          // Convert to data URL and store
          const frameDataUrl = canvas.toDataURL("image/jpeg", 0.92)
          framesRef.current.push(frameDataUrl)
        }

        frameCount++
        setRecordingTime(Math.floor(frameCount / fps))

        // Schedule next frame
        setTimeout(() => {
          animationFrameRef.current = requestAnimationFrame(captureNextFrame)
        }, frameInterval)
      } catch (error) {
        console.error("Error in frame capture:", error)
        // Continue even if there's an error
        setTimeout(() => {
          animationFrameRef.current = requestAnimationFrame(captureNextFrame)
        }, frameInterval)
      }
    }

    // Start the frame capture loop
    captureNextFrame()
  }

  // Convert captured frames to video
  const convertFramesToVideo = async () => {
    setProcessingVideo(true)

    try {
      const frames = framesRef.current
      if (frames.length === 0) {
        throw new Error("No frames captured")
      }

      // Create a canvas for the video frames
      const dimensions = getAspectRatioDimensions()
      const canvas = document.createElement("canvas")
      canvas.width = dimensions.width
      canvas.height = dimensions.height
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        throw new Error("Could not get canvas context")
      }

      // Create a MediaRecorder to record the canvas
      const stream = canvas.captureStream(fps)

      // Select best MIME type
      let mimeType = "video/webm"
      if (supportedMimeTypes.some((type) => type.includes("mp4"))) {
        mimeType = supportedMimeTypes.find((type) => type.includes("mp4")) || "video/mp4"
      } else if (supportedMimeTypes.length > 0) {
        mimeType = supportedMimeTypes[0]
      }

      const options: MediaRecorderOptions = {
        mimeType: mimeType,
        videoBitsPerSecond: quality === "ultra" ? 8000000 : quality === "high" ? 5000000 : 2500000,
      }

      const mediaRecorder = new MediaRecorder(stream, options)
      const chunks: Blob[] = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType })
        const url = URL.createObjectURL(blob)
        setCapturedVideo(url)
        setProcessingVideo(false)

        toast({
          title: "Success",
          description: "Video processed successfully!",
        })
      }

      // Start recording
      mediaRecorder.start()

      // Draw each frame onto the canvas with timing
      let frameIndex = 0
      const drawNextFrame = async () => {
        if (frameIndex >= frames.length) {
          mediaRecorder.stop()
          return
        }

        // Load the frame
        const img = new Image()
        img.onload = () => {
          // Draw the frame
          ctx.fillStyle = "white"
          ctx.fillRect(0, 0, dimensions.width, dimensions.height)
          ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height)

          // Move to next frame
          frameIndex++

          // Schedule next frame
          setTimeout(drawNextFrame, 1000 / fps)
        }
        img.src = frames[frameIndex]
      }

      // Start drawing frames
      drawNextFrame()
    } catch (error) {
      console.error("Error converting frames to video:", error)
      setProcessingVideo(false)
      toast({
        title: "Error",
        description: "Failed to process video. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Hybrid recording method using canvas capture
  const startCanvasCapture = async () => {
    // Get dimensions based on aspect ratio
    const dimensions = getAspectRatioDimensions()

    // Set up canvas for recording
    if (!canvasRef.current) {
      console.error("Canvas reference not available")
      return
    }

    const canvas = canvasRef.current
    canvas.width = dimensions.width
    canvas.height = dimensions.height
    const ctx = canvas.getContext("2d", { alpha: false })

    if (!ctx) {
      throw new Error("Could not get canvas context")
    }

    // Get the stream from the canvas
    const stream = canvas.captureStream(fps)
    streamRef.current = stream

    // Select best MIME type
    let mimeType = "video/webm"
    if (supportedMimeTypes.some((type) => type.includes("mp4"))) {
      mimeType = supportedMimeTypes.find((type) => type.includes("mp4")) || "video/mp4"
    } else if (supportedMimeTypes.some((type) => type.includes("vp9"))) {
      mimeType = "video/webm;codecs=vp9"
    } else if (supportedMimeTypes.length > 0) {
      mimeType = supportedMimeTypes[0]
    }

    // Create media recorder with supported mime type
    const options: MediaRecorderOptions = {
      mimeType: mimeType,
      videoBitsPerSecond: quality === "ultra" ? 8000000 : quality === "high" ? 5000000 : 2500000,
    }

    mediaRecorderRef.current = new MediaRecorder(stream, options)

    // Handle data available event
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data)
      }
    }

    // Handle recording stop
    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(recordedChunksRef.current, { type: mimeType })
      const url = URL.createObjectURL(blob)
      setCapturedVideo(url)
      setIsRecording(false)

      // If we don't have a thumbnail yet, capture one
      if (!capturedThumbnail) {
        await captureThumbnail()
      }

      toast({
        title: "Success",
        description: "Video recorded successfully!",
      })
    }

    // Start the recording
    mediaRecorderRef.current.start(100) // Collect data every 100ms

    // Start drawing frames
    const drawFrame = async () => {
      if (!isRecording) return

      try {
        // Fill with white background
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, dimensions.width, dimensions.height)

        // Capture and draw the current frame
        const frameCanvas = await captureFrame()
        if (frameCanvas) {
          ctx.drawImage(frameCanvas, 0, 0, dimensions.width, dimensions.height)
        }

        // Request next frame
        animationFrameRef.current = requestAnimationFrame(drawFrame)
      } catch (error) {
        console.error("Error drawing frame:", error)
        // Continue even if there's an error
        animationFrameRef.current = requestAnimationFrame(drawFrame)
      }
    }

    // Start the animation loop
    drawFrame()
  }

  const startRecording = async () => {
    if (!previewRef.current) {
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
      setCapturedThumbnail(null)
      recordedChunksRef.current = []
      framesRef.current = []

      // Wait for iframe to load completely
      await new Promise((resolve) => {
        if (previewRef.current?.contentDocument?.readyState === "complete") {
          resolve(true)
        } else {
          previewRef.current?.addEventListener("load", () => resolve(true), { once: true })
        }
      })

      // Capture a thumbnail before starting recording
      await captureThumbnail()

      // Start the timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1
          if (newTime >= maxRecordingTime) {
            stopRecording()
          }
          return newTime
        })
      }, 1000)

      // Choose recording method based on settings
      if (recordingMethod === RECORDING_METHODS.FRAME_SEQUENCE) {
        await recordFrameSequence()
      } else {
        await startCanvasCapture()
      }
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

    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // Stop the media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    } else if (recordingMethod === RECORDING_METHODS.FRAME_SEQUENCE && framesRef.current.length > 0) {
      // Convert frames to video
      setIsRecording(false)
      convertFramesToVideo()
    }

    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (recordingMethod !== RECORDING_METHODS.FRAME_SEQUENCE) {
      setIsRecording(false)
    }
  }

  const downloadVideo = () => {
    if (!capturedVideo) return

    // Determine file extension based on MIME type
    const fileExtension = supportedMimeTypes[0]?.includes("mp4") ? "mp4" : "webm"

    const link = document.createElement("a")
    link.href = capturedVideo
    link.download = `${fileName}.${fileExtension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Success",
      description: "Video downloaded successfully!",
    })
  }

  const downloadThumbnail = () => {
    if (!capturedThumbnail) return

    const link = document.createElement("a")
    link.href = capturedThumbnail
    link.download = `${fileName}_thumbnail.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Success",
      description: "Thumbnail downloaded successfully!",
    })
  }

  const saveReel = async () => {
    if (!capturedVideo) {
      toast({
        title: "Error",
        description: "Please record a video first",
        variant: "destructive",
      })
      return
    }

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save your reel",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      // Check if reels table exists
      const { error: tableCheckError } = await supabase.from("reels").select("count").limit(1)

      if (tableCheckError && tableCheckError.message.includes("does not exist")) {
        // Try to create the reels table
        try {
          await fetch("/api/init-db", { method: "POST" })
          toast({
            title: "Database initialized",
            description: "Required tables have been created",
          })
        } catch (initError) {
          toast({
            title: "Database error",
            description: "The reels table doesn't exist. Please initialize the database first.",
            variant: "destructive",
          })
          setIsSaving(false)
          return
        }
      }

      // Capture thumbnail if not already captured
      let thumbnailDataUrl = capturedThumbnail
      if (!thumbnailDataUrl) {
        thumbnailDataUrl = await captureThumbnail()
      }

      // Convert video blob to File
      const response = await fetch(capturedVideo)
      const blob = await response.blob()
      const fileExtension = supportedMimeTypes[0]?.includes("mp4") ? "mp4" : "webm"
      const file = new File([blob], `${fileName}.${fileExtension}`, { type: blob.type })

      // Upload to storage
      const filePath = `reels/${session.user.id}/${Date.now()}.${fileExtension}`

      const { error: uploadError } = await supabase.storage.from("content").upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("content").getPublicUrl(filePath)

      // Upload thumbnail if available
      let thumbnailPublicUrl = null
      if (thumbnailDataUrl) {
        // Convert data URL to blob
        const thumbnailBlob = await (await fetch(thumbnailDataUrl)).blob()
        const thumbnailFile = new File([thumbnailBlob], `${fileName}_thumbnail.png`, { type: "image/png" })

        // Upload thumbnail
        const thumbnailPath = `thumbnails/${session.user.id}/${Date.now()}.png`
        const { error: thumbnailError } = await supabase.storage.from("content").upload(thumbnailPath, thumbnailFile)

        if (!thumbnailError) {
          const {
            data: { publicUrl: thumbUrl },
          } = supabase.storage.from("content").getPublicUrl(thumbnailPath)

          thumbnailPublicUrl = thumbUrl
        }
      }

      // Save reel metadata to database
      const { error: insertError } = await supabase.from("reels").insert({
        user_id: session.user.id,
        title: title || fileName,
        description:
          description ||
          `Created with CodeNano for ${platform === "instagram" ? "Instagram" : platform === "tiktok" ? "TikTok" : "YouTube"}`,
        video_url: publicUrl,
        thumbnail_url: thumbnailPublicUrl,
        aspect_ratio: aspectRatio,
        platform: platform,
        quality: quality,
        html: code.html,
        css: code.css,
        js: code.js,
        is_public: isPublic,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (insertError) throw insertError

      toast({
        title: "Reel saved",
        description: `Your ${platform === "instagram" ? "Instagram Reel" : platform === "tiktok" ? "TikTok" : "YouTube Short"} has been saved successfully`,
      })
    } catch (error: any) {
      console.error("Save reel error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save reel",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
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
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/editor">
            <Button variant="ghost" size="sm" className="text-[#e0e0e0]/70 hover:bg-[#252525]">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Editor
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">🎬 Create Social Media Content</h1>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                    className={showAdvancedSettings ? "bg-[#252525]" : ""}
                  >
                    <Sparkles className="h-5 w-5 text-[#00ff88]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Advanced Settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => setShowHelp(true)}>
                    <Info className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View recording help</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#333333]">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={platform} onValueChange={(value: any) => setPlatform(value)} disabled={isRecording}>
                    <SelectTrigger className="w-full bg-[#0a0a0a] border-[#333333]">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#333333]">
                      <SelectItem value="instagram">Instagram Reels</SelectItem>
                      <SelectItem value="youtube">YouTube Shorts</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value)
                      setFileName(e.target.value.toLowerCase().replace(/\s+/g, "_"))
                    }}
                    placeholder="Enter video title"
                    className="bg-[#0a0a0a] border-[#333333]"
                    disabled={isRecording}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter video description"
                    className="bg-[#0a0a0a] border-[#333333] min-h-[80px]"
                    disabled={isRecording}
                  />
                </div>

                {platform !== "tiktok" && (
                  <div className="space-y-2">
                    <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
                    <Select
                      value={aspectRatio}
                      onValueChange={(value: any) => setAspectRatio(value)}
                      disabled={isRecording}
                    >
                      <SelectTrigger className="w-full bg-[#0a0a0a] border-[#333333]">
                        <SelectValue placeholder="Select aspect ratio" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-[#333333]">
                        <SelectItem value="portrait">Portrait (9:16) - Recommended</SelectItem>
                        <SelectItem value="square">Square (1:1)</SelectItem>
                        <SelectItem value="landscape">
                          Landscape ({platform === "instagram" ? "4:5" : "16:9"})
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="quality">Video Quality</Label>
                  <Select value={quality} onValueChange={(value: any) => setQuality(value)} disabled={isRecording}>
                    <SelectTrigger className="w-full bg-[#0a0a0a] border-[#333333]">
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#333333]">
                      <SelectItem value="ultra">Ultra HD (Best quality, largest file)</SelectItem>
                      <SelectItem value="high">High (Better quality, larger file)</SelectItem>
                      <SelectItem value="standard">Standard (Smaller file, faster processing)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="recording-duration">Max Duration: {maxRecordingTime}s</Label>
                    {isRecording && (
                      <span className="text-[#00ff88] font-mono">
                        {formatTime(recordingTime)} / {formatTime(maxRecordingTime)}
                      </span>
                    )}
                  </div>
                  <Slider
                    id="recording-duration"
                    min={5}
                    max={platform === "instagram" ? 90 : platform === "tiktok" ? 60 : 60}
                    step={5}
                    value={[maxRecordingTime]}
                    onValueChange={(value) => setMaxRecordingTime(value[0])}
                    disabled={isRecording}
                    className="w-full"
                  />
                  <p className="text-xs text-[#e0e0e0]/70">
                    {platform === "instagram"
                      ? "Instagram Reels can be up to 90 seconds"
                      : platform === "tiktok"
                        ? "TikTok videos can be up to 60 seconds"
                        : "YouTube Shorts should be 60 seconds or less"}
                  </p>
                </div>

                {showAdvancedSettings && (
                  <div className="space-y-4 pt-2 pb-2 border-t border-b border-[#333333]">
                    <h3 className="font-medium text-[#00ff88]">Advanced Settings</h3>

                    <div className="space-y-2">
                      <Label htmlFor="fps">Frame Rate (FPS)</Label>
                      <Select
                        value={fps.toString()}
                        onValueChange={(value) => setFps(Number.parseInt(value))}
                        disabled={isRecording}
                      >
                        <SelectTrigger className="w-full bg-[#0a0a0a] border-[#333333]">
                          <SelectValue placeholder="Select frame rate" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-[#333333]">
                          <SelectItem value="24">24 FPS (Cinematic)</SelectItem>
                          <SelectItem value="30">30 FPS (Standard)</SelectItem>
                          <SelectItem value="60">60 FPS (Smooth)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recording-method">Recording Method</Label>
                      <Select
                        value={recordingMethod}
                        onValueChange={(value) => setRecordingMethod(value)}
                        disabled={isRecording}
                      >
                        <SelectTrigger className="w-full bg-[#0a0a0a] border-[#333333]">
                          <SelectValue placeholder="Select recording method" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-[#333333]">
                          <SelectItem value={RECORDING_METHODS.HYBRID}>Hybrid (Recommended)</SelectItem>
                          <SelectItem value={RECORDING_METHODS.CANVAS_CAPTURE}>Canvas Capture</SelectItem>
                          <SelectItem value={RECORDING_METHODS.FRAME_SEQUENCE}>Frame Sequence</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-[#e0e0e0]/70">
                        {recordingMethod === RECORDING_METHODS.HYBRID
                          ? "Hybrid method combines multiple techniques for best results"
                          : recordingMethod === RECORDING_METHODS.CANVAS_CAPTURE
                            ? "Canvas capture is faster but may have lower quality"
                            : "Frame sequence produces higher quality but takes longer to process"}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="video-enhancement"
                        checked={videoEnhancement}
                        onChange={(e) => setVideoEnhancement(e.target.checked)}
                        className="rounded border-[#333333] bg-[#0a0a0a] text-[#00ff88]"
                        disabled={isRecording}
                      />
                      <Label htmlFor="video-enhancement">Video Enhancement</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="smooth-animation"
                        checked={smoothAnimation}
                        onChange={(e) => setSmoothAnimation(e.target.checked)}
                        className="rounded border-[#333333] bg-[#0a0a0a] text-[#00ff88]"
                        disabled={isRecording}
                      />
                      <Label htmlFor="smooth-animation">Smooth Animation</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="stabilization"
                        checked={stabilization}
                        onChange={(e) => setStabilization(e.target.checked)}
                        className="rounded border-[#333333] bg-[#0a0a0a] text-[#00ff88]"
                        disabled={isRecording}
                      />
                      <Label htmlFor="stabilization">Stabilization</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="color-boost"
                        checked={colorBoost}
                        onChange={(e) => setColorBoost(e.target.checked)}
                        className="rounded border-[#333333] bg-[#0a0a0a] text-[#00ff88]"
                        disabled={isRecording}
                      />
                      <Label htmlFor="color-boost">Color Boost</Label>
                    </div>
                  </div>
                )}

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

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="is-public"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="rounded border-[#333333] bg-[#0a0a0a] text-[#00ff88]"
                    disabled={isRecording}
                  />
                  <Label htmlFor="is-public">Make this content public</Label>
                </div>

                <div className="pt-4">
                  {!isRecording && !processingVideo ? (
                    <Button
                      onClick={startRecording}
                      disabled={!!capturedVideo}
                      className="w-full bg-[#00ff88] text-black hover:bg-[#00cc77]"
                    >
                      <Video className="mr-2 h-4 w-4" /> Start Recording
                    </Button>
                  ) : isRecording ? (
                    <Button onClick={stopRecording} variant="destructive" className="w-full">
                      <X className="mr-2 h-4 w-4" /> Stop Recording
                    </Button>
                  ) : (
                    <Button disabled className="w-full">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing Video...
                    </Button>
                  )}

                  {!isRecording && !processingVideo && !capturedVideo && (
                    <Button
                      onClick={captureManualThumbnail}
                      variant="outline"
                      className="w-full mt-2 border-[#333333] hover:bg-[#252525]"
                      disabled={isCapturing}
                    >
                      {isCapturing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Capturing...
                        </>
                      ) : (
                        <>
                          <Camera className="mr-2 h-4 w-4" /> Capture Thumbnail
                        </>
                      )}
                    </Button>
                  )}

                  {capturedVideo && (
                    <div className="space-y-3 mt-4">
                      <div className="flex gap-2">
                        <Button
                          onClick={downloadVideo}
                          variant="outline"
                          className="flex-1 border-[#333333] hover:bg-[#252525]"
                        >
                          <Download className="mr-2 h-4 w-4" /> Download Video
                        </Button>

                        {capturedThumbnail && (
                          <Button
                            onClick={downloadThumbnail}
                            variant="outline"
                            className="flex-1 border-[#333333] hover:bg-[#252525]"
                          >
                            <Download className="mr-2 h-4 w-4" /> Download Thumbnail
                          </Button>
                        )}
                      </div>

                      <Button
                        onClick={saveReel}
                        className="w-full bg-[#00ff88] text-black hover:bg-[#00cc77]"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" /> Save to Library
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#1a1a1a] rounded-lg border border-[#333333] p-4 flex items-center justify-center">
              <div className={`${getAspectRatioClass()} w-full max-w-md mx-auto relative overflow-hidden`}>
                {capturedVideo ? (
                  <video src={capturedVideo} controls className="w-full h-full object-contain bg-white" />
                ) : capturedThumbnail ? (
                  <div className="relative w-full h-full">
                    <img
                      src={capturedThumbnail || "/placeholder.svg"}
                      alt="Thumbnail"
                      className="w-full h-full object-contain bg-white"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      Thumbnail Preview
                    </div>
                  </div>
                ) : (
                  <>
                    <iframe
                      ref={previewRef}
                      className="w-full h-full border-none bg-white"
                      title="Preview"
                      sandbox="allow-scripts allow-same-origin"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </>
                )}

                {isRecording && (
                  <div className="absolute top-2 right-2 flex items-center bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                    <span className="w-2 h-2 bg-white rounded-full mr-1"></span>
                    REC {formatTime(recordingTime)}
                  </div>
                )}

                {processingVideo && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-[#00ff88]" />
                      <p className="text-white">Processing video...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-sm text-[#e0e0e0]/70">
              <p className="mb-2">
                Tips for creating great{" "}
                {platform === "instagram" ? "Instagram Reels" : platform === "tiktok" ? "TikTok" : "YouTube Shorts"}:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use the 9:16 aspect ratio for optimal display</li>
                <li>
                  Keep your video under {platform === "instagram" ? "60" : platform === "tiktok" ? "60" : "30"} seconds
                  for better engagement
                </li>
                <li>Add animations or interactions to make your content more dynamic</li>
                <li>Consider adding a watermark or your handle to the video</li>
                <li>Use high contrast colors for better visibility on mobile devices</li>
                {platform === "youtube" && <li>Include a clear call-to-action at the end of your Short</li>}
                {platform === "instagram" && <li>Add trending music or sounds to increase discoverability</li>}
                {platform === "tiktok" && <li>Use trending effects and sounds to boost visibility</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="bg-[#1a1a1a] text-[#e0e0e0] border-[#333333]">
          <DialogHeader>
            <DialogTitle>Recording Help</DialogTitle>
            <DialogDescription className="text-[#e0e0e0]/70">Tips for successful video recording</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">Supported Formats</h3>
              <p className="text-sm text-[#e0e0e0]/70">
                Your browser supports these video formats: {supportedMimeTypes.join(", ") || "None detected"}
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Troubleshooting</h3>
              <ul className="text-sm text-[#e0e0e0]/70 list-disc pl-5 space-y-1">
                <li>If recording fails, try a different browser (Chrome works best)</li>
                <li>Reduce the FPS and quality if the recording is choppy</li>
                <li>Try a different recording method in Advanced Settings</li>
                <li>Make sure your preview is fully loaded before recording</li>
                <li>For complex animations, use a shorter recording duration</li>
                <li>If you see a blank recording, try refreshing the page</li>
                <li>Capture a thumbnail manually if automatic capture fails</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-1">Platform Requirements</h3>
              <ul className="text-sm text-[#e0e0e0]/70 list-disc pl-5 space-y-1">
                <li>
                  <strong>Instagram Reels:</strong> 9:16 aspect ratio, up to 90 seconds
                </li>
                <li>
                  <strong>YouTube Shorts:</strong> 9:16 aspect ratio, up to 60 seconds
                </li>
                <li>
                  <strong>TikTok:</strong> 9:16 aspect ratio, up to 60 seconds
                </li>
                <li>All platforms recommend high-quality videos (1080p)</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowHelp(false)} className="bg-[#00ff88] text-black hover:bg-[#00cc77]">
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .portrait-frame {
          aspect-ratio: 9/16;
          max-height: 70vh;
        }
        .square-frame {
          aspect-ratio: 1/1;
          max-height: 70vh;
        }
        .landscape-frame {
          aspect-ratio: ${platform === "instagram" ? "4/5" : "16/9"};
          max-height: 70vh;
        }
      `}</style>
    </div>
  )
}

"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Camera, Download, Save, Loader2, Info } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { getBrowserClient } from "@/lib/supabase"
import html2canvas from "html2canvas"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ConvertToPostPage() {
  const [aspectRatio, setAspectRatio] = useState<"portrait" | "square" | "landscape">("portrait")
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [fileName, setFileName] = useState("codenano_post")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [code, setCode] = useState({ html: "", css: "", js: "" })
  const [isLoading, setIsLoading] = useState(true)
  const [quality, setQuality] = useState("high")
  const [isSaving, setIsSaving] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const previewContainerRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLIFrameElement>(null)
  const { toast } = useToast()
  const supabase = getBrowserClient()

  // Load code from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTitle = localStorage.getItem("code-nano-title") || "Untitled Post"
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
      if (capturedImage) {
        URL.revokeObjectURL(capturedImage)
      }
    }
  }, [capturedImage])

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
    switch (aspectRatio) {
      case "portrait":
        return { width: 1080, height: 1350 } // 4:5 ratio for Instagram
      case "square":
        return { width: 1080, height: 1080 } // 1:1 ratio
      case "landscape":
        return { width: 1080, height: 608 } // 16:9 ratio
      default:
        return { width: 1080, height: 1350 }
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

      // Get dimensions based on aspect ratio
      const dimensions = getAspectRatioDimensions()

      // Use html2canvas to capture the iframe content
      const canvas = await html2canvas(iframeDocument.body, {
        allowTaint: true,
        useCORS: true,
        logging: false,
        width: dimensions.width,
        height: dimensions.height,
        scale: quality === "high" ? 2 : 1, // Higher quality for "high"
        backgroundColor: "#FFFFFF", // Ensure white background
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

  const downloadImage = () => {
    if (!capturedImage) return

    const link = document.createElement("a")
    link.href = capturedImage
    link.download = `${fileName}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Success",
      description: "Image downloaded successfully!",
    })
  }

  const savePost = async () => {
    if (!capturedImage) {
      toast({
        title: "Error",
        description: "Please capture an image first",
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
        description: "Please sign in to save your post",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      // Check if posts table exists
      const { error: tableCheckError } = await supabase.from("posts").select("count").limit(1)

      if (tableCheckError && tableCheckError.message.includes("does not exist")) {
        toast({
          title: "Database error",
          description: "The posts table doesn't exist. Please initialize the database first.",
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }

      // Convert data URL to blob
      const response = await fetch(capturedImage)
      const blob = await response.blob()
      const file = new File([blob], `${fileName}.png`, { type: "image/png" })

      // Upload to storage
      const filePath = `posts/${session.user.id}/${Date.now()}.png`

      const { error: uploadError, data: uploadData } = await supabase.storage.from("content").upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("content").getPublicUrl(filePath)

      // Create a smaller thumbnail
      const thumbnailCanvas = document.createElement("canvas")
      const ctx = thumbnailCanvas.getContext("2d")

      if (!ctx) {
        throw new Error("Could not create thumbnail context")
      }

      // Create a temporary image
      const img = new Image()
      img.src = capturedImage

      await new Promise((resolve) => {
        img.onload = resolve
      })

      // Set thumbnail dimensions (300px width, maintain aspect ratio)
      const thumbnailWidth = 300
      const thumbnailHeight = (img.height / img.width) * thumbnailWidth

      thumbnailCanvas.width = thumbnailWidth
      thumbnailCanvas.height = thumbnailHeight

      // Draw the image at the smaller size
      ctx.drawImage(img, 0, 0, thumbnailWidth, thumbnailHeight)

      // Get the thumbnail data URL
      const thumbnailDataUrl = thumbnailCanvas.toDataURL("image/jpeg", 0.7)

      // Convert thumbnail data URL to blob
      const thumbnailResponse = await fetch(thumbnailDataUrl)
      const thumbnailBlob = await thumbnailResponse.blob()
      const thumbnailFile = new File([thumbnailBlob], `${fileName}_thumbnail.jpg`, { type: "image/jpeg" })

      // Upload thumbnail
      const thumbnailPath = `thumbnails/${session.user.id}/${Date.now()}.jpg`
      const { error: thumbnailError } = await supabase.storage.from("content").upload(thumbnailPath, thumbnailFile)

      let thumbnailPublicUrl = null
      if (!thumbnailError) {
        const {
          data: { publicUrl: thumbUrl },
        } = supabase.storage.from("content").getPublicUrl(thumbnailPath)

        thumbnailPublicUrl = thumbUrl
      }

      // Save post metadata to database
      const { error: insertError } = await supabase.from("posts").insert({
        user_id: session.user.id,
        title: title || fileName,
        description: description || "Created with CodeNano",
        image_url: publicUrl,
        thumbnail_url: thumbnailPublicUrl,
        aspect_ratio: aspectRatio,
        html: code.html,
        css: code.css,
        js: code.js,
        is_public: isPublic,
      })

      if (insertError) throw insertError

      toast({
        title: "Post saved",
        description: "Your post has been saved successfully",
      })
    } catch (error: any) {
      console.error("Save post error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save post",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
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
          <h1 className="text-3xl font-bold">📷 Convert Your Preview into a Post</h1>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => setShowHelp(true)}>
                  <Info className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View capture help</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#333333]">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value)
                      setFileName(e.target.value.toLowerCase().replace(/\s+/g, "_"))
                    }}
                    placeholder="Enter post title"
                    className="bg-[#0a0a0a] border-[#333333]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter post description"
                    className="bg-[#0a0a0a] border-[#333333] min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
                  <Select value={aspectRatio} onValueChange={(value: any) => setAspectRatio(value)}>
                    <SelectTrigger className="w-full bg-[#0a0a0a] border-[#333333]">
                      <SelectValue placeholder="Select aspect ratio" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#333333]">
                      <SelectItem value="portrait">Portrait (4:5)</SelectItem>
                      <SelectItem value="square">Square (1:1)</SelectItem>
                      <SelectItem value="landscape">Landscape (16:9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quality">Image Quality</Label>
                  <Select value={quality} onValueChange={setQuality}>
                    <SelectTrigger className="w-full bg-[#0a0a0a] border-[#333333]">
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#333333]">
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="high">High Resolution</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="is-public"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="rounded border-[#333333] bg-[#0a0a0a] text-[#00ff88]"
                  />
                  <Label htmlFor="is-public">Make this post public</Label>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={captureImage}
                    disabled={isCapturing}
                    className="w-full bg-[#00ff88] text-black hover:bg-[#00cc77]"
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
                    <div className="space-y-3 mt-4">
                      <Button
                        onClick={downloadImage}
                        variant="outline"
                        className="w-full border-[#333333] hover:bg-[#252525]"
                      >
                        <Download className="mr-2 h-4 w-4" /> Download PNG
                      </Button>
                      <Button
                        onClick={savePost}
                        className="w-full bg-[#00ff88] text-black hover:bg-[#00cc77]"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" /> Save Post
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
            <div className="bg-[#1a1a1a] rounded-lg border border-[#333333] p-4">
              <div
                ref={previewContainerRef}
                className={`${getAspectRatioClass()} w-full max-w-md mx-auto relative overflow-hidden`}
              >
                {capturedImage ? (
                  <img
                    src={capturedImage || "/placeholder.svg"}
                    alt="Captured preview"
                    className="w-full h-full object-contain bg-white"
                  />
                ) : (
                  <iframe
                    ref={previewRef}
                    className="w-full h-full border-none bg-white"
                    title="Preview"
                    sandbox="allow-scripts allow-same-origin"
                  />
                )}
              </div>
            </div>

            <div className="text-sm text-[#e0e0e0]/70">
              <p className="mb-2">Tips for creating great posts:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use the 4:5 aspect ratio for optimal Instagram display</li>
                <li>Choose high resolution for better image quality</li>
                <li>Make sure your code is readable in the image</li>
                <li>Consider adding a watermark or your handle to the image</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="bg-[#1a1a1a] text-[#e0e0e0] border-[#333333]">
          <DialogHeader>
            <DialogTitle>Capture Help</DialogTitle>
            <DialogDescription className="text-[#e0e0e0]/70">Tips for successful image capture</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">Troubleshooting</h3>
              <ul className="text-sm text-[#e0e0e0]/70 list-disc pl-5 space-y-1">
                <li>If capture fails, try a different browser (Chrome works best)</li>
                <li>Make sure your preview is fully loaded before capturing</li>
                <li>For complex designs, use the standard quality setting</li>
                <li>If you see a blank capture, try refreshing the page</li>
                <li>External images in your code may not be captured due to CORS restrictions</li>
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
          aspect-ratio: 4/5;
          max-height: 70vh;
        }
        .square-frame {
          aspect-ratio: 1/1;
          max-height: 70vh;
        }
        .landscape-frame {
          aspect-ratio: 16/9;
          max-height: 70vh;
        }
      `}</style>
    </div>
  )
}

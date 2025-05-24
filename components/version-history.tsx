"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { getBrowserClient } from "@/lib/supabase"
import { History, Clock, RotateCcw } from "lucide-react"

interface VersionHistoryProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  onRestore: (code: { html: string; css: string; js: string }) => void
}

export default function VersionHistory({ isOpen, onClose, projectId, onRestore }: VersionHistoryProps) {
  const [versions, setVersions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = getBrowserClient()

  useEffect(() => {
    if (isOpen && projectId) {
      fetchVersions()
    }
  }, [isOpen, projectId])

  const fetchVersions = async () => {
    if (!projectId) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("project_versions")
        .select("*")
        .eq("project_id", projectId)
        .order("saved_at", { ascending: false })
        .limit(20)

      if (error) throw error

      setVersions(data || [])
    } catch (error: any) {
      console.error("Error fetching versions:", error)
      toast({
        title: "Error",
        description: "Failed to load version history",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestore = (version: any) => {
    try {
      const codeData = JSON.parse(version.content)
      onRestore(codeData)
      onClose()
      toast({
        title: "Version restored",
        description: `Project restored to version from ${formatDate(version.saved_at)}`,
      })
    } catch (error) {
      console.error("Error restoring version:", error)
      toast({
        title: "Error",
        description: "Failed to restore version",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1a] border-[#333333] text-[#e0e0e0] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-[#00ff88]" /> Version History
          </DialogTitle>
          <DialogDescription className="text-[#e0e0e0]/70">
            View and restore previous versions of your project
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin text-[#00ff88]">
              <Clock className="h-8 w-8" />
            </div>
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-8 text-[#e0e0e0]/70">
            <History className="h-12 w-12 mx-auto mb-4 text-[#e0e0e0]/30" />
            <p>No version history available for this project.</p>
            <p className="text-sm mt-2">Versions are automatically saved when you make changes to your project.</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="bg-[#0a0a0a] border border-[#333333] rounded-md p-4 hover:border-[#00ff88] transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#00ff88]" />
                      <span className="text-sm font-medium">{formatDate(version.saved_at)}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#333333] hover:bg-[#252525] hover:text-[#00ff88]"
                      onClick={() => handleRestore(version)}
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1" /> Restore
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}

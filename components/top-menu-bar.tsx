"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play, Save, Share2, Settings, Plus } from "lucide-react"
import { useEditorStore } from "@/lib/editor-store"
import { SaveProjectModal } from "@/components/save-project-modal"
import { ShareProject } from "@/components/share-project"

interface TopMenuBarProps {
  user?: any
  onRun?: () => void
  onSave?: () => void
  onShare?: () => void
  onSettings?: () => void
}

export function TopMenuBar({ user, onRun, onSave, onShare, onSettings }: TopMenuBarProps) {
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const { currentProject, createProject } = useEditorStore()

  const handleSave = () => {
    if (user) {
      setShowSaveModal(true)
    } else {
      // Redirect to login or show login modal
      window.location.href = "/auth/login"
    }
  }

  const handleShare = () => {
    setShowShareModal(true)
  }

  const handleNewProject = () => {
    createProject()
  }

  return (
    <>
      <div className="h-12 bg-[#1a1a1a] border-b border-gray-800 flex items-center justify-between px-4">
        {/* Left side - Project actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewProject}
            className="text-gray-300 hover:text-white hover:bg-gray-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className="text-gray-300 hover:text-white hover:bg-gray-700"
          >
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-gray-300 hover:text-white hover:bg-gray-700"
          >
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
        </div>

        {/* Center - Project name */}
        <div className="flex-1 max-w-md mx-4">
          <Input
            value={currentProject?.name || "Untitled Project"}
            className="bg-gray-800 border-gray-700 text-white text-center"
            readOnly
          />
        </div>

        {/* Right side - Run and settings */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRun}
            className="text-green-400 hover:text-green-300 hover:bg-gray-700"
          >
            <Play className="w-4 h-4 mr-1" />
            Run
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onSettings}
            className="text-gray-300 hover:text-white hover:bg-gray-700"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Modals */}
      {showSaveModal && <SaveProjectModal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)} user={user} />}

      {showShareModal && (
        <ShareProject isOpen={showShareModal} onClose={() => setShowShareModal(false)} project={currentProject} />
      )}
    </>
  )
}

// Default export for backward compatibility
export default TopMenuBar

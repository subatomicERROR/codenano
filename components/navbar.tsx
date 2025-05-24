"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Save, Download, Settings, LogOut, User, GitBranch, History, Share } from "lucide-react"
import { getBrowserClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Logo } from "./logo"

interface NavbarProps {
  onSave: () => void
  onExport: () => void
  projectTitle: string
  onRename: (newTitle: string) => void
  onVersionHistory: () => void
  onFork: () => void
  onShare: () => void
}

export default function Navbar({
  onSave,
  onExport,
  projectTitle,
  onRename,
  onVersionHistory,
  onFork,
  onShare,
}: NavbarProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(projectTitle)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getBrowserClient()

  const handleTitleClick = () => {
    setIsEditing(true)
  }

  const handleTitleBlur = () => {
    setIsEditing(false)
    if (title.trim() !== projectTitle) {
      onRename(title)
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEditing(false)
      if (title.trim() !== projectTitle) {
        onRename(title)
      }
    } else if (e.key === "Escape") {
      setTitle(projectTitle)
      setIsEditing(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    })
    router.push("/")
  }

  return (
    <nav className="flex items-center justify-between h-[60px] bg-[#1a1a1a] px-6 border-b border-[#333333]">
      <div className="flex items-center gap-3">
        <Link href="/">
          <Logo size="sm" />
        </Link>

        {isEditing ? (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="h-8 w-48 bg-[#0a0a0a] border-[#333333]"
            autoFocus
          />
        ) : (
          <div className="text-[#e0e0e0] font-medium cursor-pointer" onClick={handleTitleClick}>
            {projectTitle}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="border-[#333333] hover:bg-[#252525] text-[#e0e0e0]"
          onClick={onVersionHistory}
        >
          <History className="mr-2 h-4 w-4" /> History
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-[#333333] hover:bg-[#252525] text-[#e0e0e0]"
          onClick={onFork}
        >
          <GitBranch className="mr-2 h-4 w-4" /> Fork
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-[#333333] hover:bg-[#252525] text-[#e0e0e0]"
          onClick={onShare}
        >
          <Share className="mr-2 h-4 w-4" /> Share
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-[#333333] hover:bg-[#252525] text-[#e0e0e0]"
          onClick={onSave}
        >
          <Save className="mr-2 h-4 w-4" /> Save
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-[#333333] hover:bg-[#252525] text-[#e0e0e0]"
          onClick={onExport}
        >
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-[#333333] text-[#e0e0e0]">
            <Link href="/dashboard">
              <DropdownMenuItem className="cursor-pointer">Dashboard</DropdownMenuItem>
            </Link>
            <Link href="/settings">
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" /> Settings
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator className="bg-[#333333]" />
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-500">
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}

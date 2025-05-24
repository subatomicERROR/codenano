"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FolderOpen, Plus } from "lucide-react"
import { getAllProjectsFromSupabase, getAllProjectsFromLocalStorage } from "@/lib/file-system"
import type { ProjectData } from "@/lib/file-system"

interface ProjectSelectorProps {
  currentProjectId?: string
  onSelectProject: (projectId: string) => void
  onCreateNewProject: () => void
}

export default function ProjectSelector({
  currentProjectId,
  onSelectProject,
  onCreateNewProject,
}: ProjectSelectorProps) {
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true)

      try {
        // Get projects from Supabase
        const cloudProjects = await getAllProjectsFromSupabase()

        // Get projects from localStorage
        const localProjects = getAllProjectsFromLocalStorage()

        // Combine and deduplicate projects
        const allProjects = [...cloudProjects]

        // Add local projects that don't exist in cloud
        localProjects.forEach((localProject) => {
          if (!cloudProjects.some((cloudProject) => cloudProject.id === localProject.id)) {
            allProjects.push(localProject)
          }
        })

        setProjects(allProjects)
      } catch (error) {
        console.error("Error loading projects:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProjects()
  }, [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-[#1a1a1a] border-[#333333] text-white hover:bg-[#252525]">
          <FolderOpen className="mr-2 h-4 w-4" />
          Projects
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-[#1a1a1a] border-[#333333] text-white">
        <DropdownMenuLabel>Your Projects</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#333333]" />
        <DropdownMenuItem className="cursor-pointer hover:bg-[#252525] focus:bg-[#252525]" onClick={onCreateNewProject}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[#333333]" />
        {isLoading ? (
          <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
        ) : projects.length > 0 ? (
          projects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              className={`cursor-pointer ${
                project.id === currentProjectId
                  ? "bg-[#252525] text-[#00ff88]"
                  : "hover:bg-[#252525] focus:bg-[#252525]"
              }`}
              onClick={() => project.id && onSelectProject(project.id)}
            >
              {project.title || "Untitled Project"}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>No projects found</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

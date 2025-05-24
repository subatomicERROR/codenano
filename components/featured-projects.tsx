"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Code, Clock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { getBrowserClient } from "@/lib/supabase"

// Mock data for featured projects as fallback
const mockFeaturedProjects = [
  {
    id: "1",
    title: "Animated Landing Page",
    description: "A responsive landing page with CSS animations",
    author: "quantum_coder",
    lastEdited: "2 hours ago",
    stars: 12,
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "2",
    title: "Interactive Form",
    description: "Form with validation and interactive elements",
    author: "webdev_pro",
    lastEdited: "Yesterday",
    stars: 8,
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "3",
    title: "CSS Grid Layout",
    description: "Complex layout using CSS Grid",
    author: "css_wizard",
    lastEdited: "3 days ago",
    stars: 5,
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
]

export default function FeaturedProjects() {
  const [projects, setProjects] = useState(mockFeaturedProjects)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        const supabase = getBrowserClient()

        // Check if projects table exists
        const { error: tableCheckError } = await supabase.from("projects").select("count").limit(1)

        if (tableCheckError) {
          // If table doesn't exist, use mock data
          console.log("Using mock data for featured projects")
          setLoading(false)
          return
        }

        // Get featured projects (most recent public projects)
        const { data, error: fetchError } = await supabase
          .from("projects")
          .select("*")
          .eq("is_public", true)
          .order("created_at", { ascending: false })
          .limit(3)

        if (fetchError) throw fetchError

        if (data && data.length > 0) {
          // Process the projects
          const processedProjects = await Promise.all(
            data.map(async (project) => {
              // Get author info
              const { data: profileData } = await supabase
                .from("profiles")
                .select("username")
                .eq("id", project.user_id)
                .single()

              // Format date
              const date = new Date(project.updated_at)
              const now = new Date()
              const diffTime = Math.abs(now.getTime() - date.getTime())
              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

              let lastEdited
              if (diffDays === 0) {
                lastEdited = "Today"
              } else if (diffDays === 1) {
                lastEdited = "Yesterday"
              } else if (diffDays < 7) {
                lastEdited = `${diffDays} days ago`
              } else {
                lastEdited = date.toLocaleDateString()
              }

              return {
                id: project.id,
                title: project.title || "Untitled Project",
                description: project.description || "No description",
                author: profileData?.username || "Unknown",
                lastEdited,
                stars: Math.floor(Math.random() * 15), // Mock stars count
                thumbnail: "/placeholder.svg?height=200&width=300",
              }
            }),
          )

          setProjects(processedProjects)
        }
      } catch (err) {
        console.error("Error fetching featured projects:", err)
        setError(true)
        // Keep using mock data on error
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProjects()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-[#1a1a1a] border-[#333333] overflow-hidden">
            <div className="h-40 bg-[#252525] animate-pulse"></div>
            <CardHeader className="pb-2">
              <div className="h-6 w-3/4 bg-[#252525] rounded animate-pulse"></div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="h-4 bg-[#252525] rounded animate-pulse mb-2"></div>
              <div className="h-4 w-1/2 bg-[#252525] rounded animate-pulse"></div>
            </CardContent>
            <CardFooter>
              <div className="h-8 w-24 bg-[#252525] rounded animate-pulse"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card key={project.id} className="bg-[#1a1a1a] border-[#333333] overflow-hidden">
          <div className="h-40 overflow-hidden">
            <img
              src={project.thumbnail || "/placeholder.svg?height=200&width=300"}
              alt={project.title}
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">{project.title}</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm text-[#e0e0e0]/70">{project.description}</p>
            <div className="flex items-center gap-4 mt-4 text-xs text-[#e0e0e0]/60">
              <Link href={`/user/${project.author}`} className="hover:text-[#00ff88]">
                @{project.author}
              </Link>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {project.lastEdited}
              </div>
              <div className="flex items-center">
                <Star className="h-3 w-3 mr-1 fill-[#00ff88] text-[#00ff88]" />
                {project.stars}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href={`/project/${project.id}`}>
              <Button variant="outline" size="sm" className="border-[#333333] hover:bg-[#252525]">
                <Code className="h-4 w-4 mr-2" /> View Project
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

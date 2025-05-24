"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Clock, Bookmark, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import DashboardNavbar from "@/components/dashboard-navbar"
import { useToast } from "@/hooks/use-toast"
import { getBrowserClient } from "@/lib/supabase"

export default function ExplorePage() {
  const [projects, setProjects] = useState<any[]>([])
  const [featuredProjects, setFeaturedProjects] = useState<any[]>([])
  const [savedProjectIds, setSavedProjectIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [user, setUser] = useState<any>(null)
  const { toast } = useToast()
  const supabase = getBrowserClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user || null)

      // Fetch public projects
      fetchPublicProjects()

      // Fetch featured projects
      fetchFeaturedProjects()

      // If user is logged in, fetch their saved project IDs
      if (session?.user) {
        fetchSavedProjectIds(session.user.id)
      }
    }

    checkUser()
  }, [supabase])

  const fetchPublicProjects = async () => {
    try {
      setLoading(true)
      // First, get all public projects
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false })

      if (projectsError) throw projectsError

      // Then, for each project, get the author's profile
      const projectsWithProfiles = await Promise.all(
        (projectsData || []).map(async (project) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", project.user_id)
            .single()

          return {
            ...project,
            author: profileData?.username || "Unknown",
            avatar_url: profileData?.avatar_url || null,
          }
        }),
      )

      setProjects(projectsWithProfiles)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load projects",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchFeaturedProjects = async () => {
    try {
      // In a real app, you might have a different criteria for featured projects
      // For now, we'll just get the most recent 6 public projects
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(6)

      if (projectsError) throw projectsError

      // Then, for each project, get the author's profile
      const projectsWithProfiles = await Promise.all(
        (projectsData || []).map(async (project) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", project.user_id)
            .single()

          return {
            ...project,
            author: profileData?.username || "Unknown",
            avatar_url: profileData?.avatar_url || null,
          }
        }),
      )

      setFeaturedProjects(projectsWithProfiles)
    } catch (error: any) {
      console.error("Error fetching featured projects:", error)
      // Still set featured projects to empty array to avoid breaking the UI
      setFeaturedProjects([])
    }
  }

  const fetchSavedProjectIds = async (userId: string) => {
    try {
      // Check if the saved_projects table exists by trying to select from it
      const { data, error } = await supabase.from("saved_projects").select("project_id").eq("user_id", userId).limit(1)

      // If there's an error about the table not existing, handle it gracefully
      if (error && error.message.includes("relation") && error.message.includes("does not exist")) {
        console.log("saved_projects table does not exist yet")
        setSavedProjectIds([])
        return
      }

      if (error) throw error

      // If we get here, the table exists and we can fetch all saved project IDs
      const { data: allSavedData, error: allSavedError } = await supabase
        .from("saved_projects")
        .select("project_id")
        .eq("user_id", userId)

      if (allSavedError) throw allSavedError

      setSavedProjectIds((allSavedData || []).map((item) => item.project_id))
    } catch (error: any) {
      console.error("Error fetching saved project IDs:", error)
      // If there's an error, just set an empty array
      setSavedProjectIds([])
    }
  }

  const toggleSaveProject = async (projectId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save projects to your collection",
        variant: "destructive",
      })
      return
    }

    try {
      const isSaved = savedProjectIds.includes(projectId)

      if (isSaved) {
        // Remove from saved projects
        const { error } = await supabase
          .from("saved_projects")
          .delete()
          .eq("user_id", user.id)
          .eq("project_id", projectId)

        if (error) {
          // If the table doesn't exist, we can't remove anything
          if (error.message && error.message.includes("does not exist")) {
            setSavedProjectIds([])
            return
          }
          throw error
        }

        setSavedProjectIds(savedProjectIds.filter((id) => id !== projectId))

        toast({
          title: "Removed from collection",
          description: "The pen has been removed from your collection",
        })
      } else {
        // Try to create the table first if it doesn't exist
        try {
          await supabase.rpc("create_saved_projects_table")
        } catch (error) {
          console.log("Error or table already exists:", error)
        }

        // Now try to insert
        const { error } = await supabase.from("saved_projects").insert({
          user_id: user.id,
          project_id: projectId,
        })

        if (error) throw error

        setSavedProjectIds([...savedProjectIds, projectId])

        toast({
          title: "Added to collection",
          description: "The pen has been added to your collection",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update collection",
        variant: "destructive",
      })
    }
  }

  // Filter projects based on search query
  const filteredProjects = searchQuery
    ? projects.filter(
        (project) =>
          project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : projects

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
          <h1 className="text-3xl font-bold">Explore Pens</h1>
          <div className="relative w-64">
            <Input
              placeholder="Search pens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#1a1a1a] border-[#333333] pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#e0e0e0]/50" />
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-[#1a1a1a] border border-[#333333]">
            <TabsTrigger value="all" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">
              All Pens
            </TabsTrigger>
            <TabsTrigger value="featured" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">
              Featured
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {loading ? (
              <div className="text-center py-12">Loading pens...</div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#e0e0e0]/70 mb-4">No pens found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={{
                      id: project.id,
                      title: project.title,
                      description: project.description,
                      lastEdited: formatDate(project.updated_at),
                      author: project.author || "Unknown",
                      thumbnail: "/placeholder.svg?height=200&width=300",
                    }}
                    isSaved={savedProjectIds.includes(project.id)}
                    onToggleSave={() => toggleSaveProject(project.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="featured" className="mt-6">
            {loading ? (
              <div className="text-center py-12">Loading featured pens...</div>
            ) : featuredProjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#e0e0e0]/70 mb-4">No featured pens available.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={{
                      id: project.id,
                      title: project.title,
                      description: project.description,
                      lastEdited: formatDate(project.updated_at),
                      author: project.author || "Unknown",
                      thumbnail: "/placeholder.svg?height=200&width=300",
                    }}
                    isSaved={savedProjectIds.includes(project.id)}
                    onToggleSave={() => toggleSaveProject(project.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

interface ProjectCardProps {
  project: {
    id: string
    title: string
    description: string
    lastEdited: string
    author: string
    thumbnail: string
  }
  isSaved: boolean
  onToggleSave: () => void
}

function ProjectCard({ project, isSaved, onToggleSave }: ProjectCardProps) {
  return (
    <Card className="bg-[#1a1a1a] border-[#333333] overflow-hidden">
      <div className="h-40 overflow-hidden">
        <img
          src={project.thumbnail || "/placeholder.svg"}
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
          <div>by {project.author}</div>
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {project.lastEdited}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link href={`/editor?project=${project.id}`}>
          <Button variant="outline" size="sm" className="border-[#333333] hover:bg-[#252525]">
            <Code className="h-4 w-4 mr-2" /> View
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className={`${isSaved ? "text-[#00ff88]" : "text-[#e0e0e0]/70"} hover:bg-[#252525]`}
          onClick={onToggleSave}
        >
          <Bookmark className={`h-4 w-4 ${isSaved ? "fill-[#00ff88]" : ""}`} />
        </Button>
      </CardFooter>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Code, Clock, Settings, Trash2, Bookmark, Camera, Loader2, AlertTriangle } from "lucide-react"
import DashboardNavbar from "@/components/dashboard-navbar"
import { useToast } from "@/hooks/use-toast"
import { getBrowserClient } from "@/lib/supabase"
import UserProfileCard from "@/components/user-profile-card"
import DatabaseInitializer from "@/components/db-initializer"

export default function Dashboard() {
  const [projects, setProjects] = useState<any[]>([])
  const [savedProjects, setSavedProjects] = useState<any[]>([])
  const [savedPosts, setSavedPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("my-pens")
  const [missingTables, setMissingTables] = useState<string[]>([])
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getBrowserClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/auth/login")
        return
      }

      setUser(session.user)

      // Check which tables exist
      const missing: string[] = []

      // Check profiles table
      const { error: profilesError } = await supabase.from("profiles").select("count").limit(1)
      if (profilesError && profilesError.message.includes("does not exist")) {
        missing.push("profiles")
        // Create a mock profile
        setUserProfile({
          id: session.user.id,
          username: session.user.email?.split("@")[0] || "user",
          bio: "Profile table doesn't exist yet",
          avatar_url: null,
        })
      } else {
        // Fetch user profile
        try {
          const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
          setUserProfile(
            profile || {
              id: session.user.id,
              username: session.user.email?.split("@")[0] || "user",
              bio: "",
              avatar_url: null,
            },
          )
        } catch (error) {
          console.error("Error fetching profile:", error)
          setUserProfile({
            id: session.user.id,
            username: session.user.email?.split("@")[0] || "user",
            bio: "",
            avatar_url: null,
          })
        }
      }

      // Check projects table
      const { error: projectsError } = await supabase.from("projects").select("count").limit(1)
      if (projectsError && projectsError.message.includes("does not exist")) {
        missing.push("projects")
      } else {
        // Fetch user's projects
        try {
          const { data } = await supabase
            .from("projects")
            .select("*")
            .eq("user_id", session.user.id)
            .order("updated_at", { ascending: false })

          setProjects(data || [])
        } catch (error) {
          console.error("Error fetching projects:", error)
          setProjects([])
        }
      }

      // Check saved_projects table
      const { error: savedProjectsError } = await supabase.from("saved_projects").select("count").limit(1)
      if (savedProjectsError && savedProjectsError.message.includes("does not exist")) {
        missing.push("saved_projects")
        setSavedProjects([])
      } else {
        // Fetch saved projects
        try {
          // First get the saved project IDs
          const { data: savedData, error: savedError } = await supabase
            .from("saved_projects")
            .select("project_id")
            .eq("user_id", session.user.id)

          if (savedError) {
            console.error("Error fetching saved project IDs:", savedError)
            setSavedProjects([])
          } else if (!savedData || savedData.length === 0) {
            setSavedProjects([])
          } else {
            // Then fetch the actual projects
            const projectIds = savedData.map((item) => item.project_id)

            const { data: projectsData, error: projectsError } = await supabase
              .from("projects")
              .select("*")
              .in("id", projectIds)
              .order("updated_at", { ascending: false })

            if (projectsError) {
              console.error("Error fetching saved projects:", projectsError)
              setSavedProjects([])
            } else {
              // For each project, get the author's profile if profiles table exists
              if (!missing.includes("profiles")) {
                const projectsWithProfiles = await Promise.all(
                  (projectsData || []).map(async (project) => {
                    try {
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
                    } catch (error) {
                      return {
                        ...project,
                        author: "Unknown",
                        avatar_url: null,
                      }
                    }
                  }),
                )
                setSavedProjects(projectsWithProfiles)
              } else {
                setSavedProjects(projectsData || [])
              }
            }
          }
        } catch (error) {
          console.error("Error fetching saved projects:", error)
          setSavedProjects([])
        }
      }

      // Check posts table
      const { error: postsError } = await supabase.from("posts").select("count").limit(1)
      if (postsError && postsError.message.includes("does not exist")) {
        missing.push("posts")
        setSavedPosts([])
      } else {
        // Fetch posts
        try {
          const { data } = await supabase
            .from("posts")
            .select("*")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false })

          setSavedPosts(data || [])
        } catch (error) {
          console.error("Error fetching posts:", error)
          setSavedPosts([])
        }
      }

      setMissingTables(missing)
      setLoading(false)
    }

    checkUser()
  }, [router, supabase])

  const deleteProject = async (id: string) => {
    try {
      // Check if projects table exists
      const { error: checkError } = await supabase.from("projects").select("count").limit(1)
      if (checkError && checkError.message.includes("does not exist")) {
        toast({
          title: "Error",
          description: "Projects table doesn't exist",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase.from("projects").delete().eq("id", id)

      if (error) throw error

      setProjects(projects.filter((project) => project.id !== id))

      toast({
        title: "Pen deleted",
        description: "Your pen has been deleted successfully",
      })
    } catch (error: any) {
      console.error("Delete error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete pen",
        variant: "destructive",
      })
    }
  }

  const removeSavedProject = async (projectId: string) => {
    try {
      // Check if saved_projects table exists
      const { error: checkError } = await supabase.from("saved_projects").select("count").limit(1)
      if (checkError && checkError.message.includes("does not exist")) {
        toast({
          title: "Error",
          description: "Saved projects table doesn't exist",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase
        .from("saved_projects")
        .delete()
        .eq("user_id", user.id)
        .eq("project_id", projectId)

      if (error) throw error

      setSavedProjects(savedProjects.filter((project) => project.id !== projectId))

      toast({
        title: "Removed from collection",
        description: "The pen has been removed from your collection",
      })
    } catch (error: any) {
      console.error("Remove saved project error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to remove pen from collection",
        variant: "destructive",
      })
    }
  }

  const removeSavedPost = async (postId: string) => {
    try {
      // Check if saved_posts table exists
      const { error: checkError } = await supabase.from("saved_posts").select("count").limit(1)
      if (checkError && checkError.message.includes("does not exist")) {
        toast({
          title: "Error",
          description: "Saved posts table doesn't exist",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase.from("saved_posts").delete().eq("user_id", user.id).eq("post_id", postId)

      if (error) throw error

      setSavedPosts(savedPosts.filter((post) => post.id !== postId))

      toast({
        title: "Removed from collection",
        description: "The post has been removed from your collection",
      })
    } catch (error: any) {
      console.error("Remove saved post error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to remove post from collection",
        variant: "destructive",
      })
    }
  }

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

  // Open a project in the editor
  const openProject = (project: any) => {
    // Save the project data to localStorage
    localStorage.setItem("code-nano-html", project.html || "")
    localStorage.setItem("code-nano-css", project.css || "")
    localStorage.setItem("code-nano-js", project.js || "")

    // Navigate to the editor with the project ID
    router.push(`/editor?project=${project.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00ff88]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0]">
      <DashboardNavbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {userProfile && <UserProfileCard profile={userProfile} />}

        {missingTables.length > 0 && (
          <div className="mb-6">
            <DatabaseInitializer />
          </div>
        )}

        {missingTables.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-md">
            <h3 className="text-yellow-500 font-medium flex items-center gap-2">
              <AlertTriangle size={16} /> Missing Database Tables
            </h3>
            <p className="mt-2 text-[#e0e0e0]/80">
              The following tables are missing from your database: <strong>{missingTables.join(", ")}</strong>
            </p>
            <p className="mt-1 text-[#e0e0e0]/80">
              Some features may be limited until these tables are created. Please create these tables in your Supabase
              dashboard.
            </p>
          </div>
        )}

        <div className="flex justify-between items-center mt-8 mb-6">
          <h2 className="text-2xl font-bold">Your Content</h2>
          <Link href="/editor">
            <Button className="bg-[#00ff88] text-black hover:bg-[#00cc77]">
              <Plus className="mr-2 h-4 w-4" /> Create New Pen
            </Button>
          </Link>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-[#1a1a1a] border border-[#333333]">
            <TabsTrigger value="my-pens" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">
              My Pens
            </TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">
              Saved Collection
            </TabsTrigger>
            <TabsTrigger value="posts" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">
              Posts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-pens" className="mt-6">
            {missingTables.includes("projects") ? (
              <div className="text-center py-12">
                <p className="text-[#e0e0e0]/70 mb-4">Projects table doesn't exist yet.</p>
                <Link href="/editor">
                  <Button className="bg-[#00ff88] text-black hover:bg-[#00cc77]">Create Your First Pen</Button>
                </Link>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#e0e0e0]/70 mb-4">You don't have any pens yet.</p>
                <Link href="/editor">
                  <Button className="bg-[#00ff88] text-black hover:bg-[#00cc77]">Create Your First Pen</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={{
                      id: project.id,
                      title: project.title,
                      description: project.description,
                      lastEdited: formatDate(project.updated_at),
                      isPublic: project.is_public,
                      thumbnail: "/placeholder.svg?height=200&width=300", // Placeholder for now
                    }}
                    onDelete={() => deleteProject(project.id)}
                    onOpen={() => openProject(project)}
                    isOwner={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            {missingTables.includes("saved_projects") ? (
              <div className="text-center py-12">
                <p className="text-[#e0e0e0]/70 mb-4">Saved projects table doesn't exist yet.</p>
                <Link href="/explore">
                  <Button className="bg-[#00ff88] text-black hover:bg-[#00cc77]">Explore Pens</Button>
                </Link>
              </div>
            ) : savedProjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#e0e0e0]/70 mb-4">You haven't saved any pens yet.</p>
                <Link href="/explore">
                  <Button className="bg-[#00ff88] text-black hover:bg-[#00cc77]">Explore Pens</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={{
                      id: project.id,
                      title: project.title,
                      description: project.description,
                      lastEdited: formatDate(project.updated_at),
                      isPublic: project.is_public,
                      thumbnail: "/placeholder.svg?height=200&width=300",
                    }}
                    onDelete={() => removeSavedProject(project.id)}
                    onOpen={() => openProject(project)}
                    isOwner={false}
                    isSaved={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="posts" className="mt-6">
            {missingTables.includes("posts") ? (
              <div className="text-center py-12">
                <p className="text-[#e0e0e0]/70 mb-4">Posts table doesn't exist yet.</p>
                <Link href="/convert-to-post">
                  <Button className="bg-[#00ff88] text-black hover:bg-[#00cc77]">
                    <Camera className="mr-2 h-4 w-4" /> Create a Post
                  </Button>
                </Link>
              </div>
            ) : savedPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#e0e0e0]/70 mb-4">You haven't saved any posts yet.</p>
                <Link href="/convert-to-post">
                  <Button className="bg-[#00ff88] text-black hover:bg-[#00cc77]">
                    <Camera className="mr-2 h-4 w-4" /> Create a Post
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={{
                      id: post.id,
                      title: post.title,
                      description: post.description,
                      lastEdited: formatDate(post.updated_at || post.created_at),
                      imageUrl: post.image_url,
                      thumbnail: post.thumbnail_url || "/placeholder.svg?height=200&width=300",
                    }}
                    onDelete={() => removeSavedPost(post.id)}
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
    isPublic: boolean
    thumbnail: string
  }
  onDelete: () => void
  onOpen: () => void
  isOwner: boolean
  isSaved?: boolean
}

function ProjectCard({ project, onDelete, onOpen, isOwner, isSaved = false }: ProjectCardProps) {
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
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {project.lastEdited}
          </div>
          {project.isPublic && (
            <div className="px-2 py-0.5 bg-[#00ff88]/10 text-[#00ff88] rounded-full text-xs">Public</div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" className="border-[#333333] hover:bg-[#252525]" onClick={onOpen}>
          <Code className="h-4 w-4 mr-2" /> {isOwner ? "Edit" : "View"}
        </Button>
        <div className="flex gap-2">
          {isOwner ? (
            <>
              <Button variant="ghost" size="sm" className="text-[#e0e0e0]/70 hover:bg-[#252525]">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-500/10" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className={`${isSaved ? "text-[#00ff88]" : "text-[#e0e0e0]/70"} hover:bg-[#252525]`}
              onClick={onDelete}
            >
              {isSaved ? <Bookmark className="h-4 w-4 fill-[#00ff88]" /> : <Bookmark className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

interface PostCardProps {
  post: {
    id: string
    title: string
    description: string
    lastEdited: string
    imageUrl: string
    thumbnail: string
  }
  onDelete: () => void
}

function PostCard({ post, onDelete }: PostCardProps) {
  return (
    <Card className="bg-[#1a1a1a] border-[#333333] overflow-hidden">
      <div className="h-40 overflow-hidden">
        <img
          src={post.thumbnail || "/placeholder.svg"}
          alt={post.title}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{post.title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-[#e0e0e0]/70">{post.description}</p>
        <div className="flex items-center gap-4 mt-4 text-xs text-[#e0e0e0]/60">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {post.lastEdited}
          </div>
          <div className="px-2 py-0.5 bg-[#00ff88]/10 text-[#00ff88] rounded-full text-xs">Post</div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link href={post.imageUrl} target="_blank">
          <Button variant="outline" size="sm" className="border-[#333333] hover:bg-[#252525]">
            <Camera className="h-4 w-4 mr-2" /> View Post
          </Button>
        </Link>
        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-500/10" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

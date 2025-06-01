"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Clock, Star, Github, Twitter, Globe, BadgeCheck, AlertTriangle } from "lucide-react"
import DashboardNavbar from "@/components/dashboard-navbar"
import { getBrowserClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { EnhancedLogoLoading } from "@/components/logo-loading"

export default function UserProfile({ params }: { params: { username: string } }) {
  const username = params.username
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [likedProjects, setLikedProjects] = useState<any[]>([])
  const [forkedProjects, setForkedProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCurrentUser, setIsCurrentUser] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [projectsCount, setProjectsCount] = useState(0)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getBrowserClient()

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setError(null)

        // Check if profiles table exists
        const { error: tableCheckError } = await supabase.from("profiles").select("count").limit(1)

        if (tableCheckError && tableCheckError.message.includes("does not exist")) {
          setError("The profiles table doesn't exist. Please initialize the database first.")
          // Use mock data if table doesn't exist
          setUser(mockUser)
          setProjects(mockProjects)
          setLikedProjects(mockProjects.slice(0, 2))
          setForkedProjects(mockProjects.slice(1, 2))
          setLoading(false)
          return
        }

        // Get profile by username - use eq and limit instead of single to avoid errors
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", username)
          .limit(1)

        if (profileError) {
          console.error("Error fetching profile:", profileError)
          setError("Failed to fetch user profile. Please try again later.")
          setUser(mockUser)
          setProjects(mockProjects)
          setLikedProjects(mockProjects.slice(0, 2))
          setForkedProjects(mockProjects.slice(1, 2))
          setLoading(false)
          return
        }

        // Check if we got any results
        if (!profileData || profileData.length === 0) {
          setError(`User with username "${username}" not found.`)
          setUser(mockUser)
          setProjects(mockProjects)
          setLikedProjects(mockProjects.slice(0, 2))
          setForkedProjects(mockProjects.slice(1, 2))
          setLoading(false)
          return
        }

        const userProfile = profileData[0]

        // Check if current user is viewing their own profile
        const {
          data: { session },
        } = await supabase.auth.getSession()

        const isOwn = session?.user?.id === userProfile.id
        setIsCurrentUser(isOwn)

        // Get user's projects
        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select("*")
          .eq("user_id", userProfile.id)
          .eq("is_public", true)
          .order("updated_at", { ascending: false })

        if (projectsError && !projectsError.message.includes("does not exist")) {
          console.error("Error fetching projects:", projectsError)
        }

        // Get followers count - handle case where table doesn't exist
        let followersCountValue = 0
        try {
          const { count, error: followersError } = await supabase
            .from("followers")
            .select("*", { count: "exact", head: true })
            .eq("following_id", userProfile.id)

          if (!followersError) {
            followersCountValue = count || 0
          }
        } catch (err) {
          console.log("Followers table may not exist")
        }

        // Get following count - handle case where table doesn't exist
        let followingCountValue = 0
        try {
          const { count, error: followingError } = await supabase
            .from("followers")
            .select("*", { count: "exact", head: true })
            .eq("follower_id", userProfile.id)

          if (!followingError) {
            followingCountValue = count || 0
          }
        } catch (err) {
          console.log("Followers table may not exist")
        }

        // Check if current user is following this profile
        let isFollowingValue = false
        if (session) {
          try {
            const { data: followData, error: followError } = await supabase
              .from("followers")
              .select("*")
              .eq("follower_id", session.user.id)
              .eq("following_id", userProfile.id)
              .limit(1)

            if (!followError && followData && followData.length > 0) {
              isFollowingValue = true
            }
          } catch (err) {
            console.log("Followers table may not exist")
          }
        }

        // Set state with fetched data
        setUser({
          ...userProfile,
          followers: followersCountValue,
          following: followingCountValue,
          projects: projectsData?.length || 0,
        })
        setProjects(projectsData || [])
        setFollowersCount(followersCountValue)
        setFollowingCount(followingCountValue)
        setIsFollowing(isFollowingValue)
        setProjectsCount(projectsData?.length || 0)

        // For now, use the same projects for liked and forked
        // In a real app, you would fetch these separately
        setLikedProjects(projectsData?.slice(0, Math.min(2, projectsData.length)) || [])
        setForkedProjects(projectsData?.slice(0, Math.min(1, projectsData.length)) || [])
      } catch (error: any) {
        console.error("Error in fetchUserProfile:", error)
        setError(error.message || "An unexpected error occurred")
        // Fallback to mock data
        setUser(mockUser)
        setProjects(mockProjects)
        setLikedProjects(mockProjects.slice(0, 2))
        setForkedProjects(mockProjects.slice(1, 2))
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [username, supabase])

  const initializeDatabase = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/init-db", {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to initialize database")
      }

      toast({
        title: "Database initialized",
        description: "Database tables have been created successfully",
      })

      // Reload the page to fetch the profile again
      window.location.reload()
    } catch (err: any) {
      console.error("Database initialization error:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to initialize database",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleFollow = async () => {
    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to follow users",
        variant: "destructive",
      })
      return
    }

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from("followers")
          .delete()
          .eq("follower_id", session.user.id)
          .eq("following_id", user.id)

        if (error) throw error

        setIsFollowing(false)
        setFollowersCount(followersCount - 1)

        toast({
          title: "Unfollowed",
          description: `You are no longer following ${user.username}`,
        })
      } else {
        // Follow
        const { error } = await supabase.from("followers").insert({
          follower_id: session.user.id,
          following_id: user.id,
          created_at: new Date().toISOString(),
        })

        if (error) throw error

        setIsFollowing(true)
        setFollowersCount(followersCount + 1)

        toast({
          title: "Following",
          description: `You are now following ${user.username}`,
        })
      }
    } catch (error: any) {
      console.error("Error toggling follow:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update follow status",
        variant: "destructive",
      })
    }
  }

  const openProject = (project: any) => {
    // Save the project data to localStorage
    localStorage.setItem("code-nano-html", project.html || "")
    localStorage.setItem("code-nano-css", project.css || "")
    localStorage.setItem("code-nano-js", project.js || "")
    localStorage.setItem("code-nano-title", project.title || "Untitled Project")

    // Navigate to the editor with the project ID
    router.push(`/editor?project=${project.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] flex items-center justify-center">
        <EnhancedLogoLoading size="xl" text="Loading profile..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0]">
      <DashboardNavbar />

      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Alert variant="destructive" className="bg-red-900/20 border-red-900">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            {error.includes("table doesn't exist") && (
              <Button
                onClick={initializeDatabase}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <EnhancedLogoLoading size="sm" className="mr-2" /> Initializing...
                  </>
                ) : (
                  "Initialize Database"
                )}
              </Button>
            )}
          </Alert>
        </div>
      )}

      {/* Banner */}
      <div className="h-48 md:h-64 w-full relative">
        <img
          src={user.banner_url || "/placeholder.svg?height=300&width=1200"}
          alt="Profile banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
      </div>

      {/* Profile Info */}
      <div className="max-w-7xl mx-auto px-4 relative">
        <div className="flex flex-col md:flex-row gap-6 -mt-16 md:-mt-20">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#0a0a0a] overflow-hidden z-10 bg-[#1a1a1a] flex items-center justify-center">
            {user.avatar_url ? (
              <img
                src={user.avatar_url || "/placeholder.svg"}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-5xl font-bold text-[#00ff88]">{user.username.charAt(0).toUpperCase()}</span>
            )}
          </div>

          <div className="flex-1 pt-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{user.name || user.username}</h1>
                {user.is_verified && <BadgeCheck className="h-6 w-6 text-blue-500" />}
              </div>
              <div className="flex items-center">
                <p className="text-[#00ff88]">@{user.username}</p>
              </div>

              <div className="mt-4 md:mt-0 flex gap-3">
                {!isCurrentUser && (
                  <>
                    <Button variant="outline" className="border-[#333333] hover:bg-[#252525]" onClick={toggleFollow}>
                      {isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                    <Button className="bg-[#00ff88] text-black hover:bg-[#00cc77]">Message</Button>
                  </>
                )}
                {isCurrentUser && (
                  <Button
                    variant="outline"
                    className="border-[#333333] hover:bg-[#252525]"
                    onClick={() => router.push("/settings")}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>

            <p className="mt-4 text-[#e0e0e0]/80 max-w-2xl">{user.bio}</p>

            <div className="mt-4 flex flex-wrap gap-6">
              <div className="flex items-center gap-1">
                <span className="font-bold">{followersCount}</span>
                <span className="text-[#e0e0e0]/60">Followers</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold">{followingCount}</span>
                <span className="text-[#e0e0e0]/60">Following</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold">{projectsCount}</span>
                <span className="text-[#e0e0e0]/60">Projects</span>
              </div>
            </div>

            <div className="mt-4 flex gap-4">
              {user.github_url && (
                <a
                  href={user.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#e0e0e0]/60 hover:text-[#00ff88]"
                >
                  <Github className="h-5 w-5" />
                </a>
              )}
              {user.twitter_url && (
                <a
                  href={user.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#e0e0e0]/60 hover:text-[#00ff88]"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {user.website_url && (
                <a
                  href={user.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#e0e0e0]/60 hover:text-[#00ff88]"
                >
                  <Globe className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="mt-12">
          <Tabs defaultValue="projects" className="w-full">
            <TabsList className="bg-[#1a1a1a] border border-[#333333]">
              <TabsTrigger value="projects" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">
                Projects
              </TabsTrigger>
              <TabsTrigger value="liked" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">
                Liked
              </TabsTrigger>
              <TabsTrigger value="forked" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">
                Forked
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="mt-6">
              {projects.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#e0e0e0]/70 mb-4">No projects yet.</p>
                  {isCurrentUser && (
                    <Link href="/editor">
                      <Button className="bg-[#00ff88] text-black hover:bg-[#00cc77]">Create Your First Project</Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={{
                        id: project.id,
                        title: project.title || "Untitled Project",
                        description: project.description || "No description",
                        lastEdited: formatDate(project.updated_at),
                        stars: project.stars || 0,
                        thumbnail: project.thumbnail_url || "/placeholder.svg?height=200&width=300",
                      }}
                      onOpen={() => openProject(project)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="liked" className="mt-6">
              {likedProjects.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#e0e0e0]/70 mb-4">No liked projects yet.</p>
                  <Link href="/explore">
                    <Button className="bg-[#00ff88] text-black hover:bg-[#00cc77]">Explore Projects</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {likedProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={{
                        id: project.id,
                        title: project.title || "Untitled Project",
                        description: project.description || "No description",
                        lastEdited: formatDate(project.updated_at),
                        stars: project.stars || 0,
                        thumbnail: project.thumbnail_url || "/placeholder.svg?height=200&width=300",
                      }}
                      onOpen={() => openProject(project)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="forked" className="mt-6">
              {forkedProjects.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#e0e0e0]/70 mb-4">No forked projects yet.</p>
                  <Link href="/explore">
                    <Button className="bg-[#00ff88] text-black hover:bg-[#00cc77]">Explore Projects</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {forkedProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={{
                        id: project.id,
                        title: project.title || "Untitled Project",
                        description: project.description || "No description",
                        lastEdited: formatDate(project.updated_at),
                        stars: project.stars || 0,
                        thumbnail: project.thumbnail_url || "/placeholder.svg?height=200&width=300",
                      }}
                      onOpen={() => openProject(project)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
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

interface ProjectCardProps {
  project: {
    id: string
    title: string
    description: string
    lastEdited: string
    stars: number
    thumbnail: string
  }
  onOpen: () => void
}

function ProjectCard({ project, onOpen }: ProjectCardProps) {
  return (
    <Card className="bg-[#1a1a1a] border-[#333333] overflow-hidden">
      <div className="h-40 overflow-hidden cursor-pointer" onClick={onOpen}>
        <img
          src={project.thumbnail || "/placeholder.svg"}
          alt={project.title}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl cursor-pointer hover:text-[#00ff88]" onClick={onOpen}>
          {project.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-[#e0e0e0]/70">{project.description}</p>
        <div className="flex items-center gap-4 mt-4 text-xs text-[#e0e0e0]/60">
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
        <Button variant="outline" size="sm" className="border-[#333333] hover:bg-[#252525]" onClick={onOpen}>
          <Code className="h-4 w-4 mr-2" /> View Project
        </Button>
      </CardFooter>
    </Card>
  )
}

// Mock data for user profile (used as fallback)
const mockUser = {
  username: "quantum_coder",
  name: "Alex Quantum",
  bio: "Frontend developer passionate about creating beautiful interfaces. I love experimenting with new web technologies and sharing my projects.",
  avatar_url: "/placeholder.svg?height=200&width=200",
  banner_url: "/placeholder.svg?height=300&width=1200",
  followers: 128,
  following: 75,
  projects: 24,
  github_url: "https://github.com/quantum_coder",
  twitter_url: "https://twitter.com/quantum_coder",
  website_url: "https://alexquantum.dev",
}

// Mock data for projects (used as fallback)
const mockProjects = [
  {
    id: "1",
    title: "Animated Landing Page",
    description: "A responsive landing page with CSS animations",
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    stars: 12,
    thumbnail_url: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "2",
    title: "Interactive Form",
    description: "Form with validation and interactive elements",
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    stars: 8,
    thumbnail_url: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "3",
    title: "CSS Grid Layout",
    description: "Complex layout using CSS Grid",
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    stars: 5,
    thumbnail_url: "/placeholder.svg?height=200&width=300",
  },
]

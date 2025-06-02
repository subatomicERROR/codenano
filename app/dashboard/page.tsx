"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getBrowserClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnhancedLogoLoading } from "@/components/logo-loading"
import { Logo } from "@/components/logo"
import {
  Plus,
  Code,
  Eye,
  Trash2,
  Calendar,
  LogOut,
  Globe,
  Lock,
  Compass,
  Settings,
  Star,
  GitFork,
  Activity,
  TrendingUp,
  Github,
  Twitter,
  ExternalLink,
  Edit3,
  BarChart3,
} from "lucide-react"
import Link from "next/link"

interface Project {
  id: string
  title: string
  description: string
  html: string
  css: string
  js: string
  is_public: boolean
  created_at: string
  updated_at: string
  thumbnail?: string
  views?: number
  stars?: number
  forks?: number
}

interface UserStats {
  totalProjects: number
  publicProjects: number
  totalViews: number
  totalStars: number
  totalForks: number
  joinedDate: string
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [starredProjects, setStarredProjects] = useState<Project[]>([])
  const [forkedProjects, setForkedProjects] = useState<Project[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const supabase = getBrowserClient()

  // Check for email verification success
  useEffect(() => {
    const verified = searchParams.get("verified")
    if (verified === "true") {
      toast({
        title: "🎉 Email verified successfully!",
        description: "Welcome to CodeNANO! You can now save and share your projects.",
        duration: 5000,
      })
    }
  }, [searchParams, toast])

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/auth/login")
          return
        }

        setUser(session.user)
        await loadUserData()
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/auth/login")
      } else {
        setUser(session.user)
      }
    })

    return () => authListener.subscription.unsubscribe()
  }, [supabase, router])

  const loadUserData = async () => {
    try {
      // Load projects with error handling
      const response = await fetch("/api/projects", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProjects(Array.isArray(data) ? data : [])

        // Calculate user stats
        const projectsArray = Array.isArray(data) ? data : []
        const stats: UserStats = {
          totalProjects: projectsArray.length,
          publicProjects: projectsArray.filter((p: Project) => p.is_public).length,
          totalViews: projectsArray.reduce((sum: number, p: Project) => sum + (p.views || 0), 0),
          totalStars: projectsArray.reduce((sum: number, p: Project) => sum + (p.stars || 0), 0),
          totalForks: projectsArray.reduce((sum: number, p: Project) => sum + (p.forks || 0), 0),
          joinedDate: new Date().toISOString(),
        }
        setUserStats(stats)

        // Mock starred and forked projects
        setStarredProjects(projectsArray.slice(0, 3))
        setForkedProjects(projectsArray.slice(0, 2))
      } else {
        console.error("Failed to load projects:", response.status)
        setProjects([])
        setUserStats({
          totalProjects: 0,
          publicProjects: 0,
          totalViews: 0,
          totalStars: 0,
          totalForks: 0,
          joinedDate: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      setProjects([])
      setUserStats({
        totalProjects: 0,
        publicProjects: 0,
        totalViews: 0,
        totalStars: 0,
        totalForks: 0,
        joinedDate: new Date().toISOString(),
      })
      toast({
        title: "Welcome to CodeNANO!",
        description: "Start by creating your first project",
      })
    }
  }

  const deleteProject = async (projectId: string) => {
    setDeleting(projectId)
    try {
      const response = await fetch(`/api/projects?id=${projectId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setProjects(projects.filter((p) => p.id !== projectId))
        toast({
          title: "Project deleted",
          description: "Your project has been permanently deleted",
        })
      } else {
        throw new Error("Failed to delete project")
      }
    } catch (error) {
      console.error("Error deleting project:", error)
      toast({
        title: "Error deleting project",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <EnhancedLogoLoading size="xl" text="Loading Dashboard" />
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0]">
      {/* Header */}
      <header className="border-b border-[#333333] bg-[#1a1a1a] sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Logo size="md" />
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/explore">
              <Button variant="outline" size="sm" className="border-[#333333] hover:bg-[#252525] text-[#e0e0e0]">
                <Compass className="mr-2 h-4 w-4" />
                Explore
              </Button>
            </Link>

            <Link href="/editor">
              <Button size="sm" className="bg-[#00ff88] text-black hover:bg-[#00cc77]">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-gray-400 hover:text-white hover:bg-[#333333]/50"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Profile Header */}
      <div className="relative">
        {/* Banner */}
        <div className="h-48 md:h-64 w-full relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/10 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
        </div>

        {/* Profile Info */}
        <div className="container mx-auto px-6 relative">
          <div className="flex flex-col md:flex-row gap-6 -mt-16 md:-mt-20">
            {/* Avatar */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#0a0a0a] overflow-hidden z-10 bg-[#00ff88] flex items-center justify-center">
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url || "/placeholder.svg"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-5xl font-bold text-black">
                  {(user?.user_metadata?.full_name || user?.email || "U").charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 pt-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Developer"}
                  </h1>
                  <p className="text-[#00ff88] text-lg mb-4">@{user?.email?.split("@")[0] || "user"}</p>
                  <p className="text-[#e0e0e0]/80 max-w-2xl mb-4">
                    {user?.user_metadata?.bio ||
                      "Building amazing projects with CodeNANO. Passionate about web development and creating innovative solutions."}
                  </p>

                  {/* Social Links */}
                  <div className="flex gap-4 mb-4">
                    {user?.user_metadata?.github_url && (
                      <a
                        href={user.user_metadata.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#e0e0e0]/60 hover:text-[#00ff88] transition-colors"
                      >
                        <Github className="h-5 w-5" />
                      </a>
                    )}
                    {user?.user_metadata?.twitter_url && (
                      <a
                        href={user.user_metadata.twitter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#e0e0e0]/60 hover:text-[#00ff88] transition-colors"
                      >
                        <Twitter className="h-5 w-5" />
                      </a>
                    )}
                    {user?.user_metadata?.website_url && (
                      <a
                        href={user.user_metadata.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#e0e0e0]/60 hover:text-[#00ff88] transition-colors"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link href="/settings">
                    <Button variant="outline" className="border-[#333333] hover:bg-[#252525] text-[#e0e0e0]">
                      <Edit3 className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Stats */}
              {userStats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{userStats.totalProjects}</div>
                    <div className="text-sm text-[#e0e0e0]/60">Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{userStats.totalViews}</div>
                    <div className="text-sm text-[#e0e0e0]/60">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{userStats.totalStars}</div>
                    <div className="text-sm text-[#e0e0e0]/60">Stars</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{userStats.totalForks}</div>
                    <div className="text-sm text-[#e0e0e0]/60">Forks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{userStats.publicProjects}</div>
                    <div className="text-sm text-[#e0e0e0]/60">Public</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-[#1a1a1a] border border-[#333333] mb-8">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">
              <Activity className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">
              <Code className="mr-2 h-4 w-4" />
              Projects ({projects.length})
            </TabsTrigger>
            <TabsTrigger value="starred" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">
              <Star className="mr-2 h-4 w-4" />
              Starred
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/editor">
                <Card className="bg-[#1a1a1a] border-[#333333] hover:border-[#00ff88]/50 transition-all duration-300 cursor-pointer group">
                  <CardContent className="flex flex-col items-center justify-center p-8 h-48">
                    <div className="w-16 h-16 rounded-full bg-[#00ff88] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Plus className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Create New Project</h3>
                    <p className="text-gray-400 text-center text-sm">Start building your next amazing project</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/explore">
                <Card className="bg-[#1a1a1a] border-[#333333] hover:border-[#00ff88]/50 transition-all duration-300 cursor-pointer group">
                  <CardContent className="flex flex-col items-center justify-center p-8 h-48">
                    <div className="w-16 h-16 rounded-full bg-[#00ff88] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Compass className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Explore Projects</h3>
                    <p className="text-gray-400 text-center text-sm">Discover amazing projects from the community</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/settings">
                <Card className="bg-[#1a1a1a] border-[#333333] hover:border-[#00ff88]/50 transition-all duration-300 cursor-pointer group">
                  <CardContent className="flex flex-col items-center justify-center p-8 h-48">
                    <div className="w-16 h-16 rounded-full bg-[#00ff88] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Settings className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Account Settings</h3>
                    <p className="text-gray-400 text-center text-sm">Manage your profile and preferences</p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Recent Projects */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Recent Projects</h2>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#333333] hover:bg-[#252525] text-[#e0e0e0]"
                  onClick={() => setActiveTab("projects")}
                >
                  View All
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.slice(0, 6).map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onDelete={() => deleteProject(project.id)}
                    isDeleting={deleting === project.id}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">All Projects</h2>
              <Link href="/editor">
                <Button className="bg-[#00ff88] text-black hover:bg-[#00cc77]">
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </Link>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#00ff88] flex items-center justify-center">
                  <Code className="w-12 h-12 text-black" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
                <p className="text-gray-400 mb-6">Create your first project and start building something amazing!</p>
                <Link href="/editor">
                  <Button className="bg-[#00ff88] text-black hover:bg-[#00cc77]">
                    <Plus className="mr-2 h-5 w-5" />
                    Create Your First Project
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onDelete={() => deleteProject(project.id)}
                    isDeleting={deleting === project.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Starred Tab */}
          <TabsContent value="starred" className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Starred Projects</h2>

            {starredProjects.length === 0 ? (
              <div className="text-center py-12">
                <Star className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <h3 className="text-xl font-semibold text-white mb-2">No starred projects yet</h3>
                <p className="text-gray-400 mb-6">Star projects you find interesting to keep track of them</p>
                <Link href="/explore">
                  <Button className="bg-[#00ff88] text-black hover:bg-[#00cc77]">
                    <Compass className="mr-2 h-4 w-4" />
                    Explore Projects
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {starredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onDelete={() => deleteProject(project.id)}
                    isDeleting={deleting === project.id}
                    showOwner
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Analytics Overview</h2>

            {userStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-[#1a1a1a] border-[#333333]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-[#e0e0e0]/70">Total Views</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{userStats.totalViews}</div>
                    <div className="flex items-center text-xs text-[#00ff88]">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +12% from last month
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1a1a1a] border-[#333333]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-[#e0e0e0]/70">Total Stars</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{userStats.totalStars}</div>
                    <div className="flex items-center text-xs text-[#00ff88]">
                      <Star className="w-3 h-3 mr-1" />
                      +8% from last month
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1a1a1a] border-[#333333]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-[#e0e0e0]/70">Total Forks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{userStats.totalForks}</div>
                    <div className="flex items-center text-xs text-[#00ff88]">
                      <GitFork className="w-3 h-3 mr-1" />
                      +5% from last month
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1a1a1a] border-[#333333]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-[#e0e0e0]/70">Public Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{userStats.publicProjects}</div>
                    <div className="text-xs text-[#e0e0e0]/60">of {userStats.totalProjects} total</div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Card className="bg-[#1a1a1a] border-[#333333]">
              <CardHeader>
                <CardTitle className="text-white">Project Performance</CardTitle>
                <CardDescription className="text-[#e0e0e0]/70">Your most popular projects this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.slice(0, 5).map((project, index) => (
                    <div key={project.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-[#00ff88] flex items-center justify-center text-black font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-white font-medium">{project.title}</div>
                          <div className="text-sm text-[#e0e0e0]/60">{formatDate(project.updated_at)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-[#e0e0e0]/70">
                          <Eye className="w-3 h-3" />
                          {project.views || 0}
                        </div>
                        <div className="flex items-center gap-1 text-[#e0e0e0]/70">
                          <Star className="w-3 h-3" />
                          {project.stars || 0}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#333333] bg-[#0a0a0a] py-6">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs text-[#666666]">
            Created by <span className="text-[#00ff88] font-medium">subatomicERROR</span> • CodeNANO v2.0
          </p>
        </div>
      </footer>
    </div>
  )
}

interface ProjectCardProps {
  project: Project
  onDelete: () => void
  isDeleting: boolean
  showOwner?: boolean
}

function ProjectCard({ project, onDelete, isDeleting, showOwner = false }: ProjectCardProps) {
  return (
    <Card className="bg-[#1a1a1a] border-[#333333] hover:border-[#00ff88]/30 transition-all duration-300 group overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-white text-lg mb-1 line-clamp-1 group-hover:text-[#00ff88] transition-colors">
              {project.title}
            </CardTitle>
            <CardDescription className="text-gray-400 text-sm line-clamp-2">
              {project.description || "No description provided"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 ml-2">
            {project.is_public ? (
              <Badge variant="secondary" className="bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/30">
                <Globe className="w-3 h-3 mr-1" />
                Public
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                <Lock className="w-3 h-3 mr-1" />
                Private
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Project Preview */}
        <div className="w-full h-32 bg-[#0a0a0a] rounded-lg mb-4 overflow-hidden border border-[#333333]/30 group-hover:border-[#00ff88]/30 transition-colors">
          {project.thumbnail ? (
            <img
              src={project.thumbnail || "/placeholder.svg"}
              alt={`${project.title} preview`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <Code className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Project Stats */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(project.updated_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {project.views || 0}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              {project.stars || 0}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link href={`/editor?project=${project.id}`} className="flex-1">
            <Button size="sm" className="w-full bg-[#00ff88] text-black hover:bg-[#00cc77]">
              <Code className="mr-2 h-3 w-3" />
              Edit
            </Button>
          </Link>

          <Link href={`/project/${project.id}`}>
            <Button variant="outline" size="sm" className="border-[#333333] hover:bg-[#252525] text-[#e0e0e0]">
              <Eye className="h-3 w-3" />
            </Button>
          </Link>

          {!showOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              disabled={isDeleting}
              className="border-red-500/50 hover:bg-red-500/10 text-red-400 hover:text-red-300"
            >
              {isDeleting ? <EnhancedLogoLoading size="sm" /> : <Trash2 className="h-3 w-3" />}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

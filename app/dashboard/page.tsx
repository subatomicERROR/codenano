"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getBrowserClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EnhancedLogoLoading } from "@/components/logo-loading"
import { Logo } from "@/components/logo"
import { Plus, Code, Eye, Trash2, Calendar, LogOut, Globe, Lock, Compass } from "lucide-react"
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
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
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
        await loadProjects()
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

  const loadProjects = async () => {
    try {
      const response = await fetch("/api/projects")
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      } else {
        throw new Error("Failed to load projects")
      }
    } catch (error) {
      console.error("Error loading projects:", error)
      toast({
        title: "Error loading projects",
        description: "Please try refreshing the page",
        variant: "destructive",
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
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] flex items-center justify-center">
        <EnhancedLogoLoading size="xl" text="Loading Dashboard" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a]">
      {/* Header */}
      <header className="border-b border-[#333333]/50 bg-[#1a1a1a]/80 backdrop-blur-md">
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
              <Button
                size="sm"
                className="bg-gradient-to-r from-[#00ff88] to-[#00ccff] text-black hover:from-[#00cc77] hover:to-[#0099cc]"
              >
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

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Developer"}! 👋
          </h1>
          <p className="text-gray-400">Manage your CodeNANO projects and create something amazing.</p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Project Card */}
          <Link href="/editor">
            <Card className="bg-[#1a1a1a]/80 border-[#333333]/50 hover:border-[#00ff88]/50 transition-all duration-300 cursor-pointer group h-full">
              <CardContent className="flex flex-col items-center justify-center p-8 h-48">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#00ff88] to-[#00ccff] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Plus className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Create New Project</h3>
                <p className="text-gray-400 text-center text-sm">Start building your next amazing project</p>
              </CardContent>
            </Card>
          </Link>

          {/* Project Cards */}
          {projects.map((project) => (
            <Card
              key={project.id}
              className="bg-[#1a1a1a]/80 border-[#333333]/50 hover:border-[#00ff88]/30 transition-all duration-300 group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg mb-1 line-clamp-1">{project.title}</CardTitle>
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
                <div className="w-full h-32 bg-[#0a0a0a] rounded-lg mb-4 overflow-hidden border border-[#333333]/30">
                  {project.thumbnail ? (
                    <img
                      src={project.thumbnail || "/placeholder.svg"}
                      alt={`${project.title} preview`}
                      className="w-full h-full object-cover"
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
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Link href={`/editor?project=${project.id}`} className="flex-1">
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-[#00ff88] to-[#00ccff] text-black hover:from-[#00cc77] hover:to-[#0099cc]"
                    >
                      <Code className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                  </Link>

                  <Link href={`/project/${project.id}`}>
                    <Button variant="outline" size="sm" className="border-[#333333] hover:bg-[#252525] text-[#e0e0e0]">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteProject(project.id)}
                    disabled={deleting === project.id}
                    className="border-red-500/50 hover:bg-red-500/10 text-red-400 hover:text-red-300"
                  >
                    {deleting === project.id ? <EnhancedLogoLoading size="sm" /> : <Trash2 className="h-3 w-3" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#00ff88] to-[#00ccff] flex items-center justify-center">
              <Code className="w-12 h-12 text-black" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
            <p className="text-gray-400 mb-6">Create your first project and start building something amazing!</p>
            <Link href="/editor">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#00ff88] to-[#00ccff] text-black hover:from-[#00cc77] hover:to-[#0099cc]"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Project
              </Button>
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#333333]/30 bg-[#0a0a0a] py-6">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs text-[#666666]">
            Created by <span className="text-[#00ff88] font-medium">subatomicERROR</span> • CodeNANO v2.0
          </p>
        </div>
      </footer>
    </div>
  )
}

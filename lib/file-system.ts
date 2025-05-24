import { getBrowserClient } from "@/lib/supabase"
import type { LanguageMode } from "./language-mode"

export interface FileData {
  name: string
  path: string
  content: string
  type: string
  lastModified: number
}

export interface ProjectData {
  id?: string
  title: string
  description: string
  files: FileData[]
  mode: LanguageMode
  is_public: boolean
}

// Save project to localStorage
export function saveProjectToLocalStorage(projectId: string, project: ProjectData): void {
  try {
    localStorage.setItem(`codenano-project-${projectId}`, JSON.stringify(project))

    // Update project list
    const projectList = JSON.parse(localStorage.getItem("codenano-projects") || "[]")
    if (!projectList.includes(projectId)) {
      projectList.push(projectId)
      localStorage.setItem("codenano-projects", JSON.stringify(projectList))
    }
  } catch (error) {
    console.error("Error saving project to localStorage:", error)
  }
}

// Get project from localStorage
export function getProjectFromLocalStorage(projectId: string): ProjectData | null {
  try {
    const projectData = localStorage.getItem(`codenano-project-${projectId}`)
    return projectData ? JSON.parse(projectData) : null
  } catch (error) {
    console.error("Error getting project from localStorage:", error)
    return null
  }
}

// Get all projects from localStorage
export function getAllProjectsFromLocalStorage(): ProjectData[] {
  try {
    const projectList = JSON.parse(localStorage.getItem("codenano-projects") || "[]")
    return projectList
      .map((projectId: string) => getProjectFromLocalStorage(projectId))
      .filter((project: ProjectData | null) => project !== null) as ProjectData[]
  } catch (error) {
    console.error("Error getting all projects from localStorage:", error)
    return []
  }
}

// Save project to Supabase
export async function saveProjectToSupabase(project: ProjectData): Promise<string | null> {
  const supabase = getBrowserClient()

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      throw new Error("User not authenticated")
    }

    // Convert files to JSON string
    const filesJson = JSON.stringify(project.files)

    if (project.id && !project.id.startsWith("local-")) {
      // Update existing project
      const { error } = await supabase
        .from("projects")
        .update({
          title: project.title,
          description: project.description,
          html: project.files.find((f) => f.path.endsWith(".html"))?.content || "",
          css: project.files.find((f) => f.path.endsWith(".css"))?.content || "",
          js: project.files.find((f) => f.path.endsWith(".js") || f.path.endsWith(".jsx"))?.content || "",
          files: filesJson,
          mode: project.mode,
          is_public: project.is_public,
          updated_at: new Date().toISOString(),
        })
        .eq("id", project.id)
        .eq("user_id", session.user.id)

      if (error) throw error

      // Save version history
      await supabase.from("project_versions").insert({
        project_id: project.id,
        content: JSON.stringify(project.files),
        saved_at: new Date().toISOString(),
      })

      return project.id
    } else {
      // Create new project
      const { data, error } = await supabase
        .from("projects")
        .insert({
          title: project.title,
          description: project.description,
          html: project.files.find((f) => f.path.endsWith(".html"))?.content || "",
          css: project.files.find((f) => f.path.endsWith(".css"))?.content || "",
          js: project.files.find((f) => f.path.endsWith(".js") || f.path.endsWith(".jsx"))?.content || "",
          files: filesJson,
          mode: project.mode,
          is_public: project.is_public,
          user_id: session.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single()

      if (error) throw error

      // Save version history
      await supabase.from("project_versions").insert({
        project_id: data.id,
        content: JSON.stringify(project.files),
        saved_at: new Date().toISOString(),
      })

      return data.id
    }
  } catch (error) {
    console.error("Error saving project to Supabase:", error)
    return null
  }
}

// Get project from Supabase
export async function getProjectFromSupabase(projectId: string): Promise<ProjectData | null> {
  const supabase = getBrowserClient()

  try {
    const { data, error } = await supabase.from("projects").select("*").eq("id", projectId).single()

    if (error) throw error

    // Convert files from JSON string to array
    let files: FileData[] = []

    try {
      files = JSON.parse(data.files || "[]")
    } catch (e) {
      // If files JSON is invalid, create default files from html, css, js
      files = [
        {
          name: "index.html",
          path: "index.html",
          content: data.html || "",
          type: "text/html",
          lastModified: Date.now(),
        },
        {
          name: "styles.css",
          path: "styles.css",
          content: data.css || "",
          type: "text/css",
          lastModified: Date.now(),
        },
        {
          name: "script.js",
          path: "script.js",
          content: data.js || "",
          type: "text/javascript",
          lastModified: Date.now(),
        },
      ]
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      files,
      mode: (data.mode as LanguageMode) || "html",
      is_public: data.is_public,
    }
  } catch (error) {
    console.error("Error getting project from Supabase:", error)
    return null
  }
}

// Get all projects from Supabase
export async function getAllProjectsFromSupabase(): Promise<ProjectData[]> {
  const supabase = getBrowserClient()

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return []
    }

    const { data, error } = await supabase
      .from("projects")
      .select("id, title, description, mode, is_public, created_at, updated_at")
      .eq("user_id", session.user.id)
      .order("updated_at", { ascending: false })

    if (error) throw error

    return data.map((project) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      files: [],
      mode: (project.mode as LanguageMode) || "html",
      is_public: project.is_public,
    }))
  } catch (error) {
    console.error("Error getting all projects from Supabase:", error)
    return []
  }
}

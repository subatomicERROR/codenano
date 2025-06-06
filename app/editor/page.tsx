"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { getBrowserClient } from "@/lib/supabase"
import { useEditorStore, initializeStore } from "@/lib/editor-store"
import { CodepenLayout } from "@/components/codepen-layout"
import { ProfessionalLoading } from "@/components/professional-loading"

export default function EditorPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const searchParams = useSearchParams()
  const projectId = searchParams.get("project")
  const supabase = getBrowserClient()

  const { setCurrentProject } = useEditorStore()

  useEffect(() => {
    const initEditor = async () => {
      try {
        // Initialize the store first
        initializeStore()

        // Check authentication
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setUser(session?.user || null)

        // If there's a project ID, load it
        if (projectId && session?.user) {
          try {
            const response = await fetch(`/api/projects?id=${projectId}`)
            if (response.ok) {
              const projectData = await response.json()
              if (projectData) {
                // Convert API project to editor format
                const editorProject = {
                  id: projectData.id,
                  name: projectData.title,
                  description: projectData.description,
                  mode: projectData.mode || "html",
                  files: projectData.files || [
                    {
                      id: "html-1",
                      name: "index.html",
                      content: projectData.html || "",
                      language: "html",
                      isModified: false,
                    },
                    {
                      id: "css-1",
                      name: "style.css",
                      content: projectData.css || "",
                      language: "css",
                      isModified: false,
                    },
                    {
                      id: "js-1",
                      name: "script.js",
                      content: projectData.js || "",
                      language: "javascript",
                      isModified: false,
                    },
                  ],
                  createdAt: new Date(projectData.created_at),
                  updatedAt: new Date(projectData.updated_at),
                }
                setCurrentProject(editorProject)
              }
            }
          } catch (error) {
            console.error("Error loading project:", error)
          }
        }
      } catch (error) {
        console.error("Error initializing editor:", error)
      } finally {
        setLoading(false)
      }
    }

    initEditor()
  }, [projectId, supabase, setCurrentProject])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <ProfessionalLoading variant="progress" size="xl" text="Loading Editor" showProgress={true} />
      </div>
    )
  }

  return <CodepenLayout user={user} />
}

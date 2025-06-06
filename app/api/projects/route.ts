import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("id")

    // Get the current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    if (!session) {
      console.log("No session found")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    console.log("User authenticated:", session.user.id)

    if (projectId) {
      // Get specific project
      const { data: project, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .eq("user_id", session.user.id)
        .single()

      if (error) {
        console.error("Error fetching project:", error)
        if (error.code === "PGRST116") {
          return NextResponse.json({ error: "Project not found" }, { status: 404 })
        }
        return NextResponse.json({ error: "Database error" }, { status: 500 })
      }

      return NextResponse.json(project)
    } else {
      // Get all projects for the user
      const { data: projects, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", session.user.id)
        .order("updated_at", { ascending: false })

      if (error) {
        console.error("Error fetching projects:", error)
        // Check if it's a table not found error
        if (error.message.includes("relation") && error.message.includes("does not exist")) {
          console.log("Projects table doesn't exist, returning empty array")
          return NextResponse.json([])
        }
        return NextResponse.json({ error: "Database error" }, { status: 500 })
      }

      console.log(`Found ${projects?.length || 0} projects for user`)
      return NextResponse.json(projects || [])
    }
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { title, description, html, css, js, mode, is_public, files, thumbnail } = body

    // Validate required fields
    if (!title || title.trim() === "") {
      return NextResponse.json({ error: "Project title is required" }, { status: 400 })
    }

    const projectData = {
      title: title.trim(),
      description: description || "",
      html: html || "",
      css: css || "",
      js: js || "",
      mode: mode || "html",
      is_public: is_public || false,
      files: JSON.stringify(files || []),
      thumbnail: thumbnail || null,
      user_id: session.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: project, error } = await supabase.from("projects").insert(projectData).select().single()

    if (error) {
      console.error("Error creating project:", error)
      if (error.message.includes("relation") && error.message.includes("does not exist")) {
        return NextResponse.json({ error: "Database not initialized. Please contact support." }, { status: 500 })
      }
      return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("id")

    if (!projectId) {
      return NextResponse.json({ error: "Project ID required" }, { status: 400 })
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { title, description, html, css, js, mode, is_public, files, thumbnail } = body

    if (!title || title.trim() === "") {
      return NextResponse.json({ error: "Project title is required" }, { status: 400 })
    }

    const updateData = {
      title: title.trim(),
      description: description || "",
      html: html || "",
      css: css || "",
      js: js || "",
      mode: mode || "html",
      is_public: is_public || false,
      files: JSON.stringify(files || []),
      thumbnail: thumbnail || null,
      updated_at: new Date().toISOString(),
    }

    const { data: project, error } = await supabase
      .from("projects")
      .update(updateData)
      .eq("id", projectId)
      .eq("user_id", session.user.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating project:", error)
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 })
      }
      return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("id")

    if (!projectId) {
      return NextResponse.json({ error: "Project ID required" }, { status: 400 })
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { error } = await supabase.from("projects").delete().eq("id", projectId).eq("user_id", session.user.id)

    if (error) {
      console.error("Error deleting project:", error)
      return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

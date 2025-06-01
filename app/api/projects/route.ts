import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get("id")

  const supabase = createServerClient()

  // Get session to check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // If projectId is provided, get a specific project
    if (projectId) {
      const { data, error } = await supabase.from("projects").select("*").eq("id", projectId).single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Check if the user has access to this project
      if (data.user_id !== session.user.id && !data.is_public) {
        return NextResponse.json({ error: "You don't have access to this project" }, { status: 403 })
      }

      return NextResponse.json(data)
    }

    // Otherwise, get all projects for the current user
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", session.user.id)
      .order("updated_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("API error:", error)
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const supabase = createServerClient()

  try {
    // Get session to check if user is authenticated
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
      return NextResponse.json({ error: "Authentication error" }, { status: 401 })
    }

    if (!session) {
      return NextResponse.json({ error: "Unauthorized - Please sign in" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Received project data:", {
      title: body.title,
      description: body.description?.length || 0,
      html: body.html?.length || 0,
      css: body.css?.length || 0,
      js: body.js?.length || 0,
      is_public: body.is_public,
      thumbnail: body.thumbnail ? "Present" : "None",
      user_id: session.user.id,
    })

    // Enhanced validation
    if (!body.title || typeof body.title !== "string" || body.title.trim() === "") {
      return NextResponse.json({ error: "Project title is required and must be a non-empty string" }, { status: 400 })
    }

    // Ensure content exists (at least one of html, css, js)
    const hasHtml = body.html && typeof body.html === "string" && body.html.trim() !== ""
    const hasCss = body.css && typeof body.css === "string" && body.css.trim() !== ""
    const hasJs = body.js && typeof body.js === "string" && body.js.trim() !== ""

    if (!hasHtml && !hasCss && !hasJs) {
      return NextResponse.json(
        { error: "Project must have at least some HTML, CSS, or JavaScript content" },
        { status: 400 },
      )
    }

    // Prepare the project data with proper defaults
    const projectData = {
      title: body.title.trim(),
      description: body.description && typeof body.description === "string" ? body.description.trim() : "",
      html: body.html && typeof body.html === "string" ? body.html : "",
      css: body.css && typeof body.css === "string" ? body.css : "",
      js: body.js && typeof body.js === "string" ? body.js : "",
      thumbnail: body.thumbnail && typeof body.thumbnail === "string" ? body.thumbnail : null,
      is_public: Boolean(body.is_public),
      user_id: session.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("Inserting project data:", {
      title: projectData.title,
      description: projectData.description.length,
      html: projectData.html.length,
      css: projectData.css.length,
      js: projectData.js.length,
      thumbnail: projectData.thumbnail ? "Present" : "None",
      is_public: projectData.is_public,
      user_id: projectData.user_id,
    })

    // Insert the project
    const { data, error } = await supabase.from("projects").insert(projectData).select().single()

    if (error) {
      console.error("Database insert error:", error)

      // Handle specific database errors
      if (error.message.includes("relation") && error.message.includes("does not exist")) {
        return NextResponse.json(
          {
            error: "Database tables not found. Please initialize the database first.",
            code: "TABLES_MISSING",
          },
          { status: 500 },
        )
      }

      if (error.message.includes("duplicate key")) {
        return NextResponse.json({ error: "A project with this title already exists" }, { status: 409 })
      }

      if (error.message.includes("violates check constraint")) {
        return NextResponse.json({ error: "Invalid data format. Please check your input." }, { status: 400 })
      }

      return NextResponse.json(
        {
          error: `Database error: ${error.message}`,
          details: error.details || "Unknown database error",
        },
        { status: 500 },
      )
    }

    if (!data) {
      return NextResponse.json({ error: "Failed to create project - no data returned" }, { status: 500 })
    }

    console.log("Project created successfully:", data.id)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("POST /api/projects error:", error)

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    // Handle other specific errors
    if (error.message.includes("fetch")) {
      return NextResponse.json({ error: "Database connection error" }, { status: 503 })
    }

    return NextResponse.json(
      {
        error: error.message || "Internal server error",
        details: "An unexpected error occurred while saving the project",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  const supabase = createServerClient()

  try {
    // Get session to check if user is authenticated
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
      return NextResponse.json({ error: "Authentication error" }, { status: 401 })
    }

    if (!session) {
      return NextResponse.json({ error: "Unauthorized - Please sign in" }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: "Project ID is required for updates" }, { status: 400 })
    }

    if (!updateData.title || updateData.title.trim() === "") {
      return NextResponse.json({ error: "Project title is required" }, { status: 400 })
    }

    console.log("Updating project:", id, {
      ...updateData,
      html: updateData.html?.length,
      css: updateData.css?.length,
      js: updateData.js?.length,
      thumbnail: updateData.thumbnail ? "Present" : "None",
    })

    // First check if the project exists and belongs to the user
    const { data: existingProject, error: fetchError } = await supabase
      .from("projects")
      .select("user_id, title")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error("Error fetching existing project:", fetchError)
      if (fetchError.message.includes("No rows")) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 })
      }
      return NextResponse.json({ error: "Failed to verify project ownership" }, { status: 500 })
    }

    if (existingProject.user_id !== session.user.id) {
      return NextResponse.json({ error: "You don't have permission to update this project" }, { status: 403 })
    }

    // Prepare update data
    const projectUpdateData = {
      title: updateData.title.trim(),
      description: updateData.description?.trim() || "",
      html: updateData.html || "",
      css: updateData.css || "",
      js: updateData.js || "",
      thumbnail: updateData.thumbnail || null,
      is_public: Boolean(updateData.is_public),
      updated_at: new Date().toISOString(),
    }

    // Now update the project
    const { data, error } = await supabase.from("projects").update(projectUpdateData).eq("id", id).select().single()

    if (error) {
      console.error("Update error:", error)
      return NextResponse.json(
        {
          error: `Failed to update project: ${error.message}`,
          details: error.details || "Unknown update error",
        },
        { status: 500 },
      )
    }

    console.log("Project updated successfully:", data.id)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("PUT /api/projects error:", error)

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    return NextResponse.json(
      {
        error: error.message || "Internal server error",
        details: "An unexpected error occurred while updating the project",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get("id")

  if (!projectId) {
    return NextResponse.json({ error: "Project ID is required" }, { status: 400 })
  }

  const supabase = createServerClient()

  // Get session to check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // First check if the project exists and belongs to the user
    const { data: existingProject, error: fetchError } = await supabase
      .from("projects")
      .select("user_id")
      .eq("id", projectId)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    if (existingProject.user_id !== session.user.id) {
      return NextResponse.json({ error: "You don't have permission to delete this project" }, { status: 403 })
    }

    // Now delete the project
    const { error } = await supabase.from("projects").delete().eq("id", projectId)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("DELETE error:", error)
    return NextResponse.json({ error: error.message || "Failed to delete project" }, { status: 500 })
  }
}

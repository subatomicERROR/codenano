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

  // Get session to check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Ensure required fields are present
    if (!body.html && !body.css && !body.js) {
      return NextResponse.json({ error: "Project content is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        title: body.title || "Untitled Project",
        description: body.description || "",
        html: body.html || "",
        css: body.css || "",
        js: body.js || "",
        is_public: body.is_public || false,
        user_id: session.user.id,
      })
      .select()
      .single()

    if (error) {
      console.error("Insert error:", error)
      throw error
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("POST error:", error)
    return NextResponse.json({ error: error.message || "Failed to save project" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const supabase = createServerClient()

  // Get session to check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, ...rest } = body

    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 })
    }

    // First check if the project exists and belongs to the user
    const { data: existingProject, error: fetchError } = await supabase
      .from("projects")
      .select("user_id")
      .eq("id", id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    if (existingProject.user_id !== session.user.id) {
      return NextResponse.json({ error: "You don't have permission to update this project" }, { status: 403 })
    }

    // Now update the project
    const { data, error } = await supabase
      .from("projects")
      .update({
        ...rest,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Update error:", error)
      throw error
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("PUT error:", error)
    return NextResponse.json({ error: error.message || "Failed to update project" }, { status: 500 })
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

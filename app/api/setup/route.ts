import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = createServerClient()

  try {
    // Check if the profiles table exists
    const { error: profilesError } = await supabase.from("profiles").select("count").limit(1)
    const profilesExists = !profilesError || !profilesError.message.includes("does not exist")

    // Check if the saved_projects table exists
    const { error: projectsError } = await supabase.from("saved_projects").select("count").limit(1)
    const projectsExists = !projectsError || !projectsError.message.includes("does not exist")

    // Check if the projects table exists
    const { error: mainProjectsError } = await supabase.from("projects").select("count").limit(1)
    const mainProjectsExists = !mainProjectsError || !mainProjectsError.message.includes("does not exist")

    // Check if the reels table exists
    const { error: reelsError } = await supabase.from("reels").select("count").limit(1)
    const reelsExists = !reelsError || !reelsError.message.includes("does not exist")

    // Check if the posts table exists
    const { error: postsError } = await supabase.from("posts").select("count").limit(1)
    const postsExists = !postsError || !postsError.message.includes("does not exist")

    return NextResponse.json({
      success: true,
      tables: {
        profiles: profilesExists,
        saved_projects: projectsExists,
        projects: mainProjectsExists,
        reels: reelsExists,
        posts: postsExists,
      },
    })
  } catch (error: any) {
    console.error("Error checking tables:", error)
    return NextResponse.json({ error: error.message || "An error occurred during setup" }, { status: 500 })
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
    // Check if the profiles table exists
    const { error: profilesError } = await supabase.from("profiles").select("count").limit(1)
    const profilesExists = !profilesError || !profilesError.message.includes("does not exist")

    // Check if the saved_projects table exists
    const { error: projectsError } = await supabase.from("saved_projects").select("count").limit(1)
    const projectsExists = !projectsError || !projectsError.message.includes("does not exist")

    // Check if the projects table exists
    const { error: mainProjectsError } = await supabase.from("projects").select("count").limit(1)
    const mainProjectsExists = !mainProjectsError || !mainProjectsError.message.includes("does not exist")

    // Check if the reels table exists
    const { error: reelsError } = await supabase.from("reels").select("count").limit(1)
    const reelsExists = !reelsError || !reelsError.message.includes("does not exist")

    // Check if the posts table exists
    const { error: postsError } = await supabase.from("posts").select("count").limit(1)
    const postsExists = !postsError || !postsError.message.includes("does not exist")

    // Create saved_projects table if it doesn't exist
    if (!projectsExists) {
      try {
        await supabase.rpc("create_saved_projects_table")
      } catch (error) {
        console.error("Error creating saved_projects table:", error)
      }
    }

    return NextResponse.json({
      success: true,
      tables: {
        profiles: profilesExists,
        saved_projects: projectsExists || !projectsError,
        projects: mainProjectsExists,
        reels: reelsExists,
        posts: postsExists,
      },
    })
  } catch (error: any) {
    console.error("Error checking tables:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

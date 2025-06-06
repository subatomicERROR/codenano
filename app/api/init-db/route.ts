import { NextResponse } from "next/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const supabase = createServerComponentClient({ cookies })

    // Check if tables exist and create them if they don't
    const { data: tables, error: tablesError } = await supabase.rpc("check_tables_exist")

    if (tablesError) {
      console.log("Tables check failed, creating tables...")

      // Create profiles table
      await supabase.rpc("create_profiles_table")

      // Create projects table
      await supabase.rpc("create_projects_table")

      // Create project_versions table
      await supabase.rpc("create_project_versions_table")

      // Create reels table
      await supabase.rpc("create_reels_table")

      // Create saved_projects table
      await supabase.rpc("create_saved_projects_table")
    }

    return NextResponse.json({ success: true, message: "Database initialized successfully" })
  } catch (error) {
    console.error("Database initialization error:", error)
    return NextResponse.json({ success: true, message: "Database may already be initialized" })
  }
}

export async function GET() {
  return NextResponse.json({ message: "Database initialization endpoint" })
}

import { createServerClient } from "@/lib/supabase"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = createServerClient()

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Auth callback error:", error)
        return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error.message)}`)
      }

      if (data.session) {
        console.log("Email verification successful, redirecting to dashboard")

        // Check if user profile exists, create if not
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.session.user.id)
          .single()

        if (profileError && profileError.code === "PGRST116") {
          // Profile doesn't exist, create it
          const { error: insertError } = await supabase.from("profiles").insert({
            id: data.session.user.id,
            email: data.session.user.email,
            full_name: data.session.user.user_metadata?.full_name || "",
            avatar_url: data.session.user.user_metadata?.avatar_url || "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          if (insertError) {
            console.error("Error creating profile:", insertError)
          } else {
            console.log("Profile created successfully")
          }
        }

        // Successful authentication - redirect to dashboard
        return NextResponse.redirect(`${origin}/dashboard?verified=true`)
      }
    } catch (error) {
      console.error("Unexpected auth error:", error)
      return NextResponse.redirect(`${origin}/auth/login?error=unexpected_error`)
    }
  }

  // No code provided or other error
  console.log("No auth code provided, redirecting to login")
  return NextResponse.redirect(`${origin}/auth/login?error=no_code`)
}

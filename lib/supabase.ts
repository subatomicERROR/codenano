import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for the browser
let browserClient: ReturnType<typeof createClient> | null = null

export const getBrowserClient = () => {
  if (typeof window === "undefined") {
    // Server-side - create a new client each time
    return createBrowserClient()
  }

  // Client-side - use singleton pattern
  if (!browserClient) {
    browserClient = createBrowserClient()
  }
  return browserClient
}

export const createBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://sgvfezfvxehegyrwsrrr.supabase.co"
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNndmZlemZ2eGVoZWd5cndzcnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MDAzMjcsImV4cCI6MjA2MjE3NjMyN30.T8OePMHe_tbRT9QCDDPC4z0lK_dqYynfwaRkrgQK9vQ"

  return createClient(supabaseUrl, supabaseAnonKey)
}

// Create a server client
export const createServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://sgvfezfvxehegyrwsrrr.supabase.co"
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

  return createClient(supabaseUrl, supabaseServiceKey)
}

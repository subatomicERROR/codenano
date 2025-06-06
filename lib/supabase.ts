import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

// Create a single browser client instance
let browserClient: ReturnType<typeof createClientComponentClient> | null = null

export const getBrowserClient = () => {
  if (typeof window === "undefined") {
    throw new Error("getBrowserClient should only be called on the client side")
  }

  // Use singleton pattern to prevent multiple instances
  if (!browserClient) {
    browserClient = createClientComponentClient({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })
  }
  return browserClient
}

// For client components
export const createBrowserClient = () => {
  return createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })
}

// For server components and API routes
export const createServerClient = () => {
  if (typeof window !== "undefined") {
    throw new Error("createServerClient should only be called on the server side")
  }

  // Import cookies only when needed on the server
  const { cookies } = require("next/headers")

  return createRouteHandlerClient({
    cookies,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  })
}

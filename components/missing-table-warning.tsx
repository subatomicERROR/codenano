"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export default function MissingTableWarning() {
  const [missingTables, setMissingTables] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkTables = async () => {
      try {
        const response = await fetch("/api/setup")
        const data = await response.json()

        if (data.success) {
          const missing: string[] = []
          if (!data.tables.profiles) missing.push("profiles")
          if (!data.tables.saved_projects) missing.push("saved_projects")
          setMissingTables(missing)
        }
      } catch (error) {
        console.error("Error checking tables:", error)
      } finally {
        setLoading(false)
      }
    }

    checkTables()
  }, [])

  if (loading || missingTables.length === 0) {
    return null
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Missing Database Tables</AlertTitle>
      <AlertDescription>
        <p>
          The following tables are missing from your database: <strong>{missingTables.join(", ")}</strong>
        </p>
        <p className="mt-2">
          Please create these tables manually through the Supabase dashboard. The application will continue to function
          with limited capabilities until the tables are created.
        </p>
        <p className="mt-2">
          <strong>Profiles Table Structure:</strong> id UUID PRIMARY KEY REFERENCES auth.users(id), username TEXT
          UNIQUE, avatar_url TEXT, bio TEXT, created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE
        </p>
      </AlertDescription>
    </Alert>
  )
}

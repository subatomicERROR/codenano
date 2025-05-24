"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Database, Check, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DatabaseInitializer() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [sqlScript, setSqlScript] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()

  const initializeDatabase = async () => {
    setIsInitializing(true)
    setSuccess(false)
    setSqlScript(null)

    try {
      const response = await fetch("/api/init-db")
      const data = await response.json()

      if (data.success) {
        setSqlScript(data.sqlScript)
        setSuccess(true)
        toast({
          title: "Success",
          description: "Database initialization script generated successfully",
        })
      } else {
        throw new Error(data.error || "Failed to generate initialization script")
      }
    } catch (error: any) {
      console.error("Error initializing database:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to initialize database",
        variant: "destructive",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  const copyToClipboard = () => {
    if (!sqlScript) return

    navigator.clipboard.writeText(sqlScript)
    toast({
      title: "Copied",
      description: "SQL script copied to clipboard",
    })
  }

  return (
    <Card className="bg-[#1a1a1a] border-[#333333]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" /> Database Initialization
        </CardTitle>
        <CardDescription className="text-[#e0e0e0]/70">
          Create all required tables in your Supabase database
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-2 text-[#e0e0e0]/70">
            <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <p>
                The following tables are missing from your database: <strong>profiles</strong>,{" "}
                <strong>projects</strong>, <strong>saved_projects</strong>, <strong>reels</strong>,{" "}
                <strong>posts</strong>
              </p>
              <p className="mt-2">
                Click the button below to generate an SQL script that you can run in your Supabase SQL Editor to create
                all required tables.
              </p>
            </div>
          </div>

          {sqlScript && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">SQL Script</h3>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  Copy
                </Button>
              </div>
              <div className="bg-[#0a0a0a] p-4 rounded-md max-h-60 overflow-auto">
                <pre className="text-xs text-[#e0e0e0]/70 whitespace-pre-wrap">{sqlScript}</pre>
              </div>
              <p className="mt-2 text-sm text-[#e0e0e0]/70">
                Copy this script and run it in your Supabase SQL Editor to create all required tables.
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={initializeDatabase}
          disabled={isInitializing}
          className={success ? "bg-green-600 hover:bg-green-700" : "bg-[#00ff88] text-black hover:bg-[#00cc77]"}
        >
          {isInitializing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Script...
            </>
          ) : success ? (
            <>
              <Check className="mr-2 h-4 w-4" /> Script Generated
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" /> Generate SQL Script
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Pencil, Check, X, BadgeCheck, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getBrowserClient } from "@/lib/supabase"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface UserProfileCardProps {
  profile: {
    id: string
    username?: string
    avatar_url?: string
    bio?: string
  }
}

export default function UserProfileCard({ profile }: UserProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [username, setUsername] = useState(profile.username || "")
  const [bio, setBio] = useState(profile.bio || "")
  const [loading, setLoading] = useState(false)
  const [isCreator, setIsCreator] = useState(false)
  const [profilesTableExists, setProfilesTableExists] = useState(true)
  const { toast } = useToast()
  const supabase = getBrowserClient()

  useEffect(() => {
    // Check if profiles table exists
    const checkProfilesTable = async () => {
      const { error } = await supabase.from("profiles").select("count").limit(1)
      if (error && error.message.includes("does not exist")) {
        setProfilesTableExists(false)
      }
    }

    checkProfilesTable()

    // Check if this user is the creator (subatomicERROR)
    const checkIfCreator = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user && user.email === "subatomic@codenano.io") {
        setIsCreator(true)
        // If this is the creator and username is not set to subatomicERROR, update it
        if (profilesTableExists && profile.username !== "subatomicERROR") {
          try {
            await supabase
              .from("profiles")
              .update({
                username: "subatomicERROR",
                updated_at: new Date().toISOString(),
              })
              .eq("id", profile.id)
            setUsername("subatomicERROR")
          } catch (error) {
            console.error("Failed to update creator username:", error)
          }
        }
      }
    }

    checkIfCreator()
  }, [profile.id, profile.username, supabase, profilesTableExists])

  const handleSave = async () => {
    if (!profilesTableExists) {
      toast({
        title: "Cannot update profile",
        description: "The profiles table doesn't exist in the database. Please create it first.",
        variant: "destructive",
      })
      return
    }

    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Please provide a username",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // First check if username is already taken (except by current user)
      const { data: existingUser, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .neq("id", profile.id)
        .maybeSingle()

      if (!checkError && existingUser) {
        toast({
          title: "Username already taken",
          description: "Please choose a different username",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Use upsert to either insert or update the profile
      const { error: upsertError } = await supabase.from("profiles").upsert({
        id: profile.id,
        username,
        bio,
        updated_at: new Date().toISOString(),
      })

      if (upsertError) {
        console.error("Profile upsert error:", upsertError)
        throw new Error(upsertError.message || "Failed to update profile")
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
      setIsEditing(false)
    } catch (error: any) {
      console.error("Profile update error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {!profilesTableExists && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Missing Profiles Table</AlertTitle>
          <AlertDescription>
            <p>
              The profiles table is missing from your database. Profile updates will not be saved until the table is
              created.
            </p>
            <p className="mt-2">
              <strong>Profiles Table Structure:</strong> id UUID PRIMARY KEY REFERENCES auth.users(id), username TEXT
              UNIQUE, avatar_url TEXT, bio TEXT, created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME
              ZONE
            </p>
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-[#1a1a1a] border-[#333333] overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-[#252525] flex items-center justify-center">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url || "/placeholder.svg"}
                  alt={username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-[#00ff88]">{username.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-[#e0e0e0]/70 mb-1 block">Username</label>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-[#0a0a0a] border-[#333333]"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#e0e0e0]/70 mb-1 block">Bio</label>
                    <Input
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="bg-[#0a0a0a] border-[#333333]"
                      placeholder="Tell us about yourself"
                    />
                  </div>
                  <div className="flex gap-2 justify-center md:justify-start">
                    <Button
                      onClick={handleSave}
                      className="bg-[#00ff88] text-black hover:bg-[#00cc77]"
                      disabled={loading || !profilesTableExists}
                      size="sm"
                    >
                      <Check className="h-4 w-4 mr-1" /> Save
                    </Button>
                    <Button
                      onClick={() => {
                        setUsername(profile.username || "")
                        setBio(profile.bio || "")
                        setIsEditing(false)
                      }}
                      variant="outline"
                      className="border-[#333333] hover:bg-[#252525]"
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <h2 className="text-2xl font-bold">{username}</h2>
                    {isCreator && <BadgeCheck className="h-5 w-5 text-blue-500" />}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full"
                      onClick={() => setIsEditing(true)}
                      disabled={!profilesTableExists}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-[#e0e0e0]/70">{bio || "No bio yet. Click the edit button to add one!"}</p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

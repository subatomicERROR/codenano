"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { getBrowserClient } from "@/lib/supabase"
import DashboardNavbar from "@/components/dashboard-navbar"
import { useRouter } from "next/navigation"
import { Loader2, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import MissingTableWarning from "@/components/missing-table-warning"

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [email, setEmail] = useState("")
  const [darkMode, setDarkMode] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const [profilesTableExists, setProfilesTableExists] = useState(true)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = getBrowserClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/auth/login")
        return
      }

      setUser(session.user)
      setEmail(session.user.email || "")

      try {
        // Check if profiles table exists
        const { error: profilesError } = await supabase.from("profiles").select("count").limit(1)
        const tableExists = !profilesError || !profilesError.message.includes("does not exist")
        setProfilesTableExists(tableExists)

        if (tableExists) {
          // Fetch user profile
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()

          if (!profileError) {
            setProfile(profileData)
            setUsername(profileData.username || "")
            setBio(profileData.bio || "")
          } else {
            console.error("Error fetching profile:", profileError)
            // Create a mock profile if the real one doesn't exist
            const defaultUsername = session.user.email?.split("@")[0] || "user"
            setUsername(defaultUsername)
            setProfile({
              id: session.user.id,
              username: defaultUsername,
              bio: "",
              avatar_url: null,
            })
          }
        } else {
          // Create a mock profile if the table doesn't exist
          const defaultUsername = session.user.email?.split("@")[0] || "user"
          setUsername(defaultUsername)
          setProfile({
            id: session.user.id,
            username: defaultUsername,
            bio: "",
            avatar_url: null,
          })
        }
      } catch (error) {
        console.error("Error in profile setup:", error)
        // Set default values even if there's an error
        const defaultUsername = session.user.email?.split("@")[0] || "user"
        setUsername(defaultUsername)
      }

      // Load preferences from localStorage
      if (typeof window !== "undefined") {
        const savedDarkMode = localStorage.getItem("code-nano-dark-mode")
        const savedAutoSave = localStorage.getItem("code-nano-auto-save")

        setDarkMode(savedDarkMode === null ? true : savedDarkMode === "true")
        setAutoSave(savedAutoSave === null ? true : savedAutoSave === "true")
      }

      setLoading(false)
    }

    checkUser()
  }, [router, supabase, toast])

  const saveProfile = async () => {
    if (!user) return

    // Save preferences to localStorage regardless of profiles table
    localStorage.setItem("code-nano-dark-mode", darkMode.toString())
    localStorage.setItem("code-nano-auto-save", autoSave.toString())

    if (!profilesTableExists) {
      toast({
        title: "Preferences saved",
        description:
          "Your preferences have been saved locally. Profile changes will not be saved until the profiles table is created.",
      })
      return
    }

    setSaving(true)

    try {
      // Check if username is already taken by another user
      if (username !== profile?.username) {
        const { data: existingUser, error: checkError } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", username)
          .neq("id", user.id)
          .maybeSingle()

        if (!checkError && existingUser) {
          toast({
            title: "Username already taken",
            description: "Please choose a different username",
            variant: "destructive",
          })
          setSaving(false)
          return
        }
      }

      // Use upsert to either insert or update the profile
      const { error: upsertError } = await supabase.from("profiles").upsert({
        id: user.id,
        username,
        bio,
        updated_at: new Date().toISOString(),
      })

      if (upsertError) {
        console.error("Supabase operation error:", upsertError)
        throw new Error(upsertError.message || "Failed to update profile")
      }

      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully",
      })

      // Update local profile state
      setProfile({
        ...profile,
        username,
        bio,
        updated_at: new Date().toISOString(),
      })
    } catch (error: any) {
      console.error("Save settings error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00ff88]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0]">
      <DashboardNavbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <MissingTableWarning />

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="bg-[#1a1a1a] border border-[#333333]">
            <TabsTrigger value="profile" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">
              Profile
            </TabsTrigger>
            <TabsTrigger value="account" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">
              Account
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black"
            >
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <Card className="bg-[#1a1a1a] border-[#333333]">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription className="text-[#e0e0e0]/70">
                  Update your profile information visible to other users
                </CardDescription>
                {!profilesTableExists && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Missing Profiles Table</AlertTitle>
                    <AlertDescription>
                      Profile updates will not be saved until the profiles table is created in your database.
                    </AlertDescription>
                  </Alert>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-[#0a0a0a] border-[#333333]"
                    disabled={!profilesTableExists}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="bg-[#0a0a0a] border-[#333333] min-h-[100px]"
                    placeholder="Tell others about yourself"
                    disabled={!profilesTableExists}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveProfile} className="bg-[#00ff88] text-black hover:bg-[#00cc77]" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="mt-6">
            <Card className="bg-[#1a1a1a] border-[#333333]">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription className="text-[#e0e0e0]/70">
                  Manage your account details and security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={email} disabled className="bg-[#0a0a0a] border-[#333333] opacity-70" />
                  <p className="text-xs text-[#e0e0e0]/50">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Button variant="outline" className="border-[#333333] hover:bg-[#252525]">
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="mt-6">
            <Card className="bg-[#1a1a1a] border-[#333333]">
              <CardHeader>
                <CardTitle>Editor Preferences</CardTitle>
                <CardDescription className="text-[#e0e0e0]/70">Customize your coding experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-save">Auto Save</Label>
                  <Switch id="auto-save" checked={autoSave} onCheckedChange={setAutoSave} />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveProfile} className="bg-[#00ff88] text-black hover:bg-[#00cc77]" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Preferences"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Search, User, Code, Compass, BookOpen } from "lucide-react"
import { getBrowserClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"

export default function DashboardNavbar() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = getBrowserClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }

    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <nav className="flex items-center justify-between h-[60px] bg-[#1a1a1a] px-6 border-b border-[#333333]">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3">
          <Logo size="sm" />
        </Link>

        <div className="hidden md:flex items-center gap-6 ml-8">
          <Link
            href="/dashboard"
            className="text-[#e0e0e0] hover:text-[#00ff88] transition-colors flex items-center gap-1"
          >
            <Code className="h-4 w-4" />
            <span>My Projects</span>
          </Link>
          <Link
            href="/explore"
            className="text-[#e0e0e0] hover:text-[#00ff88] transition-colors flex items-center gap-1"
          >
            <Compass className="h-4 w-4" />
            <span>Explore</span>
          </Link>
          <Link href="/reels" className="text-[#e0e0e0] hover:text-[#00ff88] transition-colors flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>Reels</span>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-[#e0e0e0] hover:bg-[#252525]">
          <Search className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" className="text-[#e0e0e0] hover:bg-[#252525]">
          <Bell className="h-5 w-5" />
        </Button>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#1a1a1a] border-[#333333] text-[#e0e0e0]">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#333333]" />
              <DropdownMenuItem className="hover:bg-[#252525] cursor-pointer">
                <Link href="/dashboard" className="w-full">
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-[#252525] cursor-pointer">
                <Link href="/explore" className="w-full">
                  Explore
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-[#252525] cursor-pointer">
                <Link href="/reels" className="w-full">
                  Reels
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-[#252525] cursor-pointer">
                <Link href="/settings" className="w-full">
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#333333]" />
              <DropdownMenuItem className="hover:bg-[#252525] cursor-pointer" onClick={handleSignOut}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/auth/login">
            <Button size="sm" variant="outline" className="border-[#333333] hover:bg-[#252525]">
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </nav>
  )
}

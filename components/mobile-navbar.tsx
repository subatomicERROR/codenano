"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X, Code, Home, Compass, User, LogOut } from "lucide-react"
import { Logo } from "./logo"

interface MobileNavbarProps {
  user?: any
  onSignOut?: () => void
}

export default function MobileNavbar({ user, onSignOut }: MobileNavbarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="md:hidden flex items-center justify-between h-[60px] bg-[#1a1a1a] px-4 border-b border-[#333333]">
      <Link href="/">
        <Logo size="sm" />
      </Link>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-white">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[280px] bg-[#1a1a1a] border-[#333333] text-white">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <Logo size="sm" />
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 space-y-4">
              {user ? (
                <>
                  <div className="pb-4 border-b border-[#333333]">
                    <p className="text-sm text-gray-400">Signed in as</p>
                    <p className="font-medium truncate">{user.email}</p>
                  </div>

                  <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-left">
                      <Home className="mr-3 h-5 w-5" />
                      Dashboard
                    </Button>
                  </Link>

                  <Link href="/editor" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-left">
                      <Code className="mr-3 h-5 w-5" />
                      Code Editor
                    </Button>
                  </Link>

                  <Link href="/explore" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-left">
                      <Compass className="mr-3 h-5 w-5" />
                      Explore
                    </Button>
                  </Link>

                  <Link href="/settings" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-left">
                      <User className="mr-3 h-5 w-5" />
                      Settings
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/explore" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-left">
                      <Compass className="mr-3 h-5 w-5" />
                      Explore Projects
                    </Button>
                  </Link>

                  <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-left">
                      <User className="mr-3 h-5 w-5" />
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {user && (
              <div className="pt-4 border-t border-[#333333]">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left text-red-400 hover:text-red-300"
                  onClick={() => {
                    onSignOut?.()
                    setIsOpen(false)
                  }}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  )
}

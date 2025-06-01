"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Github, Zap, GitBranch, Terminal } from "lucide-react"
import FeaturedProjectsWrapper from "@/components/featured-projects-wrapper"
import { getBrowserClient } from "@/lib/supabase"
import { Logo } from "@/components/logo"
import MobileNavbar from "@/components/mobile-navbar"

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = getBrowserClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)
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
    setUser(null)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0]">
      {/* Desktop Navbar */}
      <nav className="hidden md:flex items-center justify-between h-[60px] bg-[#1a1a1a] px-6 border-b border-[#333333]">
        <div className="flex items-center gap-3">
          <Logo size="md" />
        </div>

        <div className="flex items-center gap-4">
          {loading ? null : user ? (
            <>
              <Link href="/dashboard" className="text-[#e0e0e0] hover:text-[#00ff88] transition-colors">
                Dashboard
              </Link>
              <Link href="/editor">
                <Button size="sm" className="bg-[#00ff88] text-black hover:bg-[#00cc77]">
                  Code Editor
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-[#e0e0e0] hover:text-[#00ff88] transition-colors">
                Sign In
              </Link>
              <Link href="/auth/login">
                <Button size="sm" className="bg-[#00ff88] text-black hover:bg-[#00cc77]">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile Navbar */}
      <MobileNavbar user={user} onSignOut={handleSignOut} />

      {/* Hero Section */}
      <section className="relative py-20 px-6 md:py-32 md:px-10 max-w-7xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] opacity-50"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-10 -top-10 w-1/2 h-1/2 bg-[#00ff88]/5 rounded-full blur-3xl"></div>
          <div className="absolute -left-10 -bottom-10 w-1/2 h-1/2 bg-[#00ff88]/5 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Code anywhere, <span className="text-[#00ff88]">anytime</span> with CodeNANO
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-[#e0e0e0]/80">
            A powerful, mobile-first code playground that lets you write, test, and share HTML, CSS, JavaScript, Python,
            and more - directly from your browser or phone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={user ? "/editor" : "/auth/login"}>
              <Button size="lg" className="bg-[#00ff88] text-black hover:bg-[#00cc77] w-full sm:w-auto">
                Start Coding <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="https://github.com/code-nano/playground" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="border-[#333333] hover:bg-[#252525] w-full sm:w-auto">
                <Github className="mr-2 h-4 w-4" /> GitHub
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Everything you need to <span className="text-[#00ff88]">code on the go</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#333333] hover:border-[#00ff88]/50 transition-colors">
              <div className="w-12 h-12 bg-[#00ff88]/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-[#00ff88]" />
              </div>
              <h3 className="text-xl font-bold mb-2">Mobile-First Design</h3>
              <p className="text-[#e0e0e0]/70">
                Optimized for mobile browsers with touch-friendly controls, copy/paste support, and responsive layouts
                that work perfectly on any device.
              </p>
            </div>

            <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#333333] hover:border-[#00ff88]/50 transition-colors">
              <div className="w-12 h-12 bg-[#00ff88]/10 rounded-lg flex items-center justify-center mb-4">
                <GitBranch className="h-6 w-6 text-[#00ff88]" />
              </div>
              <h3 className="text-xl font-bold mb-2">Instant Preview & Sharing</h3>
              <p className="text-[#e0e0e0]/70">
                See your code come to life instantly with real-time preview. Save and share your projects with the
                community or keep them private.
              </p>
            </div>

            <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#333333] hover:border-[#00ff88]/50 transition-colors">
              <div className="w-12 h-12 bg-[#00ff88]/10 rounded-lg flex items-center justify-center mb-4">
                <Terminal className="h-6 w-6 text-[#00ff88]" />
              </div>
              <h3 className="text-xl font-bold mb-2">Multiple Languages</h3>
              <p className="text-[#e0e0e0]/70">
                Write in HTML/CSS/JS, Python, React, Next.js, or Markdown with syntax highlighting, auto-completion, and
                built-in templates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Perfect for <span className="text-[#00ff88]">learning</span> and prototyping
              </h2>
              <p className="text-lg mb-8 text-[#e0e0e0]/80">
                Whether you're a student learning to code, a developer prototyping ideas, or someone who wants to code
                on the go, CodeNANO makes it simple and enjoyable.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#00ff88] flex items-center justify-center mt-1">
                    <span className="text-black font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Start coding instantly</h3>
                    <p className="text-[#e0e0e0]/70">
                      No setup required. Open CodeNANO in any browser, choose a template or start from scratch, and
                      begin coding immediately.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#00ff88] flex items-center justify-center mt-1">
                    <span className="text-black font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">See results in real-time</h3>
                    <p className="text-[#e0e0e0]/70">
                      Watch your code come to life with instant preview. Debug with the built-in console and test on
                      different screen sizes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#00ff88] flex items-center justify-center mt-1">
                    <span className="text-black font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Save and share</h3>
                    <p className="text-[#e0e0e0]/70">
                      Save your projects to your account, share them with others, or export them to continue working
                      locally.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#00ff88]/20 to-transparent blur-xl opacity-30 rounded-xl"></div>
              <div className="relative bg-[#1a1a1a] border border-[#333333] rounded-xl overflow-hidden shadow-2xl">
                <div className="h-8 bg-[#0a0a0a] flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="ml-4 text-xs text-[#e0e0e0]/70">index.js - CodeNANO</div>
                </div>
                <div className="p-6 font-mono text-sm text-[#e0e0e0]/90 overflow-hidden">
                  <pre className="text-[#00ff88]">{"// Multi-language support"}</pre>
                  <pre>{"function calculateOptimalRoute(points) {"}</pre>
                  <pre>{"  const graph = buildGraph(points);"}</pre>
                  <pre>{"  const mst = minimumSpanningTree(graph);"}</pre>
                  <pre>{"  return hamiltonianPath(mst);"}</pre>
                  <pre>{"}"}</pre>
                  <pre>{""}</pre>
                  <pre className="text-[#00ff88]">{"// Real-time collaboration"}</pre>
                  <pre>{"async function syncChanges(document) {"}</pre>
                  <pre>{"  const patch = createPatch(document);"}</pre>
                  <pre>{"  await broadcastChanges(patch);"}</pre>
                  <pre>{"  return applyRemoteChanges();"}</pre>
                  <pre>{"}"}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16 px-6 bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Projects</h2>
            <Link href="/explore" className="text-[#00ff88] hover:underline">
              View all projects
            </Link>
          </div>

          <FeaturedProjectsWrapper />
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Trusted by <span className="text-[#00ff88]">industry leaders</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#333333]">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-bold">Alex Chen</h4>
                  <p className="text-sm text-[#e0e0e0]/70">Computer Science Student</p>
                </div>
              </div>
              <p className="text-[#e0e0e0]/80 italic">
                "CodeNANO is perfect for coding on my phone during commutes. The mobile interface is surprisingly good
                and I can actually get work done!"
              </p>
            </div>

            <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#333333]">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-bold">Maria Rodriguez</h4>
                  <p className="text-sm text-[#e0e0e0]/70">Frontend Developer</p>
                </div>
              </div>
              <p className="text-[#e0e0e0]/80 italic">
                "Great for quick prototypes and testing ideas. The instant preview and sharing features make it easy to
                collaborate with my team."
              </p>
            </div>

            <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#333333]">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-bold">David Kim</h4>
                  <p className="text-sm text-[#e0e0e0]/70">Coding Bootcamp Instructor</p>
                </div>
              </div>
              <p className="text-[#e0e0e0]/80 italic">
                "I recommend CodeNANO to all my students. It's accessible, easy to use, and works great for learning web
                development fundamentals."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to start coding anywhere?</h2>
          <p className="text-xl mb-8 text-[#e0e0e0]/80">
            Join thousands of developers, students, and creators who use CodeNANO to bring their ideas to life. No
            downloads, no setup - just pure coding fun.
          </p>
          <Link href={user ? "/editor" : "/auth/login"}>
            <Button size="lg" className="bg-[#00ff88] text-black hover:bg-[#00cc77]">
              Start Building Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 bg-[#0a0a0a] border-t border-[#333333]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              <Logo size="sm" />
            </div>

            <div className="flex gap-8">
              <Link href="/about" className="text-[#e0e0e0]/70 hover:text-[#00ff88]">
                About
              </Link>
              <Link href="/terms" className="text-[#e0e0e0]/70 hover:text-[#00ff88]">
                Terms
              </Link>
              <Link href="/privacy" className="text-[#e0e0e0]/70 hover:text-[#00ff88]">
                Privacy
              </Link>
              <Link
                href="https://github.com/code-nano/playground"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#e0e0e0]/70 hover:text-[#00ff88]"
              >
                GitHub
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center text-[#e0e0e0]/50 text-sm">
            © {new Date().getFullYear()} CodeNANO. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

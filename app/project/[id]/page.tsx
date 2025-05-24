import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Code, Star, GitFork, Share2 } from "lucide-react"
import DashboardNavbar from "@/components/dashboard-navbar"

// Mock project data
const mockProject = {
  id: "1",
  title: "Animated Landing Page",
  description:
    "A responsive landing page with CSS animations and interactive elements. This project demonstrates modern CSS techniques including flexbox, grid, and animations.",
  author: {
    username: "quantum_coder",
    name: "Alex Quantum",
    avatar: "/placeholder.svg?height=100&width=100",
  },
  createdAt: "June 15, 2023",
  lastEdited: "2 hours ago",
  stars: 12,
  forks: 5,
  views: 234,
  tags: ["HTML", "CSS", "JavaScript", "Animation"],
  html: `<!DOCTYPE html>
<html>
<head>
  <title>Animated Landing Page</title>
</head>
<body>
  <header>
    <h1>Welcome to My Landing Page</h1>
    <p>A beautiful, animated experience</p>
  </header>
  <main>
    <section class="hero">
      <h2>Amazing Features</h2>
      <p>Check out what we have to offer</p>
    </section>
  </main>
</body>
</html>`,
  css: `body {
  background: #1a1a1a;
  color: #fff;
  font-family: 'Inter', sans-serif;
}

header {
  text-align: center;
  padding: 4rem 0;
}

h1 {
  color: #00ff88;
  font-size: 3rem;
}

.hero {
  padding: 2rem;
  border-radius: 8px;
  background: #252525;
}`,
  js: `// Animation code
document.addEventListener('DOMContentLoaded', () => {
  console.log('Page loaded!');
  
  // Add some animations
  const header = document.querySelector('header');
  header.classList.add('animated');
});`,
}

export default function ProjectPage({ params }: { params: { id: string } }) {
  const projectId = params.id
  // In a real app, you would fetch project data based on the ID
  const project = mockProject

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0]">
      <DashboardNavbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-[#e0e0e0]/70 hover:bg-[#252525]">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
            <p className="text-[#e0e0e0]/70 max-w-2xl">{project.description}</p>

            <div className="flex flex-wrap gap-2 mt-4">
              {project.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-[#252525] rounded-full text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="border-[#333333] hover:bg-[#252525]">
              <Star className="h-4 w-4 mr-2" /> Star ({project.stars})
            </Button>
            <Button variant="outline" className="border-[#333333] hover:bg-[#252525]">
              <GitFork className="h-4 w-4 mr-2" /> Fork ({project.forks})
            </Button>
            <Button variant="outline" className="border-[#333333] hover:bg-[#252525]">
              <Share2 className="h-4 w-4 mr-2" /> Share
            </Button>
            <Link href={`/editor?project=${project.id}`}>
              <Button className="bg-[#00ff88] text-black hover:bg-[#00cc77]">
                <Code className="h-4 w-4 mr-2" /> Edit
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <img
            src={project.author.avatar || "/placeholder.svg"}
            alt={project.author.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <div className="font-medium">{project.author.name}</div>
            <Link href={`/user/${project.author.username}`} className="text-sm text-[#00ff88]">
              @{project.author.username}
            </Link>
          </div>
          <div className="text-sm text-[#e0e0e0]/60 ml-auto">
            Created: {project.createdAt} • Last edited: {project.lastEdited}
          </div>
        </div>

        {/* Project Preview */}
        <div className="bg-white rounded-lg overflow-hidden h-[500px] mb-8">
          <iframe
            srcDoc={`
              <!DOCTYPE html>
              <html>
              <head>
                <style>${project.css}</style>
              </head>
              <body>
                ${project.html}
                <script>${project.js}</script>
              </body>
              </html>
            `}
            title="Project Preview"
            className="w-full h-full border-none"
            sandbox="allow-scripts"
          />
        </div>

        {/* Code Snippets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#333333]">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">HTML</h3>
              <Button variant="ghost" size="sm" className="h-7 text-[#e0e0e0]/70 hover:bg-[#252525]">
                Copy
              </Button>
            </div>
            <pre className="text-sm overflow-auto p-3 bg-[#0a0a0a] rounded-md max-h-[300px]">
              <code>{project.html}</code>
            </pre>
          </div>

          <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#333333]">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">CSS</h3>
              <Button variant="ghost" size="sm" className="h-7 text-[#e0e0e0]/70 hover:bg-[#252525]">
                Copy
              </Button>
            </div>
            <pre className="text-sm overflow-auto p-3 bg-[#0a0a0a] rounded-md max-h-[300px]">
              <code>{project.css}</code>
            </pre>
          </div>

          <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#333333]">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">JavaScript</h3>
              <Button variant="ghost" size="sm" className="h-7 text-[#e0e0e0]/70 hover:bg-[#252525]">
                Copy
              </Button>
            </div>
            <pre className="text-sm overflow-auto p-3 bg-[#0a0a0a] rounded-md max-h-[300px]">
              <code>{project.js}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

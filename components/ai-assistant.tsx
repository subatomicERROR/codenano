"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Sparkles, Code, Wand2, Lightbulb, Zap } from "lucide-react"

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
  code: {
    html: string
    css: string
    js: string
  }
  onApplySuggestion: (type: "html" | "css" | "js", code: string) => void
}

export default function AIAssistant({ isOpen, onClose, code, onApplySuggestion }: AIAssistantProps) {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"prompt" | "suggestions">("prompt")
  const promptRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  // Focus the prompt textarea when the dialog opens
  useEffect(() => {
    if (isOpen && promptRef.current) {
      promptRef.current.focus()
    }
  }, [isOpen])

  // Mock suggestions for now - in a real implementation, this would call an AI API
  const mockSuggestions = [
    {
      id: "1",
      type: "html",
      title: "Improve accessibility",
      description: "Add proper ARIA attributes and semantic HTML elements",
      code: `<!DOCTYPE html>\n<html lang="en">\n<head>\n\t<meta charset="UTF-8">\n\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\n\t<title>Document</title>\n</head>\n<body>\n\t<header>\n\t\t<h1>Welcome to CodeNANO</h1>\n\t\t<nav aria-label="Main Navigation">\n\t\t\t<ul>\n\t\t\t\t<li><a href="#" aria-current="page">Home</a></li>\n\t\t\t\t<li><a href="#">About</a></li>\n\t\t\t\t<li><a href="#">Contact</a></li>\n\t\t\t</ul>\n\t\t</nav>\n\t</header>\n\t<main>\n\t\t<section aria-labelledby="section-title">\n\t\t\t<h2 id="section-title">Main Content</h2>\n\t\t\t<p>This is the main content of the page.</p>\n\t\t</section>\n\t</main>\n\t<footer>\n\t\t<p>&copy; 2023 CodeNANO</p>\n\t</footer>\n</body>\n</html>`,
    },
    {
      id: "2",
      type: "css",
      title: "Modern CSS layout",
      description: "Use CSS Grid and Flexbox for responsive layouts",
      code: `/* Modern CSS Reset */\n* {\n\tbox-sizing: border-box;\n\tmargin: 0;\n\tpadding: 0;\n}\n\nbody {\n\tfont-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;\n\tline-height: 1.6;\n\tcolor: #333;\n\tbackground-color: #f8f9fa;\n}\n\n.container {\n\tmax-width: 1200px;\n\tmargin: 0 auto;\n\tpadding: 0 1rem;\n}\n\n/* CSS Grid Layout */\n.grid {\n\tdisplay: grid;\n\tgrid-template-columns: repeat(auto-fill, minmax(300px, 1fr));\n\tgap: 1.5rem;\n}\n\n/* Flexbox Layout */\n.flex {\n\tdisplay: flex;\n\tflex-wrap: wrap;\n\tgap: 1rem;\n}\n\n/* Responsive adjustments */\n@media (max-width: 768px) {\n\t.grid {\n\t\tgrid-template-columns: 1fr;\n\t}\n\t\n\t.flex {\n\t\tflex-direction: column;\n\t}\n}`,
    },
    {
      id: "3",
      type: "js",
      title: "Modern JavaScript patterns",
      description: "Use ES6+ features and best practices",
      code: `// Modern JavaScript with ES6+ features\n\n// Use const and let instead of var\nconst apiUrl = 'https://api.example.com/data';\nlet count = 0;\n\n// Async/await for API calls\nasync function fetchData() {\n  try {\n    const response = await fetch(apiUrl);\n    if (!response.ok) throw new Error('Network response was not ok');\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Error fetching data:', error);\n    return null;\n  }\n}\n\n// Arrow functions\nconst processData = (data) => {\n  if (!data) return [];\n  return data.map(item => ({\n    id: item.id,\n    name: item.name.toUpperCase(),\n    isActive: Boolean(item.status)\n  }));\n};\n\n// Use template literals\nconst createMessage = (user) => {\n  return \`Welcome back, \${user.name}! You have \${user.notifications} new notifications.\`;\n};\n\n// Event listeners with modern syntax\ndocument.addEventListener('DOMContentLoaded', () => {\n  const button = document.querySelector('#submit-btn');\n  if (button) {\n    button.addEventListener('click', async () => {\n      const data = await fetchData();\n      const processed = processData(data);\n      displayResults(processed);\n    });\n  }\n});\n\n// Use modules (in real code, this would be in a separate file)\nexport { fetchData, processData, createMessage };`,
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsLoading(true)
    setActiveTab("suggestions")

    try {
      // In a real implementation, this would call an AI API
      // For now, we'll just use mock data
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate API call
      setSuggestions(mockSuggestions)
    } catch (error) {
      console.error("Error getting AI suggestions:", error)
      toast({
        title: "Error",
        description: "Failed to get AI suggestions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplySuggestion = (suggestion: any) => {
    onApplySuggestion(suggestion.type, suggestion.code)
    toast({
      title: "Suggestion applied",
      description: `The ${suggestion.title} suggestion has been applied to your code.`,
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1a] border-[#333333] text-[#e0e0e0] max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#00ff88]" /> AI Code Assistant
          </DialogTitle>
          <DialogDescription className="text-[#e0e0e0]/70">
            Get intelligent suggestions to improve your code
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "prompt" | "suggestions")}>
          <TabsList className="bg-[#0a0a0a] border border-[#333333]">
            <TabsTrigger value="prompt" className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black">
              <Wand2 className="h-4 w-4 mr-2" /> Ask AI
            </TabsTrigger>
            <TabsTrigger
              value="suggestions"
              className="data-[state=active]:bg-[#00ff88] data-[state=active]:text-black"
            >
              <Lightbulb className="h-4 w-4 mr-2" /> Suggestions
              {suggestions.length > 0 && ` (${suggestions.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prompt" className="mt-4">
            <form onSubmit={handleSubmit}>
              <Textarea
                ref={promptRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask for code suggestions, optimizations, or help with a specific problem..."
                className="min-h-[150px] bg-[#0a0a0a] border-[#333333] mb-4"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-[#00ff88] text-black hover:bg-[#00cc77]"
                  disabled={isLoading || !prompt.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" /> Generate Suggestions
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="suggestions" className="mt-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#00ff88] mb-4" />
                <p className="text-[#e0e0e0]/70">Analyzing your code and generating suggestions...</p>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="text-center py-12 text-[#e0e0e0]/70">
                <Lightbulb className="h-8 w-8 mx-auto mb-4 text-[#e0e0e0]/30" />
                <p>No suggestions yet. Ask the AI for help to get started!</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="bg-[#0a0a0a] border border-[#333333] rounded-md p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Code className="h-4 w-4 text-[#00ff88]" />
                        <h3 className="font-medium text-[#e0e0e0]">{suggestion.title}</h3>
                        <span className="text-xs px-2 py-0.5 bg-[#333333] rounded-full ml-auto">
                          {suggestion.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-[#e0e0e0]/70 mb-3">{suggestion.description}</p>
                      <div className="bg-[#0a0a0a] border border-[#333333] rounded-md p-2 mb-3 overflow-x-auto">
                        <pre className="text-xs text-[#e0e0e0]/90 font-mono">
                          <code>{suggestion.code}</code>
                        </pre>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          className="bg-[#00ff88] text-black hover:bg-[#00cc77]"
                          onClick={() => handleApplySuggestion(suggestion)}
                        >
                          Apply Suggestion
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-[#333333] hover:bg-[#252525]">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

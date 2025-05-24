"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Code, FileText, Globe, Terminal } from "lucide-react"

export type LanguageMode = "html" | "react" | "python" | "markdown"

interface LanguageConfig {
  name: string
  icon: React.ReactNode
  description: string
}

const languageConfigs: Record<LanguageMode, LanguageConfig> = {
  html: {
    name: "HTML/CSS/JS",
    icon: <Globe className="w-4 h-4" />,
    description: "Web development with HTML, CSS, and JavaScript",
  },
  react: {
    name: "React",
    icon: <Code className="w-4 h-4" />,
    description: "React components with JSX",
  },
  python: {
    name: "Python",
    icon: <Terminal className="w-4 h-4" />,
    description: "Python scripts and applications",
  },
  markdown: {
    name: "Markdown",
    icon: <FileText className="w-4 h-4" />,
    description: "Markdown documentation",
  },
}

interface LanguageSwitcherProps {
  currentMode: LanguageMode
  onModeChange: (mode: LanguageMode) => void
}

export default function LanguageSwitcher({ currentMode, onModeChange }: LanguageSwitcherProps) {
  const currentConfig = languageConfigs[currentMode] || languageConfigs.html

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-[#1a1a1a] border-[#333333] text-white hover:bg-[#2a2a2a]">
          {currentConfig.icon}
          <span className="ml-2">{currentConfig.name}</span>
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#1a1a1a] border-[#333333]">
        {Object.entries(languageConfigs).map(([mode, config]) => (
          <DropdownMenuItem
            key={mode}
            onClick={() => onModeChange(mode as LanguageMode)}
            className="text-white hover:bg-[#2a2a2a] cursor-pointer"
          >
            <div className="flex items-center">
              {config.icon}
              <div className="ml-2">
                <div className="font-medium">{config.name}</div>
                <div className="text-xs text-gray-400">{config.description}</div>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

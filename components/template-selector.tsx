"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileCode } from "lucide-react"
import { projectTemplates } from "@/lib/language-mode"

interface TemplateSelectorProps {
  onSelectTemplate: (templateId: string) => void
}

export default function TemplateSelector({ onSelectTemplate }: TemplateSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-[#1a1a1a] border-[#333333] text-white hover:bg-[#252525]">
          <FileCode className="mr-2 h-4 w-4" />
          Templates
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-[#1a1a1a] border-[#333333] text-white">
        <DropdownMenuLabel>Project Templates</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#333333]" />
        {projectTemplates.map((template) => (
          <DropdownMenuItem
            key={template.id}
            className="cursor-pointer hover:bg-[#252525] focus:bg-[#252525]"
            onClick={() => onSelectTemplate(template.id)}
          >
            {template.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

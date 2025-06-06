"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { languageConfigs, projectTemplates, getTemplate } from "@/lib/language-mode"
import { useEditorStore } from "@/lib/editor-store"
import { useToast } from "@/hooks/use-toast"

interface CreateProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateProjectModal({ open, onOpenChange }: CreateProjectModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const { setCurrentProject } = useEditorStore()
  const { toast } = useToast()

  const handleCreateProject = () => {
    if (!selectedTemplate || !projectName.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a template and enter a project name",
        variant: "destructive",
      })
      return
    }

    const template = getTemplate(selectedTemplate)
    if (!template) {
      toast({
        title: "Template not found",
        description: "The selected template could not be found",
        variant: "destructive",
      })
      return
    }

    // Create new project with template files
    const newProject = {
      id: Date.now().toString(),
      name: projectName,
      description: projectDescription || template.description,
      mode: template.mode,
      files: template.files.map((file, index) => ({
        id: `${template.mode}-${index + 1}`,
        name: file.name,
        content: file.content,
        language: file.language,
        isModified: false,
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setCurrentProject(newProject)

    toast({
      title: "Project created! 🎉",
      description: `"${projectName}" has been created with ${template.name} template`,
    })

    // Reset form
    setSelectedTemplate("")
    setProjectName("")
    setProjectDescription("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1a1a] border-[#333333] text-white max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Project</DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose a framework and template to get started with your new project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Selection */}
          <div>
            <Label className="text-lg font-semibold mb-4 block">Choose Framework & Template</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`p-6 border-2 rounded-xl cursor-pointer transition-all hover:scale-105 ${
                    selectedTemplate === template.id
                      ? "border-[#00ff88] bg-[#00ff88]/10 shadow-lg"
                      : "border-[#333333] hover:border-[#555555] bg-[#0a0a0a]"
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="text-5xl mb-3">{template.icon}</div>
                    <h3 className="font-bold text-lg mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-400 mb-3">{template.description}</p>
                    <span className="text-xs bg-[#333333] px-3 py-1 rounded-full">
                      {languageConfigs[template.mode].name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="bg-[#0a0a0a] border-[#333333] text-white"
                placeholder="My Awesome Project"
              />
            </div>

            <div>
              <Label htmlFor="projectDescription">Description (optional)</Label>
              <Textarea
                id="projectDescription"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="bg-[#0a0a0a] border-[#333333] text-white"
                placeholder="Describe your project..."
                rows={3}
              />
            </div>
          </div>

          {/* Preview of selected template */}
          {selectedTemplate && (
            <div className="p-4 bg-[#0a0a0a] border border-[#333333] rounded-lg">
              <h4 className="font-semibold mb-2">Template Preview</h4>
              <div className="text-sm text-gray-400">
                {(() => {
                  const template = getTemplate(selectedTemplate)
                  return template ? (
                    <div>
                      <p className="mb-2">{template.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {template.files.map((file, index) => (
                          <span key={index} className="bg-[#333333] px-2 py-1 rounded text-xs">
                            {file.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null
                })()}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-[#333333]">
            Cancel
          </Button>
          <Button
            onClick={handleCreateProject}
            disabled={!selectedTemplate || !projectName.trim()}
            className="bg-[#00ff88] text-black hover:bg-[#00cc77]"
          >
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

"use client"

export type LanguageMode = "html" | "react" | "python" | "markdown" | "nextjs"

export const languageConfigs: Record<LanguageMode, { name: string; description: string }> = {
  html: {
    name: "HTML/CSS/JS",
    description: "Standard web development with HTML, CSS, and JavaScript",
  },
  react: {
    name: "React",
    description: "React application with JSX support",
  },
  python: {
    name: "Python",
    description: "Python scripts running in the browser via Pyodide",
  },
  markdown: {
    name: "Markdown",
    description: "Markdown documents with live preview",
  },
  nextjs: {
    name: "Next.js",
    description: "Next.js application with React and server components",
  },
}

export const projectTemplates = [
  {
    id: "html-starter",
    name: "HTML Starter",
    description: "Basic HTML, CSS, and JavaScript starter template",
    mode: "html" as LanguageMode,
  },
  {
    id: "react-counter",
    name: "React Counter",
    description: "Simple React counter application",
    mode: "react" as LanguageMode,
  },
  {
    id: "python-basics",
    name: "Python Basics",
    description: "Basic Python script with examples",
    mode: "python" as LanguageMode,
  },
  {
    id: "markdown-doc",
    name: "Markdown Document",
    description: "Markdown document with formatting examples",
    mode: "markdown" as LanguageMode,
  },
  {
    id: "nextjs-app",
    name: "Next.js App",
    description: "Next.js application starter",
    mode: "nextjs" as LanguageMode,
  },
]

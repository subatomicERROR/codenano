"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Logo } from "./logo"

interface LogoLoadingProps {
  size?: "sm" | "md" | "lg" | "xl"
  text?: string
  className?: string
}

export function LogoLoading({ size = "md", text, className }: LogoLoadingProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  }

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <div className="absolute inset-0 opacity-10">
          <Logo />
        </div>
        <div className="absolute inset-0 logo-shine">
          <Logo />
        </div>
      </div>
      {text && <p className="mt-4 text-sm text-gray-400">{text}</p>}
    </div>
  )
}

export function EnhancedLogoLoading({ size = "md", text, className }: LogoLoadingProps) {
  const [dots, setDots] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return ""
        return prev + "."
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  }

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <div className="absolute inset-0 opacity-10">
          <Logo />
        </div>
        <div className="absolute inset-0 logo-shine">
          <Logo />
        </div>
      </div>
      {text && (
        <p className="mt-4 text-sm text-gray-400">
          {text}
          <span className="inline-block w-6">{dots}</span>
        </p>
      )}
    </div>
  )
}

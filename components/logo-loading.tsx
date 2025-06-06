"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Logo } from "./logo"

interface LogoLoadingProps {
  size?: "sm" | "md" | "lg" | "xl"
  text?: string
  className?: string
  variant?: "pulse" | "spin" | "glow" | "wave" | "dots"
}

export function LogoLoading({ size = "md", text, className, variant = "glow" }: LogoLoadingProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  }

  const getVariantClasses = () => {
    switch (variant) {
      case "pulse":
        return "animate-pulse"
      case "spin":
        return "animate-spin"
      case "glow":
        return "logo-glow"
      case "wave":
        return "logo-wave"
      case "dots":
        return "logo-dots"
      default:
        return "logo-glow"
    }
  }

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <div className={cn("absolute inset-0", getVariantClasses())}>
          <Logo />
        </div>
        {variant === "glow" && (
          <div className="absolute inset-0 logo-shine">
            <Logo />
          </div>
        )}
      </div>
      {text && <p className="mt-4 text-sm text-gray-400 animate-pulse">{text}</p>}
    </div>
  )
}

export function EnhancedLogoLoading({ size = "md", text, className, variant = "glow" }: LogoLoadingProps) {
  const [dots, setDots] = useState("")
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return ""
        return prev + "."
      })
    }, 500)

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0
        return prev + 1
      })
    }, 50)

    return () => {
      clearInterval(dotsInterval)
      clearInterval(progressInterval)
    }
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
        <div className="absolute inset-0 logo-glow">
          <Logo />
        </div>
        <div className="absolute inset-0 logo-shine">
          <Logo />
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-32 h-1 bg-gray-800 rounded-full mt-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#00ff88] to-[#00cc77] transition-all duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {text && (
        <p className="mt-2 text-sm text-gray-400 text-center">
          {text}
          <span className="inline-block w-6">{dots}</span>
        </p>
      )}
    </div>
  )
}

// Professional skeleton loader
export function SkeletonLoader({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="bg-gray-800 rounded-lg h-4 w-3/4 mb-2"></div>
      <div className="bg-gray-800 rounded-lg h-4 w-1/2 mb-2"></div>
      <div className="bg-gray-800 rounded-lg h-4 w-5/6"></div>
    </div>
  )
}

// Spinner component
export function Spinner({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <div className="absolute inset-0 border-2 border-gray-700 rounded-full"></div>
      <div className="absolute inset-0 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
}

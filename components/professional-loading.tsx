"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "spinner" | "dots" | "pulse" | "skeleton" | "progress"
  text?: string
  className?: string
  fullScreen?: boolean
}

export function ProfessionalLoading({
  size = "md",
  variant = "spinner",
  text,
  className,
  fullScreen = false,
}: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  }

  const containerClasses = fullScreen
    ? "fixed inset-0 bg-[#0a0a0a]/80 backdrop-blur-sm z-50 flex items-center justify-center"
    : "flex items-center justify-center"

  const renderLoading = () => {
    switch (variant) {
      case "spinner":
        return (
          <div className={cn("relative", sizeClasses[size])}>
            <div className="absolute inset-0 border-2 border-gray-700 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )

      case "dots":
        return (
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-bounce"></div>
          </div>
        )

      case "pulse":
        return <div className={cn("bg-[#00ff88] rounded-full animate-pulse", sizeClasses[size])}></div>

      case "skeleton":
        return (
          <div className="space-y-3 w-full max-w-sm">
            <div className="h-4 bg-gray-800 rounded-lg animate-pulse"></div>
            <div className="h-4 bg-gray-800 rounded-lg animate-pulse w-5/6"></div>
            <div className="h-4 bg-gray-800 rounded-lg animate-pulse w-4/6"></div>
          </div>
        )

      case "progress":
        return (
          <div className="w-32 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-[#00ff88] animate-progress"></div>
          </div>
        )

      default:
        return (
          <div className={cn("relative", sizeClasses[size])}>
            <div className="absolute inset-0 border-2 border-gray-700 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )
    }
  }

  return (
    <div className={cn(containerClasses, className)}>
      <div className="flex flex-col items-center space-y-4">
        {renderLoading()}
        {text && <p className="text-sm text-gray-400 animate-pulse text-center">{text}</p>}
      </div>
    </div>
  )
}

// Loading button component
export function LoadingButton({
  children,
  loading = false,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      className={cn("relative inline-flex items-center justify-center", loading && "pointer-events-none", className)}
      disabled={loading}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <span className={cn(loading && "opacity-0")}>{children}</span>
    </button>
  )
}

// Page loading overlay
export function PageLoadingOverlay({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-[#0a0a0a]/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4">
          <div className="w-full h-full border-4 border-gray-700 border-t-[#00ff88] rounded-full animate-spin"></div>
        </div>
        <div className="w-32 h-1 bg-gray-800 rounded-full mx-auto mb-4 overflow-hidden">
          <div className="h-full bg-[#00ff88] animate-progress"></div>
        </div>
        <p className="text-gray-400 text-sm animate-pulse">{text}</p>
      </div>
    </div>
  )
}

// Card loading skeleton
export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6 space-y-4">
          <div className="h-4 bg-gray-800 rounded-lg animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-800 rounded-lg animate-pulse w-1/2"></div>
          <div className="h-20 bg-gray-800 rounded-lg animate-pulse"></div>
          <div className="flex space-x-2">
            <div className="h-8 bg-gray-800 rounded animate-pulse w-16"></div>
            <div className="h-8 bg-gray-800 rounded animate-pulse w-16"></div>
          </div>
        </div>
      ))}
    </>
  )
}

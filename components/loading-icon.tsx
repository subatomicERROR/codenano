"use client"

import { EnhancedLogoLoading } from "./logo-loading"

interface LoadingIconProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  text?: string
}

export function LoadingIcon({ size = "md", className = "", text }: LoadingIconProps) {
  return <EnhancedLogoLoading size={size} className={className} text={text} />
}

// Keep the old component name for backward compatibility
export default LoadingIcon

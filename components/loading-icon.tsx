"use client"

import { ProfessionalLoading } from "./professional-loading"

interface LoadingIconProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  text?: string
  variant?: "spinner" | "dots" | "pulse" | "skeleton" | "logo"
}

export function LoadingIcon({ size = "md", className = "", text, variant = "logo" }: LoadingIconProps) {
  return <ProfessionalLoading size={size} className={className} text={text} variant={variant} />
}

// Keep the old component name for backward compatibility
export default LoadingIcon

interface LogoProps {
  size?: "sm" | "md" | "lg"
  variant?: "default" | "monochrome"
}

export function Logo({ size = "md", variant = "default" }: LogoProps) {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`relative ${sizes[size]}`}>
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Hexagon background */}
          <path
            d="M16 2L29.8564 10V26L16 34L2.14359 26V10L16 2Z"
            fill={variant === "default" ? "#0A0A0A" : "#1A1A1A"}
            stroke={variant === "default" ? "#00FF88" : "#FFFFFF"}
            strokeWidth="2"
          />

          {/* Code brackets */}
          <path
            d="M11 10L7 16L11 22"
            stroke={variant === "default" ? "#00FF88" : "#FFFFFF"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21 10L25 16L21 22"
            stroke={variant === "default" ? "#00FF88" : "#FFFFFF"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Slash */}
          <path
            d="M18 8L14 24"
            stroke={variant === "default" ? "#00FF88" : "#FFFFFF"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Particle effects */}
          {variant === "default" && (
            <>
              <circle cx="16" cy="16" r="1.5" fill="#00FF88" />
              <circle cx="20" cy="12" r="1" fill="#00FF88" opacity="0.8" />
              <circle cx="12" cy="20" r="1" fill="#00FF88" opacity="0.8" />
            </>
          )}
        </svg>
      </div>
      <div className={`font-bold ${size === "sm" ? "text-lg" : size === "md" ? "text-xl" : "text-2xl"}`}>
        <span className="text-white">code</span>
        <span className="text-[#00FF88]">NANO</span>
      </div>
    </div>
  )
}

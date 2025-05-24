"use client"

import dynamic from "next/dynamic"

// Use dynamic import with no SSR to avoid hydration issues
const FeaturedProjects = dynamic(() => import("@/components/featured-projects"), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-64 bg-[#1a1a1a] rounded-lg animate-pulse"></div>
      ))}
    </div>
  ),
})

export default function FeaturedProjectsWrapper() {
  return <FeaturedProjects />
}

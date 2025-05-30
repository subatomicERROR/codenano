import { Suspense } from "react"
import CleanEditor from "@/components/clean-editor"

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold mb-2">Loading CodeNANO</h2>
            <p className="text-gray-400">Preparing your clean editor...</p>
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ff88]"></div>
            </div>
          </div>
        </div>
      }
    >
      <CleanEditor />
    </Suspense>
  )
}

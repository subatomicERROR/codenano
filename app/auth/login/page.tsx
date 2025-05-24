import Link from "next/link"
import AuthForm from "@/components/auth/auth-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <div className="flex items-center justify-center h-[60px] bg-[#1a1a1a] px-6 border-b border-[#333333]">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-7 h-7 bg-gradient-to-br from-[#00ff88] to-[#00cc77] rounded-md flex items-center justify-center">
            <span className="text-lg">👾</span>
          </div>
          <span className="text-[#00ff88] font-bold text-xl">code-nano.io</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-8 text-[#e0e0e0]">Welcome to code-NANO</h1>
          <AuthForm />

          <p className="mt-8 text-center text-[#e0e0e0]/70 text-sm">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="text-[#00ff88] hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-[#00ff88] hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

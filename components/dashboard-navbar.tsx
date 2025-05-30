import Link from "next/link"

export default function DashboardNavbar() {
  return (
    <nav className="bg-[#121212] p-4 flex justify-between items-center">
      <Link href="/" className="text-white font-bold text-xl">
        Dashboard
      </Link>
      <div className="flex gap-4">
        <Link href="/analytics" className="text-[#e0e0e0]/70 hover:text-[#00ff88] transition-colors">
          Analytics
        </Link>
        <Link href="/settings" className="text-[#e0e0e0]/70 hover:text-[#00ff88] transition-colors">
          Settings
        </Link>
      </div>
    </nav>
  )
}

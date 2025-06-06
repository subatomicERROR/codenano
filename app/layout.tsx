import type React from "react"
import "./globals.css"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CodeNANO - Professional Web-Based IDE",
  description:
    "A powerful, mobile-first code playground and IDE for modern web development. Code anywhere, anytime with React, Vue, Next.js support.",
  manifest: "/manifest.json",
  themeColor: "#00ff88",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CodeNANO",
  },
  generator: "v0.dev",
  keywords: ["code editor", "IDE", "web development", "React", "Vue", "Next.js", "mobile coding"],
  authors: [{ name: "subatomicERROR" }],
  creator: "subatomicERROR",
  publisher: "CodeNANO",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#00ff88",
  colorScheme: "dark",
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CodeNANO" />
        <meta name="application-name" content="CodeNANO" />
        <meta name="msapplication-TileColor" content="#00ff88" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-192.png" />
        <link rel="mask-icon" href="/icon-192.png" color="#00ff88" />
        <link rel="shortcut icon" href="/icon-192.png" />
      </head>
      <body className={`${inter.className} mobile-safe-area`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <div className="mobile-container">{children}</div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

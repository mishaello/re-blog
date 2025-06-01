import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Header from "@/components/header"
import Footer from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "re-blog | Місцеві Новини",
  description: "Сучасний портал місцевих новин з Blade Runner дизайном",
}

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode
}>) {
  return (
      <html lang="uk" suppressHydrationWarning>
      <body className={inter.className}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
        <div className="flex min-h-screen flex-col relative">
          {/* Background effects */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-3/4 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
          </div>

          <Header />
          <main className="flex-1 container mx-auto py-8 px-4 md:px-6 relative z-10">{children}</main>
          <Footer />
        </div>
        <Toaster />
      </ThemeProvider>
      </body>
      </html>
  )
}

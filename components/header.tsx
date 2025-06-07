"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClientClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Newspaper, UserIcon, Plus, Home, UserIcon as UserProfile, Menu, X } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Header() {
  const pathname = usePathname()
  const supabase = createClientClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)

      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user || null)
      })

      return () => {
        authListener.subscription.unsubscribe()
      }
    }

    getUser()
  }, [supabase])

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const handleSignInAnonymously = async () => {
    await supabase.auth.signInAnonymously()
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setIsOpen(false)
  }

  const isAnonymous = !user?.email && !user?.user_metadata?.provider
  const canCreatePost = !!user && !isAnonymous
  console.log(canCreatePost)

  return (
      <header className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Newspaper className="h-8 w-8 text-cyan-400 animate-pulse" />
              <div className="absolute inset-0 h-8 w-8 text-cyan-400 animate-ping opacity-20">
                <Newspaper className="h-8 w-8" />
              </div>
            </div>
            <Link href="/" className="text-xl font-bold neon-text">
              re-blog
            </Link>
          </div>

          {/* Десктопна навігація */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
                href="/"
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-cyan-400 ${
                    pathname === "/" ? "text-cyan-400" : "text-gray-300"
                }`}
            >
              <Home className="h-4 w-4" />
              Головна
            </Link>

            {canCreatePost && (
                <>
                  <Link
                      href="/create"
                      className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-purple-400 ${
                          pathname === "/create" ? "text-purple-400" : "text-gray-300"
                      }`}
                  >
                    <Plus className="h-4 w-4" />
                    Створити
                  </Link>

                  <Link
                      href="/profile"
                      className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-pink-400 ${
                          pathname === "/profile" ? "text-pink-400" : "text-gray-300"
                      }`}
                  >
                    <UserProfile className="h-4 w-4" />
                    Профіль
                  </Link>
                </>
            )}

            {loading ? (
                <Button variant="ghost" size="sm" disabled className="glass">
                  Завантаження...
                </Button>
            ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full glass hover:bg-white/10">
                      <Avatar className="h-8 w-8 ring-2 ring-cyan-400/50">
                        <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white">
                          {user.user_metadata?.name?.[0] || user.email?.[0] || "A"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass border-white/20">
                    <DropdownMenuItem disabled className="text-gray-300">
                      {user.user_metadata?.name ||
                          user.email ||
                          (user.app_metadata?.provider === "anonymous" ? "Анонім" : "Користувач")}
                    </DropdownMenuItem>
                    {canCreatePost && (
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer">
                          <UserProfile className="mr-2 h-4 w-4" />
                          Мій профіль
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-400 hover:text-red-300">
                      Вийти
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="web3-button text-white font-medium px-6">Увійти</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass border-white/20">
                    <DropdownMenuItem onClick={handleSignIn} className="hover:bg-white/10">
                      <UserIcon className="mr-2 h-4 w-4 text-cyan-400" />
                      Google
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignInAnonymously} className="hover:bg-white/10">
                      <UserIcon className="mr-2 h-4 w-4 text-purple-400" />
                      Анонімно
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            )}
          </nav>

          {/* Мобільна навігація */}
          <div className="flex items-center gap-2 md:hidden">
            {canCreatePost && (
                <Link
                    href="/create"
                    className={`flex items-center justify-center w-10 h-10 rounded-full glass hover:bg-white/10 ${
                        pathname === "/create" ? "text-purple-400 ring-1 ring-purple-400/50" : "text-gray-300"
                    }`}
                >
                  <Plus className="h-5 w-5" />
                </Link>
            )}

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full glass hover:bg-white/10">
                  <Menu className="h-5 w-5 text-gray-300" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="glass border-l border-white/10 w-[280px] p-0">
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b border-white/10">
                    {user ? (
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 ring-2 ring-cyan-400/50">
                            <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white">
                              {user.user_metadata?.name?.[0] || user.email?.[0] || "A"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-white">
                              {user.user_metadata?.name ||
                                  user.email ||
                                  (user.app_metadata?.provider === "anonymous" ? "Анонім" : "Користувач")}
                            </div>
                            <div className="text-sm text-gray-400">
                              {user.app_metadata?.provider === "anonymous" ? "Анонімний вхід" : "Google аккаунт"}
                            </div>
                          </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                          <h3 className="text-lg font-medium text-white">Увійти</h3>
                          <div className="flex flex-col gap-2">
                            <Button onClick={handleSignIn} className="web3-button w-full justify-start">
                              <UserIcon className="mr-2 h-4 w-4 text-cyan-400" />
                              Google
                            </Button>
                            <Button onClick={handleSignInAnonymously} variant="outline" className="w-full justify-start">
                              <UserIcon className="mr-2 h-4 w-4 text-purple-400" />
                              Анонімно
                            </Button>
                          </div>
                        </div>
                    )}
                  </div>

                  <nav className="flex-1 p-6">
                    <ul className="space-y-4">
                      <li>
                        <Link
                            href="/"
                            className={`flex items-center gap-3 text-base font-medium transition-colors hover:text-cyan-400 ${
                                pathname === "/" ? "text-cyan-400" : "text-gray-300"
                            }`}
                            onClick={() => setIsOpen(false)}
                        >
                          <Home className="h-5 w-5" />
                          Головна
                        </Link>
                      </li>
                      {canCreatePost && (
                          <>
                            <li>
                              <Link
                                  href="/create"
                                  className={`flex items-center gap-3 text-base font-medium transition-colors hover:text-purple-400 ${
                                      pathname === "/create" ? "text-purple-400" : "text-gray-300"
                                  }`}
                                  onClick={() => setIsOpen(false)}
                              >
                                <Plus className="h-5 w-5" />
                                Створити
                              </Link>
                            </li>
                            <li>
                              <Link
                                  href="/profile"
                                  className={`flex items-center gap-3 text-base font-medium transition-colors hover:text-pink-400 ${
                                      pathname === "/profile" ? "text-pink-400" : "text-gray-300"
                                  }`}
                                  onClick={() => setIsOpen(false)}
                              >
                                <UserProfile className="h-5 w-5" />
                                Профіль
                              </Link>
                            </li>
                          </>
                      )}
                    </ul>
                  </nav>

                  {user && (
                      <div className="p-6 border-t border-white/10">
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-white/5"
                            onClick={handleSignOut}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Вийти
                        </Button>
                      </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
  )
}

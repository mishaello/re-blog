"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Globe, FileText } from "lucide-react"
import { createClientClient } from "@/lib/supabase/client"

interface Author {
  id: string
  name: string
  avatar_url: string
  bio?: string
  location?: string
  website?: string
}

interface AuthorHoverCardProps {
  author: Author | null | undefined
  children: React.ReactNode
}

export default function AuthorHoverCard({ author, children }: AuthorHoverCardProps) {
  const [postCount, setPostCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const supabase = createClientClient()

  useEffect(() => {
    if (author?.id) {
      fetchPostCount()
    }
  }, [author?.id])

  const fetchPostCount = async () => {
    if (!author?.id || loading) return

    setLoading(true)
    try {
      const { count, error } = await supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("user_id", author.id)

      if (!error && count !== null) {
        setPostCount(count)
      }
    } catch (error) {
      console.error("Error fetching post count:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!author) {
    return <>{children}</>
  }

  return (
      <HoverCard>
        <HoverCardTrigger asChild>{children}</HoverCardTrigger>
        <HoverCardContent className="w-80 glass-card border-cyan-400/30 bg-black/80 backdrop-blur-xl">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 ring-2 ring-cyan-400/50">
                <AvatarImage src={author.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white text-lg">
                  {author.name?.[0] || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{author.name}</h3>
                <Badge variant="outline" className="border-purple-400/50 text-purple-300 mt-1">
                  <FileText className="h-3 w-3 mr-1" />
                  {postCount} {postCount === 1 ? "пост" : postCount < 5 ? "пости" : "постів"}
                </Badge>
              </div>
            </div>

            {/* Bio */}
            {author.bio && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-300 leading-relaxed">{author.bio}</p>
                </div>
            )}

            {/* Location and Website */}
            <div className="space-y-2">
              {author.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin className="h-4 w-4 text-cyan-400" />
                    <span>{author.location}</span>
                  </div>
              )}
              {author.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-cyan-400" />
                    <a
                        href={author.website.startsWith("http") ? author.website : `https://${author.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-300 hover:text-cyan-200 transition-colors truncate"
                        onClick={(e) => e.stopPropagation()}
                    >
                      {author.website}
                    </a>
                  </div>
              )}
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { Calendar, User, Edit, Trash2, Tag } from "lucide-react"
import { createClientClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import AuthorHoverCard from "@/components/author-hover-card"
import Image from "next/image"
import Link from "next/link"

interface Post {
  id: string
  title: string
  content: string
  image_url?: string
  category?: string
  created_at: string
  user_id: string
  profiles?: {
    id: string
    name: string
    avatar_url: string
    bio?: string
    location?: string
    website?: string
  }
}

export default function PostDetail({ post }: { post: Post }) {
  const [isOwner, setIsOwner] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClientClient()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    checkOwnership()
  }, [])

  const checkOwnership = async () => {
    const { data: session } = await supabase.auth.getSession()
    if (session.session && session.session.user.id === post.user_id) {
      setIsOwner(true)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Ви впевнені, що хочете видалити цю публікацію?")) {
      return
    }

    setIsDeleting(true)

    try {
      const { error } = await supabase.from("posts").delete().eq("id", post.id).eq("user_id", post.user_id)

      if (error) throw error

      toast({
        title: "Успіх!",
        description: "Публікацію видалено успішно",
      })

      router.push("/")
    } catch (error) {
      console.error("Error deleting post:", error)
      toast({
        title: "Помилка",
        description: "Не вдалося видалити публікацію",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Функція для визначення кольору категорії
  const getCategoryColor = (category?: string) => {
    if (!category) return "border-gray-400/50 text-gray-400"

    const categoryColors: Record<string, string> = {
      Новини: "border-blue-400/50 text-blue-400",
      Політика: "border-red-400/50 text-red-400",
      Економіка: "border-green-400/50 text-green-400",
      Культура: "border-purple-400/50 text-purple-400",
      Спорт: "border-orange-400/50 text-orange-400",
      Технології: "border-cyan-400/50 text-cyan-400",
      Освіта: "border-indigo-400/50 text-indigo-400",
      "Здоров'я": "border-pink-400/50 text-pink-400",
      Розваги: "border-yellow-400/50 text-yellow-400",
    }

    return categoryColors[category] || "border-gray-400/50 text-gray-400"
  }

  return (
      <article className="space-y-8 relative">
        {/* Header */}
        <div className="glass-card rounded-2xl p-8 space-y-6 relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">{post.title}</h1>

              {/* Категорія під заголовком */}
              {post.category && (
                  <Badge
                      variant="outline"
                      className={`mb-6 ${getCategoryColor(post.category)} flex items-center gap-1 w-fit`}
                  >
                    <Tag className="h-3 w-3" />
                    {post.category}
                  </Badge>
              )}

              <div className="flex flex-wrap items-center gap-4 text-gray-300 relative z-50">
                <AuthorHoverCard author={post.profiles}>
                  <div className="flex items-center gap-3 cursor-pointer">
                    <Avatar className="h-12 w-12 ring-2 ring-cyan-400/50">
                      <AvatarImage src={post.profiles?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white">
                        {post.profiles?.name?.[0] || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-cyan-400" />
                        <span className="font-medium hover:text-cyan-300 transition-colors">
                        {post.profiles?.name || "Анонімний користувач"}
                      </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="h-3 w-3" />
                        <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
                      </div>
                    </div>
                  </div>
                </AuthorHoverCard>
              </div>
            </div>

            {/* Кнопки редагування для власника */}
            {isOwner && (
                <div className="flex gap-2">
                  <Link href={`/edit/${post.id}`}>
                    <Button className="web3-button">
                      <Edit className="h-4 w-4 mr-2" />
                      Редагувати
                    </Button>
                  </Link>
                  <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? "Видалення..." : "Видалити"}
                  </Button>
                </div>
            )}
          </div>
        </div>

        {/* Image */}
        {post.image_url && (
            <div className="glass-card rounded-2xl p-4 relative z-0">
              <Image
                  src={post.image_url || "/placeholder.svg"}
                  alt={post.title}
                  width={800}
                  height={400}
                  className="rounded-lg object-cover w-full max-h-96"
              />
            </div>
        )}

        {/* Content */}
        <div className="glass-card rounded-2xl p-8 relative z-0">
          <div className="prose prose-lg prose-invert max-w-none">
            {post.content.split("\n").map((paragraph, i) => (
                <p key={i} className="text-gray-300 leading-relaxed mb-4 last:mb-0">
                  {paragraph}
                </p>
            ))}
          </div>
        </div>
      </article>
  )
}

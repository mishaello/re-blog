"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { createClientClient } from "@/lib/supabase/client"
import { formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { MessageCircle, Send } from "lucide-react"

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  post_id: string
  profiles?: {
    name: string
    avatar_url: string
  } | null
}

export default function CommentSection({
  postId,
  comments,
}: {
  postId: string
  comments: Comment[]
}) {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [localComments, setLocalComments] = useState<Comment[]>(comments)
  const { toast } = useToast()
  const supabase = createClientClient()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Перевіряємо поточну сесію
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        throw new Error(`Помилка сесії: ${sessionError.message}`)
      }

      let currentUserId = sessionData.session?.user?.id

      // Якщо немає сесії, спробуємо увійти анонімно
      if (!sessionData.session) {
        const { data: anonData, error: signInError } = await supabase.auth.signInAnonymously()

        if (signInError) {
          throw new Error(`Помилка анонімного входу: ${signInError.message}`)
        }

        if (!anonData.user) {
          throw new Error("Не вдалося створити анонімну сесію")
        }

        currentUserId = anonData.user.id
      }

      if (!currentUserId) {
        throw new Error("Не вдалося отримати ID користувача")
      }

      // Створюємо коментар
      const commentData = {
        content: content.trim(),
        post_id: postId,
        user_id: currentUserId,
      }

      const { data: newComment, error: insertError } = await supabase
        .from("comments")
        .insert(commentData)
        .select("*")
        .single()

      if (insertError) {
        throw new Error(`Помилка створення коментаря: ${insertError.message}`)
      }

      if (!newComment) {
        throw new Error("Коментар не був створений")
      }

      // Отримуємо профіль користувача для нового коментаря
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", currentUserId).single()

      // Додаємо новий коментар до локального стану
      const commentWithProfile = {
        ...newComment,
        profiles: profile || null,
      }

      setLocalComments([...localComments, commentWithProfile])
      setContent("")

      toast({
        title: "Коментар додано",
        description: "Ваш коментар успішно опубліковано",
      })

      router.refresh()
    } catch (error) {
      let errorMessage = "Не вдалося додати коментар"

      if (error instanceof Error) {
        errorMessage = error.message
      }

      toast({
        title: "Помилка",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <MessageCircle className="h-6 w-6 text-cyan-400" />
          <h2 className="text-2xl font-bold text-white">Коментарі ({localComments.length})</h2>
        </div>

        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Поділіться своїми думками..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            minLength={1}
            maxLength={1000}
            className="glass border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-400 resize-none"
            rows={4}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{content.length}/1000 символів</span>
            <Button type="submit" disabled={isLoading || content.trim().length === 0} className="web3-button">
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? "Надсилання..." : "Додати коментар"}
            </Button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {localComments.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <MessageCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Поки що немає коментарів</p>
            <p className="text-gray-500 text-sm mt-2">Будьте першим, хто залишить коментар!</p>
          </div>
        ) : (
          localComments.map((comment) => (
            <div key={comment.id} className="glass-card rounded-2xl p-6 hover:bg-white/5 transition-colors">
              <div className="flex gap-4">
                <Avatar className="h-10 w-10 ring-2 ring-purple-400/50 flex-shrink-0">
                  <AvatarImage src={comment.profiles?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                    {comment.profiles?.name?.[0] || "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-white">{comment.profiles?.name || "Анонімний користувач"}</span>
                    <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

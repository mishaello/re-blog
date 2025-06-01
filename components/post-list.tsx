import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, MessageCircle, Plus, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import AuthorHoverCard from "@/components/author-hover-card"
import Image from "next/image"

interface Post {
  id: string
  title: string
  content: string
  category?: string
  image_url?: string
  created_at: string
  user_id: string
  profiles?: {
    id: string
    name: string
    avatar_url: string
    bio?: string
    location?: string
    website?: string
  } | null
}

// Функція для отримання кольору категорії
function getCategoryColor(category: string) {
  const colors: { [key: string]: string } = {
    Новини: "bg-blue-500/20 text-blue-300 border-blue-400/30",
    Політика: "bg-red-500/20 text-red-300 border-red-400/30",
    Економіка: "bg-green-500/20 text-green-300 border-green-400/30",
    Культура: "bg-purple-500/20 text-purple-300 border-purple-400/30",
    Спорт: "bg-orange-500/20 text-orange-300 border-orange-400/30",
    Технології: "bg-cyan-500/20 text-cyan-300 border-cyan-400/30",
    Освіта: "bg-indigo-500/20 text-indigo-300 border-indigo-400/30",
    "Здоров'я": "bg-pink-500/20 text-pink-300 border-pink-400/30",
    Розваги: "bg-yellow-500/20 text-yellow-300 border-yellow-400/30",
    Інше: "bg-gray-500/20 text-gray-300 border-gray-400/30",
  }
  return colors[category] || "bg-gray-500/20 text-gray-300 border-gray-400/30"
}

export default function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
        <div className="col-span-full text-center py-12">
          <div className="glass-card rounded-2xl p-8 max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
              <Plus className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white">Немає публікацій</h3>
            <p className="text-gray-400">Будьте першим, хто поділиться новинами!</p>
            <Link href="/create">
              <Button className="web3-button mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Створити публікацію
              </Button>
            </Link>
          </div>
        </div>
    )
  }

  return (
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
            <Link key={post.id} href={`/post/${post.id}`}>
              <Card className="h-full glass-card hover:bg-white/10 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20 group">
                {/* Image */}
                {post.image_url && (
                    <div className="relative h-48 overflow-hidden rounded-t-2xl">
                      <Image
                          src={post.image_url || "/placeholder.svg"}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {/* Category badge on image */}
                      {post.category && (
                          <div className="absolute top-3 left-3">
                            <Badge className={`${getCategoryColor(post.category)} backdrop-blur-sm border`}>
                              <Tag className="h-3 w-3 mr-1" />
                              {post.category}
                            </Badge>
                          </div>
                      )}
                    </div>
                )}

                <CardHeader className="pb-3">
                  {/* Category badge if no image */}
                  {!post.image_url && post.category && (
                      <div className="mb-3">
                        <Badge className={`${getCategoryColor(post.category)} backdrop-blur-sm border`}>
                          <Tag className="h-3 w-3 mr-1" />
                          {post.category}
                        </Badge>
                      </div>
                  )}

                  <div className="flex items-center gap-3 mb-3">
                    <AuthorHoverCard author={post.profiles}>
                      <div className="flex items-center gap-3 cursor-pointer">
                        <Avatar className="h-8 w-8 ring-2 ring-purple-400/50">
                          <AvatarImage src={post.profiles?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-xs">
                            {post.profiles?.name?.[0] || "A"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm text-gray-300 hover:text-cyan-300 transition-colors">
                            {post.profiles?.name || "Анонімний користувач"}
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(post.created_at)}</p>
                        </div>
                      </div>
                    </AuthorHoverCard>
                  </div>
                  <CardTitle className="line-clamp-2 text-white group-hover:text-cyan-300 transition-colors">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-gray-400 leading-relaxed">{post.content}</p>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>Читати</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>Коментарі</span>
                    </div>
                  </div>
                  <div className="text-xs text-cyan-400 group-hover:text-cyan-300 transition-colors">Детальніше →</div>
                </CardFooter>
              </Card>
            </Link>
        ))}
      </div>
  )
}

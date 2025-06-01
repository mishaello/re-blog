"use client"

import { useState, useEffect } from "react"
import { createClientClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { User, Calendar, FileText, Edit, Trash2, Eye, Save, Settings, BarChart3 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatDate } from "@/lib/utils"

interface Post {
  id: string
  title: string
  content: string
  image_url?: string
  category?: string
  created_at: string
  updated_at?: string
}

interface Profile {
  id: string
  name: string
  avatar_url: string
  bio?: string
  location?: string
  website?: string
}

interface PostsByYear {
  [year: string]: Post[]
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [postsByYear, setPostsByYear] = useState<PostsByYear>({})
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Форма редагування профілю
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    location: "",
    website: "",
  })

  const supabase = createClientClient()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: session } = await supabase.auth.getSession()

      if (!session.session) {
        router.push("/")
        return
      }

      setUser(session.session.user)
      await loadProfile(session.session.user.id)
      await loadPosts(session.session.user.id)
    } catch (error) {
      console.error("Error checking user:", error)
      toast({
        title: "Помилка",
        description: "Не вдалося завантажити профіль",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error && error.code !== "PGRST116") {
      console.error("Error loading profile:", error)
      return
    }

    if (data) {
      setProfile(data)
      setEditForm({
        name: data.name || "",
        bio: data.bio || "",
        location: data.location || "",
        website: data.website || "",
      })
    }
  }

  const loadPosts = async (userId: string) => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error loading posts:", error)
      return
    }

    if (data) {
      setPosts(data)

      // Групуємо пости по роках
      const grouped = data.reduce((acc: PostsByYear, post) => {
        const year = new Date(post.created_at).getFullYear().toString()
        if (!acc[year]) {
          acc[year] = []
        }
        acc[year].push(post)
        return acc
      }, {})

      setPostsByYear(grouped)

      // Отримуємо унікальні категорії
      const uniqueCategories = [...new Set(data.map((post) => post.category).filter(Boolean))]
      setCategories(uniqueCategories)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        name: editForm.name,
        bio: editForm.bio,
        location: editForm.location,
        website: editForm.website,
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
      })

      if (error) throw error

      await loadProfile(user.id)
      setIsEditing(false)

      toast({
        title: "Успіх!",
        description: "Профіль оновлено успішно",
      })
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "Помилка",
        description: "Не вдалося зберегти профіль",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Ви впевнені, що хочете видалити цю публікацію?")) {
      return
    }

    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId).eq("user_id", user.id)

      if (error) throw error

      await loadPosts(user.id)

      toast({
        title: "Успіх!",
        description: "Публікацію видалено успішно",
      })
    } catch (error) {
      console.error("Error deleting post:", error)
      toast({
        title: "Помилка",
        description: "Не вдалося видалити публікацію",
        variant: "destructive",
      })
    }
  }

  const getFilteredPosts = () => {
    if (selectedCategory === "all") {
      return postsByYear
    }

    const filtered: PostsByYear = {}
    Object.keys(postsByYear).forEach((year) => {
      const yearPosts = postsByYear[year].filter((post) => post.category === selectedCategory)
      if (yearPosts.length > 0) {
        filtered[year] = yearPosts
      }
    })

    return filtered
  }

  const getStats = () => {
    const totalPosts = posts.length
    const totalCategories = categories.length
    const thisYear = new Date().getFullYear().toString()
    const thisYearPosts = postsByYear[thisYear]?.length || 0

    return { totalPosts, totalCategories, thisYearPosts }
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-gray-400">Завантаження профілю...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-gray-400">Необхідно увійти в систему</p>
        </div>
      </div>
    )
  }

  const stats = getStats()
  const filteredPosts = getFilteredPosts()

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold neon-text mb-4">Особистий кабінет</h1>
        <p className="text-gray-400">Керуйте своїм профілем та публікаціями</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="glass border-white/20 grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500/20">
            <BarChart3 className="h-4 w-4 mr-2" />
            Огляд
          </TabsTrigger>
          <TabsTrigger value="posts" className="data-[state=active]:bg-cyan-500/20">
            <FileText className="h-4 w-4 mr-2" />
            Мої пости
          </TabsTrigger>
          <TabsTrigger value="profile" className="data-[state=active]:bg-cyan-500/20">
            <User className="h-4 w-4 mr-2" />
            Профіль
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-cyan-500/20">
            <Settings className="h-4 w-4 mr-2" />
            Налаштування
          </TabsTrigger>
        </TabsList>

        {/* Огляд */}
        <TabsContent value="overview" className="space-y-6">
          {/* Статистика */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card border-white/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-cyan-400 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Всього постів
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.totalPosts}</div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-purple-400 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Цього року
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.thisYearPosts}</div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-pink-400 flex items-center gap-2">
                  <Badge className="h-5 w-5" />
                  Категорій
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.totalCategories}</div>
              </CardContent>
            </Card>
          </div>

          {/* Останні пости */}
          <Card className="glass-card border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Останні публікації</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {posts.slice(0, 5).map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-4 glass rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{post.title}</h3>
                      <p className="text-sm text-gray-400">{formatDate(post.created_at)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/post/${post.id}`}>
                        <Button size="sm" variant="outline" className="glass border-white/20">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/edit/${post.id}`}>
                        <Button size="sm" className="web3-button">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Мої пости */}
        <TabsContent value="posts" className="space-y-6">
          {/* Фільтри */}
          <Card className="glass-card border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Фільтри</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                  className={selectedCategory === "all" ? "web3-button" : "glass border-white/20"}
                >
                  Всі категорії
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category ? "web3-button" : "glass border-white/20"}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Пости по роках */}
          <div className="space-y-8">
            {Object.keys(filteredPosts)
              .sort((a, b) => Number.parseInt(b) - Number.parseInt(a))
              .map((year) => (
                <Card key={year} className="glass-card border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-cyan-400" />
                      {year} рік ({filteredPosts[year].length} постів)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {filteredPosts[year].map((post) => (
                        <div key={post.id} className="glass rounded-lg p-4 space-y-3">
                          {post.image_url && (
                            <div className="relative h-32 overflow-hidden rounded-lg">
                              <Image
                                src={post.image_url || "/placeholder.svg"}
                                alt={post.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}

                          <div>
                            <h3 className="font-medium text-white line-clamp-2">{post.title}</h3>
                            <p className="text-sm text-gray-400 mt-1">{formatDate(post.created_at)}</p>
                            {post.category && (
                              <Badge variant="outline" className="mt-2 border-cyan-400/50 text-cyan-400">
                                {post.category}
                              </Badge>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Link href={`/post/${post.id}`} className="flex-1">
                              <Button size="sm" variant="outline" className="w-full glass border-white/20">
                                <Eye className="h-4 w-4 mr-2" />
                                Переглянути
                              </Button>
                            </Link>
                            <Link href={`/edit/${post.id}`}>
                              <Button size="sm" className="web3-button">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button size="sm" variant="destructive" onClick={() => handleDeletePost(post.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {Object.keys(filteredPosts).length === 0 && (
            <Card className="glass-card border-white/20">
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Немає постів у вибраній категорії</p>
                <Link href="/create">
                  <Button className="web3-button mt-4">Створити перший пост</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Профіль */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="glass-card border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Інформація профілю</CardTitle>
                <Button onClick={() => setIsEditing(!isEditing)} className="web3-button">
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? "Скасувати" : "Редагувати"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 ring-4 ring-cyan-400/50">
                  <AvatarImage src={profile?.avatar_url || user.user_metadata?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white text-2xl">
                    {profile?.name?.[0] || user.email?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>

                {!isEditing ? (
                  <div>
                    <h2 className="text-2xl font-bold text-white">{profile?.name || "Без імені"}</h2>
                    <p className="text-gray-400">{user.email}</p>
                    {profile?.location && <p className="text-sm text-gray-500 mt-1">📍 {profile.location}</p>}
                  </div>
                ) : (
                  <div className="flex-1 space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-white">
                        Ім'я
                      </Label>
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="glass border-white/20 text-white"
                        placeholder="Введіть ваше ім'я"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location" className="text-white">
                        Місцезнаходження
                      </Label>
                      <Input
                        id="location"
                        value={editForm.location}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        className="glass border-white/20 text-white"
                        placeholder="Місто, країна"
                      />
                    </div>
                  </div>
                )}
              </div>

              {!isEditing ? (
                <div className="space-y-4">
                  {profile?.bio && (
                    <div>
                      <h3 className="font-medium text-white mb-2">Про себе</h3>
                      <p className="text-gray-300">{profile.bio}</p>
                    </div>
                  )}

                  {profile?.website && (
                    <div>
                      <h3 className="font-medium text-white mb-2">Веб-сайт</h3>
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300"
                      >
                        {profile.website}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bio" className="text-white">
                      Про себе
                    </Label>
                    <Textarea
                      id="bio"
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      className="glass border-white/20 text-white"
                      placeholder="Розкажіть про себе..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="website" className="text-white">
                      Веб-сайт
                    </Label>
                    <Input
                      id="website"
                      value={editForm.website}
                      onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                      className="glass border-white/20 text-white"
                      placeholder="https://example.com"
                    />
                  </div>

                  <Button onClick={handleSaveProfile} disabled={isSaving} className="web3-button">
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Збереження..." : "Зберегти зміни"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Налаштування */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="glass-card border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Налаштування акаунту</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 glass rounded-lg">
                <div>
                  <h3 className="font-medium text-white">Email</h3>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
                <Button variant="outline" className="glass border-white/20">
                  Змінити
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 glass rounded-lg">
                <div>
                  <h3 className="font-medium text-white">Пароль</h3>
                  <p className="text-sm text-gray-400">Останнє оновлення: невідомо</p>
                </div>
                <Button variant="outline" className="glass border-white/20">
                  Змінити
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 glass rounded-lg border-red-500/20">
                <div>
                  <h3 className="font-medium text-red-400">Видалити акаунт</h3>
                  <p className="text-sm text-gray-400">Це дія незворотна</p>
                </div>
                <Button variant="destructive">Видалити</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

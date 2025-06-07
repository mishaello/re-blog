"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createClientClient } from "@/lib/supabase/client"
import { PenTool, Send, Upload, X, ImageIcon, Tag, Lock, UserIcon } from "lucide-react"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { User } from "@supabase/supabase-js"

// Попередньо визначені категорії
const CATEGORIES = [
  "Новини",
  "Політика",
  "Економіка",
  "Культура",
  "Спорт",
  "Технології",
  "Освіта",
  "Здоров'я",
  "Розваги",
  "Інше",
]

export default function CreatePostPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [customCategory, setCustomCategory] = useState("")
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientClient()

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

  const isAnonymous = user?.app_metadata?.provider === "anonymous"
  const canCreatePost = user && !isAnonymous

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!canCreatePost) {
      toast({
        title: "Помилка",
        description: "Тільки авторизовані користувачі можуть завантажувати зображення",
        variant: "destructive",
      })
      return
    }

    // Перевіряємо тип файлу
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Помилка",
        description: "Будь ласка, оберіть файл зображення",
        variant: "destructive",
      })
      return
    }

    // Перевіряємо розмір файлу (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Помилка",
        description: "Розмір файлу не повинен перевищувати 5MB",
        variant: "destructive",
      })
      return
    }

    setUploadingImage(true)

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        throw new Error("Необхідно увійти в систему")
      }

      // Створюємо унікальне ім'я файлу
      const fileExt = file.name.split(".").pop()
      const fileName = `${session.session.user.id}/${Date.now()}.${fileExt}`

      // Завантажуємо файл до Supabase Storage
      const { data, error } = await supabase.storage.from("post-images").upload(fileName, file)

      if (error) throw error

      // Отримуємо публічний URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("post-images").getPublicUrl(data.path)

      setImageUrl(publicUrl)

      toast({
        title: "Успіх!",
        description: "Зображення завантажено успішно",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Помилка",
        description: "Не вдалося завантажити зображення",
        variant: "destructive",
      })
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = () => {
    setImageUrl("")
  }

  const handleCategoryChange = (value: string) => {
    if (value === "custom") {
      setShowCustomCategory(true)
      setCategory("")
    } else {
      setShowCustomCategory(false)
      setCategory(value)
      setCustomCategory("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canCreatePost) {
      toast({
        title: "Помилка",
        description: "Тільки авторизовані користувачі можуть створювати публікації",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { data: session } = await supabase.auth.getSession()

      if (!session.session || session.session.user.app_metadata?.provider === "anonymous") {
        toast({
          title: "Помилка",
          description: "Необхідно увійти через Google для створення публікації",
          variant: "destructive",
        })
        return
      }

      const finalCategory = showCustomCategory ? customCategory : category

      const { error } = await supabase.from("posts").insert({
        title,
        content,
        category: finalCategory || null,
        image_url: imageUrl || null,
        user_id: session.session.user.id,
      })

      if (error) throw error

      toast({
        title: "Успіх!",
        description: "Публікацію створено успішно",
      })

      router.push("/")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: "Помилка",
        description: "Не вдалося створити публікацію",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="text-gray-400 mt-4">Завантаження...</p>
          </div>
        </div>
    )
  }

  if (!user) {
    return (
        <div className="max-w-3xl mx-auto">
          <Card className="glass-card border-white/20">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Lock className="h-8 w-8 text-red-400" />
                <CardTitle className="text-2xl text-white">Необхідна авторизація</CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                Для створення публікацій необхідно увійти в систему
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-300 mb-6">Увійдіть через Google, щоб почати створювати контент</p>
              <Button onClick={handleSignIn} className="web3-button">
                <UserIcon className="mr-2 h-4 w-4" />
                Увійти через Google
              </Button>
            </CardContent>
          </Card>
        </div>
    )
  }

  if (isAnonymous) {
    return (
        <div className="max-w-3xl mx-auto">
          <Card className="glass-card border-white/20">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Lock className="h-8 w-8 text-yellow-400" />
                <CardTitle className="text-2xl text-white">Обмежений доступ</CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                Анонімні користувачі не можуть створювати публікації
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-300 mb-6">
                Для створення публікацій необхідно увійти через Google. Анонімний доступ дозволяє тільки переглядати та
                коментувати контент.
              </p>
              <Button onClick={handleSignIn} className="web3-button">
                <UserIcon className="mr-2 h-4 w-4" />
                Увійти через Google
              </Button>
            </CardContent>
          </Card>
        </div>
    )
  }

  return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold neon-text mb-4">Створити публікацію</h1>
          <p className="text-gray-400">Поділіться новинами з вашою спільнотою</p>
        </div>

        <Card className="glass-card border-white/20">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <PenTool className="h-8 w-8 text-cyan-400" />
              <CardTitle className="text-2xl text-white">Нова публікація</CardTitle>
            </div>
            <CardDescription className="text-gray-400">Створіть цікавий контент для вашої аудиторії</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white font-medium">
                  Заголовок
                </Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="glass border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-400"
                    placeholder="Введіть заголовок новини..."
                />
              </div>

              {/* Категорія */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-white font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4 text-cyan-400" />
                  Категорія
                </Label>
                <Select onValueChange={handleCategoryChange}>
                  <SelectTrigger className="glass border-white/20 text-white">
                    <SelectValue placeholder="Оберіть категорію" />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/20">
                    {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                    ))}
                    <SelectItem value="custom">Інша категорія...</SelectItem>
                  </SelectContent>
                </Select>

                {showCustomCategory && (
                    <div className="mt-2">
                      <Input
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          className="glass border-white/20 text-white"
                          placeholder="Введіть свою категорію"
                      />
                    </div>
                )}
              </div>

              {/* Завантаження зображення */}
              <div className="space-y-2">
                <Label className="text-white font-medium">Зображення (опціонально)</Label>
                <div className="space-y-4">
                  {imageUrl && (
                      <div className="relative">
                        <Image
                            src={imageUrl || "/placeholder.svg"}
                            alt="Зображення публікації"
                            width={400}
                            height={200}
                            className="rounded-lg object-cover w-full max-h-64"
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                  )}
                  <div className="flex items-center gap-4">
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="glass border-white/20 text-white file:bg-cyan-600 file:text-white file:border-0 file:rounded-md flex-1"
                    />
                    <Button type="button" disabled={uploadingImage} className="web3-button shrink-0">
                      {uploadingImage ? (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Завантаження...</span>
                            <span className="sm:hidden">...</span>
                          </>
                      ) : (
                          <>
                            <ImageIcon className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Завантажити</span>
                            <span className="sm:hidden">Фото</span>
                          </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-white font-medium">
                  Зміст
                </Label>
                <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={12}
                    required
                    className="glass border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-400 resize-none"
                    placeholder="Розкажіть детальніше про новину..."
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="web3-button w-full">
                <Send className="h-4 w-4 mr-2" />
                {isLoading ? "Створення..." : "Опублікувати"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createClientClient } from "@/lib/supabase/client"
import { Edit, Save, Upload, X, ImageIcon, Tag } from "lucide-react"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [customCategory, setCustomCategory] = useState("")
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPost, setIsLoadingPost] = useState(true)
  const [uploadingImage, setUploadingImage] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientClient()

  useEffect(() => {
    loadPost()
  }, [resolvedParams.id])

  const loadPost = async () => {
    try {
      const { data: post, error } = await supabase.from("posts").select("*").eq("id", resolvedParams.id).single()

      if (error) throw error

      // Перевіряємо, чи користувач є автором
      const { data: session } = await supabase.auth.getSession()
      if (!session.session || session.session.user.id !== post.user_id) {
        toast({
          title: "Помилка доступу",
          description: "Ви можете редагувати тільки свої публікації",
          variant: "destructive",
        })
        router.push("/")
        return
      }

      setTitle(post.title)
      setContent(post.content)
      setImageUrl(post.image_url || "")

      // Встановлюємо категорію
      if (post.category) {
        if (CATEGORIES.includes(post.category)) {
          setCategory(post.category)
          setShowCustomCategory(false)
        } else {
          setCategory("custom")
          setCustomCategory(post.category)
          setShowCustomCategory(true)
        }
      }
    } catch (error) {
      console.error("Error loading post:", error)
      toast({
        title: "Помилка",
        description: "Не вдалося завантажити публікацію",
        variant: "destructive",
      })
      router.push("/")
    } finally {
      setIsLoadingPost(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

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
      setCategory("custom")
    } else {
      setShowCustomCategory(false)
      setCategory(value)
      setCustomCategory("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: session } = await supabase.auth.getSession()

      if (!session.session) {
        toast({
          title: "Помилка",
          description: "Ви повинні увійти, щоб редагувати публікацію",
          variant: "destructive",
        })
        return
      }

      const finalCategory = showCustomCategory ? customCategory : category

      const { error } = await supabase
          .from("posts")
          .update({
            title,
            content,
            category: finalCategory || null,
            image_url: imageUrl || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", resolvedParams.id)
          .eq("user_id", session.session.user.id)

      if (error) throw error

      toast({
        title: "Успіх!",
        description: "Публікацію оновлено успішно",
      })

      router.push(`/post/${resolvedParams.id}`)
    } catch (error) {
      console.error(error)
      toast({
        title: "Помилка",
        description: "Не вдалося оновити публікацію",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingPost) {
    return (
        <div className="max-w-3xl mx-auto">
          <div className="glass-card rounded-2xl p-8 text-center">
            <p className="text-gray-400">Завантаження...</p>
          </div>
        </div>
    )
  }

  return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold neon-text mb-4">Редагувати публікацію</h1>
          <p className="text-gray-400">Оновіть інформацію про вашу новину</p>
        </div>

        <Card className="glass-card border-white/20">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Edit className="h-8 w-8 text-cyan-400" />
              <CardTitle className="text-2xl text-white">Редагування</CardTitle>
            </div>
            <CardDescription className="text-gray-400">Внесіть зміни до вашої публікації</CardDescription>
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
                <Select value={category} onValueChange={handleCategoryChange}>
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
                <Label className="text-white font-medium">Зображення</Label>
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
            <CardFooter className="flex gap-4">
              <Button type="submit" disabled={isLoading} className="web3-button flex-1">
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Збереження..." : "Зберегти зміни"}
              </Button>
              <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="glass border-white/20 text-white hover:bg-white/10"
              >
                Скасувати
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
  )
}

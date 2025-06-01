import PostList from "@/components/post-list"
import CategoryFilter from "@/components/category-filter"
import { createServerClient } from "@/lib/supabase/server"
import { Sparkles, TrendingUp, Users } from "lucide-react"

interface PageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function Home({ searchParams }: PageProps) {
  try {
    const resolvedSearchParams = await searchParams
    const selectedCategory = resolvedSearchParams.category

    const supabase = await createServerClient()

    // Отримуємо пости з фільтром по категорії
    let query = supabase.from("posts").select("*, category").order("created_at", { ascending: false }).limit(10)

    if (selectedCategory && selectedCategory !== "all") {
      query = query.eq("category", selectedCategory)
    }

    const { data: posts, error } = await query

    if (error) {
      console.error("Error fetching posts:", error)
    }

    // Отримуємо всі категорії для фільтра
    const { data: categories } = await supabase
        .from("posts")
        .select("category")
        .not("category", "is", null)
        .not("category", "eq", "")

    const uniqueCategories = [...new Set(categories?.map((c) => c.category) || [])]

    // Отримуємо профілі для постів
    let postsWithProfiles = []
    if (posts && posts.length > 0) {
      const userIds = [...new Set(posts.map((post) => post.user_id))]
      const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*").in("id", userIds)

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError)
      }

      // Об'єднуємо дані
      postsWithProfiles = posts.map((post) => ({
        ...post,
        profiles: profiles?.find((profile) => profile.id === post.user_id) || null,
      }))
    }

    return (
        <div className="space-y-12">
          {/* Hero Section */}
          <section className="text-center space-y-6 py-12">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold neon-text animate-float">Місцеві Новини</h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
                Сучасний портал новин із дизайном у стилі Blade Runner. Найактуальніші події вашого міста в
                інноваційному та футуристичному форматі.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
              <div className="glass-card rounded-2xl p-6 animate-glow">
                <div className="flex items-center justify-center space-x-3">
                  <TrendingUp className="h-8 w-8 text-cyan-400"/>
                  <div>
                    <div
                        className="text-2xl font-bold text-white blade-runner-text">{postsWithProfiles?.length || 0}</div>
                    <div className="text-sm text-gray-400">Активних постів</div>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6 animate-glow delay-200">
                <div className="flex items-center justify-center space-x-3">
                  <Users className="h-8 w-8 text-purple-400"/>
                  <div>
                    <div className="text-2xl font-bold text-white cyberpunk-text">24/7</div>
                    <div className="text-sm text-gray-400">Онлайн спільнота</div>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6 animate-glow delay-400">
                <div className="flex items-center justify-center space-x-3">
                  <Sparkles className="h-8 w-8 text-pink-400"/>
                  <div>
                    <div className="text-2xl font-bold neon-pulse-text">Blade Runner</div>
                    <div className="text-sm text-gray-400">Сучасний дизайн</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Posts Section */}
          <section className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                {selectedCategory && selectedCategory !== "all" ? `Новини: ${selectedCategory}` : "Останні Новини"}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto rounded-full"></div>
            </div>

            {/* Category Filter */}
            <CategoryFilter categories={uniqueCategories} selectedCategory={selectedCategory}/>

            <PostList posts={postsWithProfiles}/>
          </section>
        </div>
    )
  } catch (error) {
    console.error("Error in Home component:", error)
    return (
        <div className="space-y-12">
          <section className="text-center space-y-6 py-12">
            <h1 className="text-5xl md:text-7xl font-bold neon-text animate-float">Місцеві Новини</h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">Сучасний портал новин з Web3 дизайном</p>
          </section>

          <section className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Останні Новини
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto rounded-full"></div>
            </div>

            <div className="glass-card rounded-2xl p-8 text-center">
              <p className="text-gray-400 text-lg">Помилка завантаження постів</p>
              <p className="text-gray-500 text-sm mt-2">Спробуйте оновити сторінку</p>
            </div>
          </section>
        </div>
    )
  }
}

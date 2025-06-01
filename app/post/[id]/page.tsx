import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import PostDetail from "@/components/post-detail"
import CommentSection from "@/components/comment-section"

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params

  try {
    const supabase = await createServerClient()

    // Перевіряємо, чи ID є валідним UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(resolvedParams.id)) {
      notFound()
    }

    // Отримуємо пост
    const { data: post, error: postError } = await supabase
        .from("posts")
        .select("*")
        .eq("id", resolvedParams.id)
        .single()

    if (postError || !post) {
      if (postError?.code === "PGRST116") {
        notFound()
      }
      throw postError
    }

    // Отримуємо профіль автора
    let profile = null
    if (post.user_id) {
      const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", post.user_id)
          .single()

      if (!profileError) {
        profile = profileData
      }
    }

    // Об'єднуємо дані
    const postWithProfile = {
      ...post,
      profiles: profile,
    }

    // Отримуємо коментарі
    const { data: comments, error: commentsError } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", resolvedParams.id)
        .order("created_at", { ascending: true })

    // Отримуємо профілі авторів коментарів
    let commentsWithProfiles = comments || []
    if (comments && comments.length > 0) {
      const commentUserIds = [...new Set(comments.map((comment) => comment.user_id))]
      const { data: commentProfiles, error: commentProfilesError } = await supabase
          .from("profiles")
          .select("*")
          .in("id", commentUserIds)

      if (!commentProfilesError) {
        commentsWithProfiles = comments.map((comment) => ({
          ...comment,
          profiles: commentProfiles?.find((profile) => profile.id === comment.user_id) || null,
        }))
      }
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
          <PostDetail post={postWithProfile} />
          <CommentSection postId={resolvedParams.id} comments={commentsWithProfiles} />
        </div>
    )
  } catch (error) {
    console.error("Error loading post:", error)

    if (error && typeof error === "object" && "code" in error && error.code === "PGRST116") {
      notFound()
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl p-8 text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Помилка завантаження</h1>
            <p className="text-gray-400">Не вдалося завантажити публікацію. Спробуйте пізніше.</p>
          </div>
        </div>
    )
  }
}

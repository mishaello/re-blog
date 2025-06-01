import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import PostDetail from "@/components/post-detail"
import CommentSection from "@/components/comment-section"

export default async function PostPage({ params }: { params: { id: string } }) {
  const supabase = await createServerClient()

  const { data: post } = await supabase
    .from("posts")
    .select("*, profiles(name, avatar_url)")
    .eq("id", params.id)
    .single()

  if (!post) {
    notFound()
  }

  const { data: comments } = await supabase
    .from("comments")
    .select("*, profiles(name, avatar_url)")
    .eq("post_id", params.id)
    .order("created_at", { ascending: true })

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <PostDetail post={post} />
      <CommentSection postId={params.id} comments={comments || []} />
    </div>
  )
}

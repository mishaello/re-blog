import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")

    if (code) {
      const supabase = await createServerClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Auth callback error:", error)
      }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(requestUrl.origin)
  } catch (error) {
    console.error("Auth callback error:", error)
    return NextResponse.redirect(new URL(request.url).origin)
  }
}

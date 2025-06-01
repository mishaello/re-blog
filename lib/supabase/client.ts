import { createBrowserClient } from "@supabase/ssr"

export function createClientClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

// Додаємо функцію для тестування підключення
export async function testConnection() {
  const supabase = createClientClient()

  try {
    const { data, error } = await supabase.from("posts").select("count", { count: "exact" })
    console.log("Connection test - posts count:", data)
    console.log("Connection test - error:", error)
    return { success: !error, data, error }
  } catch (err) {
    console.error("Connection test failed:", err)
    return { success: false, error: err }
  }
}

import { createServerClient as createClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createServerClient() {
  const cookieStore = await cookies()

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value
      },
      set(name, value, options) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // Ignore cookie set errors in production/static generation
          console.warn("Cookie set error (ignored):", error)
        }
      },
      remove(name, options) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          // Ignore cookie remove errors in production/static generation
          console.warn("Cookie remove error (ignored):", error)
        }
      },
    },
  })
}

// Альтернативний клієнт тільки для читання (для серверних компонентів)
export async function createReadOnlyServerClient() {
  const cookieStore = await cookies()

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value
      },
      set() {
        // Нічого не робимо
      },
      remove() {
        // Нічого не робимо
      },
    },
  })
}

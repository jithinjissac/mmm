import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies"

// Create a Supabase client for server-side usage
export function createServerComponentClient(cookieStore?: ReadonlyRequestCookies) {
  const cookieJar = cookieStore || cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL or Anon Key is missing")
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true, // Enable session persistence
      detectSessionInUrl: false, // Disable detecting session in URL to avoid conflicts
      autoRefreshToken: true, // Enable auto refresh token
    },
    cookies: {
      get(name: string) {
        return cookieJar.get(name)?.value
      },
      set(
        name: string,
        value: string,
        options: { path: string; maxAge: number; domain?: string; sameSite?: string; secure?: boolean },
      ) {
        try {
          cookieJar.set({ name, value, ...options })
        } catch (error) {
          // This can happen in middleware when cookies are read-only
          console.warn(`Warning: Could not set cookie ${name}`, error)
        }
      },
      remove(name: string, options: { path: string; domain?: string; sameSite?: string; secure?: boolean }) {
        try {
          cookieJar.set({ name, value: "", ...options, maxAge: 0 })
        } catch (error) {
          // This can happen in middleware when cookies are read-only
          console.warn(`Warning: Could not remove cookie ${name}`, error)
        }
      },
    },
  })
}

// Create a Supabase admin client for server-side operations that require admin privileges
export function createServerAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase URL or Service Role Key is missing")
  }

  return createServerClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

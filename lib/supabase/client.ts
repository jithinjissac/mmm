"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/lib/database.types"

// Use a global variable to store the client instance
let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClientSupabaseClient() {
  // Only create a new client if one doesn't exist already
  if (!supabaseClient) {
    supabaseClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            try {
              // Parse cookies from document.cookie
              const cookies = document.cookie.split("; ").reduce(
                (acc, cookie) => {
                  if (!cookie) return acc
                  const [key, value] = cookie.split("=")
                  if (key && value) {
                    acc[key] = decodeURIComponent(value)
                  }
                  return acc
                },
                {} as Record<string, string>,
              )
              return cookies[name]
            } catch (error) {
              console.error("Error parsing cookie:", error)
              return undefined
            }
          },
          set(
            name: string,
            value: string,
            options: { path?: string; domain?: string; maxAge?: number; secure?: boolean },
          ) {
            try {
              // Format the cookie string
              let cookie = `${name}=${encodeURIComponent(value)}`

              if (options.path) {
                cookie += `; path=${options.path}`
              }

              if (options.maxAge) {
                cookie += `; max-age=${options.maxAge}`
              }

              if (options.domain) {
                cookie += `; domain=${options.domain}`
              }

              if (options.secure) {
                cookie += "; secure"
              }

              // Set the cookie
              document.cookie = cookie
            } catch (error) {
              console.error("Error setting cookie:", error)
            }
          },
          remove(name: string, options: { path?: string; domain?: string }) {
            try {
              // To remove a cookie, set its expiration date to the past
              let cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`

              if (options.path) {
                cookie += `; path=${options.path}`
              }

              if (options.domain) {
                cookie += `; domain=${options.domain}`
              }

              document.cookie = cookie
            } catch (error) {
              console.error("Error removing cookie:", error)
            }
          },
        },
      },
    )
  }

  return supabaseClient
}

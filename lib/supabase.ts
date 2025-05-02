import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

// Environment variables with fallbacks and validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ygypemphggafipiijnbr.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Validate required configuration
if (!supabaseUrl) {
  console.error("NEXT_PUBLIC_SUPABASE_URL is not defined")
}

if (!supabaseAnonKey) {
  console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined")
}

// Simple client for browser usage with better error handling
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: async (url, options = {}) => {
      try {
        // Add a timeout to prevent hanging requests
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

        // Create new options with updated headers and signal
        const updatedOptions = {
          ...options,
          signal: controller.signal,
        }

        // Log the request in development
        if (process.env.NODE_ENV === "development") {
          console.log(`Supabase request to: ${url.toString().split("?")[0]}`)
        }

        // Make the request
        const response = await fetch(url, updatedOptions)

        // Clear the timeout
        clearTimeout(timeoutId)

        return response
      } catch (error: any) {
        console.error("Error in Supabase fetch:", error.message || "Unknown error")

        // Return a valid response object for errors
        return new Response(
          JSON.stringify({
            error: "Network error",
            details: error.message || "Unknown error",
            url: url.toString(),
          }),
          { status: 500 },
        )
      }
    },
  },
})

// Server client with cookies
export function createServerSupabase() {
  try {
    const cookieStore = cookies()

    return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // This can happen in middleware when cookies are read-only
            console.warn(`Could not set cookie ${name}`, error)
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: "", ...options, maxAge: 0 })
          } catch (error) {
            // This can happen in middleware when cookies are read-only
            console.warn(`Could not remove cookie ${name}`, error)
          }
        },
      },
    })
  } catch (error) {
    console.error("Error creating server Supabase client:", error)
    throw new Error(
      `Failed to initialize server Supabase client: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}

// Admin client for server operations that need elevated privileges
export const adminSupabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Health check function to test Supabase connection
export async function checkSupabaseHealth() {
  try {
    const { data, error } = await supabase.from("profiles").select("count").limit(1)

    if (error) {
      return {
        status: "error",
        message: error.message,
        details: error,
      }
    }

    return {
      status: "ok",
      message: "Supabase connection successful",
      data,
    }
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
      error,
    }
  }
}

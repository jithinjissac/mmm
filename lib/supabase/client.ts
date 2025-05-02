"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/lib/database.types"

// Singleton pattern to ensure we only create one client
let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null
let clientInitAttempts = 0
const MAX_INIT_ATTEMPTS = 3

export const createClientSupabaseClient = () => {
  // If we already have a client, return it
  if (supabaseClient) {
    return supabaseClient
  }

  // Prevent infinite retry loops
  if (clientInitAttempts >= MAX_INIT_ATTEMPTS) {
    throw new Error("Maximum Supabase client initialization attempts reached")
  }

  clientInitAttempts++

  try {
    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase environment variables are missing")
    }

    // Create a new client
    supabaseClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)

    // Validate the client
    if (!supabaseClient) {
      throw new Error("Failed to create Supabase client")
    }

    // Reset attempt counter on success
    clientInitAttempts = 0

    return supabaseClient
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    // If we can't create a client, throw an error
    throw error
  }
}

// Function to check if Supabase is reachable
export async function checkSupabaseConnection() {
  try {
    const supabase = createClientSupabaseClient()
    // Try a simple query to check connection
    const { error } = await supabase.from("profiles").select("id").limit(1)

    return !error
  } catch (error) {
    console.error("Supabase connection check failed:", error)
    return false
  }
}

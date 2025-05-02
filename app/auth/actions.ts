"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import type { Database } from "@/lib/database.types"

// Session durations
const SESSION_DURATIONS = {
  DEFAULT: 60 * 60, // 1 hour in seconds
  EXTENDED: 60 * 60 * 24 * 30, // 30 days in seconds
}

export async function signInWithEmail(email: string, password: string, rememberMe = false) {
  const supabase = createServerActionClient<Database>({ cookies })

  // Set session expiration based on "Remember me" checkbox
  const expiresIn = rememberMe ? SESSION_DURATIONS.EXTENDED : SESSION_DURATIONS.DEFAULT

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        expiresIn,
      },
    })

    if (error) {
      return { error: error.message, success: false }
    }

    // Get user role from profile
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()

    revalidatePath("/dashboard")
    return { success: true, role: profile?.role }
  } catch (error: any) {
    return { error: error.message || "An unexpected error occurred", success: false }
  }
}

export async function signUpWithEmail(email: string, password: string, fullName: string, role: string) {
  const supabase = createServerActionClient<Database>({ cookies })

  try {
    // Create the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    })

    if (error) {
      return { error: error.message, success: false }
    }

    // Create profile if user was created
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: fullName,
        role,
      })

      if (profileError) {
        return { error: profileError.message, success: false }
      }
    }

    revalidatePath("/dashboard")
    return { success: true, role }
  } catch (error: any) {
    return { error: error.message || "An unexpected error occurred", success: false }
  }
}

export async function signOut() {
  const supabase = createServerActionClient<Database>({ cookies })

  try {
    await supabase.auth.signOut()
    revalidatePath("/")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "An unexpected error occurred", success: false }
  }
}

export async function getCurrentUser() {
  const supabase = createServerActionClient<Database>({ cookies })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { user: null, profile: null }
    }

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

    return { user: session.user, profile }
  } catch (error) {
    console.error("Error getting current user:", error)
    return { user: null, profile: null }
  }
}

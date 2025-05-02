"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import type { Database } from "@/lib/database.types"
import { saveUserToLocalStorage, saveProfileToLocalStorage } from "@/lib/auth/fallback-auth"
import { CircuitBreaker } from "@/lib/utils/circuit-breaker"

// Create a circuit breaker for auth operations
const authCircuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  resetTimeout: 30000,
  fallbackFunction: async () => {
    console.error("Auth service circuit breaker triggered - using fallback")
    return null
  },
})

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single()

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Error fetching profile:", profileError)
    }

    // Save to local storage for offline access
    if (typeof window !== "undefined") {
      saveUserToLocalStorage(data.user)
      if (profile) {
        saveProfileToLocalStorage(data.user.id, profile)
      }
    }

    return { success: true, user: data.user, profile }
  } catch (error) {
    console.error("Sign in error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("fullName") as string
  const role = (formData.get("role") as string) || "tenant"
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        data: {
          full_name: fullName,
          role,
        },
      },
    })

    if (error) {
      return { error: error.message }
    }

    // Create profile
    if (data.user) {
      const adminClient = createAdminSupabaseClient()
      const { error: profileError } = await adminClient.from("profiles").insert({
        id: data.user.id,
        email,
        full_name: fullName,
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        console.error("Error creating profile:", profileError)
      }
    }

    return { success: true, user: data.user }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function getSession() {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    return await authCircuitBreaker.execute(() => supabase.auth.getSession())
  } catch (error) {
    console.error("Error getting session:", error)
    return { data: { session: null }, error }
  }
}

export async function getUserProfile() {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return { profile: null, error: new Error("User not authenticated") }
    }

    const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

    if (error) {
      throw error
    }

    return { profile, error: null }
  } catch (error) {
    console.error("Error getting user profile:", error)
    return { profile: null, error }
  }
}

export async function signOut() {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    await supabase.auth.signOut()
    return { error: null }
  } catch (error) {
    console.error("Error signing out:", error)
    return { error }
  }
}

export async function requireAuth() {
  const {
    data: { session },
  } = await getSession()

  if (!session) {
    redirect("/signin")
  }

  return session
}

export async function requireRole(allowedRoles: string[]) {
  const session = await requireAuth()

  const supabase = createServerComponentClient<Database>({ cookies })
  const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (error || !profile) {
    console.error("Error getting user role:", error)
    redirect("/signin")
  }

  if (!allowedRoles.includes(profile.role)) {
    redirect("/dashboard")
  }

  return { session, role: profile.role }
}

export async function createUserProfile(userId: string, email: string, fullName: string, role: string) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email,
        full_name: fullName,
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return { profile: data, error: null }
  } catch (error) {
    console.error("Error creating user profile:", error)
    return { profile: null, error }
  }
}

export async function updateUserProfile(
  userId: string,
  profileData: Partial<Database["public"]["Tables"]["profiles"]["Update"]>,
) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Add updated_at timestamp
    const dataWithTimestamp = {
      ...profileData,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("profiles").update(dataWithTimestamp).eq("id", userId).select().single()

    if (error) {
      throw error
    }

    return { profile: data, error: null }
  } catch (error) {
    console.error("Error updating user profile:", error)
    return { profile: null, error }
  }
}

export async function getUserRole() {
  try {
    const {
      data: { session },
    } = await getSession()

    if (!session?.user) {
      return { role: null, error: new Error("User not authenticated") }
    }

    const supabase = createServerComponentClient<Database>({ cookies })
    const { data, error } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (error) {
      throw error
    }

    return { role: data.role, error: null }
  } catch (error) {
    console.error("Error getting user role:", error)
    return { role: null, error }
  }
}

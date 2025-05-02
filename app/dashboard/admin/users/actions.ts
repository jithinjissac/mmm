"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"
import { revalidatePath } from "next/cache"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export async function getUsers(role?: string, search?: string) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { users: [], error: "You must be logged in to view users" }
    }

    // Get user role
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // Only admins can access this function
    if (userProfile?.role !== "admin") {
      return { users: [], error: "You don't have permission to view users" }
    }

    // Get users with their profiles
    let query = supabase.from("profiles").select("*")

    // Apply filters
    if (role) {
      query = query.eq("role", role)
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Order by created_at
    query = query.order("created_at", { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error("Error fetching users:", error)
      return { users: [], error: error.message }
    }

    return { users: data, error: null }
  } catch (error) {
    console.error("Error in getUsers action:", error)
    return { users: [], error: "An unexpected error occurred" }
  }
}

export async function getUserById(userId: string) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { user: null, error: "You must be logged in to view user details" }
    }

    // Get user role
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // Only admins can access this function
    if (userProfile?.role !== "admin") {
      return { user: null, error: "You don't have permission to view user details" }
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (profileError) {
      console.error("Error fetching user profile:", profileError)
      return { user: null, error: profileError.message }
    }

    // Get user auth data
    const adminClient = createAdminSupabaseClient()
    const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(userId)

    if (userError) {
      console.error("Error fetching user auth data:", userError)
      return { user: null, error: userError.message }
    }

    return { user: { ...profile, auth: userData.user }, error: null }
  } catch (error) {
    console.error("Error in getUserById action:", error)
    return { user: null, error: "An unexpected error occurred" }
  }
}

export async function createUser(formData: FormData) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { error: "You must be logged in to create users" }
    }

    // Get user role
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // Only admins can access this function
    if (userProfile?.role !== "admin") {
      return { error: "You don't have permission to create users" }
    }

    // Extract form data
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const fullName = formData.get("fullName") as string
    const role = formData.get("role") as string
    const phone = formData.get("phone") as string

    // Validate required fields
    if (!email || !password || !fullName || !role) {
      return { error: "Please fill in all required fields" }
    }

    // Create user with admin client
    const adminClient = createAdminSupabaseClient()
    const { data: userData, error: userError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role,
      },
    })

    if (userError) {
      console.error("Error creating user:", userError)
      return { error: userError.message }
    }

    // Create profile
    const { error: profileError } = await adminClient.from("profiles").insert({
      id: userData.user.id,
      email,
      full_name: fullName,
      role,
      phone: phone || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error("Error creating profile:", profileError)
      return { error: profileError.message }
    }

    // Revalidate the users page
    revalidatePath("/dashboard/admin/users")

    return { success: true }
  } catch (error) {
    console.error("Error in createUser action:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function updateUser(userId: string, formData: FormData) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { error: "You must be logged in to update users" }
    }

    // Get user role
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // Only admins can access this function
    if (userProfile?.role !== "admin") {
      return { error: "You don't have permission to update users" }
    }

    // Extract form data
    const fullName = formData.get("fullName") as string
    const role = formData.get("role") as string
    const phone = formData.get("phone") as string
    const password = formData.get("password") as string

    // Validate required fields
    if (!fullName || !role) {
      return { error: "Please fill in all required fields" }
    }

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        role,
        phone: phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (profileError) {
      console.error("Error updating user profile:", profileError)
      return { error: profileError.message }
    }

    // Update user metadata
    const adminClient = createAdminSupabaseClient()
    const { error: userError } = await adminClient.auth.admin.updateUserById(userId, {
      user_metadata: {
        full_name: fullName,
        role,
      },
    })

    if (userError) {
      console.error("Error updating user metadata:", userError)
      return { error: userError.message }
    }

    // Update password if provided
    if (password) {
      const { error: passwordError } = await adminClient.auth.admin.updateUserById(userId, {
        password,
      })

      if (passwordError) {
        console.error("Error updating user password:", passwordError)
        return { error: passwordError.message }
      }
    }

    // Revalidate the user pages
    revalidatePath(`/dashboard/admin/users/${userId}`)
    revalidatePath("/dashboard/admin/users")

    return { success: true }
  } catch (error) {
    console.error("Error in updateUser action:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function deleteUser(userId: string) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { error: "You must be logged in to delete users" }
    }

    // Get user role
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // Only admins can access this function
    if (userProfile?.role !== "admin") {
      return { error: "You don't have permission to delete users" }
    }

    // Delete user
    const adminClient = createAdminSupabaseClient()
    const { error: userError } = await adminClient.auth.admin.deleteUser(userId)

    if (userError) {
      console.error("Error deleting user:", userError)
      return { error: userError.message }
    }

    // Revalidate the users page
    revalidatePath("/dashboard/admin/users")

    return { success: true }
  } catch (error) {
    console.error("Error in deleteUser action:", error)
    return { error: "An unexpected error occurred" }
  }
}

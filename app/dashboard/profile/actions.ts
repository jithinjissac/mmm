"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"
import { revalidatePath } from "next/cache"

export async function updateUserProfile(formData: FormData) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { error: "You must be logged in to update your profile" }
    }

    // Extract form data
    const fullName = formData.get("fullName") as string
    const phone = formData.get("phone") as string

    // Validate required fields
    if (!fullName) {
      return { error: "Please provide your full name" }
    }

    // Update profile
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone: phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id)

    if (error) {
      console.error("Error updating profile:", error)
      return { error: error.message }
    }

    // Revalidate the profile page
    revalidatePath("/dashboard/profile")

    return { success: true }
  } catch (error) {
    console.error("Error in updateUserProfile action:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function changePassword(formData: FormData) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { error: "You must be logged in to change your password" }
    }

    // Extract form data
    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return { error: "Please fill in all password fields" }
    }

    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
      return { error: "New password and confirm password do not match" }
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return { error: "Password must be at least 8 characters long" }
    }

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      console.error("Error changing password:", error)
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in changePassword action:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function getUserProfile() {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { profile: null, error: "You must be logged in to view your profile" }
    }

    // Get user profile
    const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

    if (error) {
      console.error("Error fetching profile:", error)
      return { profile: null, error: error.message }
    }

    return { profile, error: null }
  } catch (error) {
    console.error("Error in getUserProfile action:", error)
    return { profile: null, error: "An unexpected error occurred" }
  }
}

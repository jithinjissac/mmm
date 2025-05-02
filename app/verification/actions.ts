"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import type { Database } from "@/lib/database.types"

export async function getVerificationStatus() {
  const supabase = createServerActionClient<Database>({ cookies })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { error: "Not authenticated", success: false }
    }

    const { data, error } = await supabase.from("verifications").select("*").eq("user_id", session.user.id).single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned"
      console.error("Database error:", error)
      return { error: error.message, success: false }
    }

    // If no verification record exists, create one
    if (!data) {
      const { data: newVerification, error: insertError } = await supabase
        .from("verifications")
        .insert({
          user_id: session.user.id,
          status: "unverified",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (insertError) {
        console.error("Insert error:", insertError)
        return { error: insertError.message, success: false }
      }

      return { verification: newVerification, success: true }
    }

    return { verification: data, success: true }
  } catch (error: any) {
    console.error("Error getting verification status:", error)
    return { error: error.message || "Failed to get verification status", success: false }
  }
}

export async function submitVerification(
  idFrontUrl: string | null,
  idBackUrl: string | null,
  selfieUrl: string | null,
) {
  const supabase = createServerActionClient<Database>({ cookies })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { error: "Not authenticated", success: false }
    }

    // Check if verification record exists
    const { data: existingVerification } = await supabase
      .from("verifications")
      .select("id")
      .eq("user_id", session.user.id)
      .single()

    const now = new Date().toISOString()

    if (existingVerification) {
      // Update existing verification
      const { data, error } = await supabase
        .from("verifications")
        .update({
          status: "pending",
          id_front_url: idFrontUrl,
          id_back_url: idBackUrl,
          selfie_url: selfieUrl,
          submitted_at: now,
          updated_at: now,
        })
        .eq("id", existingVerification.id)
        .select()
        .single()

      if (error) {
        console.error("Update error:", error)
        return { error: error.message, success: false }
      }

      revalidatePath("/verification")
      return { verification: data, success: true }
    } else {
      // Create new verification
      const { data, error } = await supabase
        .from("verifications")
        .insert({
          user_id: session.user.id,
          status: "pending",
          id_front_url: idFrontUrl,
          id_back_url: idBackUrl,
          selfie_url: selfieUrl,
          submitted_at: now,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single()

      if (error) {
        console.error("Insert error:", error)
        return { error: error.message, success: false }
      }

      revalidatePath("/verification")
      return { verification: data, success: true }
    }
  } catch (error: any) {
    console.error("Error submitting verification:", error)
    return { error: error.message || "Failed to submit verification", success: false }
  }
}

export async function uploadVerificationImage(base64Image: string, documentType: string) {
  const supabase = createServerActionClient<Database>({ cookies })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { error: "Not authenticated", success: false }
    }

    // Convert base64 to blob
    const base64Data = base64Image.split(",")[1]
    const byteCharacters = atob(base64Data)
    const byteArrays = []

    for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
      const slice = byteCharacters.slice(offset, offset + 1024)
      const byteNumbers = new Array(slice.length)
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      byteArrays.push(byteArray)
    }

    const blob = new Blob(byteArrays, { type: "image/png" })

    const userId = session.user.id
    const fileName = `${userId}-${documentType}-${Date.now()}.png`
    const filePath = `${userId}/${fileName}` // Simplified path structure

    console.log("Uploading to path:", filePath)

    const { data, error } = await supabase.storage.from("verification-documents").upload(filePath, blob, {
      contentType: "image/png",
      cacheControl: "3600",
      upsert: true, // Changed to true to overwrite existing files
    })

    if (error) {
      console.error("Storage error:", error)
      return { error: error.message, success: false }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("verification-documents").getPublicUrl(data.path)

    return { url: publicUrl, success: true }
  } catch (error: any) {
    console.error("Error uploading document:", error)
    return { error: error.message || "Failed to upload document", success: false }
  }
}

export async function approveVerification(verificationId: string) {
  const supabase = createServerActionClient<Database>({ cookies })

  try {
    // Check if user is admin
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { error: "Not authenticated", success: false }
    }

    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (!userProfile || userProfile.role !== "admin") {
      return { error: "Unauthorized", success: false }
    }

    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from("verifications")
      .update({
        status: "verified",
        verified_at: now,
        updated_at: now,
      })
      .eq("id", verificationId)
      .select()
      .single()

    if (error) {
      console.error("Update error:", error)
      return { error: error.message, success: false }
    }

    revalidatePath("/dashboard/admin/verifications")
    return { verification: data, success: true }
  } catch (error: any) {
    console.error("Error approving verification:", error)
    return { error: error.message || "Failed to approve verification", success: false }
  }
}

export async function rejectVerification(verificationId: string, reason: string) {
  const supabase = createServerActionClient<Database>({ cookies })

  try {
    // Check if user is admin
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { error: "Not authenticated", success: false }
    }

    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (!userProfile || userProfile.role !== "admin") {
      return { error: "Unauthorized", success: false }
    }

    const { data, error } = await supabase
      .from("verifications")
      .update({
        status: "rejected",
        rejection_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", verificationId)
      .select()
      .single()

    if (error) {
      console.error("Update error:", error)
      return { error: error.message, success: false }
    }

    revalidatePath("/dashboard/admin/verifications")
    return { verification: data, success: true }
  } catch (error: any) {
    console.error("Error rejecting verification:", error)
    return { error: error.message || "Failed to reject verification", success: false }
  }
}

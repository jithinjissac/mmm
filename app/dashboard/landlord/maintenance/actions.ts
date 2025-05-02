"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"
import { revalidatePath } from "next/cache"

export async function assignMaintenanceRequest(requestId: string, formData: FormData) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { error: "You must be logged in to assign a maintenance request" }
    }

    // Get maintenance request to check access
    const { data: maintenanceRequest, error: requestError } = await supabase
      .from("maintenance_requests")
      .select(`
        properties(landlord_id)
      `)
      .eq("id", requestId)
      .single()

    if (requestError) {
      console.error("Error fetching maintenance request:", requestError)
      return { error: requestError.message }
    }

    // Get user role
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // Check if user has permission to assign this maintenance request
    const isAdmin = userProfile?.role === "admin"
    const isLandlord = maintenanceRequest.properties.landlord_id === session.user.id

    if (!isAdmin && !isLandlord) {
      return { error: "You don't have permission to assign this maintenance request" }
    }

    // Extract form data
    const assignedToId = formData.get("assignedToId") as string
    const scheduledDate = formData.get("scheduledDate") as string
    const notes = formData.get("notes") as string

    // Validate required fields
    if (!assignedToId) {
      return { error: "Please select a maintenance staff to assign" }
    }

    // Update maintenance request
    const { error } = await supabase
      .from("maintenance_requests")
      .update({
        assigned_to_id: assignedToId,
        scheduled_date: scheduledDate || null,
        notes: notes || null,
        status: "assigned",
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)

    if (error) {
      console.error("Error assigning maintenance request:", error)
      return { error: error.message }
    }

    // Revalidate the maintenance request pages
    revalidatePath(`/dashboard/landlord/maintenance/${requestId}`)
    revalidatePath("/dashboard/landlord/maintenance")

    return { success: true }
  } catch (error) {
    console.error("Error in assignMaintenanceRequest action:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function updateMaintenanceRequestStatus(requestId: string, formData: FormData) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { error: "You must be logged in to update a maintenance request" }
    }

    // Get maintenance request to check access
    const { data: maintenanceRequest, error: requestError } = await supabase
      .from("maintenance_requests")
      .select(`
        tenant_id,
        assigned_to_id,
        properties(landlord_id)
      `)
      .eq("id", requestId)
      .single()

    if (requestError) {
      console.error("Error fetching maintenance request:", requestError)
      return { error: requestError.message }
    }

    // Get user role
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // Check if user has permission to update this maintenance request
    const isAdmin = userProfile?.role === "admin"
    const isLandlord = maintenanceRequest.properties.landlord_id === session.user.id
    const isMaintenance = maintenanceRequest.assigned_to_id === session.user.id

    if (!isAdmin && !isLandlord && !isMaintenance) {
      return { error: "You don't have permission to update this maintenance request" }
    }

    // Extract form data
    const status = formData.get("status") as string
    const notes = formData.get("notes") as string
    const completedDate = formData.get("completedDate") as string
    const resolution = formData.get("resolution") as string

    // Validate required fields
    if (!status) {
      return { error: "Please select a status" }
    }

    // If status is completed, require resolution
    if (status === "completed" && !resolution) {
      return { error: "Please provide a resolution for the completed request" }
    }

    // Update maintenance request
    const { error } = await supabase
      .from("maintenance_requests")
      .update({
        status,
        notes: notes || null,
        completed_date: status === "completed" ? completedDate || new Date().toISOString() : null,
        resolution: status === "completed" ? resolution : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)

    if (error) {
      console.error("Error updating maintenance request status:", error)
      return { error: error.message }
    }

    // Revalidate the maintenance request pages
    revalidatePath(`/dashboard/landlord/maintenance/${requestId}`)
    revalidatePath("/dashboard/landlord/maintenance")
    revalidatePath(`/dashboard/tenant/maintenance/${requestId}`)
    revalidatePath("/dashboard/tenant/maintenance")
    revalidatePath(`/dashboard/maintenance/details/${requestId}`)

    return { success: true }
  } catch (error) {
    console.error("Error in updateMaintenanceRequestStatus action:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function getMaintenanceStaff() {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { staff: [], error: "You must be logged in to view maintenance staff" }
    }

    // Get user role
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // Only landlords and admins can view maintenance staff
    if (userProfile?.role !== "landlord" && userProfile?.role !== "admin") {
      return { staff: [], error: "You don't have permission to view maintenance staff" }
    }

    // Get maintenance staff
    const { data, error } = await supabase.from("profiles").select("id, full_name, email").eq("role", "maintenance")

    if (error) {
      console.error("Error fetching maintenance staff:", error)
      return { staff: [], error: error.message }
    }

    return { staff: data, error: null }
  } catch (error) {
    console.error("Error in getMaintenanceStaff action:", error)
    return { staff: [], error: "An unexpected error occurred" }
  }
}

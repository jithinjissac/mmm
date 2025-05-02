"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createMaintenanceRequest(formData: FormData) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { error: "You must be logged in to create a maintenance request" }
    }

    // Get user role
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (!userProfile) {
      return { error: "User profile not found" }
    }

    // Extract form data
    const propertyId = formData.get("propertyId") as string
    const roomId = formData.get("roomId") as string
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const priority = formData.get("priority") as string

    // Validate required fields
    if (!propertyId || !title || !description || !priority) {
      return { error: "Please fill in all required fields" }
    }

    // Create maintenance request
    const { data: maintenanceRequest, error } = await supabase
      .from("maintenance_requests")
      .insert({
        property_id: propertyId,
        room_id: roomId || null,
        tenant_id: session.user.id,
        title,
        description,
        priority,
        status: "new",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating maintenance request:", error)
      return { error: error.message }
    }

    // Revalidate the maintenance requests page
    revalidatePath("/dashboard/tenant/maintenance")

    // Redirect to the new maintenance request page
    redirect(`/dashboard/tenant/maintenance/${maintenanceRequest.id}`)
  } catch (error) {
    console.error("Error in createMaintenanceRequest action:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function updateMaintenanceRequest(requestId: string, formData: FormData) {
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
    const isTenant = maintenanceRequest.tenant_id === session.user.id

    if (!isAdmin && !isLandlord && !isMaintenance && !isTenant) {
      return { error: "You don't have permission to update this maintenance request" }
    }

    // Extract form data
    const description = formData.get("description") as string
    const status = formData.get("status") as string

    // Tenants can only update description and cancel their own requests
    if (isTenant && !isAdmin && !isLandlord && !isMaintenance) {
      if (status && status !== "cancelled") {
        return { error: "Tenants can only cancel maintenance requests" }
      }

      const { error } = await supabase
        .from("maintenance_requests")
        .update({
          description,
          status: status === "cancelled" ? "cancelled" : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId)

      if (error) {
        console.error("Error updating maintenance request:", error)
        return { error: error.message }
      }
    } else {
      // Admins, landlords, and maintenance staff can update more fields
      const title = formData.get("title") as string
      const priority = formData.get("priority") as string
      const assignedToId = formData.get("assignedToId") as string
      const scheduledDate = formData.get("scheduledDate") as string
      const notes = formData.get("notes") as string
      const completedDate = formData.get("completedDate") as string
      const resolution = formData.get("resolution") as string

      const { error } = await supabase
        .from("maintenance_requests")
        .update({
          title: title || undefined,
          description,
          priority: priority || undefined,
          status,
          assigned_to_id: assignedToId || undefined,
          scheduled_date: scheduledDate || undefined,
          notes: notes || undefined,
          completed_date: completedDate || undefined,
          resolution: resolution || undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId)

      if (error) {
        console.error("Error updating maintenance request:", error)
        return { error: error.message }
      }
    }

    // Revalidate the maintenance request pages
    revalidatePath(`/dashboard/tenant/maintenance/${requestId}`)
    revalidatePath("/dashboard/tenant/maintenance")
    revalidatePath(`/dashboard/landlord/maintenance/${requestId}`)
    revalidatePath("/dashboard/landlord/maintenance")
    revalidatePath(`/dashboard/maintenance/details/${requestId}`)

    return { success: true }
  } catch (error) {
    console.error("Error in updateMaintenanceRequest action:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function getMaintenanceRequests() {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { requests: [], error: "You must be logged in to view maintenance requests" }
    }

    // Get user role
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (!userProfile) {
      return { requests: [], error: "User profile not found" }
    }

    let query = supabase.from("maintenance_requests").select(`
      *,
      properties(name, address, landlord_id),
      rooms(name),
      assigned_to(full_name),
      tenant:tenant_id(full_name)
    `)

    // Filter based on user role
    if (userProfile.role === "tenant") {
      // Tenants can only see their own requests
      query = query.eq("tenant_id", session.user.id)
    } else if (userProfile.role === "landlord") {
      // Landlords can see requests for their properties
      query = query.eq("properties.landlord_id", session.user.id)
    } else if (userProfile.role === "maintenance") {
      // Maintenance staff can see requests assigned to them
      query = query.eq("assigned_to_id", session.user.id)
    }
    // Admins can see all requests

    const { data, error } = await query

    if (error) {
      console.error("Error fetching maintenance requests:", error)
      return { requests: [], error: error.message }
    }

    return { requests: data, error: null }
  } catch (error) {
    console.error("Error in getMaintenanceRequests action:", error)
    return { requests: [], error: "An unexpected error occurred" }
  }
}

export async function getMaintenanceRequest(requestId: string) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { request: null, error: "You must be logged in to view maintenance request details" }
    }

    // Get maintenance request with related data
    const { data: maintenanceRequest, error } = await supabase
      .from("maintenance_requests")
      .select(`
        *,
        properties(*, landlord_id),
        rooms(name),
        assigned_to(full_name, email),
        tenant:tenant_id(full_name, email)
      `)
      .eq("id", requestId)
      .single()

    if (error) {
      console.error("Error fetching maintenance request:", error)
      return { request: null, error: error.message }
    }

    // Get user role
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // Check if user has access to this maintenance request
    if (
      userProfile?.role !== "admin" &&
      maintenanceRequest.tenant_id !== session.user.id &&
      maintenanceRequest.assigned_to_id !== session.user.id &&
      maintenanceRequest.properties.landlord_id !== session.user.id
    ) {
      return { request: null, error: "You don't have permission to view this maintenance request" }
    }

    return { request: maintenanceRequest, error: null }
  } catch (error) {
    console.error("Error in getMaintenanceRequest action:", error)
    return { request: null, error: "An unexpected error occurred" }
  }
}

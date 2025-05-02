"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { Database } from "@/lib/database.types"

type PropertyData = Database["public"]["Tables"]["properties"]["Insert"]
type MaintenanceData = Database["public"]["Tables"]["maintenance_requests"]["Insert"]

export async function getLandlordDashboardData() {
  const supabase = createServerSupabaseClient()

  // Get the current user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/signin")
  }

  const userId = session.user.id

  try {
    // Get properties
    const { data: properties, error: propertiesError } = await supabase
      .from("properties")
      .select("*")
      .eq("landlord_id", userId)
      .order("created_at", { ascending: false })

    if (propertiesError) throw propertiesError

    // Get maintenance requests
    const { data: maintenanceRequests, error: maintenanceError } = await supabase
      .from("maintenance_requests")
      .select(`
        *,
        properties!inner(id, name, address, landlord_id),
        tenant:tenant_id(id, full_name, email),
        assigned_to(id, full_name, email)
      `)
      .eq("properties.landlord_id", userId)
      .order("created_at", { ascending: false })

    if (maintenanceError) throw maintenanceError

    // Get tenants
    const { data: tenants, error: tenantsError } = await supabase
      .from("tenants")
      .select(`
        *,
        user:user_id(id, full_name, email, avatar_url),
        room:room_id(id, name, property_id),
        room:room_id(property:property_id(id, name, landlord_id))
      `)
      .eq("room.property.landlord_id", userId)
      .order("created_at", { ascending: false })

    if (tenantsError) throw tenantsError

    // Get reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select(`
        *,
        reviewer:reviewer_id(id, full_name, avatar_url),
        property:property_id(id, name)
      `)
      .eq("reviewee_id", userId)
      .order("created_at", { ascending: false })

    if (reviewsError) throw reviewsError

    // Get payments
    const { data: payments, error: paymentsError } = await supabase
      .from("bill_shares")
      .select(`
        *,
        bill:bill_id(id, title, category, due_date, total_amount),
        tenant:tenant_id(id, full_name, email)
      `)
      .eq("bill.created_by", userId)
      .order("created_at", { ascending: false })

    if (paymentsError) throw paymentsError

    // Calculate stats
    const totalProperties = properties.length
    const availableProperties = properties.filter((p) => p.status === "available").length
    const totalTenants = tenants.length
    const pendingMaintenanceRequests = maintenanceRequests.filter(
      (r) => r.status === "reported" || r.status === "scheduled",
    ).length
    const pendingPayments = payments.filter((p) => !p.is_paid).length

    // Calculate average rating
    let averageRating = 0
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
      averageRating = totalRating / reviews.length
    }

    return {
      properties,
      maintenanceRequests,
      tenants,
      reviews,
      payments,
      stats: {
        totalProperties,
        availableProperties,
        totalTenants,
        pendingMaintenanceRequests,
        pendingPayments,
        averageRating,
      },
    }
  } catch (error) {
    console.error("Error fetching landlord dashboard data:", error)
    throw new Error("Failed to fetch dashboard data")
  }
}

export async function createProperty(formData: FormData) {
  const supabase = createServerSupabaseClient()

  // Get the current user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/signin")
  }

  const userId = session.user.id

  try {
    const name = formData.get("name") as string
    const address = formData.get("address") as string
    const city = formData.get("city") as string
    const postcode = formData.get("postcode") as string
    const propertyType = formData.get("property_type") as PropertyData["property_type"]
    const description = formData.get("description") as string
    const amenitiesString = formData.get("amenities") as string
    const amenities = amenitiesString.split(",").map((item) => item.trim())
    const monthlyIncome = Number.parseFloat(formData.get("monthly_income") as string)

    const propertyData: PropertyData = {
      landlord_id: userId,
      name,
      address,
      city,
      postcode,
      property_type: propertyType,
      description,
      amenities,
      monthly_income: monthlyIncome,
      status: "available",
    }

    const { data, error } = await supabase.from("properties").insert(propertyData).select()

    if (error) throw error

    revalidatePath("/dashboard/landlord")
    revalidatePath("/dashboard/landlord/properties")

    return { success: true, data }
  } catch (error) {
    console.error("Error creating property:", error)
    return { success: false, error: "Failed to create property" }
  }
}

export async function updateProperty(propertyId: string, formData: FormData) {
  const supabase = createServerSupabaseClient()

  // Get the current user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/signin")
  }

  try {
    const name = formData.get("name") as string
    const address = formData.get("address") as string
    const city = formData.get("city") as string
    const postcode = formData.get("postcode") as string
    const propertyType = formData.get("property_type") as PropertyData["property_type"]
    const description = formData.get("description") as string
    const amenitiesString = formData.get("amenities") as string
    const amenities = amenitiesString.split(",").map((item) => item.trim())
    const monthlyIncome = Number.parseFloat(formData.get("monthly_income") as string)
    const status = formData.get("status") as string

    const propertyData: Partial<PropertyData> = {
      name,
      address,
      city,
      postcode,
      property_type: propertyType,
      description,
      amenities,
      monthly_income: monthlyIncome,
      status,
    }

    const { data, error } = await supabase.from("properties").update(propertyData).eq("id", propertyId).select()

    if (error) throw error

    revalidatePath("/dashboard/landlord")
    revalidatePath("/dashboard/landlord/properties")
    revalidatePath(`/dashboard/landlord/properties/${propertyId}`)

    return { success: true, data }
  } catch (error) {
    console.error("Error updating property:", error)
    return { success: false, error: "Failed to update property" }
  }
}

export async function deleteProperty(propertyId: string) {
  const supabase = createServerSupabaseClient()

  // Get the current user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/signin")
  }

  try {
    const { error } = await supabase.from("properties").delete().eq("id", propertyId)

    if (error) throw error

    revalidatePath("/dashboard/landlord")
    revalidatePath("/dashboard/landlord/properties")

    return { success: true }
  } catch (error) {
    console.error("Error deleting property:", error)
    return { success: false, error: "Failed to delete property" }
  }
}

export async function createMaintenanceRequest(formData: FormData) {
  const supabase = createServerSupabaseClient()

  // Get the current user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/signin")
  }

  const userId = session.user.id

  try {
    const propertyId = formData.get("property_id") as string
    const roomId = (formData.get("room_id") as string) || null
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as MaintenanceData["category"]
    const priority = formData.get("priority") as MaintenanceData["priority"]

    const maintenanceData: MaintenanceData = {
      property_id: propertyId,
      room_id: roomId,
      landlord_id: userId,
      title,
      description,
      category,
      priority,
      status: "reported",
      reported_date: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("maintenance_requests").insert(maintenanceData).select()

    if (error) throw error

    revalidatePath("/dashboard/landlord")
    revalidatePath("/dashboard/landlord/maintenance")

    return { success: true, data }
  } catch (error) {
    console.error("Error creating maintenance request:", error)
    return { success: false, error: "Failed to create maintenance request" }
  }
}

export async function updateMaintenanceRequest(requestId: string, formData: FormData) {
  const supabase = createServerSupabaseClient()

  // Get the current user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/signin")
  }

  try {
    const status = formData.get("status") as MaintenanceData["status"]
    const assignedToId = (formData.get("assigned_to") as string) || null
    const notes = (formData.get("notes") as string) || null
    const scheduledDate = (formData.get("scheduled_date") as string) || null

    const updateData: Partial<MaintenanceData> = {
      status,
      assigned_to: assignedToId,
      notes,
      scheduled_date: scheduledDate,
    }

    // If status is completed, add completed date
    if (status === "completed") {
      updateData.completed_date = new Date().toISOString()
    }

    const { data, error } = await supabase.from("maintenance_requests").update(updateData).eq("id", requestId).select()

    if (error) throw error

    revalidatePath("/dashboard/landlord")
    revalidatePath("/dashboard/landlord/maintenance")
    revalidatePath(`/dashboard/landlord/maintenance/${requestId}`)

    return { success: true, data }
  } catch (error) {
    console.error("Error updating maintenance request:", error)
    return { success: false, error: "Failed to update maintenance request" }
  }
}

export async function getCredibilityScore(userId: string) {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase.from("credibility").select("*").eq("user_id", userId).single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Error fetching credibility score:", error)
    return { success: false, error: "Failed to fetch credibility score" }
  }
}

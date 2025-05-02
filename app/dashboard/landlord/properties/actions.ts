"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"
import { revalidatePath } from "next/cache"

export async function createProperty(formData: FormData) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { error: "You must be logged in to create a property" }
    }

    // Get user role
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (userProfile?.role !== "landlord" && userProfile?.role !== "admin") {
      return { error: "Only landlords and admins can create properties" }
    }

    // Extract form data
    const name = formData.get("name") as string
    const address = formData.get("address") as string
    const city = formData.get("city") as string
    const postcode = formData.get("postcode") as string
    const propertyType = formData.get("property_type") as string // Changed from propertyType to match form field name
    const description = formData.get("description") as string
    const amenitiesString = formData.get("amenities") as string
    const monthlyIncome = Number.parseFloat(formData.get("monthly_income") as string) || null // Changed from monthlyIncome to match form field name

    // Validate required fields
    if (!name || !address || !city || !postcode || !propertyType) {
      return { error: "Please fill in all required fields" }
    }

    // Parse amenities
    const amenities = amenitiesString ? amenitiesString.split(",").map((a) => a.trim()) : null

    // Create property
    const { data: property, error } = await supabase
      .from("properties")
      .insert({
        landlord_id: session.user.id,
        name,
        address,
        city,
        postcode,
        property_type: propertyType as any,
        description: description || null,
        amenities,
        monthly_income: monthlyIncome,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating property:", error)
      return { error: error.message }
    }

    // Revalidate the properties page
    revalidatePath("/dashboard/landlord/properties")

    // Return success with the property ID instead of redirecting
    return { success: true, propertyId: property.id }
  } catch (error) {
    console.error("Error in createProperty action:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function updateProperty(propertyId: string, formData: FormData) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { error: "You must be logged in to update a property" }
    }

    // Get property to check ownership
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("landlord_id")
      .eq("id", propertyId)
      .single()

    if (propertyError) {
      console.error("Error fetching property:", propertyError)
      return { error: propertyError.message }
    }

    // Get user role
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // Check if user has permission to update this property
    if (userProfile?.role !== "admin" && property.landlord_id !== session.user.id) {
      return { error: "You don't have permission to update this property" }
    }

    // Extract form data
    const name = formData.get("name") as string
    const address = formData.get("address") as string
    const city = formData.get("city") as string
    const postcode = formData.get("postcode") as string
    const propertyType = formData.get("property_type") as string // Changed from propertyType to match form field name
    const description = formData.get("description") as string
    const amenitiesString = formData.get("amenities") as string
    const monthlyIncome = Number.parseFloat(formData.get("monthly_income") as string) || null // Changed from monthlyIncome to match form field name
    const status = formData.get("status") as string

    // Validate required fields
    if (!name || !address || !city || !postcode || !propertyType) {
      return { error: "Please fill in all required fields" }
    }

    // Parse amenities
    const amenities = amenitiesString ? amenitiesString.split(",").map((a) => a.trim()) : null

    // Update property
    const { error } = await supabase
      .from("properties")
      .update({
        name,
        address,
        city,
        postcode,
        property_type: propertyType as any,
        description: description || null,
        amenities,
        monthly_income: monthlyIncome,
        status: status || "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", propertyId)

    if (error) {
      console.error("Error updating property:", error)
      return { error: error.message }
    }

    // Revalidate the property pages
    revalidatePath(`/dashboard/landlord/properties/${propertyId}`)
    revalidatePath("/dashboard/landlord/properties")

    return { success: true, propertyId }
  } catch (error) {
    console.error("Error in updateProperty action:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function deleteProperty(propertyId: string) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { error: "You must be logged in to delete a property" }
    }

    // Get property to check ownership
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("landlord_id")
      .eq("id", propertyId)
      .single()

    if (propertyError) {
      console.error("Error fetching property:", propertyError)
      return { error: propertyError.message }
    }

    // Get user role
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // Check if user has permission to delete this property
    if (userProfile?.role !== "admin" && property.landlord_id !== session.user.id) {
      return { error: "You don't have permission to delete this property" }
    }

    // Delete property (this will cascade delete related rooms and images)
    const { error } = await supabase.from("properties").delete().eq("id", propertyId)

    if (error) {
      console.error("Error deleting property:", error)
      return { error: error.message }
    }

    // Revalidate the properties page
    revalidatePath("/dashboard/landlord/properties")

    // Return success instead of redirecting
    return { success: true }
  } catch (error) {
    console.error("Error in deleteProperty action:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function getProperties() {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { properties: [], error: "You must be logged in to view properties" }
    }

    // Get user role
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    let query = supabase.from("properties").select(`
      *,
      property_images(*)
    `)

    // Filter properties based on user role
    if (userProfile?.role === "landlord") {
      query = query.eq("landlord_id", session.user.id)
    } else if (userProfile?.role !== "admin" && userProfile?.role !== "maintenance") {
      return { properties: [], error: "You don't have permission to view properties" }
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching properties:", error)
      return { properties: [], error: error.message }
    }

    return { properties: data, error: null }
  } catch (error) {
    console.error("Error in getProperties action:", error)
    return { properties: [], error: "An unexpected error occurred" }
  }
}

export async function getProperty(propertyId: string) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { property: null, error: "You must be logged in to view property details" }
    }

    // Get property with images and rooms
    const { data: property, error } = await supabase
      .from("properties")
      .select(`
        *,
        property_images(*),
        rooms(*, room_images(*))
      `)
      .eq("id", propertyId)
      .single()

    if (error) {
      console.error("Error fetching property:", error)
      return { property: null, error: error.message }
    }

    // Get user role
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // Check if user has access to this property
    if (
      userProfile?.role !== "admin" &&
      userProfile?.role !== "maintenance" &&
      property.landlord_id !== session.user.id
    ) {
      return { property: null, error: "You don't have permission to view this property" }
    }

    return { property, error: null }
  } catch (error) {
    console.error("Error in getProperty action:", error)
    return { property: null, error: "An unexpected error occurred" }
  }
}

"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Database } from "@/lib/database.types"

type Property = Database["public"]["Tables"]["properties"]["Insert"]
type PropertyImage = Database["public"]["Tables"]["property_images"]["Insert"]

export async function getProperties() {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    throw new Error("Not authenticated")
  }

  try {
    // Use a simpler query to avoid RLS policy recursion
    const { data: properties, error } = await supabase
      .from("properties")
      .select(`
        id,
        landlord_id,
        name,
        address,
        city,
        postcode,
        property_type,
        description,
        amenities,
        monthly_income,
        status,
        created_at,
        updated_at,
        property_images (
          id,
          url,
          is_primary
        ),
        rooms:rooms (
          id,
          name,
          status,
          rent
        )
      `)
      .eq("landlord_id", session.user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching properties:", error)
      throw new Error("Failed to fetch properties")
    }

    return properties
  } catch (error) {
    console.error("Error in getProperties:", error)
    throw new Error("Failed to fetch properties")
  }
}

export async function getProperty(id: string) {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    throw new Error("Not authenticated")
  }

  try {
    // Use a simpler query to avoid RLS policy recursion
    const { data: property, error } = await supabase
      .from("properties")
      .select(`
        id,
        landlord_id,
        name,
        address,
        city,
        postcode,
        property_type,
        description,
        amenities,
        monthly_income,
        status,
        created_at,
        updated_at,
        property_images (
          id,
          url,
          is_primary
        ),
        rooms:rooms (
          id,
          name,
          room_type,
          max_occupants,
          rent,
          deposit,
          status,
          description,
          created_at,
          updated_at,
          room_images (
            id,
            url,
            is_primary
          )
        )
      `)
      .eq("id", id)
      .eq("landlord_id", session.user.id)
      .single()

    if (error) {
      console.error("Error fetching property:", error)
      throw new Error("Failed to fetch property")
    }

    return property
  } catch (error) {
    console.error("Error in getProperty:", error)
    throw new Error("Failed to fetch property")
  }
}

// Keep the rest of the functions unchanged
export async function createProperty(property: Property, images: PropertyImage[]) {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    throw new Error("Not authenticated")
  }

  // Insert the property
  const { data: newProperty, error: propertyError } = await supabase
    .from("properties")
    .insert({
      ...property,
      landlord_id: session.user.id,
    })
    .select()
    .single()

  if (propertyError) {
    console.error("Error creating property:", propertyError)
    throw new Error("Failed to create property")
  }

  // Insert the property images
  if (images.length > 0) {
    const propertyImages = images.map((image) => ({
      ...image,
      property_id: newProperty.id,
    }))

    const { error: imagesError } = await supabase.from("property_images").insert(propertyImages)

    if (imagesError) {
      console.error("Error adding property images:", imagesError)
      throw new Error("Failed to add property images")
    }
  }

  revalidatePath("/dashboard/landlord/properties")
  return newProperty
}

export async function updateProperty(id: string, property: Partial<Property>) {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    throw new Error("Not authenticated")
  }

  const { data: updatedProperty, error } = await supabase
    .from("properties")
    .update(property)
    .eq("id", id)
    .eq("landlord_id", session.user.id)
    .select()
    .single()

  if (error) {
    console.error("Error updating property:", error)
    throw new Error("Failed to update property")
  }

  revalidatePath(`/dashboard/landlord/properties/${id}`)
  revalidatePath("/dashboard/landlord/properties")
  return updatedProperty
}

export async function deleteProperty(id: string) {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    throw new Error("Not authenticated")
  }

  const { error } = await supabase.from("properties").delete().eq("id", id).eq("landlord_id", session.user.id)

  if (error) {
    console.error("Error deleting property:", error)
    throw new Error("Failed to delete property")
  }

  revalidatePath("/dashboard/landlord/properties")
  return { success: true }
}

export async function addPropertyImage(propertyId: string, imageUrl: string, isPrimary = false) {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    throw new Error("Not authenticated")
  }

  // Verify ownership
  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("id")
    .eq("id", propertyId)
    .eq("landlord_id", session.user.id)
    .single()

  if (propertyError || !property) {
    console.error("Error verifying property ownership:", propertyError)
    throw new Error("Property not found or you don't have permission")
  }

  // If this is the primary image, update all other images to not be primary
  if (isPrimary) {
    await supabase.from("property_images").update({ is_primary: false }).eq("property_id", propertyId)
  }

  const { data: image, error } = await supabase
    .from("property_images")
    .insert({
      property_id: propertyId,
      url: imageUrl,
      is_primary: isPrimary,
    })
    .select()
    .single()

  if (error) {
    console.error("Error adding property image:", error)
    throw new Error("Failed to add property image")
  }

  revalidatePath(`/dashboard/landlord/properties/${propertyId}`)
  return image
}

export async function deletePropertyImage(id: string, propertyId: string) {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    throw new Error("Not authenticated")
  }

  // Verify ownership
  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("id")
    .eq("id", propertyId)
    .eq("landlord_id", session.user.id)
    .single()

  if (propertyError || !property) {
    console.error("Error verifying property ownership:", propertyError)
    throw new Error("Property not found or you don't have permission")
  }

  const { error } = await supabase.from("property_images").delete().eq("id", id)

  if (error) {
    console.error("Error deleting property image:", error)
    throw new Error("Failed to delete property image")
  }

  revalidatePath(`/dashboard/landlord/properties/${propertyId}`)
  return { success: true }
}

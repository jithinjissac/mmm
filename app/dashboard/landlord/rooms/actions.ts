"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createRoom(formData: FormData) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { error: "You must be logged in to create a room" }
    }

    // Extract form data
    const propertyId = formData.get("propertyId") as string
    const name = formData.get("name") as string
    const roomType = formData.get("roomType") as string
    const maxOccupants = Number.parseInt(formData.get("maxOccupants") as string) || 1
    const rent = Number.parseFloat(formData.get("rent") as string)
    const deposit = Number.parseFloat(formData.get("deposit") as string)
    const status = (formData.get("status") as string) || "vacant"
    const description = formData.get("description") as string

    // Validate required fields
    if (!propertyId || !name || !roomType || isNaN(rent) || isNaN(deposit)) {
      return { error: "Please fill in all required fields" }
    }

    // Check if user owns the property
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

    // Check if user has permission to add a room to this property
    if (userProfile?.role !== "admin" && property.landlord_id !== session.user.id) {
      return { error: "You don't have permission to add rooms to this property" }
    }

    // Create room
    const { data: room, error } = await supabase
      .from("rooms")
      .insert({
        property_id: propertyId,
        name,
        room_type: roomType as any,
        max_occupants: maxOccupants,
        rent,
        deposit,
        status: status as any,
        description: description || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating room:", error)
      return { error: error.message }
    }

    // Revalidate the rooms page and property page
    revalidatePath(`/dashboard/landlord/properties/${propertyId}`)
    revalidatePath("/dashboard/landlord/rooms")

    // Redirect to the new room page
    redirect(`/dashboard/landlord/rooms/${room.id}`)
  } catch (error) {
    console.error("Error in createRoom action:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function updateRoom(roomId: string, formData: FormData) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { error: "You must be logged in to update a room" }
    }

    // Get room to check ownership
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select(`
        property_id,
        properties(landlord_id)
      `)
      .eq("id", roomId)
      .single()

    if (roomError) {
      console.error("Error fetching room:", roomError)
      return { error: roomError.message }
    }

    // Get user role
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // Check if user has permission to update this room
    if (userProfile?.role !== "admin" && room.properties.landlord_id !== session.user.id) {
      return { error: "You don't have permission to update this room" }
    }

    // Extract form data
    const name = formData.get("name") as string
    const roomType = formData.get("roomType") as string
    const maxOccupants = Number.parseInt(formData.get("maxOccupants") as string) || 1
    const rent = Number.parseFloat(formData.get("rent") as string)
    const deposit = Number.parseFloat(formData.get("deposit") as string)
    const status = formData.get("status") as string
    const description = formData.get("description") as string

    // Validate required fields
    if (!name || !roomType || isNaN(rent) || isNaN(deposit)) {
      return { error: "Please fill in all required fields" }
    }

    // Update room
    const { error } = await supabase
      .from("rooms")
      .update({
        name,
        room_type: roomType as any,
        max_occupants: maxOccupants,
        rent,
        deposit,
        status: status as any,
        description: description || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", roomId)

    if (error) {
      console.error("Error updating room:", error)
      return { error: error.message }
    }

    // Revalidate the room pages and property page
    revalidatePath(`/dashboard/landlord/rooms/${roomId}`)
    revalidatePath(`/dashboard/landlord/properties/${room.property_id}`)
    revalidatePath("/dashboard/landlord/rooms")

    return { success: true }
  } catch (error) {
    console.error("Error in updateRoom action:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function deleteRoom(roomId: string) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { error: "You must be logged in to delete a room" }
    }

    // Get room to check ownership
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select(`
        property_id,
        properties(landlord_id)
      `)
      .eq("id", roomId)
      .single()

    if (roomError) {
      console.error("Error fetching room:", roomError)
      return { error: roomError.message }
    }

    // Get user role
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // Check if user has permission to delete this room
    if (userProfile?.role !== "admin" && room.properties.landlord_id !== session.user.id) {
      return { error: "You don't have permission to delete this room" }
    }

    // Delete room (this will cascade delete related images)
    const { error } = await supabase.from("rooms").delete().eq("id", roomId)

    if (error) {
      console.error("Error deleting room:", error)
      return { error: error.message }
    }

    // Revalidate the rooms page and property page
    revalidatePath(`/dashboard/landlord/properties/${room.property_id}`)
    revalidatePath("/dashboard/landlord/rooms")

    // Redirect to the rooms list
    redirect("/dashboard/landlord/rooms")
  } catch (error) {
    console.error("Error in deleteRoom action:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function getRooms(propertyId?: string) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { rooms: [], error: "You must be logged in to view rooms" }
    }

    // Get user role
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    let query = supabase.from("rooms").select(`
      *,
      room_images(*),
      properties(name, address, landlord_id)
    `)

    // Filter by property if provided
    if (propertyId) {
      query = query.eq("property_id", propertyId)
    }

    // If user is a landlord, only show rooms for their properties
    if (userProfile?.role === "landlord") {
      // First get the landlord's properties
      const { data: properties } = await supabase.from("properties").select("id").eq("landlord_id", session.user.id)

      if (properties && properties.length > 0) {
        const propertyIds = properties.map((p) => p.id)
        query = query.in("property_id", propertyIds)
      } else {
        // Landlord has no properties, return empty array
        return { rooms: [], error: null }
      }
    } else if (userProfile?.role !== "admin" && userProfile?.role !== "maintenance") {
      // Only landlords, admins, and maintenance staff can view rooms
      return { rooms: [], error: "You don't have permission to view rooms" }
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching rooms:", error)
      return { rooms: [], error: error.message }
    }

    return { rooms: data, error: null }
  } catch (error) {
    console.error("Error in getRooms action:", error)
    return { rooms: [], error: "An unexpected error occurred" }
  }
}

export async function getRoom(roomId: string) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { room: null, error: "You must be logged in to view room details" }
    }

    // Get room with images
    const { data: room, error } = await supabase
      .from("rooms")
      .select(`
        *,
        room_images(*),
        properties(*, landlord_id)
      `)
      .eq("id", roomId)
      .single()

    if (error) {
      console.error("Error fetching room:", error)
      return { room: null, error: error.message }
    }

    // Get user role
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // Check if user has access to this room
    if (
      userProfile?.role !== "admin" &&
      userProfile?.role !== "maintenance" &&
      room.properties.landlord_id !== session.user.id
    ) {
      return { room: null, error: "You don't have permission to view this room" }
    }

    return { room, error: null }
  } catch (error) {
    console.error("Error in getRoom action:", error)
    return { room: null, error: "An unexpected error occurred" }
  }
}

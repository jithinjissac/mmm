"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Database } from "@/lib/database.types"

type Room = Database["public"]["Tables"]["rooms"]["Insert"]
type RoomImage = Database["public"]["Tables"]["room_images"]["Insert"]

export async function getRooms(propertyId?: string) {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    throw new Error("Not authenticated")
  }

  try {
    // First get the properties owned by the user
    const { data: properties, error: propertiesError } = await supabase
      .from("properties")
      .select("id")
      .eq("landlord_id", session.user.id)

    if (propertiesError) {
      console.error("Error fetching user properties:", propertiesError)
      throw new Error("Failed to fetch user properties")
    }

    const propertyIds = properties.map((p) => p.id)

    if (propertyIds.length === 0) {
      // User has no properties, return empty array
      return []
    }

    let query = supabase
      .from("rooms")
      .select(`
        id,
        property_id,
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
        ),
        properties:property_id (
          id,
          name,
          address,
          city,
          postcode
        )
      `)
      .in("property_id", propertyIds)
      .order("created_at", { ascending: false })

    // If propertyId is provided, filter by property
    if (propertyId) {
      query = query.eq("property_id", propertyId)
    }

    const { data: rooms, error } = await query

    if (error) {
      console.error("Error fetching rooms:", error)
      throw new Error("Failed to fetch rooms")
    }

    return rooms
  } catch (error) {
    console.error("Error in getRooms:", error)
    throw new Error("Failed to fetch rooms")
  }
}

export async function getRoom(id: string) {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    throw new Error("Not authenticated")
  }

  try {
    // First verify the user owns the property that contains this room
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select(`
        id,
        property_id,
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
        ),
        properties:property_id (
          id,
          name,
          address,
          city,
          postcode,
          landlord_id
        )
      `)
      .eq("id", id)
      .single()

    if (roomError) {
      console.error("Error fetching room:", roomError)
      throw new Error("Failed to fetch room")
    }

    // Verify ownership
    if (room.properties.landlord_id !== session.user.id) {
      throw new Error("You don't have permission to view this room")
    }

    return room
  } catch (error) {
    console.error("Error in getRoom:", error)
    throw new Error("Failed to fetch room")
  }
}

// Keep the rest of the functions unchanged
export async function createRoom(room: Room, images: RoomImage[]) {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    throw new Error("Not authenticated")
  }

  // Verify the user owns the property
  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("landlord_id")
    .eq("id", room.property_id)
    .single()

  if (propertyError || !property) {
    console.error("Error verifying property ownership:", propertyError)
    throw new Error("Property not found or you don't have permission")
  }

  if (property.landlord_id !== session.user.id) {
    throw new Error("You don't have permission to add rooms to this property")
  }

  // Insert the room
  const { data: newRoom, error: roomError } = await supabase.from("rooms").insert(room).select().single()

  if (roomError) {
    console.error("Error creating room:", roomError)
    throw new Error("Failed to create room")
  }

  // Insert the room images
  if (images.length > 0) {
    const roomImages = images.map((image) => ({
      ...image,
      room_id: newRoom.id,
    }))

    const { error: imagesError } = await supabase.from("room_images").insert(roomImages)

    if (imagesError) {
      console.error("Error adding room images:", imagesError)
      throw new Error("Failed to add room images")
    }
  }

  revalidatePath(`/dashboard/landlord/properties/${room.property_id}`)
  revalidatePath("/dashboard/landlord/rooms")
  return newRoom
}

export async function updateRoom(id: string, room: Partial<Room>) {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    throw new Error("Not authenticated")
  }

  // Verify the user owns the property
  const { data: existingRoom, error: roomError } = await supabase
    .from("rooms")
    .select("property_id")
    .eq("id", id)
    .single()

  if (roomError || !existingRoom) {
    console.error("Error fetching room:", roomError)
    throw new Error("Room not found")
  }

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("landlord_id")
    .eq("id", existingRoom.property_id)
    .single()

  if (propertyError || !property) {
    console.error("Error verifying property ownership:", propertyError)
    throw new Error("Property not found")
  }

  if (property.landlord_id !== session.user.id) {
    throw new Error("You don't have permission to update this room")
  }

  // Update the room
  const { data: updatedRoom, error } = await supabase
    .from("rooms")
    .update({
      ...room,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating room:", error)
    throw new Error("Failed to update room")
  }

  revalidatePath(`/dashboard/landlord/properties/${existingRoom.property_id}`)
  revalidatePath(`/dashboard/landlord/rooms/${id}`)
  revalidatePath("/dashboard/landlord/rooms")
  return updatedRoom
}

export async function deleteRoom(id: string) {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    throw new Error("Not authenticated")
  }

  // Verify the user owns the property
  const { data: room, error: roomError } = await supabase.from("rooms").select("property_id").eq("id", id).single()

  if (roomError || !room) {
    console.error("Error fetching room:", roomError)
    throw new Error("Room not found")
  }

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("landlord_id")
    .eq("id", room.property_id)
    .single()

  if (propertyError || !property) {
    console.error("Error verifying property ownership:", propertyError)
    throw new Error("Property not found")
  }

  if (property.landlord_id !== session.user.id) {
    throw new Error("You don't have permission to delete this room")
  }

  // Delete the room
  const { error } = await supabase.from("rooms").delete().eq("id", id)

  if (error) {
    console.error("Error deleting room:", error)
    throw new Error("Failed to delete room")
  }

  revalidatePath(`/dashboard/landlord/properties/${room.property_id}`)
  revalidatePath("/dashboard/landlord/rooms")
  return { success: true }
}

export async function addRoomImage(roomId: string, imageUrl: string, isPrimary = false) {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    throw new Error("Not authenticated")
  }

  // Verify the user owns the property
  const { data: room, error: roomError } = await supabase.from("rooms").select("property_id").eq("id", roomId).single()

  if (roomError || !room) {
    console.error("Error fetching room:", roomError)
    throw new Error("Room not found")
  }

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("landlord_id")
    .eq("id", room.property_id)
    .single()

  if (propertyError || !property) {
    console.error("Error verifying property ownership:", propertyError)
    throw new Error("Property not found")
  }

  if (property.landlord_id !== session.user.id) {
    throw new Error("You don't have permission to add images to this room")
  }

  // If this is the primary image, update all other images to not be primary
  if (isPrimary) {
    await supabase.from("room_images").update({ is_primary: false }).eq("room_id", roomId)
  }

  // Add the image
  const { data: image, error } = await supabase
    .from("room_images")
    .insert({
      room_id: roomId,
      url: imageUrl,
      is_primary: isPrimary,
    })
    .select()
    .single()

  if (error) {
    console.error("Error adding room image:", error)
    throw new Error("Failed to add room image")
  }

  revalidatePath(`/dashboard/landlord/rooms/${roomId}`)
  return image
}

export async function deleteRoomImage(id: string, roomId: string) {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    throw new Error("Not authenticated")
  }

  // Verify the user owns the property
  const { data: room, error: roomError } = await supabase.from("rooms").select("property_id").eq("id", roomId).single()

  if (roomError || !room) {
    console.error("Error fetching room:", roomError)
    throw new Error("Room not found")
  }

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("landlord_id")
    .eq("id", room.property_id)
    .single()

  if (propertyError || !property) {
    console.error("Error verifying property ownership:", propertyError)
    throw new Error("Property not found")
  }

  if (property.landlord_id !== session.user.id) {
    throw new Error("You don't have permission to delete images from this room")
  }

  // Delete the image
  const { error } = await supabase.from("room_images").delete().eq("id", id)

  if (error) {
    console.error("Error deleting room image:", error)
    throw new Error("Failed to delete room image")
  }

  revalidatePath(`/dashboard/landlord/rooms/${roomId}`)
  return { success: true }
}

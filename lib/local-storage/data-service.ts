import { v4 as uuidv4 } from "uuid"
import {
  getLocalStorageData,
  saveLocalStorageData,
  type LocalProperty,
  type LocalPropertyImage,
  type LocalRoom,
  type LocalRoomImage,
  getItemById,
  addItem,
  deleteItem,
  queryItems,
} from "./storage-service"
import { getSession } from "./auth-service"

// Simulate network delay
const simulateNetworkDelay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

// Get all properties
export async function getProperties(): Promise<LocalProperty[]> {
  await simulateNetworkDelay()
  const data = getLocalStorageData()
  return data.properties
}

// Get properties by landlord ID
export async function getPropertiesByLandlordId(landlordId: string): Promise<LocalProperty[]> {
  await simulateNetworkDelay()
  const data = getLocalStorageData()
  return data.properties.filter((property) => property.landlord_id === landlordId)
}

// Get property by ID
export async function getPropertyById(id: string): Promise<LocalProperty | null> {
  await simulateNetworkDelay()
  const data = getLocalStorageData()
  const property = data.properties.find((property) => property.id === id)

  if (!property) return null

  // Get property images
  property.property_images = data.property_images.filter((image) => image.property_id === id)

  return property
}

// Add a new property
export async function addProperty(
  propertyData: Omit<LocalProperty, "id" | "created_at" | "updated_at">,
): Promise<LocalProperty> {
  await simulateNetworkDelay()
  const data = getLocalStorageData()

  const newProperty: LocalProperty = {
    id: uuidv4(),
    ...propertyData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  data.properties.push(newProperty)
  saveLocalStorageData(data)

  return newProperty
}

// Update a property
export async function updateProperty(id: string, updates: Partial<LocalProperty>): Promise<LocalProperty | null> {
  await simulateNetworkDelay()
  const data = getLocalStorageData()

  const propertyIndex = data.properties.findIndex((property) => property.id === id)
  if (propertyIndex === -1) return null

  // Update the property
  const updatedProperty = {
    ...data.properties[propertyIndex],
    ...updates,
    updated_at: new Date().toISOString(),
  }

  data.properties[propertyIndex] = updatedProperty

  // Handle property images if provided
  if (updates.property_images) {
    // Remove existing images for this property
    data.property_images = data.property_images.filter((image) => image.property_id !== id)

    // Add the updated images
    data.property_images.push(
      ...updates.property_images.map((image) => ({
        ...image,
        property_id: id,
      })),
    )

    // Remove property_images from the property object to avoid duplication
    delete updatedProperty.property_images
  }

  saveLocalStorageData(data)

  // Return the updated property with images
  return {
    ...updatedProperty,
    property_images: data.property_images.filter((image) => image.property_id === id),
  }
}

// Delete a property
export async function deleteProperty(id: string): Promise<boolean> {
  await simulateNetworkDelay()
  const data = getLocalStorageData()

  // Remove the property
  data.properties = data.properties.filter((property) => property.id !== id)

  // Remove associated images
  data.property_images = data.property_images.filter((image) => image.property_id !== id)

  // Remove associated rooms
  data.rooms = data.rooms.filter((room) => room.property_id !== id)

  saveLocalStorageData(data)

  return true
}

// Get all rooms
export async function getRooms(): Promise<LocalRoom[]> {
  await simulateNetworkDelay()
  const data = getLocalStorageData()
  return data.rooms
}

// Get rooms by property ID
export async function getRoomsByPropertyId(propertyId: string): Promise<LocalRoom[]> {
  await simulateNetworkDelay()
  const data = getLocalStorageData()
  return data.rooms.filter((room) => room.property_id === propertyId)
}

// Get rooms by landlord ID
export async function getRoomsByLandlordId(landlordId: string): Promise<LocalRoom[]> {
  await simulateNetworkDelay()
  const data = getLocalStorageData()

  // Get all properties owned by this landlord
  const landlordProperties = data.properties.filter((property) => property.landlord_id === landlordId)

  // Get all rooms in these properties
  return data.rooms.filter((room) => landlordProperties.some((property) => property.id === room.property_id))
}

// Get room by ID
export async function getRoomByIdData(id: string): Promise<LocalRoom | null> {
  await simulateNetworkDelay()
  const data = getLocalStorageData()
  const room = data.rooms.find((room) => room.id === id)

  if (!room) return null

  // Get room images
  room.room_images = data.room_images.filter((image) => image.room_id === id)

  return room
}

// Add a new room
export async function addRoomData(roomData: Omit<LocalRoom, "id" | "created_at" | "updated_at">): Promise<LocalRoom> {
  await simulateNetworkDelay()
  const data = getLocalStorageData()

  const newRoom: LocalRoom = {
    id: uuidv4(),
    ...roomData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  data.rooms.push(newRoom)
  saveLocalStorageData(data)

  return newRoom
}

// Update a room
export async function updateRoomData(id: string, updates: Partial<LocalRoom>): Promise<LocalRoom | null> {
  await simulateNetworkDelay()
  const data = getLocalStorageData()

  const roomIndex = data.rooms.findIndex((room) => room.id === id)
  if (roomIndex === -1) return null

  // Update the room
  const updatedRoom = {
    ...data.rooms[roomIndex],
    ...updates,
    updated_at: new Date().toISOString(),
  }

  data.rooms[roomIndex] = updatedRoom

  // Handle room images if provided
  if (updates.room_images) {
    // Remove existing images for this room
    data.room_images = data.room_images.filter((image) => image.room_id !== id)

    // Add the updated images
    data.room_images.push(
      ...updates.room_images.map((image) => ({
        ...image,
        room_id: id,
      })),
    )

    // Remove room_images from the room object to avoid duplication
    delete updatedRoom.room_images
  }

  saveLocalStorageData(data)

  // Return the updated room with images
  return {
    ...updatedRoom,
    room_images: data.room_images.filter((image) => image.room_id === id),
  }
}

// Delete a room
export async function deleteRoom(id: string): Promise<boolean> {
  await simulateNetworkDelay()
  const data = getLocalStorageData()

  // Remove the room
  data.rooms = data.rooms.filter((room) => room.id !== id)

  // Remove associated images
  data.room_images = data.room_images.filter((image) => image.room_id !== id)

  saveLocalStorageData(data)

  return true
}

// Get property statistics for a landlord
export async function getPropertyStatistics(landlordId: string): Promise<{
  totalProperties: number
  totalRooms: number
  totalIncome: number
  occupancyRate: number
}> {
  await simulateNetworkDelay()
  const data = getLocalStorageData()

  // Get properties owned by this landlord
  const properties = data.properties.filter((property) => property.landlord_id === landlordId)

  // Get rooms in these properties
  const rooms = data.rooms.filter((room) => properties.some((property) => property.id === room.property_id))

  // Calculate statistics
  const totalProperties = properties.length
  const totalRooms = rooms.length
  const totalIncome = properties.reduce((sum, property) => sum + (property.monthly_income || 0), 0)

  // Calculate occupancy rate
  const occupiedRooms = rooms.filter((room) => room.status === "occupied").length
  const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0

  return {
    totalProperties,
    totalRooms,
    totalIncome,
    occupancyRate,
  }
}

// Property service
export const PropertyService = {
  // Get all properties for a landlord
  async getPropertiesByLandlordId(landlordId: string): Promise<LocalProperty[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))
    return getPropertiesByLandlordId(landlordId)
  },

  // Get property by ID
  async getPropertyById(id: string): Promise<LocalProperty | null> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200))
    return getPropertyById(id)
  },

  // Create a new property
  async createProperty(property: Omit<LocalProperty, "id" | "created_at" | "updated_at">): Promise<LocalProperty> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return addProperty(property)
  },

  // Update a property
  async updatePropertyData(id: string, updates: Partial<LocalProperty>): Promise<LocalProperty | null> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 400))
    return updateProperty(id, updates)
  },

  // Delete a property
  async deletePropertyData(id: string): Promise<boolean> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))
    return deleteProperty(id)
  },

  // Get all properties for the current user
  async getProperties(): Promise<LocalProperty[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const { user } = await getSession()
    if (!user) throw new Error("Not authenticated")

    return queryItems<LocalProperty>("properties", { landlord_id: user.id })
  },

  // Get a property by ID
  async getProperty(id: string): Promise<LocalProperty | null> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    const { user } = await getSession()
    if (!user) throw new Error("Not authenticated")

    const property = getItemById<LocalProperty>("properties", id)

    // Check ownership
    if (property && property.landlord_id !== user.id) {
      throw new Error("You do not have permission to view this property")
    }

    return property
  },

  // Add a new property
  async addPropertyData(propertyData: Omit<LocalProperty, "id" | "created_at" | "updated_at">): Promise<LocalProperty> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const { user } = await getSession()
    if (!user) throw new Error("Not authenticated")

    const now = new Date().toISOString()

    const newProperty: LocalProperty = {
      id: uuidv4(),
      ...propertyData,
      landlord_id: user.id,
      created_at: now,
      updated_at: now,
    }

    return addItem<LocalProperty>("properties", newProperty)
  },

  // Update a property
  // async updateProperty(id: string, updates: Partial<LocalProperty>): Promise<LocalProperty | null> {
  //   // Simulate network delay
  //   await new Promise((resolve) => setTimeout(resolve, 400))

  //   const { user } = await getSession()
  //   if (!user) throw new Error("Not authenticated")

  //   // Check ownership
  //   const property = getItemById<LocalProperty>("properties", id)
  //   if (!property) throw new Error("Property not found")
  //   if (property.landlord_id !== user.id) {
  //     throw new Error("You do not have permission to update this property")
  //   }

  //   return updateItem<LocalProperty>("properties", id, {
  //     ...updates,
  //     updated_at: new Date().toISOString(),
  //   })
  // },

  // Delete a property
  // async deleteProperty(id: string): Promise<boolean> {
  //   // Simulate network delay
  //   await new Promise((resolve) => setTimeout(resolve, 300))

  //   const { user } = await getSession()
  //   if (!user) throw new Error("Not authenticated")

  //   // Check ownership
  //   const property = getItemById<LocalProperty>("properties", id)
  //   if (!property) throw new Error("Property not found")
  //   if (property.landlord_id !== user.id) {
  //     throw new Error("You do not have permission to delete this property")
  //   }

  //   // Delete associated images
  //   const data = getLocalStorageData()
  //   const propertyImages = data.property_images.filter((img) => img.property_id === id)

  //   propertyImages.forEach((img) => {
  //     deleteItem("property_images", img.id)
  //   })

  //   // Delete associated rooms
  //   const rooms = data.rooms.filter((room) => room.property_id === id)

  //   rooms.forEach((room) => {
  //     // Delete room images
  //     const roomImages = data.room_images.filter((img) => img.room_id === room.id)
  //     roomImages.forEach((img) => {
  //       deleteItem("room_images", img.id)
  //     })

  //     // Delete room
  //     deleteItem("rooms", room.id)
  //   })

  //   // Delete property
  //   return deleteItem("properties", id)
  // },

  // Add a property image
  async addPropertyImage(propertyId: string, imageUrl: string, isPrimary = false): Promise<LocalPropertyImage> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 400))

    const { user } = await getSession()
    if (!user) throw new Error("Not authenticated")

    // Check ownership
    const property = getItemById<LocalProperty>("properties", propertyId)
    if (!property) throw new Error("Property not found")
    if (property.landlord_id !== user.id) {
      throw new Error("You do not have permission to add images to this property")
    }

    // If this is the primary image, update all other images
    if (isPrimary) {
      const data = getLocalStorageData()
      data.property_images.forEach((img, index) => {
        if (img.property_id === propertyId && img.is_primary) {
          data.property_images[index] = { ...img, is_primary: false }
        }
      })
      saveLocalStorageData(data)
    }

    const newImage: LocalPropertyImage = {
      id: uuidv4(),
      property_id: propertyId,
      url: imageUrl,
      is_primary: isPrimary,
      created_at: new Date().toISOString(),
    }

    return addItem<LocalPropertyImage>("property_images", newImage)
  },

  // Delete a property image
  async deletePropertyImage(id: string, propertyId: string): Promise<boolean> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const { user } = await getSession()
    if (!user) throw new Error("Not authenticated")

    // Check ownership
    const property = getItemById<LocalProperty>("properties", propertyId)
    if (!property) throw new Error("Property not found")
    if (property.landlord_id !== user.id) {
      throw new Error("You do not have permission to delete images from this property")
    }

    return deleteItem("property_images", id)
  },

  // Get property images
  async getPropertyImages(propertyId: string): Promise<LocalPropertyImage[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    return queryItems<LocalPropertyImage>("property_images", { property_id: propertyId })
  },
}

// Room service
export const RoomService = {
  // Get all rooms for a property
  async getRoomsByPropertyIdData(propertyId: string): Promise<LocalRoom[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))
    return getRoomsByPropertyId(propertyId)
  },

  // Get room by ID
  async getRoomByIdData(id: string): Promise<LocalRoom | null> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200))
    return getRoomByIdData(id)
  },

  // Create a new room
  async createRoomData(room: Omit<LocalRoom, "id" | "created_at" | "updated_at">): Promise<LocalRoom> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return addRoomData(room)
  },

  // Update a room
  async updateRoomData(id: string, updates: Partial<LocalRoom>): Promise<LocalRoom | null> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 400))
    return updateRoomData(id, updates)
  },

  // Delete a room
  async deleteRoom(id: string): Promise<boolean> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))
    return deleteRoom(id)
  },

  // Get all rooms for the current user
  async getRooms(): Promise<LocalRoom[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const { user } = await getSession()
    if (!user) throw new Error("Not authenticated")

    const data = getLocalStorageData()

    // Get all properties owned by the user
    const userProperties = data.properties.filter((prop) => prop.landlord_id === user.id)
    const propertyIds = userProperties.map((prop) => prop.id)

    // Get all rooms in those properties
    return data.rooms.filter((room) => propertyIds.includes(room.property_id))
  },

  // Get a room by ID
  async getRoom(id: string): Promise<{ room: LocalRoom; property: LocalProperty } | null> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    const { user } = await getSession()
    if (!user) throw new Error("Not authenticated")

    const room = getItemById<LocalRoom>("rooms", id)
    if (!room) return null

    const property = getItemById<LocalProperty>("properties", room.property_id)
    if (!property) return null

    // Check ownership
    if (property.landlord_id !== user.id) {
      throw new Error("You do not have permission to view this room")
    }

    return { room, property }
  },

  // Add a new room
  async addRoom(roomData: Omit<LocalRoom, "id" | "created_at" | "updated_at">): Promise<LocalRoom> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const { user } = await getSession()
    if (!user) throw new Error("Not authenticated")

    // Check property ownership
    const property = getItemById<LocalProperty>("properties", roomData.property_id)
    if (!property) throw new Error("Property not found")
    if (property.landlord_id !== user.id) {
      throw new Error("You do not have permission to add rooms to this property")
    }

    const now = new Date().toISOString()

    const newRoom: LocalRoom = {
      id: uuidv4(),
      ...roomData,
      created_at: now,
      updated_at: now,
    }

    return addItem<LocalRoom>("rooms", newRoom)
  },

  // Update a room
  async updateRoom(id: string, updates: Partial<LocalRoom>): Promise<LocalRoom | null> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 400))

    const { user } = await getSession()
    if (!user) throw new Error("Not authenticated")

    // Check ownership
    const room = getItemById<LocalRoom>("rooms", id)
    if (!room) throw new Error("Room not found")

    const property = getItemById<LocalProperty>("properties", room.property_id)
    if (!property) throw new Error("Property not found")

    if (property.landlord_id !== user.id) {
      throw new Error("You do not have permission to update this room")
    }

    return updateItem<LocalRoom>("rooms", id, {
      ...updates,
      updated_at: new Date().toISOString(),
    })
  },

  // Delete a room
  async deleteRoomData(id: string): Promise<boolean> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const { user } = await getSession()
    if (!user) throw new Error("Not authenticated")

    // Check ownership
    const room = getItemById<LocalRoom>("rooms", id)
    if (!room) throw new Error("Room not found")

    const property = getItemById<LocalProperty>("properties", room.property_id)
    if (!property) throw new Error("Property not found")

    if (property.landlord_id !== user.id) {
      throw new Error("You do not have permission to delete this room")
    }

    // Delete associated images
    const data = getLocalStorageData()
    const roomImages = data.room_images.filter((img) => img.room_id === id)

    roomImages.forEach((img) => {
      deleteItem("room_images", img.id)
    })

    // Delete room
    return deleteItem("rooms", id)
  },

  // Add a room image
  async addRoomImage(roomId: string, imageUrl: string, isPrimary = false): Promise<LocalRoomImage> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 400))

    const { user } = await getSession()
    if (!user) throw new Error("Not authenticated")

    // Check ownership
    const room = getItemById<LocalRoom>("rooms", roomId)
    if (!room) throw new Error("Room not found")

    const property = getItemById<LocalProperty>("properties", room.property_id)
    if (!property) throw new Error("Property not found")

    if (property.landlord_id !== user.id) {
      throw new Error("You do not have permission to add images to this room")
    }

    // If this is the primary image, update all other images
    if (isPrimary) {
      const data = getLocalStorageData()
      data.room_images.forEach((img, index) => {
        if (img.room_id === roomId && img.is_primary) {
          data.room_images[index] = { ...img, is_primary: false }
        }
      })
      saveLocalStorageData(data)
    }

    const newImage: LocalRoomImage = {
      id: uuidv4(),
      room_id: roomId,
      url: imageUrl,
      is_primary: isPrimary,
      created_at: new Date().toISOString(),
    }

    return addItem<LocalRoomImage>("room_images", newImage)
  },

  // Delete a room image
  async deleteRoomImage(id: string, roomId: string): Promise<boolean> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const { user } = await getSession()
    if (!user) throw new Error("Not authenticated")

    // Check ownership
    const room = getItemById<LocalRoom>("rooms", roomId)
    if (!room) throw new Error("Room not found")

    const property = getItemById<LocalProperty>("properties", room.property_id)
    if (!property) throw new Error("Property not found")

    if (property.landlord_id !== user.id) {
      throw new Error("You do not have permission to delete images from this room")
    }

    return deleteItem("room_images", id)
  },

  // Get room images
  async getRoomImages(roomId: string): Promise<LocalRoomImage[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    return queryItems<LocalRoomImage>("room_images", { room_id: roomId })
  },
}

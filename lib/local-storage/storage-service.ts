// Define types for our local storage data
export interface LocalUser {
  id: string
  email: string
  password: string
  created_at: string
  user_metadata: {
    role: string
    [key: string]: any
  }
}

export interface LocalProfile {
  id: string
  email: string
  full_name: string | null
  role: string
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface LocalSession {
  id: string
  user_id: string
  created_at: string
  expires_at: string
}

export interface LocalProperty {
  id: string
  name: string
  address: string
  city: string
  postcode: string
  property_type: string
  description: string | null
  monthly_income: number
  status: string
  amenities: string[]
  landlord_id: string
  created_at: string
  updated_at: string
  property_images?: LocalPropertyImage[]
}

export interface LocalPropertyImage {
  id: string
  property_id: string
  url: string
  is_primary: boolean
  created_at: string
}

export interface LocalRoom {
  id: string
  property_id: string
  name: string
  room_type: string
  max_occupants: number
  rent: number
  deposit: number
  status: string
  description: string | null
  created_at: string
  updated_at: string
  room_images?: LocalRoomImage[]
  properties?: LocalProperty
}

export interface LocalRoomImage {
  id: string
  room_id: string
  url: string
  is_primary: boolean
  created_at: string
}

export interface LocalTenant {
  id: string
  room_id: string
  user_id: string
  start_date: string
  end_date: string | null
  rent_amount: number
  deposit_amount: number
  status: string
  created_at: string
  updated_at: string
}

export interface LocalStorageData {
  users: LocalUser[]
  profiles: LocalProfile[]
  sessions: LocalSession[]
  properties: LocalProperty[]
  property_images: LocalPropertyImage[]
  rooms: LocalRoom[]
  room_images: LocalRoomImage[]
  tenants: LocalTenant[]
}

// Local storage key
const STORAGE_KEY = "uk_rental_app_data"

// Default sample data
const DEFAULT_DATA: LocalStorageData = {
  users: [
    {
      id: "admin-user-id",
      email: "admin@example.com",
      password: "password123",
      created_at: new Date().toISOString(),
      user_metadata: { role: "admin" },
    },
    {
      id: "landlord-user-id",
      email: "landlord@example.com",
      password: "password123",
      created_at: new Date().toISOString(),
      user_metadata: { role: "landlord" },
    },
    {
      id: "tenant-user-id",
      email: "tenant@example.com",
      password: "password123",
      created_at: new Date().toISOString(),
      user_metadata: { role: "tenant" },
    },
  ],
  profiles: [
    {
      id: "admin-user-id",
      email: "admin@example.com",
      full_name: "Admin User",
      role: "admin",
      phone: "+44123456789",
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "landlord-user-id",
      email: "landlord@example.com",
      full_name: "Landlord User",
      role: "landlord",
      phone: "+44123456789",
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "tenant-user-id",
      email: "tenant@example.com",
      full_name: "Tenant User",
      role: "tenant",
      phone: "+44123456789",
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  sessions: [],
  properties: [
    {
      id: "property-1",
      name: "Cozy City Apartment",
      address: "123 City Street",
      city: "London",
      postcode: "EC1A 1BB",
      property_type: "apartment",
      description: "A beautiful apartment in the heart of the city with modern amenities.",
      monthly_income: 2500,
      status: "available",
      amenities: ["WiFi", "Heating", "Washing Machine"],
      landlord_id: "landlord-user-id",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "property-2",
      name: "Spacious Family Home",
      address: "456 Family Road",
      city: "Manchester",
      postcode: "M1 1AA",
      property_type: "house",
      description: "Perfect for families, this home offers plenty of space and a beautiful garden.",
      monthly_income: 3500,
      status: "available",
      amenities: ["Garden", "Parking", "Furnished"],
      landlord_id: "landlord-user-id",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "property-3",
      name: "Rustic Countryside Cottage",
      address: "789 Country Lane",
      city: "York",
      postcode: "YO1 6JH",
      property_type: "cottage",
      description: "Escape to the countryside in this charming cottage with stunning views.",
      monthly_income: 1800,
      status: "available",
      amenities: ["Fireplace", "Garden", "Pet Friendly"],
      landlord_id: "landlord-user-id",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  property_images: [
    {
      id: "property-image-1",
      property_id: "property-1",
      url: "/cozy-city-apartment.png",
      is_primary: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "property-image-2",
      property_id: "property-2",
      url: "/cozy-eclectic-living-room.png",
      is_primary: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "property-image-3",
      property_id: "property-3",
      url: "/cozy-cabin-retreat.png",
      is_primary: true,
      created_at: new Date().toISOString(),
    },
  ],
  rooms: [
    {
      id: "room-1",
      property_id: "property-1",
      name: "Master Bedroom",
      room_type: "double",
      max_occupants: 2,
      rent: 800,
      deposit: 1200,
      status: "vacant",
      description: "Spacious master bedroom with en-suite bathroom and walk-in closet.",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "room-2",
      property_id: "property-1",
      name: "Single Bedroom",
      room_type: "single",
      max_occupants: 1,
      rent: 600,
      deposit: 900,
      status: "vacant",
      description: "Cozy single bedroom with plenty of natural light.",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "room-3",
      property_id: "property-2",
      name: "Studio Room",
      room_type: "studio",
      max_occupants: 2,
      rent: 750,
      deposit: 1000,
      status: "vacant",
      description: "Self-contained studio room with kitchenette and private bathroom.",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  room_images: [
    {
      id: "room-image-1",
      room_id: "room-1",
      url: "/serene-master-suite.png",
      is_primary: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "room-image-2",
      room_id: "room-2",
      url: "/cozy-single-bedroom.png",
      is_primary: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "room-image-3",
      room_id: "room-3",
      url: "/cozy-city-studio.png",
      is_primary: true,
      created_at: new Date().toISOString(),
    },
  ],
  tenants: [],
}

// Initialize local storage with default data if it doesn't exist
export function initializeLocalStorage(): void {
  if (typeof window === "undefined") return

  // Check if data already exists
  const existingData = localStorage.getItem(STORAGE_KEY)
  if (!existingData) {
    // Initialize with default data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA))
    console.log("Local storage initialized with default data")
  }
}

// Get data from local storage
export function getLocalStorageData(): LocalStorageData {
  if (typeof window === "undefined") {
    return DEFAULT_DATA
  }

  // Initialize if not already initialized
  initializeLocalStorage()

  // Get data from local storage
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : DEFAULT_DATA
}

// Save data to local storage
export function saveLocalStorageData(data: LocalStorageData): void {
  if (typeof window === "undefined") return

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// Clear local storage
export function clearLocalStorage(): void {
  if (typeof window === "undefined") return

  localStorage.removeItem(STORAGE_KEY)
}

// Reset local storage to default data
export function resetLocalStorage(): void {
  if (typeof window === "undefined") return

  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA))
}

// Generic function to get items from a collection
export function getItems<T>(collection: keyof LocalStorageData): T[] {
  const data = getLocalStorageData()
  return data[collection] as unknown as T[]
}

// Generic function to get a single item by ID
export function getItemById<T extends { id: string }>(collection: keyof LocalStorageData, id: string): T | null {
  const items = getItems<T>(collection)
  return items.find((item) => item.id === id) || null
}

// Generic function to add an item to a collection
export function addItem<T extends { id?: string }>(collection: keyof LocalStorageData, item: T): T {
  const data = getLocalStorageData()
  const newItem = { ...item, id: item.id || crypto.randomUUID() }
  data[collection] = [...data[collection], newItem] as any
  saveLocalStorageData(data)
  return newItem as T
}

// Generic function to update an item in a collection
export function updateItem<T extends { id: string }>(
  collection: keyof LocalStorageData,
  id: string,
  updates: Partial<T>,
): T | null {
  const data = getLocalStorageData()
  const items = data[collection] as unknown as T[]
  const index = items.findIndex((item) => item.id === id)

  if (index === -1) return null

  const updatedItem = { ...items[index], ...updates }
  items[index] = updatedItem
  data[collection] = items as any
  saveLocalStorageData(data)

  return updatedItem
}

// Generic function to delete an item from a collection
export function deleteItem(collection: keyof LocalStorageData, id: string): boolean {
  const data = getLocalStorageData()
  const items = data[collection] as any[]
  const filteredItems = items.filter((item) => item.id !== id)

  if (filteredItems.length === items.length) return false

  data[collection] = filteredItems
  saveLocalStorageData(data)

  return true
}

// Function to query items with filters
export function queryItems<T>(collection: keyof LocalStorageData, filters: Record<string, any>): T[] {
  const items = getItems<T>(collection)

  return items.filter((item) => {
    return Object.entries(filters).every(([key, value]) => {
      // Handle nested properties with dot notation
      if (key.includes(".")) {
        const parts = key.split(".")
        let nestedItem: any = item

        for (const part of parts) {
          if (nestedItem === null || nestedItem === undefined) return false
          nestedItem = nestedItem[part]
        }

        return nestedItem === value
      }

      // Handle regular properties
      return (item as any)[key] === value
    })
  })
}

// Helper functions for specific data types

// Get all properties
export function getAllProperties(): LocalProperty[] {
  const data = getLocalStorageData()
  return data.properties
}

// Get property by ID
export function getPropertyById(id: string): LocalProperty | null {
  const data = getLocalStorageData()
  const property = data.properties.find((property) => property.id === id)

  if (!property) return null

  // Add property images
  property.property_images = data.property_images.filter((img) => img.property_id === id)

  return property
}

// Get properties by landlord ID
export function getPropertiesByLandlordId(landlordId: string): LocalProperty[] {
  const data = getLocalStorageData()
  const properties = data.properties.filter((property) => property.landlord_id === landlordId)

  // Add property images to each property
  return properties.map((property) => ({
    ...property,
    property_images: data.property_images.filter((img) => img.property_id === property.id),
  }))
}

// Add a new property
export function addProperty(property: Omit<LocalProperty, "id" | "created_at" | "updated_at">): LocalProperty {
  const now = new Date().toISOString()
  const newProperty: LocalProperty = {
    id: crypto.randomUUID(),
    created_at: now,
    updated_at: now,
    ...property,
  }

  const data = getLocalStorageData()
  data.properties.push(newProperty)
  saveLocalStorageData(data)

  return newProperty
}

// Update a property
export function updateProperty(id: string, updates: Partial<LocalProperty>): LocalProperty | null {
  const data = getLocalStorageData()
  const propertyIndex = data.properties.findIndex((property) => property.id === id)

  if (propertyIndex === -1) return null

  const updatedProperty = {
    ...data.properties[propertyIndex],
    ...updates,
    updated_at: new Date().toISOString(),
  }

  data.properties[propertyIndex] = updatedProperty
  saveLocalStorageData(data)

  return updatedProperty
}

// Delete a property
export function deleteProperty(id: string): boolean {
  const data = getLocalStorageData()
  const initialLength = data.properties.length

  data.properties = data.properties.filter((property) => property.id !== id)

  // Also delete related rooms and images
  data.property_images = data.property_images.filter((image) => image.property_id !== id)

  // Get rooms for this property
  const roomsToDelete = data.rooms.filter((room) => room.property_id === id)
  const roomIds = roomsToDelete.map((room) => room.id)

  // Delete rooms
  data.rooms = data.rooms.filter((room) => !roomIds.includes(room.id))

  // Delete room images
  data.room_images = data.room_images.filter((image) => !roomIds.includes(image.room_id))

  // Delete tenants
  data.tenants = data.tenants.filter((tenant) => !roomIds.includes(tenant.room_id))

  saveLocalStorageData(data)

  return data.properties.length < initialLength
}

// Get all rooms
export function getAllRooms(): LocalRoom[] {
  const data = getLocalStorageData()
  return data.rooms.map((room) => ({
    ...room,
    room_images: data.room_images.filter((img) => img.room_id === room.id),
    properties: data.properties.find((prop) => prop.id === room.property_id),
  }))
}

// Get room by ID
export function getRoomById(id: string): LocalRoom | null {
  const data = getLocalStorageData()
  const room = data.rooms.find((room) => room.id === id)

  if (!room) return null

  // Add room images
  room.room_images = data.room_images.filter((img) => img.room_id === id)

  // Add property
  room.properties = data.properties.find((prop) => prop.id === room.property_id) || undefined

  return room
}

// Get rooms by property ID
export function getRoomsByPropertyId(propertyId: string): LocalRoom[] {
  const data = getLocalStorageData()
  const rooms = data.rooms.filter((room) => room.property_id === propertyId)

  // Add room images and property to each room
  return rooms.map((room) => ({
    ...room,
    room_images: data.room_images.filter((img) => img.room_id === room.id),
    properties: data.properties.find((prop) => prop.id === room.property_id),
  }))
}

// Add a new room
export function addRoom(room: Omit<LocalRoom, "id" | "created_at" | "updated_at">): LocalRoom {
  const now = new Date().toISOString()
  const newRoom: LocalRoom = {
    id: crypto.randomUUID(),
    created_at: now,
    updated_at: now,
    ...room,
  }

  const data = getLocalStorageData()
  data.rooms.push(newRoom)
  saveLocalStorageData(data)

  return newRoom
}

// Update a room
export function updateRoom(id: string, updates: Partial<LocalRoom>): LocalRoom | null {
  const data = getLocalStorageData()
  const roomIndex = data.rooms.findIndex((room) => room.id === id)

  if (roomIndex === -1) return null

  const updatedRoom = {
    ...data.rooms[roomIndex],
    ...updates,
    updated_at: new Date().toISOString(),
  }

  data.rooms[roomIndex] = updatedRoom
  saveLocalStorageData(data)

  return updatedRoom
}

// Delete a room
export function deleteRoom(id: string): boolean {
  const data = getLocalStorageData()
  const initialLength = data.rooms.length

  data.rooms = data.rooms.filter((room) => room.id !== id)

  // Delete room images
  data.room_images = data.room_images.filter((image) => image.room_id !== id)

  // Delete tenants
  data.tenants = data.tenants.filter((tenant) => tenant.room_id !== id)

  saveLocalStorageData(data)

  return data.rooms.length < initialLength
}

// Get tenants by room ID
export function getTenantsByRoomId(roomId: string): LocalTenant[] {
  const data = getLocalStorageData()
  return data.tenants.filter((tenant) => tenant.room_id === roomId)
}

// Add a tenant
export function addTenant(tenant: Omit<LocalTenant, "id" | "created_at" | "updated_at">): LocalTenant {
  const now = new Date().toISOString()
  const newTenant: LocalTenant = {
    id: crypto.randomUUID(),
    created_at: now,
    updated_at: now,
    ...tenant,
  }

  const data = getLocalStorageData()
  data.tenants.push(newTenant)
  saveLocalStorageData(data)

  return newTenant
}

// Update a tenant
export function updateTenant(id: string, updates: Partial<LocalTenant>): LocalTenant | null {
  const data = getLocalStorageData()
  const tenantIndex = data.tenants.findIndex((tenant) => tenant.id === id)

  if (tenantIndex === -1) return null

  const updatedTenant = {
    ...data.tenants[tenantIndex],
    ...updates,
    updated_at: new Date().toISOString(),
  }

  data.tenants[tenantIndex] = updatedTenant
  saveLocalStorageData(data)

  return updatedTenant
}

// Delete a tenant
export function deleteTenant(id: string): boolean {
  const data = getLocalStorageData()
  const initialLength = data.tenants.length

  data.tenants = data.tenants.filter((tenant) => tenant.id !== id)
  saveLocalStorageData(data)

  return data.tenants.length < initialLength
}

// Get all users with their profiles
export function getAllUsers(): any[] {
  const data = getLocalStorageData()
  const { users, profiles } = data

  // Combine user and profile data
  return profiles.map((profile) => {
    const user = users.find((user) => user.id === profile.id)
    return {
      ...profile,
      ...user,
    }
  })
}

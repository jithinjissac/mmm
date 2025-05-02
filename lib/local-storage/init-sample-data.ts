import { v4 as uuidv4 } from "uuid"
import { getLocalStorageData, saveLocalStorageData } from "./storage-service"

// Function to initialize sample data for testing
export function initializeSampleData() {
  if (typeof window === "undefined") return

  const data = getLocalStorageData()

  // Check if we already have sample data
  if (data.users.length > 1) return

  console.log("Initializing sample data...")

  const now = new Date().toISOString()

  // Create sample users
  const landlordId = uuidv4()
  const tenantId = uuidv4()

  // Add landlord
  data.users.push({
    id: landlordId,
    email: "landlord@example.com",
    password: "password123",
    created_at: now,
    user_metadata: { role: "landlord" },
  })

  data.profiles.push({
    id: landlordId,
    email: "landlord@example.com",
    full_name: "Sample Landlord",
    role: "landlord",
    phone: "123-456-7890",
    avatar_url: null,
    created_at: now,
    updated_at: now,
  })

  // Add tenant
  data.users.push({
    id: tenantId,
    email: "tenant@example.com",
    password: "password123",
    created_at: now,
    user_metadata: { role: "tenant" },
  })

  data.profiles.push({
    id: tenantId,
    email: "tenant@example.com",
    full_name: "Sample Tenant",
    role: "tenant",
    phone: "098-765-4321",
    avatar_url: null,
    created_at: now,
    updated_at: now,
  })

  // Create sample properties
  const property1Id = uuidv4()
  const property2Id = uuidv4()

  data.properties.push({
    id: property1Id,
    landlord_id: landlordId,
    name: "Seaside Apartment",
    address: "123 Ocean Drive",
    city: "Brighton",
    postcode: "BN1 2AB",
    property_type: "apartment",
    description: "Beautiful apartment with sea views",
    amenities: ["wifi", "parking", "garden"],
    monthly_income: 1500,
    status: "available",
    created_at: now,
    updated_at: now,
  })

  data.properties.push({
    id: property2Id,
    landlord_id: landlordId,
    name: "City Centre House",
    address: "45 High Street",
    city: "London",
    postcode: "EC1V 7DP",
    property_type: "house",
    description: "Spacious house in the heart of the city",
    amenities: ["wifi", "parking", "garden", "gym"],
    monthly_income: 2500,
    status: "available",
    created_at: now,
    updated_at: now,
  })

  // Add property images
  data.property_images.push({
    id: uuidv4(),
    property_id: property1Id,
    url: "/cozy-city-apartment.png",
    is_primary: true,
    created_at: now,
  })

  data.property_images.push({
    id: uuidv4(),
    property_id: property1Id,
    url: "/cozy-eclectic-living-room.png",
    is_primary: false,
    created_at: now,
  })

  data.property_images.push({
    id: uuidv4(),
    property_id: property2Id,
    url: "/cozy-cabin-retreat.png",
    is_primary: true,
    created_at: now,
  })

  // Create sample rooms
  const room1Id = uuidv4()
  const room2Id = uuidv4()
  const room3Id = uuidv4()

  data.rooms.push({
    id: room1Id,
    property_id: property1Id,
    name: "Master Bedroom",
    room_type: "double",
    max_occupants: 2,
    rent: 800,
    deposit: 1000,
    status: "vacant",
    description: "Large master bedroom with en-suite bathroom",
    created_at: now,
    updated_at: now,
  })

  data.rooms.push({
    id: room2Id,
    property_id: property1Id,
    name: "Single Room",
    room_type: "single",
    max_occupants: 1,
    rent: 500,
    deposit: 600,
    status: "vacant",
    description: "Cozy single room with great views",
    created_at: now,
    updated_at: now,
  })

  data.rooms.push({
    id: room3Id,
    property_id: property2Id,
    name: "Studio Apartment",
    room_type: "studio",
    max_occupants: 2,
    rent: 1200,
    deposit: 1500,
    status: "vacant",
    description: "Self-contained studio apartment",
    created_at: now,
    updated_at: now,
  })

  // Add room images
  data.room_images.push({
    id: uuidv4(),
    room_id: room1Id,
    url: "/serene-master-suite.png",
    is_primary: true,
    created_at: now,
  })

  data.room_images.push({
    id: uuidv4(),
    room_id: room2Id,
    url: "/cozy-single-bedroom.png",
    is_primary: true,
    created_at: now,
  })

  data.room_images.push({
    id: uuidv4(),
    room_id: room3Id,
    url: "/cozy-city-studio.png",
    is_primary: true,
    created_at: now,
  })

  // Save the data
  saveLocalStorageData(data)
  console.log("Sample data initialized")
}

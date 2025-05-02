// Mock data service for development without authentication

// Helper function to simulate API delay
export const simulateApiDelay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock properties data
const properties = [
  {
    id: "prop-1",
    name: "Riverside Apartment",
    address: "123 River Road, London, SW1 2AB",
    description: "A beautiful riverside apartment with modern amenities.",
    monthly_rent: 1200,
    is_available: true,
    bedrooms: 2,
    bathrooms: 1,
    property_type: "apartment",
    landlord_id: "user-1",
    created_at: "2023-01-15T10:30:00Z",
    images: ["/cozy-city-apartment.png", "/cozy-eclectic-living-room.png", "/cozy-cabin-retreat.png"],
  },
  {
    id: "prop-2",
    name: "City View Flat",
    address: "45 High Street, Manchester, M1 3FG",
    description: "Modern flat with stunning city views and central location.",
    monthly_rent: 950,
    is_available: false,
    bedrooms: 1,
    bathrooms: 1,
    property_type: "flat",
    landlord_id: "user-1",
    created_at: "2023-02-20T14:15:00Z",
    images: ["/cozy-city-studio.png", "/cozy-single-bedroom.png"],
  },
  {
    id: "prop-3",
    name: "Garden Cottage",
    address: "8 Meadow Lane, Bristol, BS1 5QR",
    description: "Charming cottage with a beautiful garden in a quiet neighborhood.",
    monthly_rent: 1500,
    is_available: true,
    bedrooms: 3,
    bathrooms: 2,
    property_type: "house",
    landlord_id: "user-1",
    created_at: "2023-03-10T09:45:00Z",
    images: ["/suburban-house-exterior.png", "/cozy-cabin-retreat.png", "/serene-master-suite.png"],
  },
]

// Mock rooms data
const rooms = [
  {
    id: "room-1",
    name: "Master Bedroom",
    description: "Spacious master bedroom with en-suite bathroom",
    monthly_rent: 800,
    is_available: true,
    room_type: "double",
    property_id: "prop-1",
    created_at: "2023-01-20T11:30:00Z",
    images: ["/serene-master-suite.png"],
  },
  {
    id: "room-2",
    name: "Single Room",
    description: "Cozy single room with great natural light",
    monthly_rent: 600,
    is_available: false,
    room_type: "single",
    property_id: "prop-1",
    created_at: "2023-01-20T12:00:00Z",
    images: ["/cozy-single-bedroom.png"],
  },
  {
    id: "room-3",
    name: "Studio Room",
    description: "Self-contained studio with kitchenette",
    monthly_rent: 750,
    is_available: true,
    room_type: "studio",
    property_id: "prop-2",
    created_at: "2023-02-25T10:15:00Z",
    images: ["/cozy-city-studio.png"],
  },
]

// Mock maintenance requests
const maintenanceRequests = [
  {
    id: "maint-1",
    title: "Leaking Faucet",
    description: "The bathroom faucet is leaking and needs repair.",
    status: "pending",
    priority: "medium",
    property_id: "prop-1",
    room_id: "room-1",
    tenant_id: "user-2",
    created_at: "2023-05-10T09:30:00Z",
    updated_at: "2023-05-10T09:30:00Z",
  },
  {
    id: "maint-2",
    title: "Broken Heating",
    description: "The heating system is not working properly.",
    status: "in_progress",
    priority: "high",
    property_id: "prop-2",
    room_id: null,
    tenant_id: "user-3",
    created_at: "2023-05-05T14:20:00Z",
    updated_at: "2023-05-07T10:15:00Z",
  },
  {
    id: "maint-3",
    title: "Light Fixture Replacement",
    description: "The light fixture in the kitchen needs to be replaced.",
    status: "completed",
    priority: "low",
    property_id: "prop-1",
    room_id: "room-2",
    tenant_id: "user-4",
    created_at: "2023-04-28T11:45:00Z",
    updated_at: "2023-05-02T16:30:00Z",
  },
]

// Mock payments
const payments = [
  {
    id: "pay-1",
    amount: 800,
    payment_type: "rent",
    status: "paid",
    tenant_id: "user-2",
    property_id: "prop-1",
    room_id: "room-1",
    due_date: "2023-05-01T00:00:00Z",
    payment_date: "2023-04-29T14:30:00Z",
  },
  {
    id: "pay-2",
    amount: 750,
    payment_type: "rent",
    status: "pending",
    tenant_id: "user-3",
    property_id: "prop-2",
    room_id: "room-3",
    due_date: "2023-06-01T00:00:00Z",
    payment_date: null,
  },
  {
    id: "pay-3",
    amount: 600,
    payment_type: "rent",
    status: "paid",
    tenant_id: "user-4",
    property_id: "prop-1",
    room_id: "room-2",
    due_date: "2023-05-01T00:00:00Z",
    payment_date: "2023-04-30T09:15:00Z",
  },
  {
    id: "pay-4",
    amount: 120,
    payment_type: "utilities",
    status: "paid",
    tenant_id: "user-2",
    property_id: "prop-1",
    room_id: "room-1",
    due_date: "2023-05-15T00:00:00Z",
    payment_date: "2023-05-10T11:45:00Z",
  },
]

// Mock users
const users = [
  {
    id: "user-1",
    name: "John Landlord",
    email: "landlord@example.com",
    role: "landlord",
    created_at: "2023-01-01T10:00:00Z",
  },
  {
    id: "user-2",
    name: "Alice Tenant",
    email: "alice@example.com",
    role: "tenant",
    created_at: "2023-01-05T14:30:00Z",
  },
  {
    id: "user-3",
    name: "Bob Tenant",
    email: "bob@example.com",
    role: "tenant",
    created_at: "2023-01-10T09:15:00Z",
  },
  {
    id: "user-4",
    name: "Charlie Tenant",
    email: "charlie@example.com",
    role: "tenant",
    created_at: "2023-01-15T16:45:00Z",
  },
  {
    id: "user-5",
    name: "David Admin",
    email: "admin@example.com",
    role: "admin",
    created_at: "2022-12-01T08:00:00Z",
  },
  {
    id: "user-6",
    name: "Eve Maintenance",
    email: "maintenance@example.com",
    role: "maintenance",
    created_at: "2023-01-02T11:30:00Z",
  },
]

// Mock data service methods
export const MockDataService = {
  // Properties
  getProperties: async () => {
    await simulateApiDelay()
    return { data: properties, error: null }
  },
  getPropertyById: async (id: string) => {
    await simulateApiDelay()
    const property = properties.find((p) => p.id === id)
    return { data: property || null, error: property ? null : "Property not found" }
  },
  createProperty: async (propertyData: any) => {
    await simulateApiDelay()
    const newProperty = {
      id: `prop-${properties.length + 1}`,
      ...propertyData,
      created_at: new Date().toISOString(),
    }
    properties.push(newProperty)
    return { data: newProperty, error: null }
  },
  updateProperty: async (id: string, propertyData: any) => {
    await simulateApiDelay()
    const index = properties.findIndex((p) => p.id === id)
    if (index === -1) {
      return { data: null, error: "Property not found" }
    }
    properties[index] = { ...properties[index], ...propertyData }
    return { data: properties[index], error: null }
  },
  deleteProperty: async (id: string) => {
    await simulateApiDelay()
    const index = properties.findIndex((p) => p.id === id)
    if (index === -1) {
      return { data: null, error: "Property not found" }
    }
    properties.splice(index, 1)
    return { data: { success: true }, error: null }
  },

  // Rooms
  getRooms: async () => {
    await simulateApiDelay()
    return { data: rooms, error: null }
  },
  getRoomsByPropertyId: async (propertyId: string) => {
    await simulateApiDelay()
    const propertyRooms = rooms.filter((r) => r.property_id === propertyId)
    return { data: propertyRooms, error: null }
  },
  getRoomById: async (id: string) => {
    await simulateApiDelay()
    const room = rooms.find((r) => r.id === id)
    return { data: room || null, error: room ? null : "Room not found" }
  },

  // Maintenance
  getMaintenanceRequests: async () => {
    await simulateApiDelay(800)

    // Return mock maintenance requests with predictable IDs
    return {
      data: [
        {
          id: "maint-1",
          property_id: "prop-1",
          room_id: "room-1",
          tenant_id: "tenant-1",
          landlord_id: "landlord-1",
          title: "Leaking Kitchen Sink",
          description:
            "The kitchen sink has been leaking for the past two days. Water is collecting in the cabinet underneath.",
          category: "Plumbing",
          priority: "medium",
          status: "new",
          reported_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          images: ["/leaky-pipe-under-sink.png", "/dripping-chrome-faucet.png"],
          notes: "Will need to replace the sink trap. Parts ordered.",
        },
        {
          id: "maint-2",
          property_id: "prop-2",
          room_id: "room-2",
          tenant_id: "tenant-2",
          landlord_id: "landlord-1",
          title: "Broken Heating System",
          description: "The heating system is not working properly. The apartment is very cold, especially at night.",
          category: "Heating",
          priority: "high",
          status: "in-progress",
          reported_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          scheduled_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          images: ["/cozy-home-heating.png"],
          notes: "Technician scheduled for inspection.",
        },
        {
          id: "maint-3",
          property_id: "prop-1",
          room_id: "room-3",
          tenant_id: "tenant-3",
          landlord_id: "landlord-1",
          title: "Light Fixture Not Working",
          description:
            "The ceiling light in the living room is not working. I've tried replacing the bulb but it still doesn't work.",
          category: "Electrical",
          priority: "low",
          status: "scheduled",
          reported_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          scheduled_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          images: ["/modern-kitchen-pendant.png"],
          notes: "Electrician scheduled for next week.",
        },
        {
          id: "maint-4",
          property_id: "prop-3",
          room_id: "room-4",
          tenant_id: "tenant-4",
          landlord_id: "landlord-2",
          title: "Bathroom Mold",
          description: "There is black mold growing on the bathroom ceiling and around the shower. It's getting worse.",
          category: "Cleaning",
          priority: "medium",
          status: "completed",
          reported_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          completed_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          images: ["/damp-basement-corner.png"],
          notes: "Cleaned and treated with anti-mold solution. Advised tenant to improve ventilation.",
        },
        {
          id: "maint-5",
          property_id: "prop-2",
          room_id: "room-5",
          tenant_id: "tenant-5",
          landlord_id: "landlord-1",
          title: "Broken Window",
          description:
            "The window in the bedroom is cracked and doesn't close properly. It's letting in cold air and rain.",
          category: "Windows",
          priority: "high",
          status: "new",
          reported_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          images: [],
          notes: "",
        },
      ],
    }
  },
  getMaintenanceRequestById: async (id: string) => {
    await simulateApiDelay()
    const request = maintenanceRequests.find((r) => r.id === id)
    return { data: request || null, error: request ? null : "Maintenance request not found" }
  },
  createMaintenanceRequest: async (requestData: any) => {
    await simulateApiDelay()
    const newRequest = {
      id: `maint-${maintenanceRequests.length + 1}`,
      ...requestData,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    maintenanceRequests.push(newRequest)
    return { data: newRequest, error: null }
  },
  updateMaintenanceRequest: async (id: string, requestData: any) => {
    await simulateApiDelay()
    const index = maintenanceRequests.findIndex((r) => r.id === id)
    if (index === -1) {
      return { data: null, error: "Maintenance request not found" }
    }
    maintenanceRequests[index] = {
      ...maintenanceRequests[index],
      ...requestData,
      updated_at: new Date().toISOString(),
    }
    return { data: maintenanceRequests[index], error: null }
  },

  // Payments
  getPayments: async () => {
    await simulateApiDelay()
    return { data: payments, error: null }
  },
  getPaymentsByTenantId: async (tenantId: string) => {
    await simulateApiDelay()
    const tenantPayments = payments.filter((p) => p.tenant_id === tenantId)
    return { data: tenantPayments, error: null }
  },
  getPaymentsByPropertyId: async (propertyId: string) => {
    await simulateApiDelay()
    const propertyPayments = payments.filter((p) => p.property_id === propertyId)
    return { data: propertyPayments, error: null }
  },
  createPayment: async (paymentData: any) => {
    await simulateApiDelay()
    const newPayment = {
      id: `pay-${payments.length + 1}`,
      ...paymentData,
      payment_date: paymentData.status === "paid" ? new Date().toISOString() : null,
    }
    payments.push(newPayment)
    return { data: newPayment, error: null }
  },

  // Users
  getUsers: async () => {
    await simulateApiDelay()
    return { data: users, error: null }
  },
  getUserById: async (id: string) => {
    await simulateApiDelay()
    const user = users.find((u) => u.id === id)
    return { data: user || null, error: user ? null : "User not found" }
  },
  getUsersByRole: async (role: string) => {
    await simulateApiDelay()
    const roleUsers = users.filter((u) => u.role === role)
    return { data: roleUsers, error: null }
  },
}

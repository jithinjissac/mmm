import { v4 as uuidv4 } from "uuid"
import type { MaintenanceRequest } from "@/types/maintenance"

// Mock data service for maintenance requests
class MockMaintenanceService {
  private maintenanceRequests: MaintenanceRequest[] = []

  constructor() {
    // Initialize with some sample data
    this.maintenanceRequests = [
      {
        id: "maint-001",
        property_id: "prop-1",
        room_id: "room-1",
        tenant_id: "tenant-1",
        landlord_id: "landlord-1",
        title: "Leaking Faucet",
        description: "The kitchen faucet is leaking and causing water damage to the cabinet below.",
        category: "plumbing",
        priority: "medium",
        status: "new",
        reported_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        images: ["/leaky-pipe-under-sink.png"],
        notes: "Water is pooling in the cabinet and causing damage to the wood.",
        preferred_time_slot: "morning",
        permission_to_enter: true,
        contact_method: "email",
      },
      {
        id: "maint-002",
        property_id: "prop-1",
        room_id: "room-4",
        tenant_id: "tenant-1",
        landlord_id: "landlord-1",
        title: "Broken Shower Head",
        description: "The shower head in the bathroom is broken and spraying water in all directions.",
        category: "plumbing",
        priority: "high",
        status: "in-progress",
        reported_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        scheduled_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        assigned_to: "maintenance-1",
        images: ["/dripping-chrome-faucet.png"],
        preferred_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        preferred_time_slot: "afternoon",
        access_instructions: "The key is under the mat.",
        permission_to_enter: true,
      },
      {
        id: "maint-003",
        property_id: "prop-2",
        room_id: "room-7",
        tenant_id: "tenant-2",
        landlord_id: "landlord-2",
        title: "No Hot Water",
        description: "There is no hot water in the kitchen sink or shower.",
        category: "heating",
        priority: "high",
        status: "scheduled",
        reported_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        scheduled_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        assigned_to: "maintenance-2",
        images: ["/cozy-home-heating.png"],
        contact_method: "phone",
        alternative_contact: "John Doe",
        alternative_phone: "555-123-4567",
      },
    ]
  }

  // Get all maintenance requests
  async getAllRequests(): Promise<MaintenanceRequest[]> {
    return this.maintenanceRequests
  }

  // Get maintenance requests by tenant ID
  async getRequestsByTenant(tenantId: string): Promise<MaintenanceRequest[]> {
    return this.maintenanceRequests.filter((request) => request.tenant_id === tenantId)
  }

  // Get maintenance requests by landlord ID
  async getRequestsByLandlord(landlordId: string): Promise<MaintenanceRequest[]> {
    return this.maintenanceRequests.filter((request) => request.landlord_id === landlordId)
  }

  // Get maintenance request by ID
  async getRequestById(id: string): Promise<MaintenanceRequest | undefined> {
    return this.maintenanceRequests.find((request) => request.id === id)
  }

  // Create a new maintenance request
  async createRequest(
    request: Omit<MaintenanceRequest, "id" | "status" | "reported_date">,
  ): Promise<MaintenanceRequest> {
    const newRequest: MaintenanceRequest = {
      id: `maint-${uuidv4().substring(0, 8)}`,
      status: "new",
      reported_date: new Date().toISOString(),
      ...request,
    }

    this.maintenanceRequests.push(newRequest)
    return newRequest
  }

  // Update a maintenance request
  async updateRequest(id: string, updates: Partial<MaintenanceRequest>): Promise<MaintenanceRequest | undefined> {
    const index = this.maintenanceRequests.findIndex((request) => request.id === id)
    if (index === -1) return undefined

    const updatedRequest = {
      ...this.maintenanceRequests[index],
      ...updates,
    }

    this.maintenanceRequests[index] = updatedRequest
    return updatedRequest
  }

  // Delete a maintenance request
  async deleteRequest(id: string): Promise<boolean> {
    const initialLength = this.maintenanceRequests.length
    this.maintenanceRequests = this.maintenanceRequests.filter((request) => request.id !== id)
    return this.maintenanceRequests.length < initialLength
  }
}

// Create and export a singleton instance
export const maintenanceService = new MockMaintenanceService()

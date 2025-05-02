import { v4 as uuidv4 } from "uuid"
import type { TenantGroup, TenantGroupFormData } from "@/types/tenant-groups"

// Mock data for tenant groups
const mockTenantGroups: TenantGroup[] = [
  {
    id: "group1",
    name: "All Tenants",
    description: "All tenants in the property",
    memberIds: ["tenant-user-id", "user3", "user4"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "group2",
    name: "Kitchen Duty",
    description: "Tenants responsible for kitchen chores",
    memberIds: ["tenant-user-id", "user3"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "group3",
    name: "Bathroom Cleaners",
    description: "Tenants responsible for bathroom cleaning",
    memberIds: ["user3", "user4"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Mock roommates data
export const mockRoommates = [
  { id: "tenant-user-id", name: "Tenant User", avatarUrl: null },
  { id: "user3", name: "Alice Johnson", avatarUrl: null },
  { id: "user4", name: "Bob Brown", avatarUrl: null },
]

// Get all tenant groups
export const getTenantGroups = async (): Promise<TenantGroup[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return [...mockTenantGroups]
}

// Get tenant group by ID
export const getTenantGroupById = async (id: string): Promise<TenantGroup | null> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockTenantGroups.find((group) => group.id === id) || null
}

// Create a new tenant group
export const createTenantGroup = async (groupData: TenantGroupFormData): Promise<TenantGroup> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 700))

  const newGroup: TenantGroup = {
    id: uuidv4(),
    ...groupData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  mockTenantGroups.push(newGroup)
  return newGroup
}

// Update a tenant group
export const updateTenantGroup = async (id: string, groupData: Partial<TenantGroupFormData>): Promise<TenantGroup> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const index = mockTenantGroups.findIndex((group) => group.id === id)
  if (index === -1) {
    throw new Error("Tenant group not found")
  }

  const updatedGroup = {
    ...mockTenantGroups[index],
    ...groupData,
    updatedAt: new Date().toISOString(),
  }

  mockTenantGroups[index] = updatedGroup
  return updatedGroup
}

// Delete a tenant group
export const deleteTenantGroup = async (id: string): Promise<void> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const index = mockTenantGroups.findIndex((group) => group.id === id)
  if (index === -1) {
    throw new Error("Tenant group not found")
  }

  mockTenantGroups.splice(index, 1)
}

// Get all roommates
export const getRoommates = async () => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))
  return [...mockRoommates]
}

import type { Chore, ChoreComment, ChoreFilter, ChoreFormData, ChoreStatus } from "@/types/chores"
import { v4 as uuidv4 } from "uuid"
import { mockRoommates } from "@/lib/mock-tenant-group-service"
import { getTenantGroupById } from "@/lib/mock-tenant-group-service"
import { getNextScheduledDate } from "@/lib/services/chore-scheduler"
import { getTenantGroups } from "@/lib/mock-tenant-group-service"

// Mock data for chores
const mockChores: Chore[] = [
  {
    id: "1",
    title: "Clean kitchen",
    description: "Clean all surfaces, floor, and appliances in the kitchen",
    propertyId: "prop1",
    roomId: "room1",
    assignmentType: "individual",
    assignedToId: "user1",
    assignedToName: "John Doe",
    createdById: "user2",
    createdByName: "Jane Smith",
    status: "pending",
    priority: "medium",
    dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    frequency: "weekly",
    isRecurring: true,
    lastScheduledDate: new Date().toISOString(),
    nextScheduledDate: new Date(Date.now() + 604800000).toISOString(), // Next week
    tags: ["kitchen", "cleaning"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Take out trash",
    description: "Empty all trash bins and take to the dumpster",
    propertyId: "prop1",
    assignmentType: "group",
    assignedGroupId: "group1",
    assignedGroupName: "All Tenants",
    createdById: "user2",
    createdByName: "Jane Smith",
    status: "completed",
    priority: "high",
    dueDate: new Date().toISOString(),
    completedDate: new Date().toISOString(),
    frequency: "daily",
    isRecurring: true,
    lastScheduledDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    nextScheduledDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    tags: ["trash", "daily"],
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Clean bathroom",
    description: "Clean toilet, shower, sink, and floor",
    propertyId: "prop1",
    roomId: "room2",
    assignmentType: "rotation",
    rotationIds: ["tenant-user-id", "user3", "user4"],
    rotationNames: ["Tenant User", "Alice Johnson", "Bob Brown"],
    currentAssigneeId: "user3",
    currentAssigneeName: "Alice Johnson",
    createdById: "user2",
    createdByName: "Jane Smith",
    status: "in-progress",
    priority: "medium",
    dueDate: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    frequency: "weekly",
    isRecurring: true,
    lastScheduledDate: new Date(Date.now() - 604800000).toISOString(), // Last week
    nextScheduledDate: new Date(Date.now() + 604800000).toISOString(), // Next week
    tags: ["bathroom", "cleaning"],
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Mow the lawn",
    description: "Mow the front and back lawn",
    propertyId: "prop1",
    assignmentType: "individual",
    assignedToId: "user4",
    assignedToName: "Bob Brown",
    createdById: "user2",
    createdByName: "Jane Smith",
    status: "overdue",
    priority: "low",
    dueDate: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    frequency: "biweekly",
    isRecurring: true,
    lastScheduledDate: new Date(Date.now() - 1209600000).toISOString(), // 2 weeks ago
    nextScheduledDate: new Date(Date.now() + 1209600000).toISOString(), // 2 weeks from now
    tags: ["garden", "outdoor"],
    createdAt: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    title: "Replace light bulbs",
    description: "Replace burnt out light bulbs in the living room",
    propertyId: "prop1",
    roomId: "room3",
    assignmentType: "individual",
    assignedToId: "tenant-user-id",
    assignedToName: "Tenant User",
    createdById: "user2",
    createdByName: "Jane Smith",
    status: "pending",
    priority: "urgent",
    dueDate: new Date(Date.now() + 43200000).toISOString(), // 12 hours from now
    frequency: "once",
    isRecurring: false,
    tags: ["maintenance", "living room"],
    createdAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    updatedAt: new Date().toISOString(),
  },
]

// Mock data for chore comments
const mockChoreComments: ChoreComment[] = [
  {
    id: "1",
    choreId: "1",
    userId: "user1",
    userName: "John Doe",
    content: "I'll do this after work today",
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
  {
    id: "2",
    choreId: "1",
    userId: "user2",
    userName: "Jane Smith",
    content: "Thanks, make sure to clean the oven too",
    createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
  },
  {
    id: "3",
    choreId: "3",
    userId: "user3",
    userName: "Alice Johnson",
    content: "Started cleaning, will finish tomorrow",
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
  },
]

// Helper function to get roommate name by ID
const getRoommateName = (id: string): string => {
  const roommate = mockRoommates.find((r) => r.id === id)
  return roommate ? roommate.name : "Unknown"
}

// Mock service functions
export const getChores = async (filters?: ChoreFilter): Promise<Chore[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  let filteredChores = [...mockChores]

  if (filters) {
    if (filters.status) {
      filteredChores = filteredChores.filter((chore) => chore.status === filters.status)
    }

    if (filters.priority) {
      filteredChores = filteredChores.filter((chore) => chore.priority === filters.priority)
    }

    if (filters.assignedToId) {
      filteredChores = filteredChores.filter((chore) => {
        if (chore.assignmentType === "individual") {
          return chore.assignedToId === filters.assignedToId
        } else if (chore.assignmentType === "rotation") {
          return chore.currentAssigneeId === filters.assignedToId
        }
        return false
      })
    }

    if (filters.assignedGroupId) {
      filteredChores = filteredChores.filter(
        (chore) => chore.assignmentType === "group" && chore.assignedGroupId === filters.assignedGroupId,
      )
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filteredChores = filteredChores.filter(
        (chore) =>
          chore.title.toLowerCase().includes(searchLower) ||
          (chore.description && chore.description.toLowerCase().includes(searchLower)),
      )
    }

    if (filters.dueDate) {
      const dueDate = new Date(filters.dueDate).setHours(0, 0, 0, 0)
      filteredChores = filteredChores.filter((chore) => {
        const choreDate = new Date(chore.dueDate).setHours(0, 0, 0, 0)
        return choreDate === dueDate
      })
    }

    if (filters.tags && filters.tags.length > 0) {
      filteredChores = filteredChores.filter(
        (chore) => chore.tags && filters.tags?.some((tag) => chore.tags?.includes(tag)),
      )
    }
  }

  // Check for overdue chores
  const now = new Date()
  filteredChores = filteredChores.map((chore) => {
    if (chore.status !== "completed" && new Date(chore.dueDate) < now) {
      return { ...chore, status: "overdue" }
    }
    return chore
  })

  return filteredChores
}

export const getChoreById = async (id: string): Promise<Chore | null> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const chore = mockChores.find((c) => c.id === id)
  return chore || null
}

export const getChoreComments = async (choreId: string): Promise<ChoreComment[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return mockChoreComments.filter((comment) => comment.choreId === choreId)
}

export const createChore = async (
  choreData: ChoreFormData,
  userId: string,
  userName: string,
  propertyId: string,
): Promise<Chore> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 700))

  // Process assignment data
  let assignedToId,
    assignedToName,
    assignedGroupId,
    assignedGroupName,
    rotationIds,
    rotationNames,
    currentAssigneeId,
    currentAssigneeName

  if (choreData.assignmentType === "individual" && choreData.assignedToId) {
    assignedToId = choreData.assignedToId
    assignedToName = getRoommateName(choreData.assignedToId)
  } else if (choreData.assignmentType === "group" && choreData.assignedGroupId) {
    const group = await getTenantGroupById(choreData.assignedGroupId)
    assignedGroupId = choreData.assignedGroupId
    assignedGroupName = group?.name || "Unknown Group"
  } else if (choreData.assignmentType === "rotation" && choreData.rotationIds && choreData.rotationIds.length > 0) {
    rotationIds = choreData.rotationIds
    rotationNames = choreData.rotationIds.map((id) => getRoommateName(id))
    // Assign to the first person in the rotation initially
    currentAssigneeId = choreData.rotationIds[0]
    currentAssigneeName = getRoommateName(choreData.rotationIds[0])
  }

  // Calculate next scheduled date for recurring chores
  let lastScheduledDate, nextScheduledDate
  if (choreData.isRecurring) {
    lastScheduledDate = new Date().toISOString()
    nextScheduledDate = getNextScheduledDate(choreData.frequency, lastScheduledDate).toISOString()
  }

  const newChore: Chore = {
    id: uuidv4(),
    ...choreData,
    propertyId,
    assignmentType: choreData.assignmentType,
    assignedToId,
    assignedToName,
    assignedGroupId,
    assignedGroupName,
    rotationIds,
    rotationNames,
    currentAssigneeId,
    currentAssigneeName,
    createdById: userId,
    createdByName: userName,
    status: "pending",
    lastScheduledDate,
    nextScheduledDate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  mockChores.push(newChore)
  return newChore
}

export const updateChore = async (id: string, choreData: Partial<ChoreFormData>): Promise<Chore> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const index = mockChores.findIndex((c) => c.id === id)
  if (index === -1) {
    throw new Error("Chore not found")
  }

  const existingChore = mockChores[index]

  // Process assignment data if it changed
  const updates: Partial<Chore> = {}

  if (choreData.assignmentType && choreData.assignmentType !== existingChore.assignmentType) {
    updates.assignmentType = choreData.assignmentType

    // Reset all assignment fields
    updates.assignedToId = undefined
    updates.assignedToName = undefined
    updates.assignedGroupId = undefined
    updates.assignedGroupName = undefined
    updates.rotationIds = undefined
    updates.rotationNames = undefined
    updates.currentAssigneeId = undefined
    updates.currentAssigneeName = undefined

    // Set new assignment data
    if (choreData.assignmentType === "individual" && choreData.assignedToId) {
      updates.assignedToId = choreData.assignedToId
      updates.assignedToName = getRoommateName(choreData.assignedToId)
    } else if (choreData.assignmentType === "group" && choreData.assignedGroupId) {
      const group = await getTenantGroupById(choreData.assignedGroupId)
      updates.assignedGroupId = choreData.assignedGroupId
      updates.assignedGroupName = group?.name || "Unknown Group"
    } else if (choreData.assignmentType === "rotation" && choreData.rotationIds && choreData.rotationIds.length > 0) {
      updates.rotationIds = choreData.rotationIds
      updates.rotationNames = choreData.rotationIds.map((id) => getRoommateName(id))
      updates.currentAssigneeId = choreData.rotationIds[0]
      updates.currentAssigneeName = getRoommateName(choreData.rotationIds[0])
    }
  } else {
    // Update assignment data within the same type
    if (
      existingChore.assignmentType === "individual" &&
      choreData.assignedToId &&
      choreData.assignedToId !== existingChore.assignedToId
    ) {
      updates.assignedToId = choreData.assignedToId
      updates.assignedToName = getRoommateName(choreData.assignedToId)
    } else if (
      existingChore.assignmentType === "group" &&
      choreData.assignedGroupId &&
      choreData.assignedGroupId !== existingChore.assignedGroupId
    ) {
      const group = await getTenantGroupById(choreData.assignedGroupId)
      updates.assignedGroupId = choreData.assignedGroupId
      updates.assignedGroupName = group?.name || "Unknown Group"
    } else if (existingChore.assignmentType === "rotation" && choreData.rotationIds) {
      updates.rotationIds = choreData.rotationIds
      updates.rotationNames = choreData.rotationIds.map((id) => getRoommateName(id))

      // If the current assignee is not in the rotation anymore, reset to the first person
      if (existingChore.currentAssigneeId && !choreData.rotationIds.includes(existingChore.currentAssigneeId)) {
        updates.currentAssigneeId = choreData.rotationIds[0]
        updates.currentAssigneeName = getRoommateName(choreData.rotationIds[0])
      }
    }
  }

  // Update recurring settings if changed
  if (choreData.isRecurring !== undefined && choreData.isRecurring !== existingChore.isRecurring) {
    updates.isRecurring = choreData.isRecurring

    if (choreData.isRecurring) {
      updates.lastScheduledDate = new Date().toISOString()
      updates.nextScheduledDate = getNextScheduledDate(
        choreData.frequency || existingChore.frequency,
        updates.lastScheduledDate,
      ).toISOString()
    } else {
      updates.lastScheduledDate = undefined
      updates.nextScheduledDate = undefined
    }
  } else if (choreData.frequency && choreData.frequency !== existingChore.frequency && existingChore.isRecurring) {
    // Recalculate next scheduled date if frequency changed
    updates.lastScheduledDate = existingChore.lastScheduledDate || new Date().toISOString()
    updates.nextScheduledDate = getNextScheduledDate(choreData.frequency, updates.lastScheduledDate).toISOString()
  }

  const updatedChore = {
    ...existingChore,
    ...choreData,
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  mockChores[index] = updatedChore
  return updatedChore
}

export const updateChoreStatus = async (id: string, status: ChoreStatus): Promise<Chore> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const index = mockChores.findIndex((c) => c.id === id)
  if (index === -1) {
    throw new Error("Chore not found")
  }

  const existingChore = mockChores[index]

  // If completing a recurring chore, handle rotation and scheduling
  const updates: Partial<Chore> = {
    status,
    updatedAt: new Date().toISOString(),
  }

  if (status === "completed") {
    updates.completedDate = new Date().toISOString()

    // For recurring chores, schedule the next instance
    if (existingChore.isRecurring) {
      // Update last scheduled date
      updates.lastScheduledDate = new Date().toISOString()

      // Calculate next scheduled date
      updates.nextScheduledDate = getNextScheduledDate(existingChore.frequency, updates.lastScheduledDate).toISOString()

      // For rotation assignments, move to the next person
      if (
        existingChore.assignmentType === "rotation" &&
        existingChore.rotationIds &&
        existingChore.rotationIds.length > 1
      ) {
        const currentIndex = existingChore.rotationIds.findIndex((id) => id === existingChore.currentAssigneeId)
        const nextIndex = (currentIndex + 1) % existingChore.rotationIds.length
        updates.currentAssigneeId = existingChore.rotationIds[nextIndex]
        updates.currentAssigneeName =
          existingChore.rotationNames?.[nextIndex] || getRoommateName(existingChore.rotationIds[nextIndex])
      }

      // Reset status for the next occurrence
      updates.status = "pending"
      updates.completedDate = undefined
    }
  }

  const updatedChore = {
    ...existingChore,
    ...updates,
  }

  mockChores[index] = updatedChore
  return updatedChore
}

export const addChoreComment = async (
  choreId: string,
  userId: string,
  userName: string,
  content: string,
): Promise<ChoreComment> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const newComment: ChoreComment = {
    id: uuidv4(),
    choreId,
    userId,
    userName,
    content,
    createdAt: new Date().toISOString(),
  }

  mockChoreComments.push(newComment)
  return newComment
}

export const deleteChore = async (id: string): Promise<void> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const index = mockChores.findIndex((c) => c.id === id)
  if (index === -1) {
    throw new Error("Chore not found")
  }

  mockChores.splice(index, 1)

  // Also delete related comments
  const commentIndices = mockChoreComments
    .map((comment, index) => (comment.choreId === id ? index : -1))
    .filter((index) => index !== -1)
    .sort((a, b) => b - a) // Sort in descending order to remove from end first

  for (const index of commentIndices) {
    mockChoreComments.splice(index, 1)
  }
}

// Get chores for a specific user
export const getChoresForUser = async (userId: string): Promise<Chore[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Get all tenant groups this user belongs to
  const groups = await getTenantGroups()
  const userGroupIds = groups.filter((group) => group.memberIds.includes(userId)).map((group) => group.id)

  return mockChores.filter((chore) => {
    if (chore.assignmentType === "individual") {
      return chore.assignedToId === userId
    } else if (chore.assignmentType === "group") {
      return userGroupIds.includes(chore.assignedGroupId || "")
    } else if (chore.assignmentType === "rotation") {
      return chore.currentAssigneeId === userId
    }
    return false
  })
}

// Get upcoming chores for a user
export const getUpcomingChoresForUser = async (userId: string, days = 7): Promise<Chore[]> => {
  const userChores = await getChoresForUser(userId)
  const now = new Date()
  const futureDate = new Date(now)
  futureDate.setDate(futureDate.getDate() + days)

  return userChores.filter((chore) => {
    const dueDate = new Date(chore.dueDate)
    return dueDate >= now && dueDate <= futureDate && chore.status !== "completed"
  })
}

// Process all recurring chores - this would typically be run by a cron job
export const processRecurringChores = async (): Promise<void> => {
  const now = new Date()

  for (let i = 0; i < mockChores.length; i++) {
    const chore = mockChores[i]

    if (!chore.isRecurring || !chore.nextScheduledDate) continue

    // If next scheduled date has passed and chore is completed
    if (new Date(chore.nextScheduledDate) <= now && chore.status === "completed") {
      // Calculate new next scheduled date
      const nextDate = getNextScheduledDate(chore.frequency, chore.nextScheduledDate)

      // For rotation assignments, move to the next person
      let currentAssigneeId = chore.currentAssigneeId
      let currentAssigneeName = chore.currentAssigneeName

      if (chore.assignmentType === "rotation" && chore.rotationIds && chore.rotationIds.length > 1) {
        const currentIndex = chore.rotationIds.findIndex((id) => id === chore.currentAssigneeId)
        const nextIndex = (currentIndex + 1) % chore.rotationIds.length
        currentAssigneeId = chore.rotationIds[nextIndex]
        currentAssigneeName = chore.rotationNames?.[nextIndex] || getRoommateName(chore.rotationIds[nextIndex])
      }

      // Update the chore
      mockChores[i] = {
        ...chore,
        status: "pending",
        completedDate: undefined,
        lastScheduledDate: chore.nextScheduledDate,
        nextScheduledDate: nextDate.toISOString(),
        currentAssigneeId,
        currentAssigneeName,
        updatedAt: new Date().toISOString(),
      }
    }
    // If next scheduled date has passed but chore is not completed
    else if (new Date(chore.nextScheduledDate) <= now && chore.status !== "completed") {
      // Mark as overdue
      mockChores[i] = {
        ...chore,
        status: "overdue",
        updatedAt: new Date().toISOString(),
      }
    }
  }
}

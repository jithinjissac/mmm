import { addDays, addWeeks, addMonths, parseISO } from "date-fns"
import type { Chore, ChoreSchedule } from "@/types/chores"
import { v4 as uuidv4 } from "uuid"

// Mock data for chore schedules
const mockChoreSchedules: ChoreSchedule[] = []

// Get the next scheduled date based on frequency and last scheduled date
export const getNextScheduledDate = (frequency: string, lastDate: string): Date => {
  const date = parseISO(lastDate)

  switch (frequency) {
    case "daily":
      return addDays(date, 1)
    case "weekly":
      return addWeeks(date, 1)
    case "biweekly":
      return addWeeks(date, 2)
    case "monthly":
      return addMonths(date, 1)
    default:
      return date
  }
}

// Schedule a chore
export const scheduleChore = async (chore: Chore): Promise<ChoreSchedule> => {
  // Determine the next scheduled date
  const lastScheduledDate = chore.lastScheduledDate || chore.createdAt
  const nextDate = getNextScheduledDate(chore.frequency, lastScheduledDate)

  // For rotation assignments, determine the next assignee
  let assigneeId = chore.assignedToId
  let assigneeName = chore.assignedToName

  if (chore.assignmentType === "rotation" && chore.rotationIds && chore.rotationIds.length > 0) {
    const currentIndex = chore.rotationIds.findIndex((id) => id === chore.currentAssigneeId)
    const nextIndex = (currentIndex + 1) % chore.rotationIds.length
    assigneeId = chore.rotationIds[nextIndex]
    assigneeName = chore.rotationNames?.[nextIndex]
  }

  // Create the schedule
  const schedule: ChoreSchedule = {
    id: uuidv4(),
    choreId: chore.id,
    scheduledDate: nextDate.toISOString(),
    assigneeId,
    assigneeName,
    status: "pending",
    createdAt: new Date().toISOString(),
  }

  // Save to mock data
  mockChoreSchedules.push(schedule)

  return schedule
}

// Get scheduled chores for a specific date range
export const getScheduledChores = async (startDate: string, endDate: string): Promise<ChoreSchedule[]> => {
  const start = parseISO(startDate)
  const end = parseISO(endDate)

  return mockChoreSchedules.filter((schedule) => {
    const scheduleDate = parseISO(schedule.scheduledDate)
    return scheduleDate >= start && scheduleDate <= end
  })
}

// Get scheduled chores for a specific chore
export const getChoreSchedules = async (choreId: string): Promise<ChoreSchedule[]> => {
  return mockChoreSchedules.filter((schedule) => schedule.choreId === choreId)
}

// Update a chore schedule
export const updateChoreSchedule = async (
  scheduleId: string,
  updates: Partial<ChoreSchedule>,
): Promise<ChoreSchedule> => {
  const index = mockChoreSchedules.findIndex((schedule) => schedule.id === scheduleId)

  if (index === -1) {
    throw new Error("Schedule not found")
  }

  const updatedSchedule = {
    ...mockChoreSchedules[index],
    ...updates,
  }

  mockChoreSchedules[index] = updatedSchedule
  return updatedSchedule
}

// Process recurring chores - this would typically be run by a cron job
export const processRecurringChores = async (chores: Chore[]): Promise<void> => {
  const today = new Date()

  for (const chore of chores) {
    if (!chore.isRecurring) continue

    // Check if we need to schedule a new instance
    if (!chore.nextScheduledDate || parseISO(chore.nextScheduledDate) <= today) {
      await scheduleChore(chore)
    }
  }
}

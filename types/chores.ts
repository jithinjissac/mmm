export type ChoreStatus = "pending" | "in-progress" | "completed" | "overdue"
export type ChoreFrequency = "once" | "daily" | "weekly" | "biweekly" | "monthly"
export type ChorePriority = "low" | "medium" | "high" | "urgent"
export type ChoreAssignmentType = "individual" | "group" | "rotation"

export interface Chore {
  id: string
  title: string
  description?: string
  propertyId: string
  roomId?: string
  assignmentType: ChoreAssignmentType
  assignedToId?: string
  assignedToName?: string
  assignedGroupId?: string
  assignedGroupName?: string
  rotationIds?: string[]
  rotationNames?: string[]
  currentAssigneeId?: string
  currentAssigneeName?: string
  createdById: string
  createdByName: string
  status: ChoreStatus
  priority: ChorePriority
  dueDate: string
  completedDate?: string
  frequency: ChoreFrequency
  isRecurring: boolean
  lastScheduledDate?: string
  nextScheduledDate?: string
  notes?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface ChoreComment {
  id: string
  choreId: string
  userId: string
  userName: string
  content: string
  createdAt: string
}

export interface ChoreFilter {
  status?: ChoreStatus
  priority?: ChorePriority
  assignedToId?: string
  assignedGroupId?: string
  search?: string
  dueDate?: string
  tags?: string[]
}

export interface ChoreFormData {
  title: string
  description?: string
  assignmentType: ChoreAssignmentType
  assignedToId?: string
  assignedGroupId?: string
  rotationIds?: string[]
  priority: ChorePriority
  dueDate: string
  frequency: ChoreFrequency
  isRecurring: boolean
  notes?: string
  tags?: string[]
}

export interface ChoreSchedule {
  id: string
  choreId: string
  scheduledDate: string
  assigneeId?: string
  assigneeName?: string
  status: ChoreStatus
  completedDate?: string
  createdAt: string
}

export interface Tenant {
  id: string
  name: string
  avatarUrl?: string
}

export interface BillShare {
  tenantId: string
  amount: number
  isPaid: boolean
  paidAt?: string
}

export interface Bill {
  id: string
  title: string
  description?: string
  totalAmount: number
  dueDate: string
  category: "utilities" | "internet" | "groceries" | "rent" | "other"
  createdBy: string
  createdAt: string
  shares: BillShare[]
  attachmentUrl?: string
  isRecurring: boolean
  recurringFrequency?: "weekly" | "monthly" | "quarterly" | "yearly"
}

export type BillFormData = Omit<Bill, "id" | "createdAt" | "shares"> & {
  splitMethod: "equal" | "custom"
  tenantShares?: { tenantId: string; percentage: number }[]
}

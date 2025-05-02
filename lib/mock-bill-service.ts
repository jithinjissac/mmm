import type { Bill, Tenant } from "@/types/bills"

// Mock tenants data
const mockTenants: Tenant[] = [
  { id: "tenant-1", name: "John Smith", avatarUrl: "/javascript-code-abstract.png" },
  { id: "tenant-2", name: "Emma Johnson", avatarUrl: "/stylized-ej-initials.png" },
  { id: "tenant-3", name: "Michael Brown", avatarUrl: "/abstract-blue-burst.png" },
  { id: "tenant-4", name: "Sarah Wilson", avatarUrl: "/abstract-southwest.png" },
]

// Mock bills data
const mockBills: Bill[] = [
  {
    id: "bill-1",
    title: "Electricity Bill - March",
    description: "Monthly electricity bill for the apartment",
    totalAmount: 120.5,
    dueDate: "2023-04-15",
    category: "utilities",
    createdBy: "tenant-1",
    createdAt: "2023-03-30T10:00:00Z",
    isRecurring: true,
    recurringFrequency: "monthly",
    shares: [
      { tenantId: "tenant-1", amount: 30.13, isPaid: true, paidAt: "2023-04-10T14:30:00Z" },
      { tenantId: "tenant-2", amount: 30.13, isPaid: true, paidAt: "2023-04-12T09:15:00Z" },
      { tenantId: "tenant-3", amount: 30.12, isPaid: false },
      { tenantId: "tenant-4", amount: 30.12, isPaid: false },
    ],
  },
  {
    id: "bill-2",
    title: "Internet Subscription",
    description: "Monthly internet subscription fee",
    totalAmount: 49.99,
    dueDate: "2023-04-20",
    category: "internet",
    createdBy: "tenant-2",
    createdAt: "2023-04-01T15:30:00Z",
    isRecurring: true,
    recurringFrequency: "monthly",
    shares: [
      { tenantId: "tenant-1", amount: 12.5, isPaid: true, paidAt: "2023-04-18T11:45:00Z" },
      { tenantId: "tenant-2", amount: 12.5, isPaid: true, paidAt: "2023-04-18T11:45:00Z" },
      { tenantId: "tenant-3", amount: 12.5, isPaid: true, paidAt: "2023-04-19T16:20:00Z" },
      { tenantId: "tenant-4", amount: 12.49, isPaid: false },
    ],
  },
  {
    id: "bill-3",
    title: "Grocery Shopping",
    description: "Weekly grocery shopping for the house",
    totalAmount: 85.75,
    dueDate: "2023-04-05",
    category: "groceries",
    createdBy: "tenant-3",
    createdAt: "2023-04-02T18:45:00Z",
    isRecurring: false,
    shares: [
      { tenantId: "tenant-1", amount: 21.44, isPaid: true, paidAt: "2023-04-03T09:30:00Z" },
      { tenantId: "tenant-2", amount: 21.44, isPaid: true, paidAt: "2023-04-04T14:15:00Z" },
      { tenantId: "tenant-3", amount: 21.44, isPaid: true, paidAt: "2023-04-02T18:45:00Z" },
      { tenantId: "tenant-4", amount: 21.43, isPaid: true, paidAt: "2023-04-05T10:20:00Z" },
    ],
  },
  {
    id: "bill-4",
    title: "Water Bill - Q1",
    description: "Quarterly water bill",
    totalAmount: 95.3,
    dueDate: "2023-04-30",
    category: "utilities",
    createdBy: "tenant-1",
    createdAt: "2023-04-10T11:20:00Z",
    isRecurring: true,
    recurringFrequency: "quarterly",
    shares: [
      { tenantId: "tenant-1", amount: 23.83, isPaid: false },
      { tenantId: "tenant-2", amount: 23.83, isPaid: false },
      { tenantId: "tenant-3", amount: 23.82, isPaid: false },
      { tenantId: "tenant-4", amount: 23.82, isPaid: false },
    ],
  },
]

// Simulate API delay
export const simulateApiDelay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms))

export const MockBillService = {
  // Get all bills
  getBills: async () => {
    await simulateApiDelay()
    return { data: mockBills, error: null }
  },

  // Get a specific bill by ID
  getBillById: async (id: string) => {
    await simulateApiDelay()
    const bill = mockBills.find((bill) => bill.id === id)
    return { data: bill, error: bill ? null : "Bill not found" }
  },

  // Get all tenants
  getTenants: async () => {
    await simulateApiDelay()
    return { data: mockTenants, error: null }
  },

  // Create a new bill
  createBill: async (billData: Omit<Bill, "id" | "createdAt">) => {
    await simulateApiDelay()
    const newBill: Bill = {
      ...billData,
      id: `bill-${mockBills.length + 1}`,
      createdAt: new Date().toISOString(),
    }
    mockBills.push(newBill)
    return { data: newBill, error: null }
  },

  // Update bill payment status
  updateBillPayment: async (billId: string, tenantId: string, isPaid: boolean) => {
    await simulateApiDelay()
    const billIndex = mockBills.findIndex((bill) => bill.id === billId)
    if (billIndex === -1) return { data: null, error: "Bill not found" }

    const shareIndex = mockBills[billIndex].shares.findIndex((share) => share.tenantId === tenantId)
    if (shareIndex === -1) return { data: null, error: "Share not found" }

    mockBills[billIndex].shares[shareIndex].isPaid = isPaid
    if (isPaid) {
      mockBills[billIndex].shares[shareIndex].paidAt = new Date().toISOString()
    } else {
      delete mockBills[billIndex].shares[shareIndex].paidAt
    }

    return { data: mockBills[billIndex], error: null }
  },
}

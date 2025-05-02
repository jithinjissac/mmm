"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BillCard } from "@/components/bills/bill-card"
import type { Bill, Tenant } from "@/types/bills"
import { MockBillService } from "@/lib/mock-bill-service"
import { Loader2, Plus, Receipt, Search } from "lucide-react"

export default function BillsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [bills, setBills] = useState<Bill[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<string>("all")

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Load bills
        const { data: billsData } = await MockBillService.getBills()
        setBills(billsData || [])

        // Load tenants
        const { data: tenantsData } = await MockBillService.getTenants()
        setTenants(tenantsData || [])
      } catch (error) {
        console.error("Error loading bills data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Filter bills based on search, category, and tab
  const filteredBills = bills.filter((bill) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      bill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bill.description && bill.description.toLowerCase().includes(searchQuery.toLowerCase()))

    // Category filter
    const matchesCategory = categoryFilter === "all" || bill.category === categoryFilter

    // Tab filter
    const isPaid = bill.shares.every((share) => share.isPaid)
    const isUnpaid = bill.shares.some((share) => !share.isPaid)
    const isOverdue = new Date(bill.dueDate) < new Date() && isUnpaid

    if (activeTab === "all") return matchesSearch && matchesCategory
    if (activeTab === "unpaid") return matchesSearch && matchesCategory && isUnpaid && !isOverdue
    if (activeTab === "paid") return matchesSearch && matchesCategory && isPaid
    if (activeTab === "overdue") return matchesSearch && matchesCategory && isOverdue

    return false
  })

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bills & Expenses</h1>
          <p className="text-muted-foreground">Manage and split bills with your housemates</p>
        </div>
        <Button onClick={() => router.push("/dashboard/tenant/bills/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Bill
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bills..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="utilities">Utilities</SelectItem>
            <SelectItem value="internet">Internet</SelectItem>
            <SelectItem value="groceries">Groceries</SelectItem>
            <SelectItem value="rent">Rent</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Bills</TabsTrigger>
          <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {filteredBills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No bills found</h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery || categoryFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Add your first bill to get started"}
              </p>
              {!searchQuery && categoryFilter === "all" && (
                <Button className="mt-4" onClick={() => router.push("/dashboard/tenant/bills/create")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Bill
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBills.map((bill) => (
                <BillCard key={bill.id} bill={bill} tenants={tenants} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="unpaid" className="mt-6">
          {filteredBills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No unpaid bills</h3>
              <p className="text-muted-foreground mt-1">All your bills are paid or overdue</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBills.map((bill) => (
                <BillCard key={bill.id} bill={bill} tenants={tenants} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="paid" className="mt-6">
          {filteredBills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No paid bills</h3>
              <p className="text-muted-foreground mt-1">You haven't paid any bills yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBills.map((bill) => (
                <BillCard key={bill.id} bill={bill} tenants={tenants} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="overdue" className="mt-6">
          {filteredBills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No overdue bills</h3>
              <p className="text-muted-foreground mt-1">All your bills are paid or still within the due date</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBills.map((bill) => (
                <BillCard key={bill.id} bill={bill} tenants={tenants} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

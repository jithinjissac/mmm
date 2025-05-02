"use client"

import { useState, useEffect } from "react"
import { BillForm } from "@/components/bills/bill-form"
import type { Tenant } from "@/types/bills"
import { MockBillService } from "@/lib/mock-bill-service"
import { Loader2 } from "lucide-react"

export default function CreateBillPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [tenants, setTenants] = useState<Tenant[]>([])

  useEffect(() => {
    const loadTenants = async () => {
      setIsLoading(true)
      try {
        const { data } = await MockBillService.getTenants()
        setTenants(data || [])
      } catch (error) {
        console.error("Error loading tenants:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTenants()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Bill</h1>
        <p className="text-muted-foreground">Add a new bill to split with your housemates</p>
      </div>

      <BillForm tenants={tenants} />
    </div>
  )
}

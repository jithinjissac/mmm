"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { BillDetail } from "@/components/bills/bill-detail"
import type { Bill, Tenant } from "@/types/bills"
import { MockBillService } from "@/lib/mock-bill-service"
import { Loader2 } from "lucide-react"

export default function BillDetailPage() {
  const router = useRouter()
  const params = useParams()
  const billId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [bill, setBill] = useState<Bill | null>(null)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Load bill details
        const { data: billData, error: billError } = await MockBillService.getBillById(billId)

        if (billError) {
          setError(billError)
          return
        }

        setBill(billData || null)

        // Load tenants
        const { data: tenantsData } = await MockBillService.getTenants()
        setTenants(tenantsData || [])
      } catch (error) {
        console.error("Error loading bill details:", error)
        setError("Failed to load bill details")
      } finally {
        setIsLoading(false)
      }
    }

    if (billId) {
      loadData()
    }
  }, [billId])

  const handleMarkAsPaid = async (tenantId: string) => {
    if (!bill) return

    try {
      const { data: updatedBill } = await MockBillService.updateBillPayment(bill.id, tenantId, true)
      if (updatedBill) {
        setBill(updatedBill)
      }
    } catch (error) {
      console.error("Error marking bill as paid:", error)
    }
  }

  const handleBack = () => {
    router.push("/dashboard/tenant/bills")
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !bill) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-xl font-semibold mb-2">Bill not found</h2>
        <p className="text-muted-foreground mb-4">{error || "The requested bill could not be found"}</p>
        <button className="text-primary hover:underline" onClick={handleBack}>
          Go back to bills
        </button>
      </div>
    )
  }

  return <BillDetail bill={bill} tenants={tenants} onMarkAsPaid={handleMarkAsPaid} onBack={handleBack} />
}

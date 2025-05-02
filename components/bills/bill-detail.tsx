"use client"

import type { Bill, Tenant } from "@/types/bills"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, User, ArrowLeft, Download, Repeat } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface BillDetailProps {
  bill: Bill
  tenants: Tenant[]
  onMarkAsPaid: (tenantId: string) => void
  onBack: () => void
}

export function BillDetail({ bill, tenants, onMarkAsPaid, onBack }: BillDetailProps) {
  // Format dates
  const dueDate = new Date(bill.dueDate)
  const formattedDueDate = dueDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const createdDate = new Date(bill.createdAt)
  const formattedCreatedDate = createdDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  // Check if bill is overdue
  const isOverdue = dueDate < new Date() && bill.shares.some((share) => !share.isPaid)

  // Get creator name
  const creator = tenants.find((tenant) => tenant.id === bill.createdBy)

  // Get category badge color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "utilities":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "internet":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "groceries":
        return "bg-green-100 text-green-800 border-green-200"
      case "rent":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="pl-0">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Bills
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{bill.title}</CardTitle>
              {bill.description && <CardDescription>{bill.description}</CardDescription>}
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${getCategoryColor(bill.category)} capitalize`}>{bill.category}</Badge>
              {bill.isRecurring && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Repeat className="h-3 w-3" />
                  <span className="capitalize">{bill.recurringFrequency}</span>
                </Badge>
              )}
              {isOverdue && <Badge variant="destructive">Overdue</Badge>}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Total Amount</span>
              <span className="text-2xl font-bold">{formatCurrency(bill.totalAmount)}</span>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Due Date
              </span>
              <span className="text-base">{formattedDueDate}</span>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" /> Created On
              </span>
              <span className="text-base">{formattedCreatedDate}</span>
              {creator && (
                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <User className="h-3 w-3" /> by {creator.name}
                </span>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Payment Breakdown</h3>
            <div className="space-y-4">
              {bill.shares.map((share) => {
                const tenant = tenants.find((t) => t.id === share.tenantId)
                if (!tenant) return null

                return (
                  <div key={share.tenantId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={tenant.avatarUrl || "/placeholder.svg"} alt={tenant.name} />
                        <AvatarFallback>{tenant.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{tenant.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {share.isPaid ? `Paid on ${new Date(share.paidAt!).toLocaleDateString()}` : "Not paid yet"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-medium">{formatCurrency(share.amount)}</span>
                      {!share.isPaid && (
                        <Button size="sm" onClick={() => onMarkAsPaid(share.tenantId)}>
                          Mark as Paid
                        </Button>
                      )}
                      {share.isPaid && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Paid
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {bill.attachmentUrl && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-medium mb-4">Attachments</h3>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <span>Download Bill</span>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

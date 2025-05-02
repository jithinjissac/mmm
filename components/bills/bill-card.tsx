import type { Bill } from "@/types/bills"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Calendar, ArrowRight } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

interface BillCardProps {
  bill: Bill
  tenants: { id: string; name: string; avatarUrl?: string }[]
}

export function BillCard({ bill, tenants }: BillCardProps) {
  // Calculate payment progress
  const paidShares = bill.shares.filter((share) => share.isPaid)
  const paidAmount = paidShares.reduce((sum, share) => sum + share.amount, 0)
  const progressPercentage = (paidAmount / bill.totalAmount) * 100

  // Format due date
  const dueDate = new Date(bill.dueDate)
  const formattedDueDate = dueDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  // Check if bill is overdue
  const isOverdue = dueDate < new Date() && progressPercentage < 100

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
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{bill.title}</CardTitle>
            <CardDescription>{bill.description}</CardDescription>
          </div>
          <Badge className={`${getCategoryColor(bill.category)} capitalize`}>{bill.category}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Due: {formattedDueDate}</span>
          </div>
          <div className="font-semibold text-lg">{formatCurrency(bill.totalAmount)}</div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Payment Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="mt-4">
          <div className="text-sm text-muted-foreground mb-2">Participants:</div>
          <div className="flex -space-x-2">
            {bill.shares.map((share) => {
              const tenant = tenants.find((t) => t.id === share.tenantId)
              if (!tenant) return null

              return (
                <div key={share.tenantId} className="relative">
                  <Avatar className={`border-2 ${share.isPaid ? "border-green-500" : "border-gray-200"}`}>
                    <AvatarImage src={tenant.avatarUrl || "/placeholder.svg"} alt={tenant.name} />
                    <AvatarFallback>{tenant.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  {share.isPaid && (
                    <span className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-3 h-3 border-2 border-white"></span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="ghost" className="w-full" size="sm">
          <Link href={`/dashboard/tenant/bills/${bill.id}`}>
            <span>View Details</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

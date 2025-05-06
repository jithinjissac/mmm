import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, CreditCard, CheckCircle, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function TenantPaymentsPage() {
  const supabase = createServerComponentClient({ cookies })

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch payments from Supabase
  const { data: payments, error } = await supabase
    .from("payments")
    .select("*")
    .eq("tenant_id", user?.id)
    .order("due_date", { ascending: false })

  if (error) {
    console.error("Error fetching payments:", error)
  }

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "pending":
        return <AlertCircle className="h-5 w-5 text-amber-500" />
      case "overdue":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <CreditCard className="h-5 w-5 text-gray-500" />
    }
  }

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            Paid
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
            Pending
          </Badge>
        )
      case "overdue":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            Overdue
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount)
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <Link href="/dashboard/tenant/payments/make">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Make Payment
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {payments && payments.length > 0 ? (
          payments.map((payment) => (
            <Link href={`/dashboard/tenant/payments/${payment.id}`} key={payment.id}>
              <Card className="h-full transition-all hover:bg-accent hover:text-accent-foreground">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">{payment.type || "Rent Payment"}</CardTitle>
                  {getStatusIcon(payment.status)}
                </CardHeader>
                <CardContent>
                  <div className="mb-2">{getStatusBadge(payment.status)}</div>
                  <div className="text-2xl font-bold mb-2">{formatCurrency(payment.amount)}</div>
                  <CardDescription>{payment.description || "Monthly rent payment"}</CardDescription>
                  <div className="mt-2">
                    <p className="text-sm">
                      <span className="font-medium">Due Date:</span> {new Date(payment.due_date).toLocaleDateString()}
                    </p>
                    {payment.paid_date && (
                      <p className="text-sm">
                        <span className="font-medium">Paid Date:</span>{" "}
                        {new Date(payment.paid_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-muted-foreground">Reference: {payment.reference || payment.id}</p>
                </CardFooter>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <h3 className="text-lg font-medium">No payments found</h3>
            <p className="text-muted-foreground mt-1">You don't have any payments due at the moment</p>
          </div>
        )}
      </div>
    </div>
  )
}

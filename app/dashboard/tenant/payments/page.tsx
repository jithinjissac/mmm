"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, CreditCard, Calendar, CheckCircle, Download, Eye } from "lucide-react"
import { useAuth } from "@/components/mock-auth-provider"
import WithAuthProtection from "@/components/auth/with-auth-protection"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

// Mock payment data
const mockPayments = [
  {
    id: 1,
    type: "Rent Payment",
    amount: 750,
    dueDate: "2023-06-01",
    status: "Paid",
    paidDate: "2023-06-01",
    method: "Direct Debit",
    reference: "REF-2023-06-01",
    propertyName: "Cozy City Apartment",
    receiptUrl: "#",
  },
  {
    id: 2,
    type: "Rent Payment",
    amount: 750,
    dueDate: "2023-05-01",
    status: "Paid",
    paidDate: "2023-05-01",
    method: "Direct Debit",
    reference: "REF-2023-05-01",
    propertyName: "Cozy City Apartment",
    receiptUrl: "#",
  },
  {
    id: 3,
    type: "Rent Payment",
    amount: 750,
    dueDate: "2023-04-01",
    status: "Paid",
    paidDate: "2023-04-01",
    method: "Direct Debit",
    reference: "REF-2023-04-01",
    propertyName: "Cozy City Apartment",
    receiptUrl: "#",
  },
  {
    id: 4,
    type: "Rent Payment",
    amount: 750,
    dueDate: "2023-07-01",
    status: "Upcoming",
    paidDate: null,
    method: "Direct Debit (Scheduled)",
    reference: null,
    propertyName: "Cozy City Apartment",
    receiptUrl: null,
  },
  {
    id: 5,
    type: "Deposit Payment",
    amount: 900,
    dueDate: "2023-01-15",
    status: "Paid",
    paidDate: "2023-01-15",
    method: "Bank Transfer",
    reference: "DEP-2023-01-15",
    propertyName: "Cozy City Apartment",
    receiptUrl: "#",
  },
]

// Payment method type
type PaymentMethod = {
  id: string
  type: string
  last4: string
  expiryDate: string
  isDefault: boolean
}

// Mock payment methods
const mockPaymentMethods: PaymentMethod[] = [
  {
    id: "pm_1",
    type: "visa",
    last4: "4242",
    expiryDate: "04/25",
    isDefault: true,
  },
  {
    id: "pm_2",
    type: "mastercard",
    last4: "5555",
    expiryDate: "08/24",
    isDefault: false,
  },
]

export default function TenantPaymentsPage() {
  const { user, isLoading } = useAuth()
  const [payments, setPayments] = useState(mockPayments)
  const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods)
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const { toast } = useToast()

  const paidPayments = payments.filter((payment) => payment.status === "Paid")
  const upcomingPayments = payments.filter((payment) => payment.status === "Upcoming")
  const overduePayments = payments.filter((payment) => payment.status === "Overdue")

  const nextPayment = upcomingPayments.length > 0 ? upcomingPayments[0] : null
  const daysUntilNextPayment = nextPayment
    ? Math.ceil((new Date(nextPayment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const handlePayNow = (payment: any) => {
    setSelectedPayment(payment)
    setIsPaymentDialogOpen(true)
  }

  const processPayment = async () => {
    if (!selectedPayment) return

    setIsProcessingPayment(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Update payment status
    const updatedPayments = payments.map((payment) =>
      payment.id === selectedPayment.id
        ? {
            ...payment,
            status: "Paid",
            paidDate: new Date().toISOString().split("T")[0],
            method: "Credit Card",
            reference: `REF-${new Date().toISOString().split("T")[0]}`,
          }
        : payment,
    )

    setPayments(updatedPayments)
    setIsProcessingPayment(false)
    setIsPaymentDialogOpen(false)

    toast({
      title: "Payment Successful",
      description: `Your payment of £${selectedPayment.amount.toFixed(2)} has been processed successfully.`,
    })
  }

  const downloadReceipt = (payment: any) => {
    toast({
      title: "Receipt Downloaded",
      description: `Receipt for payment #${payment.reference} has been downloaded.`,
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading payments...</span>
      </div>
    )
  }

  return (
    <WithAuthProtection requiredRole="tenant">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Payments</h1>
            <p className="text-muted-foreground">Manage your rent payments and transaction history</p>
          </div>
          {nextPayment && (
            <Button onClick={() => handlePayNow(nextPayment)}>
              <CreditCard className="mr-2 h-4 w-4" /> Make Payment
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {nextPayment ? `£${nextPayment.amount.toFixed(2)}` : "No upcoming payments"}
              </div>
              <p className="text-xs text-muted-foreground">
                {nextPayment
                  ? `Due in ${daysUntilNextPayment} days (${new Date(nextPayment.dueDate).toLocaleDateString()})`
                  : "All payments are up to date"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Method</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paymentMethods.find((pm) => pm.isDefault)?.type || "Not Set"}</div>
              <p className="text-xs text-muted-foreground">
                {paymentMethods.find((pm) => pm.isDefault)
                  ? `Card ending in ${paymentMethods.find((pm) => pm.isDefault)?.last4}`
                  : "Add a payment method"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid (2023)</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                £{paidPayments.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {paidPayments.length} payment{paidPayments.length !== 1 ? "s" : ""} made
              </p>
            </CardContent>
          </Card>
        </div>

        {nextPayment && (
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Payment</CardTitle>
              <CardDescription>Your next scheduled rent payment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Amount:</p>
                    <p className="text-2xl font-bold">£{nextPayment.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Due Date:</p>
                    <p className="text-lg">{new Date(nextPayment.dueDate).toLocaleDateString()}</p>
                    <p className="text-sm text-muted-foreground">
                      {daysUntilNextPayment} day{daysUntilNextPayment !== 1 ? "s" : ""} from now
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Property:</p>
                    <p className="text-lg">{nextPayment.propertyName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status:</p>
                    <Badge className="bg-amber-500 mt-1">Upcoming</Badge>
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline">Change Payment Method</Button>
                  <Button onClick={() => handlePayNow(nextPayment)}>Pay Now</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Track your rent payments and transaction history</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All Payments</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                {overduePayments.length > 0 && <TabsTrigger value="overdue">Overdue</TabsTrigger>}
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <PaymentHistoryTable payments={payments} onPayNow={handlePayNow} onDownloadReceipt={downloadReceipt} />
              </TabsContent>

              <TabsContent value="paid" className="space-y-4">
                <PaymentHistoryTable
                  payments={paidPayments}
                  onPayNow={handlePayNow}
                  onDownloadReceipt={downloadReceipt}
                />
              </TabsContent>

              <TabsContent value="upcoming" className="space-y-4">
                <PaymentHistoryTable
                  payments={upcomingPayments}
                  onPayNow={handlePayNow}
                  onDownloadReceipt={downloadReceipt}
                />
              </TabsContent>

              {overduePayments.length > 0 && (
                <TabsContent value="overdue" className="space-y-4">
                  <PaymentHistoryTable
                    payments={overduePayments}
                    onPayNow={handlePayNow}
                    onDownloadReceipt={downloadReceipt}
                  />
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>

        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Make Payment</DialogTitle>
              <DialogDescription>
                Complete your payment using your saved payment method or add a new one.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedPayment && (
                <div className="rounded-lg border p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Amount:</span>
                      <span className="font-bold">£{selectedPayment.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Property:</span>
                      <span>{selectedPayment.propertyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Due Date:</span>
                      <span>{new Date(selectedPayment.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Payment Method</h3>
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`flex items-center justify-between rounded-lg border p-3 ${method.isDefault ? "border-primary" : ""}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium capitalize">{method.type}</p>
                          <p className="text-xs text-muted-foreground">**** **** **** {method.last4}</p>
                        </div>
                      </div>
                      {method.isDefault && <Badge>Default</Badge>}
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    <CreditCard className="mr-2 h-4 w-4" /> Add New Payment Method
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={processPayment} disabled={isProcessingPayment}>
                {isProcessingPayment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isProcessingPayment ? "Processing..." : "Confirm Payment"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </WithAuthProtection>
  )
}

// Payment History Table Component
function PaymentHistoryTable({
  payments,
  onPayNow,
  onDownloadReceipt,
}: {
  payments: any[]
  onPayNow: (payment: any) => void
  onDownloadReceipt: (payment: any) => void
}) {
  if (payments.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No payments found</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>
                {payment.status === "Paid"
                  ? new Date(payment.paidDate).toLocaleDateString()
                  : new Date(payment.dueDate).toLocaleDateString()}
              </TableCell>
              <TableCell>{payment.type}</TableCell>
              <TableCell>£{payment.amount.toFixed(2)}</TableCell>
              <TableCell>
                <Badge
                  className={
                    payment.status === "Paid"
                      ? "bg-green-500"
                      : payment.status === "Upcoming"
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }
                >
                  {payment.status}
                </Badge>
              </TableCell>
              <TableCell>{payment.reference || "-"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {payment.status === "Paid" ? (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => onDownloadReceipt(payment)}>
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download Receipt</span>
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View Details</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Payment Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium">Payment Type:</p>
                                <p>{payment.type}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Amount:</p>
                                <p>£{payment.amount.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Date Paid:</p>
                                <p>{new Date(payment.paidDate).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Reference:</p>
                                <p>{payment.reference}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Payment Method:</p>
                                <p>{payment.method}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Property:</p>
                                <p>{payment.propertyName}</p>
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <Button variant="outline" onClick={() => onDownloadReceipt(payment)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download Receipt
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  ) : (
                    <Button variant="default" size="sm" onClick={() => onPayNow(payment)}>
                      Pay Now
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

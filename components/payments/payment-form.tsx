"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, CreditCard, PoundSterling } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Mock tenancy data (simplified from TenancyDetail)
const MOCK_TENANCIES = [
  {
    id: "tenancy1",
    listing_title: "Modern City Apartment",
    room_name: "Master Bedroom",
    rent: 800,
    deposit: 1000,
    payments: [
      {
        id: "payment3",
        amount: 800,
        type: "rent",
        status: "due",
        due_date: "2023-09-15",
        paid_date: null,
      },
    ],
  },
  // Other tenancies...
]

export function PaymentForm() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [tenancy, setTenancy] = useState<any>(null)
  const [nextPayment, setNextPayment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  })

  useEffect(() => {
    const fetchTenancy = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const foundTenancy = MOCK_TENANCIES.find((t) => t.id === params.id)
        if (!foundTenancy) {
          toast({
            title: "Tenancy not found",
            description: "The tenancy you're looking for doesn't exist or has been removed.",
            variant: "destructive",
          })
          router.push("/tenancies")
          return
        }

        setTenancy(foundTenancy)

        // Find the next due payment
        const duePayment = foundTenancy.payments.find((p: any) => p.status === "due")
        setNextPayment(duePayment)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load payment details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchTenancy()
    }
  }, [params.id, router, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCardDetails({
      ...cardDetails,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (paymentMethod === "card") {
      // Validate card details
      if (!cardDetails.cardNumber || !cardDetails.cardName || !cardDetails.expiryDate || !cardDetails.cvv) {
        toast({
          title: "Missing information",
          description: "Please fill in all card details.",
          variant: "destructive",
        })
        return
      }
    }

    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call to process payment
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Payment successful",
        description: `Your payment of £${nextPayment.amount} has been processed successfully.`,
      })

      router.push(`/tenancy/${params.id}`)
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!tenancy || !nextPayment) {
    return (
      <div className="text-center py-6">
        <h3 className="text-lg font-medium">No payment due</h3>
        <p className="text-muted-foreground mt-2">There are no payments due for this tenancy.</p>
        <Button className="mt-4" onClick={() => router.push(`/tenancy/${params.id}`)}>
          Back to Tenancy
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Make a Payment</CardTitle>
          <CardDescription>
            Pay your rent for {tenancy.listing_title} - {tenancy.room_name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Payment Details</h3>
                <div className="mt-4 space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="text-2xl font-bold">£{nextPayment.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className="font-medium">{nextPayment.due_date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Type</p>
                    <p className="font-medium capitalize">{nextPayment.type}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Payment Method</h3>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" /> Credit/Debit Card
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bank" id="bank" />
                    <Label htmlFor="bank" className="flex items-center">
                      <PoundSterling className="h-4 w-4 mr-2" /> Bank Transfer
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {paymentMethod === "card" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.cardNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input
                      id="cardName"
                      name="cardName"
                      placeholder="John Smith"
                      value={cardDetails.cardName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        name="expiryDate"
                        placeholder="MM/YY"
                        value={cardDetails.expiryDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        name="cvv"
                        placeholder="123"
                        value={cardDetails.cvv}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "bank" && (
                <div className="bg-muted p-4 rounded-md">
                  <h4 className="font-medium mb-2">Bank Transfer Details</h4>
                  <p className="text-sm mb-1">Account Name: UK Rental Solutions Ltd</p>
                  <p className="text-sm mb-1">Account Number: 12345678</p>
                  <p className="text-sm mb-1">Sort Code: 12-34-56</p>
                  <p className="text-sm mb-1">Reference: TEN-{params.id}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please use the reference above when making your bank transfer. Once you've made the transfer, click
                    "Confirm Payment" below.
                  </p>
                </div>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {paymentMethod === "card" ? "Pay Now" : "Confirm Payment"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowRight } from "lucide-react"
import { useVerification } from "@/lib/verification/verification-context"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/mock-auth-provider"

export function VerificationComplete() {
  const { verificationState } = useVerification()
  const { userRole } = useAuth()
  const router = useRouter()

  const getDashboardPath = () => {
    if (userRole === "landlord") {
      return "/dashboard/landlord/properties"
    } else if (userRole === "tenant") {
      return "/dashboard/tenant/rental"
    }
    return `/dashboard/${userRole || "tenant"}`
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Verification Complete</CardTitle>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Verified
          </Badge>
        </div>
        <CardDescription>
          Your identity has been successfully verified. You now have full access to all platform features.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-6">
        <div className="rounded-full bg-green-100 p-3 mb-4">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Verification Successful</h3>
        <p className="text-center text-muted-foreground mb-6">
          Thank you for completing the verification process. Your account is now fully verified.
        </p>
        <div className="w-full max-w-md bg-muted p-4 rounded-lg mb-6">
          <p className="text-sm font-medium mb-2">Verified on:</p>
          <p className="text-sm text-muted-foreground">
            {verificationState.verifiedAt
              ? new Date(verificationState.verifiedAt).toLocaleString()
              : new Date().toLocaleString()}
          </p>
        </div>
        <Button onClick={() => router.push(getDashboardPath())} className="w-full">
          Continue to Dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}

"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useVerification } from "@/lib/verification/verification-context"
import { useAuth } from "@/components/mock-auth-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, ArrowRight } from "lucide-react"

interface VerificationCheckProps {
  children: React.ReactNode
  requiredFor?: string[]
}

export function VerificationCheck({ children, requiredFor = [] }: VerificationCheckProps) {
  const { userRole } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [showWarning, setShowWarning] = useState(false)

  // Initialize verification status and context.  This ensures the hook is always called.
  const verificationContext = useVerification()
  const isVerified = verificationContext?.isVerified ?? true // Default to true if context is unavailable

  // Check if verification is required for the current path
  const isVerificationRequired = () => {
    // If no specific paths are provided, assume verification is required
    if (requiredFor.length === 0) return true

    // Check if current path starts with any of the required paths
    return requiredFor.some((path) => pathname.startsWith(path))
  }

  // Check if the current user role requires verification
  const doesRoleRequireVerification = () => {
    // If user is not logged in or no role, don't require verification
    if (!userRole) return false

    // For this example, we'll require verification for landlords and tenants
    return ["landlord", "tenant"].includes(userRole)
  }

  useEffect(() => {
    // Only show warning if verification is required for this path and role
    if (isVerificationRequired() && doesRoleRequireVerification() && !isVerified) {
      setShowWarning(true)
    } else {
      setShowWarning(false)
    }
  }, [pathname, isVerified, userRole])

  if (showWarning) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
              Verification Required
            </CardTitle>
            <CardDescription>You need to complete ID verification to access this feature.</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Access Restricted</AlertTitle>
              <AlertDescription>
                For security reasons, we require identity verification before you can {getFeatureDescription(pathname)}.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Why do we require verification?</h3>
              <p className="text-sm text-muted-foreground">Identity verification helps us:</p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>Ensure the safety and security of all users</li>
                <li>Prevent fraud and scams on our platform</li>
                <li>Comply with legal and regulatory requirements</li>
                <li>Build trust between landlords and tenants</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/verification")} className="w-full">
              Complete Verification
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

// Helper function to get feature description based on path
function getFeatureDescription(pathname: string): string {
  if (pathname.includes("/properties/add") || pathname.includes("/properties/create")) {
    return "add new properties"
  } else if (pathname.includes("/apply")) {
    return "submit rental applications"
  } else if (pathname.includes("/messages")) {
    return "send messages"
  } else if (pathname.includes("/payments")) {
    return "process payments"
  } else if (pathname.includes("/maintenance")) {
    return "submit maintenance requests"
  } else {
    return "access this feature"
  }
}

"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useVerification } from "@/lib/verification/verification-context"
import { CheckCircle, AlertTriangle, Clock } from "lucide-react"
import Link from "next/link"

export function VerificationStatusIndicator() {
  const { isVerified, isPending, isRejected } = useVerification()

  if (isVerified) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <CheckCircle className="mr-1 h-3 w-3" />
        Verified
      </Badge>
    )
  }

  if (isPending) {
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        <Clock className="mr-1 h-3 w-3" />
        Pending
      </Badge>
    )
  }

  if (isRejected) {
    return (
      <div className="flex items-center space-x-2">
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Failed
        </Badge>
        <Button variant="ghost" size="sm" asChild className="h-6 text-xs">
          <Link href="/verification">Retry</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
        Unverified
      </Badge>
      <Button variant="ghost" size="sm" asChild className="h-6 text-xs">
        <Link href="/verification">Verify Now</Link>
      </Button>
    </div>
  )
}

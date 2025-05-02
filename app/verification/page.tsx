"use client"

import { VerificationWizard } from "@/components/verification/verification-wizard"
import MockAuthProvider, { useAuth } from "@/components/mock-auth-provider"
import { VerificationProvider } from "@/lib/verification/verification-context"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Create a content component that uses the auth context
function VerificationContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect to login if not logged in
    if (!isLoading && !user) {
      router.push("/login?redirect=/verification")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <VerificationWizard />
    </div>
  )
}

// Main page component that wraps the content with both providers
export default function VerificationPage() {
  return (
    <MockAuthProvider>
      <VerificationProvider>
        <VerificationContent />
      </VerificationProvider>
    </MockAuthProvider>
  )
}

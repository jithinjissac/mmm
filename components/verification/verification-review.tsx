"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useVerification } from "@/lib/verification/verification-context"

export function VerificationReview() {
  const { verificationState, submitVerificationData, isLoading } = useVerification()
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!termsAccepted || !privacyAccepted) {
      return
    }

    setSubmitting(true)
    try {
      await submitVerificationData()
    } finally {
      setSubmitting(false)
    }
  }

  const isSubmitDisabled = !termsAccepted || !privacyAccepted || submitting || isLoading

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Review Your Information</h3>
        <p className="text-sm text-muted-foreground">
          Please review your verification documents before submitting. Make sure all information is clear and accurate.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">ID Front</h4>
          <div className="border rounded-lg overflow-hidden">
            {verificationState.documents.idFront ? (
              <img
                src={verificationState.documents.idFront || "/placeholder.svg"}
                alt="ID Front"
                className="w-full object-contain h-48"
              />
            ) : (
              <div className="h-48 bg-muted flex items-center justify-center text-muted-foreground">
                No image uploaded
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selfie</h4>
          <div className="border rounded-lg overflow-hidden">
            {verificationState.documents.selfie ? (
              <img
                src={verificationState.documents.selfie || "/placeholder.svg"}
                alt="Selfie"
                className="w-full object-contain h-48"
              />
            ) : (
              <div className="h-48 bg-muted flex items-center justify-center text-muted-foreground">
                No image uploaded
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-start space-x-2">
          <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(!!checked)} />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the Terms of Service
            </Label>
            <p className="text-sm text-muted-foreground">
              I confirm that all information provided is accurate and belongs to me.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="privacy"
            checked={privacyAccepted}
            onCheckedChange={(checked) => setPrivacyAccepted(!!checked)}
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="privacy"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the Privacy Policy
            </Label>
            <p className="text-sm text-muted-foreground">
              I understand how my data will be used and stored for verification purposes.
            </p>
          </div>
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={isSubmitDisabled} className="w-full">
        {submitting || isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Verification"
        )}
      </Button>
    </div>
  )
}

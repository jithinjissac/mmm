"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Upload, Camera, CheckCircle, AlertTriangle, ArrowRight, RefreshCw } from "lucide-react"
import { useVerification, type VerificationStep } from "@/lib/verification/verification-context"
import { DocumentUpload } from "./document-upload"
import { SelfieCapture } from "./selfie-capture"
import { VerificationReview } from "./verification-review"
import { VerificationComplete } from "./verification-complete"

export function VerificationWizard() {
  // Use the verification context
  const { verificationState, currentStep, setCurrentStep, isVerified, isPending, isRejected, resetVerification } =
    useVerification()

  // For demo purposes - auto approve after 5 seconds
  const [demoApproving, setDemoApproving] = useState(false)
  const { mockApproveVerification } = useVerification()

  const handleDemoApprove = () => {
    setDemoApproving(true)
    setTimeout(() => {
      mockApproveVerification()
      setDemoApproving(false)
    }, 5000)
  }

  // If verification is rejected, show rejection message
  if (isRejected) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Verification Failed</CardTitle>
            <Badge variant="destructive">Rejected</Badge>
          </div>
          <CardDescription>
            Your verification was not successful. Please review the reason and try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Verification Rejected</AlertTitle>
            <AlertDescription>
              {verificationState.rejectionReason || "Your ID verification could not be completed. Please try again."}
            </AlertDescription>
          </Alert>
          <p className="text-sm text-muted-foreground mb-4">Common reasons for rejection include:</p>
          <ul className="list-disc pl-5 text-sm text-muted-foreground mb-6 space-y-1">
            <li>Blurry or unclear images</li>
            <li>Information on ID not matching account details</li>
            <li>Expired identification documents</li>
            <li>Selfie not matching ID photo</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button onClick={resetVerification} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // If verification is pending, show pending message
  if (isPending) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Verification In Progress</CardTitle>
            <Badge variant="secondary">Pending</Badge>
          </div>
          <CardDescription>Your verification is being processed. This usually takes 1-2 business days.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          {demoApproving ? (
            <>
              <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
              <p className="text-center text-muted-foreground">Processing your verification...</p>
            </>
          ) : (
            <>
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Verification Submitted</h3>
              <p className="text-center text-muted-foreground mb-6">
                We've received your verification documents and are reviewing them. You'll be notified once the process
                is complete.
              </p>
              <div className="w-full max-w-md bg-muted p-4 rounded-lg mb-6">
                <p className="text-sm font-medium mb-2">Submitted on:</p>
                <p className="text-sm text-muted-foreground">
                  {verificationState.submittedAt ? new Date(verificationState.submittedAt).toLocaleString() : "Unknown"}
                </p>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-sm text-muted-foreground mb-2 text-center w-full">For demo purposes only:</p>
          <div className="flex space-x-2 w-full">
            <Button variant="outline" className="w-full" onClick={() => resetVerification()} disabled={demoApproving}>
              Cancel Verification
            </Button>
            <Button className="w-full" onClick={handleDemoApprove} disabled={demoApproving}>
              {demoApproving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve (Demo)
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    )
  }

  // If verification is complete, show success message
  if (isVerified) {
    return <VerificationComplete />
  }

  // Map steps to tab values
  const stepToTab: Record<VerificationStep, string> = {
    upload: "upload",
    selfie: "selfie",
    review: "review",
    complete: "complete",
  }

  // Map tabs to steps
  const tabToStep: Record<string, VerificationStep> = {
    upload: "upload",
    selfie: "selfie",
    review: "review",
    complete: "complete",
  }

  const handleTabChange = (value: string) => {
    if (tabToStep[value]) {
      setCurrentStep(tabToStep[value])
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>ID Verification</CardTitle>
        <CardDescription>Complete the verification process to access all features of the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={stepToTab[currentStep]} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" disabled={currentStep !== "upload"}>
              <Upload className="mr-2 h-4 w-4" />
              Upload ID
            </TabsTrigger>
            <TabsTrigger
              value="selfie"
              disabled={!verificationState.documents.idFront || currentStep === "review" || currentStep === "complete"}
            >
              <Camera className="mr-2 h-4 w-4" />
              Take Selfie
            </TabsTrigger>
            <TabsTrigger
              value="review"
              disabled={
                !verificationState.documents.idFront ||
                !verificationState.documents.selfie ||
                currentStep === "complete"
              }
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Review
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="mt-6">
            <DocumentUpload />
          </TabsContent>
          <TabsContent value="selfie" className="mt-6">
            <SelfieCapture />
          </TabsContent>
          <TabsContent value="review" className="mt-6">
            <VerificationReview />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            if (currentStep === "selfie") {
              setCurrentStep("upload")
            } else if (currentStep === "review") {
              setCurrentStep("selfie")
            }
          }}
          disabled={currentStep === "upload"}
        >
          Back
        </Button>
        <Button
          onClick={() => {
            if (currentStep === "upload") {
              setCurrentStep("selfie")
            } else if (currentStep === "selfie") {
              setCurrentStep("review")
            }
          }}
          disabled={
            (currentStep === "upload" && !verificationState.documents.idFront) ||
            (currentStep === "selfie" && !verificationState.documents.selfie) ||
            currentStep === "review"
          }
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAuth } from "@/components/mock-auth-provider"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { getVerificationStatus, submitVerification, uploadVerificationImage } from "@/app/verification/actions"
import { toast } from "@/components/ui/use-toast"

export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected"

export type VerificationStep = "upload" | "selfie" | "review" | "complete"

interface VerificationState {
  status: VerificationStatus
  currentStep: VerificationStep
  documents: {
    idFront?: string
    idBack?: string
    selfie?: string
  }
  submittedAt?: string
  verifiedAt?: string
  rejectionReason?: string
}

interface VerificationContextType {
  verificationState: VerificationState
  isVerified: boolean
  isPending: boolean
  isRejected: boolean
  currentStep: VerificationStep
  setCurrentStep: (step: VerificationStep) => void
  uploadDocument: (type: keyof VerificationState["documents"], file: string) => void
  submitVerificationData: () => Promise<boolean>
  resetVerification: () => void
  loadVerificationStatus: () => Promise<void>
  isLoading: boolean
  mockApproveVerification: () => void // For demo purposes
  mockRejectVerification: (reason: string) => void // For demo purposes
}

const defaultState: VerificationState = {
  status: "unverified",
  currentStep: "upload",
  documents: {},
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined)

export function VerificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [storageKey, setStorageKey] = useState<string>("verification-state")
  const [isLoading, setIsLoading] = useState(false)

  // Use a safe version of useLocalStorage that handles SSR
  const [verificationState, setVerificationState] = useLocalStorage<VerificationState>(storageKey, defaultState)

  // Update storage key when user changes
  useEffect(() => {
    if (user?.id) {
      setStorageKey(`verification-state-${user.id}`)
    }
  }, [user?.id])

  // Reset state when user changes
  useEffect(() => {
    if (storageKey && !verificationState) {
      setVerificationState(defaultState)
    }
  }, [storageKey, verificationState, setVerificationState])

  // Load verification status from database on mount
  useEffect(() => {
    if (user?.id) {
      loadVerificationStatus()
    }
  }, [user?.id])

  // Ensure we always have a valid state object
  const safeState = verificationState || defaultState

  const isVerified = safeState.status === "verified"
  const isPending = safeState.status === "pending"
  const isRejected = safeState.status === "rejected"
  const [currentStep, setCurrentStepState] = useState<VerificationStep>(safeState.currentStep || "upload")

  const loadVerificationStatus = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const result = await getVerificationStatus()

      if (result.success && result.verification) {
        const dbState: VerificationState = {
          status: result.verification.status,
          currentStep:
            result.verification.status === "verified"
              ? "complete"
              : result.verification.status === "pending"
                ? "review"
                : "upload",
          documents: {
            idFront: result.verification.id_front_url || undefined,
            idBack: result.verification.id_back_url || undefined,
            selfie: result.verification.selfie_url || undefined,
          },
          submittedAt: result.verification.submitted_at || undefined,
          verifiedAt: result.verification.verified_at || undefined,
          rejectionReason: result.verification.rejection_reason || undefined,
        }

        setVerificationState(dbState)
        setCurrentStepState(dbState.currentStep)
      }
    } catch (error) {
      console.error("Error loading verification status:", error)
      toast({
        title: "Error",
        description: "Failed to load verification status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const setCurrentStep = (step: VerificationStep) => {
    setCurrentStepState(step)
    setVerificationState((prevState) => ({
      ...prevState,
      currentStep: step,
    }))
  }

  const uploadDocument = useCallback(
    async (type: keyof VerificationState["documents"], file: string) => {
      console.log(`Uploading document: ${type}`)

      // First update local state for immediate UI feedback
      setVerificationState((prevState) => ({
        ...prevState,
        documents: {
          ...prevState.documents,
          [type]: file,
        },
      }))

      // Then upload to storage if it's a base64 image
      if (file && file.startsWith("data:image")) {
        try {
          setIsLoading(true)
          const result = await uploadVerificationImage(file, type)

          if (result.success && result.url) {
            // Update local state with the permanent URL
            setVerificationState((prevState) => ({
              ...prevState,
              documents: {
                ...prevState.documents,
                [type]: result.url,
              },
            }))
            console.log(`Successfully uploaded ${type} to: ${result.url}`)
          } else {
            throw new Error(result.error || "Failed to upload image")
          }
        } catch (error: any) {
          console.error(`Error uploading ${type}:`, error)
          toast({
            title: "Upload Error",
            description: `Failed to upload ${type}: ${error.message}`,
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }
    },
    [setVerificationState],
  )

  const submitVerificationData = useCallback(async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to submit verification.",
        variant: "destructive",
      })
      return false
    }

    setIsLoading(true)
    try {
      const result = await submitVerification(
        safeState.documents.idFront || null,
        safeState.documents.idBack || null,
        safeState.documents.selfie || null,
      )

      if (result.success) {
        setVerificationState((prevState) => ({
          ...prevState,
          status: "pending",
          currentStep: "review",
          submittedAt: new Date().toISOString(),
        }))

        toast({
          title: "Verification Submitted",
          description: "Your verification documents have been submitted for review.",
        })

        return true
      } else {
        throw new Error(result.error || "Failed to submit verification")
      }
    } catch (error: any) {
      console.error("Error submitting verification:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit verification. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, safeState.documents, setVerificationState])

  const resetVerification = useCallback(() => {
    setVerificationState(() => ({
      ...defaultState,
      status: "unverified",
      currentStep: "upload",
      documents: {},
      rejectionReason: undefined,
      submittedAt: undefined,
      verifiedAt: undefined,
    }))
  }, [setVerificationState])

  // For demo purposes only
  const mockApproveVerification = useCallback(() => {
    setVerificationState((prevState) => ({
      ...prevState,
      status: "verified",
      currentStep: "complete",
      verifiedAt: new Date().toISOString(),
    }))
  }, [setVerificationState])

  // For demo purposes only
  const mockRejectVerification = useCallback(
    (reason: string) => {
      setVerificationState((prevState) => ({
        ...prevState,
        status: "rejected",
        rejectionReason: reason,
      }))
    },
    [setVerificationState],
  )

  return (
    <VerificationContext.Provider
      value={{
        verificationState: safeState,
        isVerified,
        isPending,
        isRejected,
        currentStep,
        setCurrentStep,
        uploadDocument,
        submitVerificationData,
        resetVerification,
        loadVerificationStatus,
        isLoading,
        mockApproveVerification,
        mockRejectVerification,
      }}
    >
      {children}
    </VerificationContext.Provider>
  )
}

export function useVerification() {
  const context = useContext(VerificationContext)
  if (context === undefined) {
    throw new Error("useVerification must be used within a VerificationProvider")
  }
  return context
}

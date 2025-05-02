export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected"

export type VerificationStep = "upload" | "selfie" | "review" | "complete"

export interface Verification {
  id: string
  user_id: string
  status: VerificationStatus
  id_front_url: string | null
  id_back_url: string | null
  selfie_url: string | null
  rejection_reason: string | null
  submitted_at: string | null
  verified_at: string | null
  created_at: string
  updated_at: string
}

export interface VerificationState {
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

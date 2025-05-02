"use client"

import { useCallback } from "react"
import type { AuthErrorType } from "@/components/auth/auth-error-boundary"

export class AuthError extends Error {
  code: AuthErrorType

  constructor(message: string, code: AuthErrorType = "unknown") {
    super(message)
    this.name = "AuthError"
    this.code = code
  }
}

export function useAuthError() {
  const throwAuthError = useCallback((message: string, code: AuthErrorType = "unknown") => {
    throw new AuthError(message, code)
  }, [])

  return { throwAuthError, AuthError }
}

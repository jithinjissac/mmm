"use client"

import { useEffect, memo } from "react"

function ClearBadCookiesComponent() {
  // Disable automatic cookie clearing as it's causing login issues
  useEffect(() => {
    // Only log that we're not clearing cookies
    console.log("Cookie auto-clearing disabled to prevent login issues")
  }, [])

  return null
}

// Memoize the component to prevent unnecessary re-renders
export const ClearBadCookies = memo(ClearBadCookiesComponent)

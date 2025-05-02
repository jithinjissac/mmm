import type { Metadata } from "next"
import TenantMessagesClientPage from "./TenantMessagesClientPage"

export const metadata: Metadata = {
  title: "Messages | UK Rental Solution",
  description: "Communicate with your landlord",
}

export default function TenantMessagesPage() {
  return <TenantMessagesClientPage />
}

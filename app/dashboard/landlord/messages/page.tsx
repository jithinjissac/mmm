import type { Metadata } from "next"
import LandlordMessagesClientPage from "./LandlordMessagesClientPage"

export const metadata: Metadata = {
  title: "Messages | UK Rental Solution",
  description: "Manage your conversations with tenants",
}

export default function LandlordMessagesPage() {
  return <LandlordMessagesClientPage />
}

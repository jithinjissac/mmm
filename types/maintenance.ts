export interface MaintenanceRequest {
  id: string
  property_id: string
  room_id: string
  tenant_id?: string
  landlord_id: string
  title: string
  description: string
  category: string
  priority: "low" | "medium" | "high" | "emergency"
  status: "new" | "in-progress" | "scheduled" | "completed" | "cancelled"
  reported_date: string
  scheduled_date?: string
  completed_date?: string
  assigned_to?: string
  images?: string[]
  notes?: string
  resolution?: string

  // New fields
  preferred_date?: string
  preferred_time_slot?: string
  access_instructions?: string
  permission_to_enter?: boolean
  contact_method?: string
  alternative_contact?: string
  alternative_phone?: string
  additional_notes?: string
}

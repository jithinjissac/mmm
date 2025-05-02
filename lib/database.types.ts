export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: "admin" | "landlord" | "tenant" | "maintenance"
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: "admin" | "landlord" | "tenant" | "maintenance"
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: "admin" | "landlord" | "tenant" | "maintenance"
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          landlord_id: string
          name: string
          address: string
          city: string
          postcode: string
          property_type: "apartment" | "apartment_building" | "house" | "studio" | "shared_house"
          description: string | null
          amenities: string[] | null
          monthly_income: number | null
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          landlord_id: string
          name: string
          address: string
          city: string
          postcode: string
          property_type: "apartment" | "apartment_building" | "house" | "studio" | "shared_house"
          description?: string | null
          amenities?: string[] | null
          monthly_income?: number | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          landlord_id?: string
          name?: string
          address?: string
          city?: string
          postcode?: string
          property_type?: "apartment" | "apartment_building" | "house" | "studio" | "shared_house"
          description?: string | null
          amenities?: string[] | null
          monthly_income?: number | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      property_images: {
        Row: {
          id: string
          property_id: string
          url: string
          is_primary: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          url: string
          is_primary?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          url?: string
          is_primary?: boolean | null
          created_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          property_id: string
          name: string
          room_type: "single" | "double" | "ensuite" | "studio"
          max_occupants: number
          rent: number
          deposit: number
          status: "vacant" | "occupied" | "maintenance" | "reserved"
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          name: string
          room_type: "single" | "double" | "ensuite" | "studio"
          max_occupants?: number
          rent: number
          deposit: number
          status?: "vacant" | "occupied" | "maintenance" | "reserved"
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          name?: string
          room_type?: "single" | "double" | "ensuite" | "studio"
          max_occupants?: number
          rent?: number
          deposit?: number
          status?: "vacant" | "occupied" | "maintenance" | "reserved"
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      room_images: {
        Row: {
          id: string
          room_id: string
          url: string
          is_primary: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          url: string
          is_primary?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          url?: string
          is_primary?: boolean | null
          created_at?: string
        }
      }
      verifications: {
        Row: {
          id: string
          user_id: string
          status: "unverified" | "pending" | "verified" | "rejected"
          id_front_url: string | null
          id_back_url: string | null
          selfie_url: string | null
          rejection_reason: string | null
          submitted_at: string | null
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status: "unverified" | "pending" | "verified" | "rejected"
          id_front_url?: string | null
          id_back_url?: string | null
          selfie_url?: string | null
          rejection_reason?: string | null
          submitted_at?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: "unverified" | "pending" | "verified" | "rejected"
          id_front_url?: string | null
          id_back_url?: string | null
          selfie_url?: string | null
          rejection_reason?: string | null
          submitted_at?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "admin" | "landlord" | "tenant" | "maintenance"
      property_type: "apartment" | "apartment_building" | "house" | "studio" | "shared_house"
      room_type: "single" | "double" | "ensuite" | "studio"
      room_status: "vacant" | "occupied" | "maintenance" | "reserved"
      verification_status: "unverified" | "pending" | "verified" | "rejected"
    }
  }
}

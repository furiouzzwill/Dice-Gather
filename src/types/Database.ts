export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          account_type: "personal" | "business" | null
          business_name: string | null
          business_type: string | null
          business_address: string | null
          business_city: string | null
          business_state: string | null
          business_zip: string | null
          created_at: string
          updated_at: string
          online: boolean
          unlocks?: any
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          account_type?: "personal" | "business" | null
          business_name?: string | null
          business_type?: string | null
          business_address?: string | null
          business_city?: string | null
          business_state?: string | null
          business_zip?: string | null
          created_at?: string
          updated_at?: string
          online?: boolean
          unlocks?: any
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          account_type?: "personal" | "business" | null
          business_name?: string | null
          business_type?: string | null
          business_address?: string | null
          business_city?: string | null
          business_state?: string | null
          business_zip?: string | null
          created_at?: string
          updated_at?: string
          online?: boolean
          unlocks?: any
        }
      }
      games: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string
          difficulty: string
          date: string
          duration: number
          location: string
          image_url: string | null
          spots_total: number
          spots_available: number
          host_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category: string
          difficulty: string
          date: string
          duration: number
          location: string
          image_url?: string | null
          spots_total: number
          spots_available: number
          host_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: string
          difficulty?: string
          date?: string
          duration?: number
          location?: string
          image_url?: string | null
          spots_total?: number
          spots_available?: number
          host_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      reservations: {
        Row: {
          id: string
          game_id: string
          user_id: string
          status: "pending" | "confirmed" | "cancelled"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          game_id: string
          user_id: string
          status?: "pending" | "confirmed" | "cancelled"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          user_id?: string
          status?: "pending" | "confirmed" | "cancelled"
          created_at?: string
          updated_at?: string
        }
      }
      friends: {
        Row: {
          id: string
          user_id: string
          friend_id: string
          status: "pending" | "accepted"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          friend_id: string
          status?: "pending" | "accepted"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          friend_id?: string
          status?: "pending" | "accepted"
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          read?: boolean
          created_at?: string
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
      [_ in never]: never
    }
  }
}


import "react-native-url-polyfill/auto"
import { createClient } from "@supabase/supabase-js"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../config/env"
// Or if you're importing directly from the Database file
// import type { Database } from "../types/Database"

// Define the Database types directly in this file
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

// Define common types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Game = Database["public"]["Tables"]["games"]["Row"]
export type Reservation = Database["public"]["Tables"]["reservations"]["Row"]
export type Friend = Database["public"]["Tables"]["friends"]["Row"]
export type Message = Database["public"]["Tables"]["messages"]["Row"]

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Helper function to get user profile
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching user profile:", error)
    return null
  }

  return data
}

// Helper function to update user profile
export async function updateUserProfile(userId: string, updates: any) {
  const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId).select()

  if (error) {
    console.error("Error updating user profile:", error)
    return null
  }

  return data
}

// Helper function to get friends
export async function getFriends(userId: string) {
  const { data, error } = await supabase
    .from("friends")
    .select(`*, profile:profiles!friend_id(*)`)
    .eq("user_id", userId)
    .eq("status", "accepted")

  if (error) {
    console.error("Error fetching friends:", error)
    return []
  }

  return data
}

// Helper function to get pending friend requests
export async function getPendingRequests(userId: string) {
  const { data, error } = await supabase
    .from("friends")
    .select(`*, profile:profiles!user_id(*)`)
    .eq("friend_id", userId)
    .eq("status", "pending")

  if (error) {
    console.error("Error fetching pending requests:", error)
    return []
  }

  return data
}


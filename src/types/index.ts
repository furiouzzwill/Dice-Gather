export * from "./Database"

// Re-export common types for convenience
import type { Database } from "./Database"

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
// Update the Game type to ensure image_url is properly typed
export type Game = Database["public"]["Tables"]["games"]["Row"] & {
  host?: {
    id: string
    full_name: string
    avatar_url?: string | null
    account_type?: string
    created_at?: string
    updated_at?: string
    [key: string]: any
  }
}
export type Reservation = Database["public"]["Tables"]["reservations"]["Row"]
export type Friend = Database["public"]["Tables"]["friends"]["Row"]
export type Message = Database["public"]["Tables"]["messages"]["Row"]


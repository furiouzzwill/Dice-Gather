"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase, getUserProfile, type Profile } from "../lib/supabase"
import type { Session, AuthChangeEvent } from "@supabase/supabase-js"

// Add this export at the top of the file, after the imports
export type User = {
  id: string
  email?: string | null
  name?: string
  avatar?: string
  joinedDate?: string
  accountType?: "personal" | "business"
  businessInfo?: {
    businessName: string
    businessType: string
    location?: {
      address: string
      city: string
      state: string
      zip: string
    }
  }
  friends?: string[]
  friendRequests?: string[]
  unlocks?: any
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  signup: (
    name: string,
    email: string,
    username: string,
    password: string,
    accountType?: "personal" | "business",
    businessInfo?: {
      businessName: string
      businessType: string
      location?: {
        address: string
        city: string
        state: string
        zip: string
      }
    },
  ) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  updateUser: (userData: Partial<Profile>) => Promise<void>
  loginWithMagicLink: (email: string) => Promise<{ success: boolean; message: string }>
  loginWithProvider: (provider: "google" | "facebook" | "apple") => Promise<{ success: boolean; message?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for active session on mount
    checkUser()

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          setUser(session.user)
          const userProfile = await getUserProfile(session.user.id)
          setProfile(userProfile)
        } else {
          setUser(null)
          setProfile(null)
        }
        setIsLoading(false)
      },
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  async function checkUser() {
    try {
      setIsLoading(true)
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        setUser(session.user)
        const userProfile = await getUserProfile(session.user.id)
        setProfile(userProfile)
      }
    } catch (error) {
      console.error("Error checking user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return { success: true, message: "Logged in successfully!" }
    } catch (error: any) {
      return { success: false, message: error.message || "Failed to login" }
    }
  }

  // Add a magic link login function for mobile
  async function loginWithMagicLink(email: string) {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: "dicegather://login-callback", // Your deep link URL
        },
      })

      if (error) throw error

      return {
        success: true,
        message: "Check your email for the login link!",
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to send magic link",
      }
    }
  }

  // Add OAuth login for mobile
  async function loginWithProvider(provider: "google" | "facebook" | "apple") {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: "dicegather://login-callback", // Your deep link URL
        },
      })

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || `Failed to login with ${provider}`,
      }
    }
  }

  async function signup(
    name: string,
    email: string,
    username: string,
    password: string,
    accountType: "personal" | "business" = "personal",
    businessInfo?: {
      businessName: string
      businessType: string
      location?: {
        address: string
        city: string
        state: string
        zip: string
      }
    },
  ) {
    try {
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error
      if (!data.user) throw new Error("User creation failed")

      // Create profile
      const profileData: any = {
        id: data.user.id,
        username,
        full_name: name,
        account_type: accountType,
      }

      // Add business info if provided
      if (accountType === "business" && businessInfo) {
        profileData.business_name = businessInfo.businessName
        profileData.business_type = businessInfo.businessType

        if (businessInfo.location) {
          profileData.business_address = businessInfo.location.address
          profileData.business_city = businessInfo.location.city
          profileData.business_state = businessInfo.location.state
          profileData.business_zip = businessInfo.location.zip
        }
      }

      const { error: profileError } = await supabase.from("profiles").insert(profileData)

      if (profileError) throw profileError

      return { success: true, message: "Signed up successfully!" }
    } catch (error: any) {
      return { success: false, message: error.message || "Failed to sign up" }
    }
  }

  async function logout() {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  async function updateUser(userData: Partial<Profile>) {
    try {
      if (!user) throw new Error("No user logged in")

      const { error } = await supabase.from("profiles").update(userData).eq("id", user.id)

      if (error) throw error

      // Update local profile state
      setProfile((prev: Profile | null) => (prev ? { ...prev, ...userData } : null))
    } catch (error) {
      console.error("Error updating user:", error)
    }
  }

  const value = {
    user,
    profile,
    isLoading,
    login,
    loginWithMagicLink,
    loginWithProvider,
    signup,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}


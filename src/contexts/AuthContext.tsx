"use client"
import { createContext, useState, useContext, useEffect, type ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Alert } from "react-native"
import { mockUsers } from "../data/mockData"

// Define User type
export type User = {
  id: string
  name: string
  email: string
  username: string
  avatar?: string
  joinedDate?: string
  bio?: string
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
  online?: boolean
  friends?: string[]
  friendRequests?: string[]
  unlocks?: {
    [key: string]: {
      unlocked: boolean
      selected?: string
    }
  }
}

// Define AuthContext type
type AuthContextType = {
  user: User | null
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
  updateUser: (userData: Partial<User>) => Promise<void>
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Define props for AuthProvider
interface AuthProviderProps {
  children: ReactNode
}

// Create AuthProvider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is logged in on initial load
  useEffect(() => {
    async function loadUserFromStorage() {
      try {
        const userJson = await AsyncStorage.getItem("user")
        if (userJson) {
          const parsedUser = JSON.parse(userJson)

          // Ensure accountType is either "personal", "business", or undefined
          if (
            parsedUser.accountType &&
            parsedUser.accountType !== "personal" &&
            parsedUser.accountType !== "business"
          ) {
            parsedUser.accountType = undefined
          }

          setUser(parsedUser as User)
        }
      } catch (error) {
        console.error("Failed to load user from storage:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserFromStorage()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      // Simulate API call with mock data
      const foundUser = mockUsers.find((u) => u.email === email)

      if (!foundUser || (foundUser as any).password !== password) {
        return { success: false, message: "Invalid email or password" }
      }

      // Remove password from user object and ensure accountType is properly typed
      const { password: _, ...userWithoutPassword } = foundUser as any

      // Ensure accountType is either "personal", "business", or undefined
      if (
        userWithoutPassword.accountType &&
        userWithoutPassword.accountType !== "personal" &&
        userWithoutPassword.accountType !== "business"
      ) {
        userWithoutPassword.accountType = undefined
      }

      // Update online status
      userWithoutPassword.online = true

      // Save user to storage
      await AsyncStorage.setItem("user", JSON.stringify(userWithoutPassword))

      // Update state
      setUser(userWithoutPassword as User)

      return { success: true, message: "Login successful" }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: "An unexpected error occurred" }
    }
  }

  const signup = async (
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
  ) => {
    try {
      // Check if user already exists
      if (mockUsers.some((u) => u.email === email)) {
        return { success: false, message: "Email already in use" }
      }

      if (mockUsers.some((u) => u.username === username)) {
        return { success: false, message: "Username already taken" }
      }

      // Create new user
      const newUser = {
        id: `user${mockUsers.length + 1}`,
        name,
        email,
        username,
        password,
        avatar: `https://ui-avatars.com/api/?name=${name.replace(" ", "+")}&background=random`,
        joinedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        accountType,
        ...(accountType === "business" && { businessInfo }),
        online: true,
        friends: [] as string[],
        friendRequests: [] as string[],
      }

      // In a real app, you would send this to an API
      mockUsers.push(newUser as any)

      // Remove password from user object for storage
      const { password: _, ...userWithoutPassword } = newUser

      // Save user to storage
      await AsyncStorage.setItem("user", JSON.stringify(userWithoutPassword))

      // Update state
      setUser(userWithoutPassword)

      return { success: true, message: "Signup successful" }
    } catch (error) {
      console.error("Signup error:", error)
      return { success: false, message: "An unexpected error occurred" }
    }
  }

  const logout = async () => {
    try {
      // Update online status for the current user in mock data
      if (user) {
        const userIndex = mockUsers.findIndex((u) => u.id === user.id)
        if (userIndex !== -1) {
          mockUsers[userIndex].online = false
        }
      }

      await AsyncStorage.removeItem("user")
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
      Alert.alert("Error", "Failed to log out")
    }
  }

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (!user) return

      const updatedUser = { ...user, ...userData }

      // Update in mock data
      const userIndex = mockUsers.findIndex((u) => u.id === user.id)
      if (userIndex !== -1) {
        Object.assign(mockUsers[userIndex], userData)
      }

      // Save to storage
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser))

      // Update state
      setUser(updatedUser)
    } catch (error) {
      console.error("Update user error:", error)
      Alert.alert("Error", "Failed to update user")
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// Create hook for using auth
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}


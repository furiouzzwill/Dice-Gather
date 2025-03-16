"use client"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { Alert } from "react-native"
import { useAuth } from "./AuthContext"
import { supabase } from "../lib/supabase"
import type { User } from "./AuthContext"

// Define FriendsContext type
type FriendsContextType = {
  friends: User[]
  friendRequests: User[]
  isLoading: boolean
  sendFriendRequest: (userId: string) => Promise<boolean>
  acceptFriendRequest: (userId: string) => Promise<boolean>
  declineFriendRequest: (userId: string) => Promise<boolean>
  removeFriend: (userId: string) => Promise<boolean>
  isFriend: (userId: string) => Promise<boolean>
  hasSentFriendRequest: (userId: string) => Promise<boolean>
  hasReceivedFriendRequest: (userId: string) => Promise<boolean>
  refreshFriends: () => void
}

// Create context
const FriendsContext = createContext<FriendsContextType | undefined>(undefined)

// Define props for FriendsProvider
interface FriendsProviderProps {
  children: ReactNode
}

// Create FriendsProvider component
export const FriendsProvider = ({ children }: FriendsProviderProps) => {
  const { user } = useAuth()
  const [friends, setFriends] = useState<User[]>([])
  const [friendRequests, setFriendRequests] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load friends and friend requests
  const loadFriendsData = async () => {
    if (!user) {
      setFriends([])
      setFriendRequests([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)

      // Get accepted friends
      const { data: friendsData, error: friendsError } = await supabase
        .from("friends")
        .select(`*, profile:profiles!friend_id(*)`)
        .eq("user_id", user.id)
        .eq("status", "accepted")

      if (friendsError) throw friendsError

      // Get friend requests
      const { data: requestsData, error: requestsError } = await supabase
        .from("friends")
        .select(`*, profile:profiles!user_id(*)`)
        .eq("friend_id", user.id)
        .eq("status", "pending")

      if (requestsError) throw requestsError

      // Convert to User type
      const friendUsers =
        friendsData?.map((friend) => ({
          id: friend.friend_id,
          name: friend.profile.full_name,
          email: friend.profile.email,
          avatar: friend.profile.avatar_url,
          // Add other fields as needed
        })) || []

      const requestUsers =
        requestsData?.map((request) => ({
          id: request.user_id,
          name: request.profile.full_name,
          email: request.profile.email,
          avatar: request.profile.avatar_url,
          // Add other fields as needed
        })) || []

      setFriends(friendUsers)
      setFriendRequests(requestUsers)
    } catch (error) {
      console.error("Failed to load friends data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadFriendsData()
  }, [user])

  const refreshFriends = () => {
    loadFriendsData()
  }

  const sendFriendRequest = async (userId: string): Promise<boolean> => {
    try {
      if (!user) return false

      // Check if already friends
      const { data: existingFriend, error: existingFriendError } = await supabase
        .from("friends")
        .select("*")
        .or(`and(user_id.eq.${user.id},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${user.id})`)
        .eq("status", "accepted")
        .maybeSingle()

      if (existingFriendError) throw existingFriendError

      if (existingFriend) {
        Alert.alert("Already Friends", "You are already friends with this user.")
        return false
      }

      // Check if request already sent
      const { data: existingRequest, error: existingRequestError } = await supabase
        .from("friends")
        .select("*")
        .eq("user_id", user.id)
        .eq("friend_id", userId)
        .eq("status", "pending")
        .maybeSingle()

      if (existingRequestError) throw existingRequestError

      if (existingRequest) {
        Alert.alert("Request Pending", "You have already sent a friend request to this user.")
        return false
      }

      // Send friend request
      const { error } = await supabase.from("friends").insert({
        user_id: user.id,
        friend_id: userId,
        status: "pending",
      })

      if (error) throw error

      Alert.alert("Success", "Friend request sent successfully.")
      return true
    } catch (error) {
      console.error("Send friend request error:", error)
      Alert.alert("Error", "Failed to send friend request.")
      return false
    }
  }

  const acceptFriendRequest = async (userId: string): Promise<boolean> => {
    try {
      if (!user) return false

      // Find the friend request
      const { data: friendRequest, error: findError } = await supabase
        .from("friends")
        .select("*")
        .eq("user_id", userId)
        .eq("friend_id", user.id)
        .eq("status", "pending")
        .single()

      if (findError) {
        Alert.alert("No Request", "No friend request found from this user.")
        return false
      }

      // Update the friend request status
      const { error: updateError } = await supabase
        .from("friends")
        .update({ status: "accepted" })
        .eq("id", friendRequest.id)

      if (updateError) throw updateError

      // Refresh friends list
      refreshFriends()

      Alert.alert("Success", "Friend request accepted.")
      return true
    } catch (error) {
      console.error("Accept friend request error:", error)
      Alert.alert("Error", "Failed to accept friend request.")
      return false
    }
  }

  const declineFriendRequest = async (userId: string): Promise<boolean> => {
    try {
      if (!user) return false

      // Find the friend request
      const { data: friendRequest, error: findError } = await supabase
        .from("friends")
        .select("*")
        .eq("user_id", userId)
        .eq("friend_id", user.id)
        .eq("status", "pending")
        .single()

      if (findError) {
        Alert.alert("No Request", "No friend request found from this user.")
        return false
      }

      // Delete the friend request
      const { error: deleteError } = await supabase.from("friends").delete().eq("id", friendRequest.id)

      if (deleteError) throw deleteError

      // Refresh friends list
      refreshFriends()

      Alert.alert("Success", "Friend request declined.")
      return true
    } catch (error) {
      console.error("Decline friend request error:", error)
      Alert.alert("Error", "Failed to decline friend request.")
      return false
    }
  }

  const removeFriend = async (userId: string): Promise<boolean> => {
    try {
      if (!user) return false

      // Find the friendship
      const { data: friendship, error: findError } = await supabase
        .from("friends")
        .select("*")
        .or(`and(user_id.eq.${user.id},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${user.id})`)
        .eq("status", "accepted")
        .single()

      if (findError) {
        Alert.alert("Not Friends", "You are not friends with this user.")
        return false
      }

      // Delete the friendship
      const { error: deleteError } = await supabase.from("friends").delete().eq("id", friendship.id)

      if (deleteError) throw deleteError

      // Refresh friends list
      refreshFriends()

      Alert.alert("Success", "Friend removed successfully.")
      return true
    } catch (error) {
      console.error("Remove friend error:", error)
      Alert.alert("Error", "Failed to remove friend.")
      return false
    }
  }

  const isFriend = async (userId: string): Promise<boolean> => {
    if (!user) return false

    try {
      const { data, error } = await supabase
        .from("friends")
        .select("*")
        .or(`and(user_id.eq.${user.id},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${user.id})`)
        .eq("status", "accepted")
        .maybeSingle()

      if (error) throw error

      return !!data
    } catch (error) {
      console.error("Check friend status error:", error)
      return false
    }
  }

  const hasSentFriendRequest = async (userId: string): Promise<boolean> => {
    if (!user) return false

    try {
      const { data, error } = await supabase
        .from("friends")
        .select("*")
        .eq("user_id", user.id)
        .eq("friend_id", userId)
        .eq("status", "pending")
        .maybeSingle()

      if (error) throw error

      return !!data
    } catch (error) {
      console.error("Check sent request error:", error)
      return false
    }
  }

  const hasReceivedFriendRequest = async (userId: string): Promise<boolean> => {
    if (!user) return false

    try {
      const { data, error } = await supabase
        .from("friends")
        .select("*")
        .eq("user_id", userId)
        .eq("friend_id", user.id)
        .eq("status", "pending")
        .maybeSingle()

      if (error) throw error

      return !!data
    } catch (error) {
      console.error("Check received request error:", error)
      return false
    }
  }

  return (
    <FriendsContext.Provider
      value={{
        friends,
        friendRequests,
        isLoading,
        sendFriendRequest,
        acceptFriendRequest,
        declineFriendRequest,
        removeFriend,
        isFriend,
        hasSentFriendRequest,
        hasReceivedFriendRequest,
        refreshFriends,
      }}
    >
      {children}
    </FriendsContext.Provider>
  )
}

// Create hook for using friends
export const useFriends = () => {
  const context = useContext(FriendsContext)
  if (context === undefined) {
    throw new Error("useFriends must be used within a FriendsProvider")
  }
  return context
}


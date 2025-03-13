"use client"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { Alert } from "react-native"
import { useAuth } from "./AuthContext"
import { mockUsers, getUserById } from "../data/mockData"
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
  isFriend: (userId: string) => boolean
  hasSentFriendRequest: (userId: string) => boolean
  hasReceivedFriendRequest: (userId: string) => boolean
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
  const { user, updateUser } = useAuth()
  const [friends, setFriends] = useState<User[]>([])
  const [friendRequests, setFriendRequests] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load friends and friend requests
  const loadFriendsData = () => {
    if (!user) {
      setFriends([])
      setFriendRequests([])
      setIsLoading(false)
      return
    }

    try {
      // Get friends
      const userFriends = user.friends || []
      const friendsData = userFriends
        .map((friendId) => getUserById(friendId))
        .filter((friend) => friend !== undefined) as User[]

      setFriends(friendsData)

      // Get friend requests
      const userFriendRequests = user.friendRequests || []
      const requestsData = userFriendRequests
        .map((requesterId) => getUserById(requesterId))
        .filter((requester) => requester !== undefined) as User[]

      setFriendRequests(requestsData)
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

      // Find the user to send request to
      const targetUser = getUserById(userId)
      if (!targetUser) return false

      // Check if already friends
      if (user.friends?.includes(userId)) {
        Alert.alert("Already Friends", "You are already friends with this user.")
        return false
      }

      // Check if request already sent
      if (targetUser.friendRequests?.includes(user.id)) {
        Alert.alert("Request Pending", "You have already sent a friend request to this user.")
        return false
      }

      // Update target user's friend requests
      const targetIndex = mockUsers.findIndex((u) => u.id === userId)
      if (targetIndex === -1) return false

      // Use type assertion to fix the error
      const targetUserInMock = mockUsers[targetIndex]

      if (!targetUserInMock.friendRequests) {
        targetUserInMock.friendRequests = [] as string[]
      }
      // Now TypeScript knows it's a string array
      ;(targetUserInMock.friendRequests as string[]).push(user.id)

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

      // Check if request exists
      if (!user.friendRequests?.includes(userId)) {
        Alert.alert("No Request", "No friend request found from this user.")
        return false
      }

      // Update current user
      const updatedFriendRequests = user.friendRequests.filter((id) => id !== userId)
      const updatedFriends = [...(user.friends || []), userId]

      await updateUser({
        friendRequests: updatedFriendRequests,
        friends: updatedFriends,
      })

      // Update the other user
      const otherUserIndex = mockUsers.findIndex((u) => u.id === userId)
      if (otherUserIndex !== -1) {
        const otherUser = mockUsers[otherUserIndex]

        if (!otherUser.friends) {
          otherUser.friends = [] as string[]
        }
        // Now TypeScript knows it's a string array
        ;(otherUser.friends as string[]).push(user.id)
      }

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

      // Check if request exists
      if (!user.friendRequests?.includes(userId)) {
        Alert.alert("No Request", "No friend request found from this user.")
        return false
      }

      // Update current user
      const updatedFriendRequests = user.friendRequests.filter((id) => id !== userId)

      await updateUser({
        friendRequests: updatedFriendRequests,
      })

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

      // Check if they are friends
      if (!user.friends?.includes(userId)) {
        Alert.alert("Not Friends", "You are not friends with this user.")
        return false
      }

      // Update current user
      const updatedFriends = user.friends.filter((id) => id !== userId)

      await updateUser({
        friends: updatedFriends,
      })

      // Update the other user
      const otherUserIndex = mockUsers.findIndex((u) => u.id === userId)
      if (otherUserIndex !== -1 && mockUsers[otherUserIndex].friends) {
        const otherUserFriends = mockUsers[otherUserIndex].friends as string[]
        mockUsers[otherUserIndex].friends = otherUserFriends.filter((id) => id !== user.id)
      }

      refreshFriends()
      Alert.alert("Success", "Friend removed successfully.")
      return true
    } catch (error) {
      console.error("Remove friend error:", error)
      Alert.alert("Error", "Failed to remove friend.")
      return false
    }
  }

  const isFriend = (userId: string): boolean => {
    return user?.friends?.includes(userId) || false
  }

  const hasSentFriendRequest = (userId: string): boolean => {
    const targetUser = getUserById(userId)
    return targetUser?.friendRequests?.includes(user?.id || "") || false
  }

  const hasReceivedFriendRequest = (userId: string): boolean => {
    return user?.friendRequests?.includes(userId) || false
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


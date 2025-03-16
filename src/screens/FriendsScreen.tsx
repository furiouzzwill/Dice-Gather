"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "../contexts/ThemeContext"
import { useAuth } from "../contexts/AuthContext"
import { supabase } from "../lib/supabase"
import type { Profile } from "../types"

const FindFriendsScreen = () => {
  const navigation = useNavigation() as any
  const { colors } = useTheme()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [sentRequests, setSentRequests] = useState<string[]>([])
  const [existingFriends, setExistingFriends] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      fetchExistingFriends()
      fetchSentRequests()
    }
  }, [user])

  const fetchExistingFriends = async () => {
    try {
      const { data, error } = await supabase
        .from("friends")
        .select("friend_id")
        .eq("user_id", user?.id)
        .eq("status", "accepted")

      if (error) throw error
      if (data) {
        setExistingFriends(data.map((item) => item.friend_id))
      }
    } catch (error) {
      console.error("Error fetching existing friends:", error)
    }
  }

  const fetchSentRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("friends")
        .select("friend_id")
        .eq("user_id", user?.id)
        .eq("status", "pending")

      if (error) throw error
      if (data) {
        setSentRequests(data.map((item) => item.friend_id))
      }
    } catch (error) {
      console.error("Error fetching sent requests:", error)
    }
  }

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
        .neq("id", user?.id)
        .limit(20)

      if (error) throw error
      if (data) {
        setSearchResults(data)
      }
    } catch (error) {
      console.error("Error searching users:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchUsers()
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const sendFriendRequest = async (friendId: string) => {
    try {
      const { error } = await supabase.from("friends").insert({
        user_id: user?.id,
        friend_id: friendId,
        status: "pending",
      })

      if (error) throw error

      // Update local state
      setSentRequests([...sentRequests, friendId])
    } catch (error) {
      console.error("Error sending friend request:", error)
    }
  }

  const navigateToProfile = (userId: string) => {
    navigation.navigate("UserProfile", { userId })
  }

  const renderUserItem = ({ item }: { item: Profile }) => {
    const isFriend = existingFriends.includes(item.id)
    const isRequestSent = sentRequests.includes(item.id)

    return (
      <TouchableOpacity
        style={[styles.userItem, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => navigateToProfile(item.id)}
      >
        <Image source={{ uri: item.avatar_url || "https://via.placeholder.com/50" }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>{item.full_name}</Text>
          <Text style={[styles.userUsername, { color: colors.muted }]}>@{item.username}</Text>
        </View>
        {!isFriend && !isRequestSent ? (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => sendFriendRequest(item.id)}
          >
            <Ionicons name="person-add-outline" size={18} color="#ffffff" />
          </TouchableOpacity>
        ) : isFriend ? (
          <View style={[styles.friendBadge, { backgroundColor: colors.muted + "40" }]}>
            <Text style={[styles.friendBadgeText, { color: colors.muted }]}>Friend</Text>
          </View>
        ) : (
          <View style={[styles.pendingBadge, { backgroundColor: colors.primary + "40" }]}>
            <Text style={[styles.pendingBadgeText, { color: colors.primary }]}>Pending</Text>
          </View>
        )}
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Find Friends</Text>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.muted} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search by name or username"
          placeholderTextColor={colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color={colors.muted} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
        />
      ) : searchQuery.length > 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color={colors.muted} />
          <Text style={[styles.emptyText, { color: colors.muted }]}>No users found</Text>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color={colors.muted} />
          <Text style={[styles.emptyText, { color: colors.muted }]}>Search for users to add as friends</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  resultsList: {
    paddingBottom: 16,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
  },
  userUsername: {
    fontSize: 14,
  },
  addButton: {
    padding: 8,
    borderRadius: 20,
  },
  friendBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  friendBadgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  pendingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: "center",
    maxWidth: "80%",
  },
})

export default FindFriendsScreen


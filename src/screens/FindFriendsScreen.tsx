"use client"

import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native"
import { useState, useEffect } from "react"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "../contexts/ThemeContext"
import { useAuth } from "../contexts/AuthContext"
import { useFriends } from "../contexts/FriendsContext"
import { supabase } from "../lib/supabase"
import type { Profile, Friend } from "../types"

const FriendsScreen = () => {
  const navigation = useNavigation() as any
  const { colors } = useTheme()
  const { user, profile } = useAuth()
  const { friends, refreshFriends } = useFriends()
  const [pendingRequests, setPendingRequests] = useState<(Friend & { profile: Profile })[]>([])
  const [loading, setLoading] = useState(true)
  const [friendsList, setFriendsList] = useState<(Friend & { profile: Profile })[]>([])

  useEffect(() => {
    if (user) {
      fetchFriends()
      fetchPendingRequests()
    }
  }, [user])

  const fetchFriends = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("friends")
        .select(`*, profile:profiles!friend_id(*)`)
        .eq("user_id", user?.id)
        .eq("status", "accepted")

      if (error) throw error
      if (data) {
        setFriendsList(data as any)
        // Also refresh the friends context
        refreshFriends()
      }
    } catch (error) {
      console.error("Error fetching friends:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("friends")
        .select(`*, profile:profiles!user_id(*)`)
        .eq("friend_id", user?.id)
        .eq("status", "pending")

      if (error) throw error
      if (data) setPendingRequests(data as any)
    } catch (error) {
      console.error("Error fetching pending requests:", error)
    }
  }

  const acceptFriendRequest = async (requestId: string) => {
    try {
      const { error } = await supabase.from("friends").update({ status: "accepted" }).eq("id", requestId)

      if (error) throw error

      // Refresh lists
      fetchFriends()
      fetchPendingRequests()
    } catch (error) {
      console.error("Error accepting friend request:", error)
    }
  }

  const declineFriendRequest = async (requestId: string) => {
    try {
      const { error } = await supabase.from("friends").delete().eq("id", requestId)

      if (error) throw error

      // Refresh pending requests
      fetchPendingRequests()
    } catch (error) {
      console.error("Error declining friend request:", error)
    }
  }

  const removeFriend = async (friendId: string) => {
    try {
      const { error } = await supabase.from("friends").delete().eq("id", friendId)

      if (error) throw error

      // Refresh friends list
      fetchFriends()
    } catch (error) {
      console.error("Error removing friend:", error)
    }
  }

  const navigateToProfile = (userId: string) => {
    navigation.navigate("UserProfile", { userId })
  }

  const renderFriendItem = ({ item }: { item: Friend & { profile: Profile } }) => (
    <TouchableOpacity
      style={[styles.friendItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => navigateToProfile(item.friend_id)}
    >
      <Image source={{ uri: item.profile.avatar_url || "https://via.placeholder.com/50" }} style={styles.avatar} />
      <View style={styles.friendInfo}>
        <Text style={[styles.friendName, { color: colors.text }]}>{item.profile.full_name}</Text>
        <Text style={[styles.friendUsername, { color: colors.muted }]}>@{item.profile.username}</Text>
      </View>
      <TouchableOpacity
        style={[styles.removeButton, { backgroundColor: colors.muted + "20" }]}
        onPress={() => removeFriend(item.id)}
      >
        <Ionicons name="person-remove-outline" size={18} color={colors.muted} />
      </TouchableOpacity>
    </TouchableOpacity>
  )

  const renderRequestItem = ({ item }: { item: Friend & { profile: Profile } }) => (
    <View style={[styles.requestItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity style={styles.requestProfile} onPress={() => navigateToProfile(item.user_id)}>
        <Image source={{ uri: item.profile.avatar_url || "https://via.placeholder.com/50" }} style={styles.avatar} />
        <View style={styles.friendInfo}>
          <Text style={[styles.friendName, { color: colors.text }]}>{item.profile.full_name}</Text>
          <Text style={[styles.friendUsername, { color: colors.muted }]}>@{item.profile.username}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.acceptButton, { backgroundColor: colors.primary }]}
          onPress={() => acceptFriendRequest(item.id)}
        >
          <Ionicons name="checkmark" size={18} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.declineButton, { backgroundColor: colors.muted + "20" }]}
          onPress={() => declineFriendRequest(item.id)}
        >
          <Ionicons name="close" size={18} color={colors.muted} />
        </TouchableOpacity>
      </View>
    </View>
  )

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Please log in to view friends</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Friends</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate("FindFriends")}
        >
          <Ionicons name="person-add" size={18} color="#ffffff" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {pendingRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Friend Requests</Text>
          <FlatList
            data={pendingRequests}
            renderItem={renderRequestItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.requestsList}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Friends</Text>
        {loading ? (
          <Text style={[styles.emptyText, { color: colors.muted }]}>Loading...</Text>
        ) : friendsList.length > 0 ? (
          <FlatList
            data={friendsList}
            renderItem={renderFriendItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.friendsList}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.muted }]}>You don't have any friends yet</Text>
            <TouchableOpacity
              style={[styles.findButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate("FindFriends")}
            >
              <Text style={styles.findButtonText}>Find Friends</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  friendsList: {
    paddingBottom: 16,
  },
  requestsList: {
    paddingBottom: 16,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  requestItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  requestProfile: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  friendInfo: {
    marginLeft: 12,
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "600",
  },
  friendUsername: {
    fontSize: 14,
  },
  removeButton: {
    padding: 8,
    borderRadius: 20,
  },
  requestActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  acceptButton: {
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  declineButton: {
    padding: 8,
    borderRadius: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 20,
    textAlign: "center",
  },
  findButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  findButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
})

export default FriendsScreen


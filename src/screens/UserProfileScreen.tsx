"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useTheme } from "../contexts/ThemeContext"
import { useAuth } from "../contexts/AuthContext"
import { supabase } from "../lib/supabase"
import type { Profile, Game } from "../types"

type RouteParams = {
  userId: string
}

const UserProfileScreen = () => {
  const route = useRoute()
  const { userId } = route.params as RouteParams
  const navigation = useNavigation() as any
  const { colors } = useTheme()
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [friendStatus, setFriendStatus] = useState<"none" | "pending" | "accepted" | "received">("none")
  const [friendId, setFriendId] = useState<string | null>(null)
  const [hostedGames, setHostedGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      fetchUserProfile()
      fetchFriendStatus()
      fetchHostedGames()
    }
  }, [userId])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) throw error
      if (data) {
        setProfile(data)
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFriendStatus = async () => {
    if (!user) return

    try {
      // Check if user has sent a friend request
      const { data: sentRequest, error: sentError } = await supabase
        .from("friends")
        .select("*")
        .eq("user_id", user.id)
        .eq("friend_id", userId)
        .single()

      if (sentError && sentError.code !== "PGRST116") {
        throw sentError
      }

      if (sentRequest) {
        setFriendStatus(sentRequest.status)
        setFriendId(sentRequest.id)
        return
      }

      // Check if user has received a friend request
      const { data: receivedRequest, error: receivedError } = await supabase
        .from("friends")
        .select("*")
        .eq("user_id", userId)
        .eq("friend_id", user.id)
        .single()

      if (receivedError && receivedError.code !== "PGRST116") {
        throw receivedError
      }

      if (receivedRequest) {
        setFriendStatus(receivedRequest.status === "pending" ? "received" : receivedRequest.status)
        setFriendId(receivedRequest.id)
        return
      }

      setFriendStatus("none")
      setFriendId(null)
    } catch (error) {
      console.error("Error fetching friend status:", error)
    }
  }

  const fetchHostedGames = async () => {
    try {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("host_id", userId)
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true })
        .limit(3)

      if (error) throw error
      if (data) {
        setHostedGames(data)
      }
    } catch (error) {
      console.error("Error fetching hosted games:", error)
    }
  }

  const sendFriendRequest = async () => {
    if (!user) return

    try {
      const { error } = await supabase.from("friends").insert({
        user_id: user.id,
        friend_id: userId,
        status: "pending",
      })

      if (error) throw error

      setFriendStatus("pending")
      fetchFriendStatus() // Refresh to get the friend ID
    } catch (error) {
      console.error("Error sending friend request:", error)
    }
  }

  const acceptFriendRequest = async () => {
    if (!friendId) return

    try {
      const { error } = await supabase.from("friends").update({ status: "accepted" }).eq("id", friendId)

      if (error) throw error

      setFriendStatus("accepted")
    } catch (error) {
      console.error("Error accepting friend request:", error)
    }
  }

  const removeFriend = async () => {
    if (!friendId) return

    try {
      const { error } = await supabase.from("friends").delete().eq("id", friendId)

      if (error) throw error

      setFriendStatus("none")
      setFriendId(null)
    } catch (error) {
      console.error("Error removing friend:", error)
    }
  }

  const renderFriendButton = () => {
    if (friendStatus === "none") {
      return (
        <TouchableOpacity
          style={[styles.friendButton, { backgroundColor: colors.primary }]}
          onPress={sendFriendRequest}
        >
          <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
          <Text style={styles.friendButtonText}>Add Friend</Text>
        </TouchableOpacity>
      )
    } else if (friendStatus === "pending") {
      return (
        <TouchableOpacity
          style={[styles.friendButton, { backgroundColor: colors.muted + "40" }]}
          onPress={removeFriend}
        >
          <Ionicons name="time-outline" size={18} color={colors.muted} />
          <Text style={[styles.friendButtonText, { color: colors.muted }]}>Request Sent</Text>
        </TouchableOpacity>
      )
    } else if (friendStatus === "received") {
      return (
        <View style={styles.friendButtonsRow}>
          <TouchableOpacity
            style={[styles.friendButton, { backgroundColor: colors.primary, flex: 1 }]}
            onPress={acceptFriendRequest}
          >
            <Ionicons name="checkmark-outline" size={18} color="#FFFFFF" />
            <Text style={styles.friendButtonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.friendButton, { backgroundColor: colors.muted + "40", flex: 1, marginLeft: 8 }]}
            onPress={removeFriend}
          >
            <Ionicons name="close-outline" size={18} color={colors.muted} />
            <Text style={[styles.friendButtonText, { color: colors.muted }]}>Decline</Text>
          </TouchableOpacity>
        </View>
      )
    } else if (friendStatus === "accepted") {
      return (
        <TouchableOpacity
          style={[styles.friendButton, { backgroundColor: colors.muted + "40" }]}
          onPress={removeFriend}
        >
          <Ionicons name="person-outline" size={18} color={colors.muted} />
          <Text style={[styles.friendButtonText, { color: colors.muted }]}>Friends</Text>
        </TouchableOpacity>
      )
    }
    return null
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (!profile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.muted} />
          <Text style={[styles.errorText, { color: colors.muted }]}>User not found</Text>
        </View>
      </View>
    )
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
      </View>

      <View style={styles.profileHeader}>
        <Image source={{ uri: profile.avatar_url || "https://via.placeholder.com/100" }} style={styles.profileImage} />
        <Text style={[styles.profileName, { color: colors.text }]}>{profile.full_name}</Text>
        <Text style={[styles.profileUsername, { color: colors.muted }]}>@{profile.username}</Text>

        {user?.id !== userId && renderFriendButton()}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
        <Text style={[styles.aboutText, { color: colors.text }]}>
          {profile.bio || "This user hasn't added a bio yet."}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming Hosted Games</Text>
        {hostedGames.length > 0 ? (
          hostedGames.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={[styles.gameCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => navigation.navigate("GameDetails", { gameId: game.id })}
            >
              <View style={styles.gameInfo}>
                <Text style={[styles.gameTitle, { color: colors.text }]}>{game.title}</Text>
                <Text style={[styles.gameDate, { color: colors.muted }]}>
                  {new Date(game.date).toLocaleDateString()} at{" "}
                  {new Date(game.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
                <View style={styles.gameFooter}>
                  <Text style={[styles.gameSpots, { color: colors.text }]}>
                    {game.spots_available} / {game.spots_total} spots
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={[styles.emptyText, { color: colors.muted }]}>This user isn't hosting any upcoming games.</Text>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 16,
    marginBottom: 16,
  },
  friendButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  friendButtonsRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  friendButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 8,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#CCCCCC",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 16,
    lineHeight: 24,
  },
  gameCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  gameDate: {
    fontSize: 14,
    marginBottom: 8,
  },
  gameFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gameSpots: {
    fontSize: 14,
    fontWeight: "500",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 16,
  },
})

export default UserProfileScreen


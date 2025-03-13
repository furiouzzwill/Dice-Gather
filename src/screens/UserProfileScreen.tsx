"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../contexts/ThemeContext"
import { useFriends } from "../contexts/FriendsContext"
import { getUserById, mockGames } from "../data/mockData"
import type { User } from "../contexts/AuthContext"
import GameCard from "../components/GameCard"

const UserProfileScreen = () => {
  const route = useRoute() as any
  const navigation = useNavigation() as any
  const { colors } = useTheme()
  const {
    sendFriendRequest,
    acceptFriendRequest,
    removeFriend,
    isFriend,
    hasSentFriendRequest,
    hasReceivedFriendRequest,
  } = useFriends()

  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { userId } = route.params

  useEffect(() => {
    const fetchUser = () => {
      setIsLoading(true)
      // In a real app, you would make an API call
      const foundUser = getUserById(userId)
      if (foundUser) {
        // Use type assertion to ensure the accountType is properly typed
        const typedUser: User = {
          ...foundUser,
          accountType: foundUser.accountType as "personal" | "business" | undefined,
        }
        setUser(typedUser)
      }
      setIsLoading(false)
    }

    fetchUser()
  }, [userId])

  // Get user's hosted games
  const userGames = mockGames.filter((game) => game.host.name === user?.name).slice(0, 2)

  const navigateToChat = () => {
    if (user) {
      navigation.navigate("Chat", { userId: user.id })
    }
  }

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (!user) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={[styles.errorTitle, { color: colors.text }]}>User Not Found</Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const isAlreadyFriend = isFriend(user.id)
  const hasPendingRequest = hasSentFriendRequest(user.id)
  const hasRequest = hasReceivedFriendRequest(user.id)

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
      </View>

      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.profileHeader}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={[styles.name, { color: colors.text }]}>{user.name}</Text>
            <Text style={[styles.username, { color: colors.muted }]}>@{user.username}</Text>

            {user.accountType === "business" && (
              <View style={[styles.businessBadge, { backgroundColor: colors.primary + "20" }]}>
                <Text style={[styles.businessBadgeText, { color: colors.primary }]}>Business Account</Text>
              </View>
            )}
          </View>
          <View style={[styles.statusIndicator, { backgroundColor: user.online ? "#4ade80" : colors.muted }]} />
        </View>

        <View style={styles.profileDetails}>
          {user.joinedDate && (
            <View style={[styles.detailItem, { borderBottomColor: colors.border }]}>
              <Text style={[styles.detailLabel, { color: colors.muted }]}>Member since</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{user.joinedDate}</Text>
            </View>
          )}

          {user.accountType === "business" && user.businessInfo && (
            <View style={[styles.detailItem, { borderBottomColor: colors.border }]}>
              <Text style={[styles.detailLabel, { color: colors.muted }]}>Business</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{user.businessInfo.businessName}</Text>
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          {isAlreadyFriend ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={navigateToChat}
              >
                <Ionicons name="chatbubble-outline" size={16} color="#ffffff" />
                <Text style={styles.actionButtonText}>Message</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.error }]}
                onPress={() => removeFriend(user.id)}
              >
                <Ionicons name="person-remove-outline" size={16} color="#ffffff" />
                <Text style={styles.actionButtonText}>Remove Friend</Text>
              </TouchableOpacity>
            </>
          ) : hasRequest ? (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary, flex: 1 }]}
              onPress={() => acceptFriendRequest(user.id)}
            >
              <Ionicons name="checkmark-outline" size={16} color="#ffffff" />
              <Text style={styles.actionButtonText}>Accept Friend Request</Text>
            </TouchableOpacity>
          ) : hasPendingRequest ? (
            <View style={[styles.actionButton, { backgroundColor: colors.secondary, flex: 1 }]}>
              <Text style={[styles.actionButtonText, { color: colors.muted }]}>Friend Request Sent</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary, flex: 1 }]}
              onPress={() => sendFriendRequest(user.id)}
            >
              <Ionicons name="person-add-outline" size={16} color="#ffffff" />
              <Text style={styles.actionButtonText}>Add Friend</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {userGames.length > 0 && (
        <View style={styles.gamesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Hosted Games</Text>
          {userGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
          {userGames.length > 2 && (
            <TouchableOpacity
              style={[styles.moreButton, { borderColor: colors.border }]}
              onPress={() => navigation.navigate("Games", { host: user.name })}
            >
              <Text style={[styles.moreButtonText, { color: colors.primary }]}>See all games</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
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
    marginBottom: 16,
  },
  backBtn: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
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
    padding: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  profileCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    marginLeft: 16,
    justifyContent: "center",
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    marginBottom: 4,
  },
  businessBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  businessBadgeText: {
    fontSize: 10,
    fontWeight: "500",
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  profileDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
    flex: 1,
  },
  actionButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    marginLeft: 8,
  },
  gamesSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  moreButton: {
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  moreButtonText: {
    fontWeight: "600",
  },
})

export default UserProfileScreen


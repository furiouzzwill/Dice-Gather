"use client"

import { useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../contexts/ThemeContext"
import { useFriends } from "../contexts/FriendsContext"
import type { User } from "../contexts/AuthContext"

const FriendsScreen = () => {
  const { colors } = useTheme()
  const navigation = useNavigation() as any
  const { friends, friendRequests, isLoading, acceptFriendRequest, declineFriendRequest, removeFriend } = useFriends()

  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends")

  // Filter friends based on search query
  const filteredFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const navigateToChat = (friend: User) => {
    navigation.navigate("Chat", { userId: friend.id })
  }

  const navigateToUserProfile = (userId: string) => {
    navigation.navigate("UserProfile", { userId })
  }

  const renderFriendItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={[styles.friendItem, { backgroundColor: colors.card }]}
      onPress={() => navigateToUserProfile(item.id)}
    >
      <View style={styles.friendInfo}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.nameContainer}>
          <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.username, { color: colors.muted }]}>@{item.username}</Text>
        </View>
        <View style={[styles.statusIndicator, { backgroundColor: item.online ? "#4ade80" : colors.muted }]} />
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.primary + "20" }]}
          onPress={() => navigateToChat(item)}
        >
          <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.error + "20" }]}
          onPress={() => removeFriend(item.id)}
        >
          <Ionicons name="person-remove-outline" size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  const renderRequestItem = ({ item }: { item: User }) => (
    <View style={[styles.friendItem, { backgroundColor: colors.card }]}>
      <TouchableOpacity style={styles.friendInfo} onPress={() => navigateToUserProfile(item.id)}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.nameContainer}>
          <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.username, { color: colors.muted }]}>@{item.username}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.primary + "20" }]}
          onPress={() => acceptFriendRequest(item.id)}
        >
          <Ionicons name="checkmark-outline" size={18} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.error + "20" }]}
          onPress={() => declineFriendRequest(item.id)}
        >
          <Ionicons name="close-outline" size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderEmptyFriends = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={48} color={colors.muted} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No friends yet</Text>
      <Text style={[styles.emptySubtitle, { color: colors.muted }]}>Search for users to add them as friends</Text>
    </View>
  )

  const renderEmptyRequests = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="mail-outline" size={48} color={colors.muted} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No friend requests</Text>
      <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
        When someone sends you a friend request, it will appear here
      </Text>
    </View>
  )

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Friends</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate("FindFriends")}
        >
          <Ionicons name="person-add" size={16} color="#ffffff" />
          <Text style={styles.addButtonText}>Find Friends</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.muted} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search friends..."
          placeholderTextColor={colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color={colors.muted} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "friends" && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab("friends")}
        >
          <Text style={[styles.tabText, { color: activeTab === "friends" ? colors.primary : colors.muted }]}>
            Friends {friends.length > 0 && `(${friends.length})`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "requests" && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab("requests")}
        >
          <Text style={[styles.tabText, { color: activeTab === "requests" ? colors.primary : colors.muted }]}>
            Requests {friendRequests.length > 0 && `(${friendRequests.length})`}
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={activeTab === "friends" ? filteredFriends : friendRequests}
          keyExtractor={(item) => item.id}
          renderItem={activeTab === "friends" ? renderFriendItem : renderRequestItem}
          ListEmptyComponent={activeTab === "friends" ? renderEmptyFriends : renderEmptyRequests}
          contentContainerStyle={styles.listContent}
        />
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
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 16,
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
    fontSize: 14,
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    height: 44,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 8,
    fontSize: 14,
  },
  tabs: {
    flexDirection: "row",
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 10,
    marginRight: 24,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
  },
  friendItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  friendInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  nameContainer: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
  },
  username: {
    fontSize: 12,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  listContent: {
    flexGrow: 1,
  },
})

export default FriendsScreen


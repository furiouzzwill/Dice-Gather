"use client"

import { useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../contexts/ThemeContext"
import { useFriends } from "../contexts/FriendsContext"
import { useAuth } from "../contexts/AuthContext"
import { mockUsers } from "../data/mockData"
import type { User } from "../contexts/AuthContext"

const FindFriendsScreen = () => {
  const { colors } = useTheme()
  const navigation = useNavigation() as any
  const { user } = useAuth()
  const { sendFriendRequest, isFriend, hasSentFriendRequest, hasReceivedFriendRequest, acceptFriendRequest } =
    useFriends()

  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  // Get all users except current user
  const otherUsers = mockUsers.filter((u) => u.id !== user?.id)

  // Filter users based on search query
  const filteredUsers =
    searchQuery.length > 0
      ? otherUsers.filter(
          (u) =>
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.username.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : []

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setIsSearching(query.length > 0)
  }

  const navigateToUserProfile = (userId: string) => {
    navigation.navigate("UserProfile", { userId })
  }

  const renderUserItem = ({ item }: { item: User }) => {
    const isAlreadyFriend = isFriend(item.id)
    const hasPendingRequest = hasSentFriendRequest(item.id)
    const hasRequest = hasReceivedFriendRequest(item.id)

    return (
      <TouchableOpacity
        style={[styles.userItem, { backgroundColor: colors.card }]}
        onPress={() => navigateToUserProfile(item.id)}
      >
        <View style={styles.userInfo}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          <View style={styles.nameContainer}>
            <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.username, { color: colors.muted }]}>@{item.username}</Text>
          </View>
          <View style={[styles.statusIndicator, { backgroundColor: item.online ? "#4ade80" : colors.muted }]} />
        </View>

        <View style={styles.actionButtons}>
          {isAlreadyFriend ? (
            <View style={[styles.actionButton, { backgroundColor: colors.secondary }]}>
              <Ionicons name="checkmark" size={16} color={colors.muted} />
              <Text style={[styles.actionButtonText, { color: colors.muted }]}>Friends</Text>
            </View>
          ) : hasRequest ? (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => acceptFriendRequest(item.id)}
            >
              <Text style={styles.actionButtonText}>Accept Request</Text>
            </TouchableOpacity>
          ) : hasPendingRequest ? (
            <View style={[styles.actionButton, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.actionButtonText, { color: colors.muted }]}>Request Sent</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => sendFriendRequest(item.id)}
            >
              <Ionicons name="person-add" size={16} color="#ffffff" />
              <Text style={styles.actionButtonText}>Add Friend</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      {searchQuery.length > 0 ? (
        <>
          <Ionicons name="search" size={48} color={colors.muted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No users found</Text>
          <Text style={[styles.emptySubtitle, { color: colors.muted }]}>Try a different search term</Text>
        </>
      ) : (
        <>
          <Ionicons name="people-outline" size={48} color={colors.muted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Find Friends</Text>
          <Text style={[styles.emptySubtitle, { color: colors.muted }]}>Search for users by name or username</Text>
        </>
      )}
    </View>
  )

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
          placeholder="Search by name or username..."
          placeholderTextColor={colors.muted}
          value={searchQuery}
          onChangeText={handleSearch}
          autoFocus
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <Ionicons name="close-circle" size={20} color={colors.muted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {isSearching && (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={styles.listContent}
        />
      )}

      {!isSearching && renderEmptyList()}
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
    marginBottom: 16,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
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
  userItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  userInfo: {
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
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  actionButtonText: {
    color: "#ffffff",
    fontWeight: "500",
    fontSize: 12,
    marginLeft: 4,
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

export default FindFriendsScreen


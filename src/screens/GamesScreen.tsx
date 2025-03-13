"use client"

import { useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "../contexts/ThemeContext"
import { mockGames } from "../data/mockData"
import GameCard from "../components/GameCard"
import Input from "../components/Input"
import { useAuth } from "../contexts/AuthContext"

type FilterOption = "all" | "upcoming" | "available"

const GamesScreen = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterOption, setFilterOption] = useState<FilterOption>("all")
  const { colors } = useTheme()
  const { user } = useAuth()
  const navigation = useNavigation() as any

  // Update the handleHostGame function to remove business account check
  const handleHostGame = () => {
    // All users can host games now, just navigate
    navigation.navigate("HostGame")
  }

  const filteredGames = mockGames.filter((game) => {
    const matchesSearch =
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.location.toLowerCase().includes(searchQuery.toLowerCase())

    if (filterOption === "upcoming") {
      return matchesSearch && new Date(game.date) > new Date()
    } else if (filterOption === "available") {
      return matchesSearch && game.spotsAvailable > 0
    } else {
      return matchesSearch
    }
  })

  const renderFilterButton = (option: FilterOption, label: string, icon: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        {
          backgroundColor: filterOption === option ? colors.primary : colors.secondary,
        },
      ]}
      onPress={() => setFilterOption(option)}
    >
      <Ionicons
        name={icon as any}
        size={16}
        color={filterOption === option ? "#ffffff" : colors.text}
        style={styles.filterIcon}
      />
      <Text
        style={[
          styles.filterText,
          {
            color: filterOption === option ? "#ffffff" : colors.text,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  )

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Browse Games</Text>
      </View>

      <View style={styles.searchContainer}>
        <Input
          placeholder="Search games, locations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Ionicons name="search" size={18} color={colors.muted} />}
        />
      </View>

      <View style={styles.filtersContainer}>
        {renderFilterButton("all", "All Games", "grid-outline")}
        {renderFilterButton("upcoming", "Upcoming", "calendar-outline")}
        {renderFilterButton("available", "Available Spots", "people-outline")}
      </View>

      {filteredGames.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={48} color={colors.muted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No games found</Text>
          <Text style={[styles.emptySubtitle, { color: colors.muted }]}>Try adjusting your search or filters</Text>
        </View>
      ) : (
        <FlatList
          data={filteredGames}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <GameCard game={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Show floating button to all users */}
      <TouchableOpacity style={[styles.floatingButton, { backgroundColor: colors.primary }]} onPress={handleHostGame}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginTop: 40,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  searchContainer: {
    marginBottom: 16,
  },
  filtersContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterIcon: {
    marginRight: 4,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
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
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
})

export default GamesScreen


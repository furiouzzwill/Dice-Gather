"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import { supabase } from "../lib/supabase"
import type { Game } from "../lib/supabase"

const HomeScreen = () => {
  const navigation = useNavigation() as any
  const { user, profile } = useAuth()
  const { colors } = useTheme()
  const [upcomingGames, setUpcomingGames] = useState<Game[]>([])
  const [popularGames, setPopularGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchGames()
  }, [])

  // Update the fetchGames function to properly join the host profile information
  const fetchGames = async () => {
    try {
      setIsLoading(true)

      // Fetch upcoming games
      const { data: upcoming, error: upcomingError } = await supabase
        .from("games")
        .select("*, host:profiles!host_id(*)")
        .gte("date", new Date().toISOString())
        .gt("spots_available", 0)
        .order("date", { ascending: true })
        .limit(5)

      if (upcomingError) throw upcomingError

      // Fetch popular games (games with least available spots)
      const { data: popular, error: popularError } = await supabase
        .from("games")
        .select("*, host:profiles!host_id(*)")
        .gte("date", new Date().toISOString())
        .gt("spots_available", 0)
        .order("spots_available", { ascending: true })
        .limit(5)

      if (popularError) throw popularError

      setUpcomingGames(upcoming || [])
      setPopularGames(popular || [])
    } catch (error) {
      console.error("Error fetching games:", error)
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchGames()
  }

  const handleGamePress = (game: Game) => {
    navigation.navigate("GameDetails", { gameId: game.id })
  }

  const renderGameCard = ({ item }: { item: Game }) => {
    const gameDate = new Date(item.date)
    const formattedDate = gameDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
    const formattedTime = gameDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })

    return (
      <TouchableOpacity
        style={[styles.gameCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => handleGamePress(item)}
      >
        <Image
          source={{ uri: item.image_url || "https://via.placeholder.com/100?text=Game" }}
          style={styles.gameImage}
        />
        <View style={styles.gameInfo}>
          <Text style={[styles.gameTitle, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.gameCategory, { color: colors.primary }]}>{item.category}</Text>
          <View style={styles.gameDetails}>
            <View style={styles.gameDetailItem}>
              <Ionicons name="calendar-outline" size={14} color={colors.muted} />
              <Text style={[styles.gameDetailText, { color: colors.muted }]}>{formattedDate}</Text>
            </View>
            <View style={styles.gameDetailItem}>
              <Ionicons name="time-outline" size={14} color={colors.muted} />
              <Text style={[styles.gameDetailText, { color: colors.muted }]}>{formattedTime}</Text>
            </View>
          </View>
          <View style={styles.gameFooter}>
            <View style={styles.spotsContainer}>
              <Text style={[styles.spotsText, { color: colors.text }]}>
                {item.spots_available} / {item.spots_total} spots
              </Text>
            </View>
            <View
              style={[
                styles.difficultyBadge,
                {
                  backgroundColor:
                    item.difficulty === "Easy" ? "#10B981" : item.difficulty === "Medium" ? "#F59E0B" : "#EF4444",
                },
              ]}
            >
              <Text style={styles.difficultyText}>{item.difficulty}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading games...</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.welcomeText, { color: colors.muted }]}>Welcome back,</Text>
          <Text style={[styles.userName, { color: colors.text }]}>
            {profile?.full_name || user?.email?.split("@")[0] || "Gamer"}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.profileButton, { backgroundColor: colors.primary + "20" }]}
          onPress={() => navigation.navigate("Profile")}
        >
          <Image
            source={{ uri: profile?.avatar_url || "https://via.placeholder.com/40" }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TouchableOpacity
          style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate("Search")}
        >
          <Ionicons name="search" size={20} color={colors.muted} />
          <Text style={[styles.searchText, { color: colors.muted }]}>Search for games...</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate("HostGame")}
        >
          <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Host Game</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate("BrowseGames")}
        >
          <Ionicons name="grid-outline" size={22} color={colors.primary} />
          <Text style={[styles.actionButtonText, { color: colors.primary }]}>Browse All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming Games</Text>
          <TouchableOpacity onPress={() => navigation.navigate("BrowseGames")}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>

        {upcomingGames.length > 0 ? (
          <FlatList
            data={upcomingGames}
            renderItem={renderGameCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.gamesList}
            style={styles.gamesListContainer}
          />
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Ionicons name="calendar-outline" size={40} color={colors.muted} />
            <Text style={[styles.emptyStateText, { color: colors.muted }]}>No upcoming games found</Text>
            <TouchableOpacity
              style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate("HostGame")}
            >
              <Text style={styles.emptyStateButtonText}>Host a Game</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular Games</Text>
          <TouchableOpacity onPress={() => navigation.navigate("BrowseGames")}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>

        {popularGames.length > 0 ? (
          <FlatList
            data={popularGames}
            renderItem={renderGameCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.gamesList}
            style={styles.gamesListContainer}
          />
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Ionicons name="trending-up-outline" size={40} color={colors.muted} />
            <Text style={[styles.emptyStateText, { color: colors.muted }]}>No popular games found</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
        </View>

        <View style={styles.categoriesContainer}>
          {["Strategy", "Card Games", "Party", "Role-Playing", "Cooperative", "Competitive"].map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.categoryButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => navigation.navigate("BrowseGames", { category })}
            >
              <Text style={[styles.categoryText, { color: colors.text }]}>{category}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  welcomeText: {
    fontSize: 14,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchText: {
    marginLeft: 8,
    fontSize: 14,
  },
  actionsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  actionButtonText: {
    marginLeft: 8,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  seeAllText: {
    fontSize: 14,
  },
  gamesListContainer: {
    marginBottom: 8,
  },
  gamesList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  gameCard: {
    width: 280,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  gameImage: {
    width: "100%",
    height: 120,
  },
  gameInfo: {
    padding: 12,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  gameCategory: {
    fontSize: 14,
    marginBottom: 8,
  },
  gameDetails: {
    flexDirection: "row",
    marginBottom: 8,
    gap: 12,
  },
  gameDetailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  gameDetailText: {
    fontSize: 12,
    marginLeft: 4,
  },
  gameFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  spotsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  spotsText: {
    fontSize: 12,
    fontWeight: "500",
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  emptyState: {
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyStateText: {
    marginTop: 8,
    marginBottom: 16,
    fontSize: 14,
    textAlign: "center",
  },
  emptyStateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
  },
})

export default HomeScreen


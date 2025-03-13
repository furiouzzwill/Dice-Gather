import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../contexts/ThemeContext"
import { useAuth } from "../contexts/AuthContext"
import { mockGames } from "../data/mockData"
import GameCard from "../components/GameCard"

const HomeScreen = () => {
  // Use type assertion for navigation
  const navigation = useNavigation() as any
  const { colors } = useTheme()
  const { user } = useAuth()

  // Update the handleHostGame function to remove business account check
  const handleHostGame = () => {
    // All users can host games now, just navigate
    navigation.navigate("HostGame")
  }

  // Get upcoming games (next 3)
  const upcomingGames = [...mockGames]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .filter((game) => new Date(game.date) > new Date())
    .slice(0, 3)

  // Get games with available spots
  const availableGames = mockGames.filter((game) => game.spotsAvailable > 0).slice(0, 3)

  const navigateToGames = () => {
    // Navigate to the Games tab
    navigation.navigate("Games")
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Dice & Gather</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Find your next board game event</Text>
      </View>

      {/* Show host game banner to all users with different messaging */}
      <View style={styles.hostGameContainer}>
        {/* Also update the host game container text to be the same for all users */}
        <View style={styles.hostGameContent}>
          <View>
            <Text style={[styles.hostGameTitle, { color: colors.text }]}>Ready to host a game?</Text>
            <Text style={[styles.hostGameSubtitle, { color: colors.muted }]}>
              Create a new board game event for the community
            </Text>
          </View>
          <TouchableOpacity style={[styles.hostButton, { backgroundColor: colors.primary }]} onPress={handleHostGame}>
            <Ionicons name="add-circle-outline" size={18} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.hostButtonText}>Host Game</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming Games</Text>
          <TouchableOpacity onPress={navigateToGames}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
          </TouchableOpacity>
        </View>

        {upcomingGames.length > 0 ? (
          upcomingGames.map((game) => <GameCard key={game.id} game={game} />)
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Ionicons name="calendar-outline" size={48} color={colors.muted} />
            <Text style={[styles.emptyStateText, { color: colors.text }]}>No upcoming games</Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.muted }]}>
              Check back later or host your own game
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Spots</Text>
          <TouchableOpacity onPress={navigateToGames}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
          </TouchableOpacity>
        </View>

        {availableGames.length > 0 ? (
          availableGames.map((game) => <GameCard key={game.id} game={game} />)
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Ionicons name="people-outline" size={48} color={colors.muted} />
            <Text style={[styles.emptyStateText, { color: colors.text }]}>No available spots</Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.muted }]}>All current games are full</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginTop: 40,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  seeAll: {
    fontSize: 14,
  },
  emptyState: {
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  hostGameContainer: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  hostGameContent: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hostGameTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  hostGameSubtitle: {
    fontSize: 14,
    maxWidth: 200,
  },
  hostButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  hostButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
})

export default HomeScreen


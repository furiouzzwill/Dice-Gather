"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../contexts/ThemeContext"
import { mockGames } from "../data/mockData"
import type { GameDetailsRouteProp, StackNavigationProps } from "../types/navigation"

const GameDetailsScreen = () => {
  // Use type assertions for route and navigation
  const route = useRoute() as any as GameDetailsRouteProp
  const navigation = useNavigation() as any as StackNavigationProps
  const { colors } = useTheme()
  const [game, setGame] = useState<any>(null)
  const [reserving, setReserving] = useState(false)
  const { gameId } = route.params

  useEffect(() => {
    // Find the game by ID
    const foundGame = mockGames.find((g) => g.id === gameId)
    if (foundGame) {
      setGame(foundGame)
    } else {
      // Handle game not found
      Alert.alert("Error", "Game not found")
      navigation.goBack()
    }
  }, [gameId, navigation])

  if (!game) {
    return null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleReserve = () => {
    setReserving(true)

    // Simulate API call
    setTimeout(() => {
      setReserving(false)
      Alert.alert("Success", "Spot reserved successfully!")
    }, 1500)
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Image source={{ uri: game.image || "https://picsum.photos/400/200" }} style={styles.image} resizeMode="cover" />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{game.title}</Text>

          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{game.category}</Text>
            </View>

            <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.badgeText, { color: colors.text }]}>{game.difficulty}</Text>
            </View>

            <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.badgeText, { color: colors.text }]}>{game.duration} mins</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About This Event</Text>
          <Text style={[styles.description, { color: colors.text }]}>{game.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Event Details</Text>

          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={20} color={colors.muted} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.text }]}>Date</Text>
              <Text style={[styles.detailText, { color: colors.muted }]}>{formatDate(game.date)}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={20} color={colors.muted} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.text }]}>Time</Text>
              <Text style={[styles.detailText, { color: colors.muted }]}>{formatTime(game.date)}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={20} color={colors.muted} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.text }]}>Location</Text>
              <Text style={[styles.detailText, { color: colors.muted }]}>{game.location}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="people-outline" size={20} color={colors.muted} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.text }]}>Spots Available</Text>
              <Text style={[styles.detailText, { color: colors.muted }]}>{game.spotsAvailable} spots left</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Host</Text>
          <View style={styles.hostContainer}>
            <Image source={{ uri: game.host.avatar }} style={styles.hostAvatar} />
            <View style={styles.hostInfo}>
              <Text style={[styles.hostName, { color: colors.text }]}>{game.host.name}</Text>
              {game.host.since && (
                <Text style={[styles.hostSince, { color: colors.muted }]}>Hosting since {game.host.since}</Text>
              )}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.reserveButton,
            {
              backgroundColor: game.spotsAvailable === 0 || reserving ? colors.muted : colors.primary,
            },
          ]}
          onPress={handleReserve}
          disabled={game.spotsAvailable === 0 || reserving}
        >
          <Text style={styles.reserveButtonText}>
            {reserving ? "Reserving..." : game.spotsAvailable === 0 ? "No spots available" : "Reserve your spot"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: 200,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  detailItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  detailText: {
    fontSize: 14,
  },
  hostContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  hostAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  hostInfo: {
    marginLeft: 12,
  },
  hostName: {
    fontSize: 16,
    fontWeight: "500",
  },
  hostSince: {
    fontSize: 12,
  },
  reserveButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  reserveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default GameDetailsScreen


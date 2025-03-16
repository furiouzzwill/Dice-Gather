"use client"

import type React from "react"
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../contexts/ThemeContext"
import type { StackNavigationProps } from "../types/navigation"

type GameCardProps = {
  game: {
    id: string
    title: string
    description: string | null
    category: string
    date: string
    location: string
    image_url?: string | null
    difficulty: string
    duration: number
    spots_available: number
    spots_total: number
    host_id: string
    created_at: string
    updated_at: string
    host?: {
      id: string
      full_name: string
      avatar_url?: string | null
      account_type?: string
    }
  }
  compact?: boolean
}

const GameCard: React.FC<GameCardProps> = ({ game, compact = false }) => {
  // Use type assertion for navigation
  const navigation = useNavigation() as any as StackNavigationProps
  const { colors } = useTheme()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
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

  const handlePress = () => {
    navigation.navigate("GameDetails", { gameId: game.id })
  }

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, compact && styles.compactCard]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: game.image_url || "https://picsum.photos/400/200" }}
        style={[styles.image, compact && styles.compactImage]}
        resizeMode="cover"
      />

      <View style={styles.categoryBadge}>
        <Text style={styles.categoryText}>{game.category}</Text>
      </View>

      {game.host?.account_type === "business" && (
        <View style={styles.officialBadge}>
          <Text style={styles.officialText}>Official Event</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {game.title}
        </Text>

        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {game.difficulty} • {game.duration} mins
        </Text>

        {!compact && (
          <Text style={[styles.description, { color: colors.text }]} numberOfLines={2}>
            {game.description}
          </Text>
        )}

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color={colors.muted} />
            <Text style={[styles.detailText, { color: colors.text }]}>{formatDate(game.date)}</Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color={colors.muted} />
            <Text style={[styles.detailText, { color: colors.text }]}>{formatTime(game.date)}</Text>
          </View>

          {!compact && (
            <>
              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={16} color={colors.muted} />
                <Text style={[styles.detailText, { color: colors.text }]} numberOfLines={1}>
                  {game.location}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="people-outline" size={16} color={colors.muted} />
                <Text style={[styles.detailText, { color: colors.text }]}>{game.spots_available} spots left</Text>
              </View>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
  },
  compactCard: {
    flexDirection: "row",
    height: 100,
  },
  image: {
    height: 150,
    width: "100%",
  },
  compactImage: {
    height: "100%",
    width: 100,
  },
  categoryBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#2563eb",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  officialBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(37, 99, 235, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  officialText: {
    color: "#2563eb",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
  },
  details: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    marginLeft: 4,
  },
})

export default GameCard


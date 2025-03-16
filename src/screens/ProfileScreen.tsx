"use client"

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../contexts/ThemeContext"
import { useAuth } from "../contexts/AuthContext"
import { usePoints } from "../contexts/PointsContext"
import ProfileBanner from "../components/ProfileBanner"

const ProfileScreen = () => {
  const navigation = useNavigation() as any
  const { colors, toggleTheme, theme } = useTheme()
  const { user, profile, logout } = useAuth()
  const { points, level, levelTitle, progress, unlockedFeatures } = usePoints()

  // Check if profile exists
  if (!profile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Loading profile...</Text>
      </View>
    )
  }

  const handleLogout = async () => {
    await logout()
    // Update this navigation reset to ensure it goes to the correct Login screen
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    })
  }

  const handleHostGame = () => {
    navigation.navigate("HostGame")
  }

  const navigateToAchievements = () => {
    navigation.navigate("Achievements")
  }

  const navigateToCustomize = () => {
    navigation.navigate("CustomizeProfile")
  }

  // Get avatar frame if unlocked
  const avatarFrameFeature = unlockedFeatures.avatarFrame
  const hasAvatarFrame = avatarFrameFeature?.unlocked
  const selectedFrame = avatarFrameFeature?.selected

  // Define avatar frames
  const AVATAR_FRAMES: { [key: string]: string } = {
    gold: "#FFD700",
    silver: "#C0C0C0",
    bronze: "#CD7F32",
    wood: "#8B4513",
  }

  // Get frame color
  const frameColor = hasAvatarFrame && selectedFrame ? AVATAR_FRAMES[selectedFrame] : undefined

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Please log in</Text>
        <TouchableOpacity
          style={[styles.loginButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
          <Ionicons name={theme === "dark" ? "sunny-outline" : "moon-outline"} size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ProfileBanner />

      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {hasAvatarFrame && frameColor ? (
              <View style={[styles.avatarFrame, { borderColor: frameColor }]}>
                <Image source={{ uri: profile.avatar_url || "https://via.placeholder.com/80" }} style={styles.avatar} />
              </View>
            ) : (
              <Image source={{ uri: profile.avatar_url || "https://via.placeholder.com/80" }} style={styles.avatar} />
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.name, { color: colors.text }]}>{profile.full_name}</Text>
            <Text style={[styles.username, { color: colors.muted }]}>@{profile.username}</Text>

            {profile.account_type === "business" && (
              <View style={[styles.businessBadge, { backgroundColor: colors.primary + "20" }]}>
                <Text style={[styles.businessBadgeText, { color: colors.primary }]}>Business Account</Text>
              </View>
            )}
          </View>

          <View style={[styles.levelBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.levelText}>Lvl {level}</Text>
          </View>
        </View>

        <View style={styles.profileDetails}>
          <View style={[styles.detailItem, { borderBottomColor: colors.border }]}>
            <Text style={[styles.detailLabel, { color: colors.muted }]}>Email</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{user.email}</Text>
          </View>

          <View style={[styles.detailItem, { borderBottomColor: colors.border }]}>
            <Text style={[styles.detailLabel, { color: colors.muted }]}>Member since</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {profile.created_at
                ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                : "Not available"}
            </Text>
          </View>

          <View style={[styles.detailItem, { borderBottomColor: colors.border }]}>
            <Text style={[styles.detailLabel, { color: colors.muted }]}>Rank</Text>
            <Text style={[styles.detailValue, { color: colors.primary }]}>{levelTitle}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.customizeButton, { backgroundColor: colors.primary + "20" }]}
          onPress={navigateToCustomize}
        >
          <Ionicons name="brush-outline" size={18} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.customizeButtonText, { color: colors.primary }]}>Customize Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.logoutButton, { borderColor: colors.primary }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.logoutButtonText, { color: colors.primary }]}>Log out</Text>
        </TouchableOpacity>
      </View>

      {/* Achievements Card */}
      <TouchableOpacity
        style={[styles.achievementsCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={navigateToAchievements}
      >
        <View style={styles.achievementsHeader}>
          <View style={styles.achievementsHeaderLeft}>
            <Ionicons name="trophy-outline" size={24} color={colors.primary} style={styles.achievementsIcon} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Achievements</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </View>

        <View style={styles.achievementStats}>
          <View style={styles.achievementStat}>
            <Text style={[styles.achievementStatValue, { color: colors.primary }]}>0</Text>
            <Text style={[styles.achievementStatLabel, { color: colors.muted }]}>Unlocked</Text>
          </View>

          <View style={[styles.achievementStatDivider, { backgroundColor: colors.border }]} />

          <View style={styles.achievementStat}>
            <Text style={[styles.achievementStatValue, { color: colors.primary }]}>{points}</Text>
            <Text style={[styles.achievementStatLabel, { color: colors.muted }]}>Points</Text>
          </View>
        </View>

        <View style={styles.levelProgressContainer}>
          <View style={[styles.levelProgressBar, { backgroundColor: colors.muted + "30" }]}>
            <View
              style={[
                styles.levelProgressFill,
                {
                  backgroundColor: colors.primary,
                  width: `${progress * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        <Text style={[styles.achievementsDescription, { color: colors.muted }]}>
          Track your progress and earn rewards by participating in board game events
        </Text>
      </TouchableOpacity>

      {/* Show hosting card to all users */}
      <View
        style={[
          styles.hostingCard,
          {
            backgroundColor: colors.primary + "10",
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>Hosting</Text>
        <Text style={[styles.cardDescription, { color: colors.muted }]}>
          Host your own board game events and invite others to join
        </Text>

        <TouchableOpacity style={[styles.hostButton, { backgroundColor: colors.primary }]} onPress={handleHostGame}>
          <Ionicons name="add-circle-outline" size={18} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={styles.hostButtonText}>Host a Game</Text>
        </TouchableOpacity>
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
  themeToggle: {
    padding: 8,
  },
  profileCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
  },
  avatarFrame: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    padding: 3,
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
  },
  businessBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  businessBadgeText: {
    fontSize: 10,
    fontWeight: "500",
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  levelText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 12,
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
  customizeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  customizeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  achievementsCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  achievementsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  achievementsHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  achievementsIcon: {
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  achievementStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
    paddingVertical: 8,
  },
  achievementStat: {
    alignItems: "center",
  },
  achievementStatValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  achievementStatLabel: {
    fontSize: 12,
  },
  achievementStatDivider: {
    width: 1,
    height: "80%",
  },
  levelProgressContainer: {
    marginBottom: 12,
  },
  levelProgressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  levelProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  achievementsDescription: {
    fontSize: 14,
    textAlign: "center",
  },
  hostingCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  hostButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  hostButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  loginButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
})

export default ProfileScreen


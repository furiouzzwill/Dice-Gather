"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../contexts/ThemeContext"
import { useAuth } from "../contexts/AuthContext"
import { usePoints, LEVEL_REWARDS } from "../contexts/PointsContext"

// Define banner images
const BANNER_IMAGES = {
  banner1: "https://picsum.photos/id/10/800/200", // Forest
  banner2: "https://picsum.photos/id/15/800/200", // Mountains
  banner3: "https://picsum.photos/id/26/800/200", // Beach
}

// Define theme colors
const THEME_COLORS = {
  blue: "#3B82F6",
  green: "#10B981",
  purple: "#8B5CF6",
  orange: "#F97316",
}

// Define avatar frames
const AVATAR_FRAMES = {
  gold: "#FFD700",
  silver: "#C0C0C0",
  bronze: "#CD7F32",
  wood: "#8B4513",
}

const CustomizeProfileScreen = () => {
  const navigation = useNavigation() as any
  const { colors } = useTheme()
  const { user } = useAuth()
  const { unlockedFeatures, updateSelectedOption } = usePoints()
  const [activeTab, setActiveTab] = useState("profileBanner")

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

  // Get unlocked features
  const unlockedFeaturesList = Object.keys(unlockedFeatures).filter((key) => unlockedFeatures[key]?.unlocked)

  // Get locked features
  const lockedFeaturesList = LEVEL_REWARDS.filter((reward) => !unlockedFeatures[reward.feature]?.unlocked).sort(
    (a, b) => a.level - b.level,
  )

  // Get active feature details
  const activeFeature = LEVEL_REWARDS.find((reward) => reward.feature === activeTab)
  const isFeatureUnlocked = unlockedFeatures[activeTab]?.unlocked
  const selectedOption = unlockedFeatures[activeTab]?.selected

  // Handle option selection
  const handleSelectOption = async (option: string) => {
    await updateSelectedOption(activeTab, option)
  }

  // Render banner options
  const renderBannerOptions = () => {
    if (!isFeatureUnlocked) return null

    return (
      <View style={styles.optionsContainer}>
        {Object.entries(BANNER_IMAGES).map(([key, uri]) => (
          <TouchableOpacity
            key={key}
            style={[styles.bannerOption, selectedOption === key && { borderColor: colors.primary, borderWidth: 3 }]}
            onPress={() => handleSelectOption(key)}
          >
            <Image source={{ uri }} style={styles.bannerImage} resizeMode="cover" />
          </TouchableOpacity>
        ))}
      </View>
    )
  }

  // Render theme options
  const renderThemeOptions = () => {
    if (!isFeatureUnlocked) return null

    return (
      <View style={styles.optionsContainer}>
        {Object.entries(THEME_COLORS).map(([key, color]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              selectedOption === key && { borderColor: colors.text, borderWidth: 3 },
            ]}
            onPress={() => handleSelectOption(key)}
          >
            {selectedOption === key && <Ionicons name="checkmark" size={24} color="#FFFFFF" />}
          </TouchableOpacity>
        ))}
      </View>
    )
  }

  // Render avatar frame options
  const renderAvatarFrameOptions = () => {
    if (!isFeatureUnlocked) return null

    return (
      <View style={styles.optionsContainer}>
        {Object.entries(AVATAR_FRAMES).map(([key, color]) => (
          <TouchableOpacity key={key} style={styles.avatarFrameContainer} onPress={() => handleSelectOption(key)}>
            <View
              style={[
                styles.avatarFrame,
                { borderColor: color as string },
                selectedOption === key && { borderWidth: 5 },
              ]}
            >
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            </View>
            <Text style={[styles.optionLabel, { color: colors.text }]}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )
  }

  // Render options based on active tab
  const renderOptions = () => {
    switch (activeTab) {
      case "profileBanner":
        return renderBannerOptions()
      case "profileTheme":
        return renderThemeOptions()
      case "avatarFrame":
        return renderAvatarFrameOptions()
      default:
        return (
          <View style={styles.comingSoonContainer}>
            <Ionicons name="construct-outline" size={48} color={colors.muted} />
            <Text style={[styles.comingSoonText, { color: colors.text }]}>Customization options coming soon!</Text>
          </View>
        )
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Customize Profile</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {unlockedFeaturesList.map((feature) => {
          const featureDetails = LEVEL_REWARDS.find((r) => r.feature === feature)
          if (!featureDetails) return null

          return (
            <TouchableOpacity
              key={feature}
              style={[styles.tabButton, activeTab === feature && { backgroundColor: colors.primary }]}
              onPress={() => setActiveTab(feature)}
            >
              <Text style={[styles.tabText, { color: activeTab === feature ? "#FFFFFF" : colors.text }]}>
                {featureDetails.reward}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {activeFeature && (
        <View style={[styles.featureContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.featureTitle, { color: colors.text }]}>{activeFeature.reward}</Text>
          <Text style={[styles.featureDescription, { color: colors.muted }]}>{activeFeature.description}</Text>

          {isFeatureUnlocked ? (
            renderOptions()
          ) : (
            <View style={styles.lockedFeatureContainer}>
              <Ionicons name="lock-closed" size={48} color={colors.muted} />
              <Text style={[styles.lockedText, { color: colors.text }]}>Unlock at Level {activeFeature.level}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Locked Features</Text>
      </View>

      <FlatList
        data={lockedFeaturesList}
        keyExtractor={(item) => item.feature}
        renderItem={({ item }) => (
          <View style={[styles.lockedFeatureCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.lockedFeatureHeader}>
              <Text style={[styles.lockedFeatureTitle, { color: colors.text }]}>{item.reward}</Text>
              <View style={[styles.levelBadge, { backgroundColor: colors.muted }]}>
                <Text style={styles.levelBadgeText}>Level {item.level}</Text>
              </View>
            </View>
            <Text style={[styles.lockedFeatureDescription, { color: colors.muted }]}>{item.description}</Text>
          </View>
        )}
        contentContainerStyle={styles.lockedFeaturesList}
        showsVerticalScrollIndicator={false}
      />
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
    marginRight: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  tabsContainer: {
    marginBottom: 16,
  },
  tabsContent: {
    paddingRight: 16,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  featureContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  bannerOption: {
    width: "100%",
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  colorOption: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarFrameContainer: {
    alignItems: "center",
    marginBottom: 16,
    width: "48%",
  },
  avatarFrame: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    padding: 3,
    marginBottom: 8,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  comingSoonContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  comingSoonText: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 12,
    textAlign: "center",
  },
  lockedFeatureContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  lockedText: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 12,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  lockedFeaturesList: {
    paddingBottom: 16,
  },
  lockedFeatureCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  lockedFeatureHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  lockedFeatureTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelBadgeText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 12,
  },
  lockedFeatureDescription: {
    fontSize: 14,
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
    color: "#FFFFFF",
  },
})

export default CustomizeProfileScreen


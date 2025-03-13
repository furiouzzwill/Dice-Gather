"use client"

import { View, Image, StyleSheet } from "react-native"
import { useTheme } from "../contexts/ThemeContext"
import { usePoints } from "../contexts/PointsContext"

// Define banner images
const BANNER_IMAGES = {
  banner1: "https://picsum.photos/id/10/800/200", // Forest
  banner2: "https://picsum.photos/id/15/800/200", // Mountains
  banner3: "https://picsum.photos/id/26/800/200", // Beach
  default: "https://picsum.photos/id/1/800/200", // Default banner
}

interface ProfileBannerProps {
  height?: number
}

const ProfileBanner = ({ height = 120 }: ProfileBannerProps) => {
  const { colors } = useTheme()
  const { unlockedFeatures } = usePoints()

  // Check if profile banner feature is unlocked
  const bannerFeature = unlockedFeatures.profileBanner
  const isUnlocked = bannerFeature?.unlocked
  const selectedBanner = bannerFeature?.selected || "default"

  // Get banner image
  const bannerImage = isUnlocked ? BANNER_IMAGES[selectedBanner as keyof typeof BANNER_IMAGES] : BANNER_IMAGES.default

  return (
    <View style={[styles.container, { height, backgroundColor: colors.muted + "30" }]}>
      <Image source={{ uri: bannerImage }} style={styles.bannerImage} resizeMode="cover" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
    borderRadius: 12,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
})

export default ProfileBanner


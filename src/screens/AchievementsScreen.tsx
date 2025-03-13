"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Modal } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../contexts/ThemeContext"
import { useAuth } from "../contexts/AuthContext"
import { usePoints, LEVEL_REWARDS } from "../contexts/PointsContext"
import { getUserAchievements, type Achievement } from "../data/mockData"

const AchievementsScreen = () => {
  const navigation = useNavigation() as any
  const { colors } = useTheme()
  const { user } = useAuth()
  const { points, level, levelTitle, nextLevelPoints, progress, rewards } = usePoints()
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [showRewardsModal, setShowRewardsModal] = useState(false)

  // Get user achievements
  const achievements = getUserAchievements(user?.id || "")
  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const totalCount = achievements.length

  // Filter achievements by category
  const filteredAchievements =
    activeCategory === "all" ? achievements : achievements.filter((a) => a.category === activeCategory)

  // Categories for filter
  const categories = [
    { id: "all", name: "All", icon: "grid-outline" },
    { id: "social", name: "Social", icon: "people-outline" },
    { id: "events", name: "Events", icon: "calendar-outline" },
    { id: "games", name: "Games", icon: "game-controller-outline" },
    { id: "hosting", name: "Hosting", icon: "star-outline" },
  ]

  const renderAchievementItem = ({ item }: { item: Achievement }) => {
    const isUnlocked = item.unlocked
    const hasProgress = !isUnlocked && item.progress

    return (
      <View
        style={[
          styles.achievementCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity: isUnlocked ? 1 : 0.7,
          },
        ]}
      >
        <View style={styles.achievementHeader}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: isUnlocked ? colors.primary + "20" : colors.muted + "20",
                borderColor: isUnlocked ? colors.primary : colors.muted,
              },
            ]}
          >
            <Ionicons name={item.icon as any} size={24} color={isUnlocked ? colors.primary : colors.muted} />
          </View>
          <View style={styles.achievementInfo}>
            <Text style={[styles.achievementTitle, { color: colors.text }]}>
              {item.title}
              {isUnlocked && <Text style={{ color: colors.primary }}> • {item.points} pts</Text>}
            </Text>
            <Text style={[styles.achievementDescription, { color: colors.muted }]}>{item.description}</Text>
            {isUnlocked && item.dateUnlocked && (
              <Text style={[styles.achievementDate, { color: colors.primary }]}>Unlocked on {item.dateUnlocked}</Text>
            )}
            {hasProgress && (
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { backgroundColor: colors.muted + "30" }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: colors.primary,
                        width: `${(item.progress!.current / item.progress!.total) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.progressText, { color: colors.muted }]}>
                  {item.progress!.current}/{item.progress!.total}
                </Text>
              </View>
            )}
          </View>
          {isUnlocked ? (
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
          ) : (
            <Ionicons name="lock-closed" size={20} color={colors.muted} />
          )}
        </View>
      </View>
    )
  }

  // Rewards modal
  const RewardsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showRewardsModal}
      onRequestClose={() => setShowRewardsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Level Rewards</Text>
            <TouchableOpacity onPress={() => setShowRewardsModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.rewardsList}>
            {LEVEL_REWARDS.map((reward) => (
              <View
                key={reward.level}
                style={[
                  styles.rewardItem,
                  {
                    backgroundColor: level >= reward.level ? colors.primary + "10" : colors.muted + "10",
                    borderColor: level >= reward.level ? colors.primary + "30" : colors.border,
                  },
                ]}
              >
                <View style={styles.rewardHeader}>
                  <View
                    style={[
                      styles.levelBadge,
                      { backgroundColor: level >= reward.level ? colors.primary : colors.muted },
                    ]}
                  >
                    <Text style={styles.levelBadgeText}>Level {reward.level}</Text>
                  </View>
                  {level >= reward.level && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                </View>
                <Text style={[styles.rewardText, { color: colors.text }]}>{reward.reward}</Text>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowRewardsModal(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Achievements</Text>
      </View>

      {/* Level and Points Card */}
      <View style={[styles.levelCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.levelHeader}>
          <View>
            <Text style={[styles.levelTitle, { color: colors.text }]}>Level {level}</Text>
            <Text style={[styles.levelSubtitle, { color: colors.primary }]}>{levelTitle}</Text>
          </View>
          <View style={[styles.pointsBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.pointsText}>{points} Points</Text>
          </View>
        </View>

        {nextLevelPoints > 0 && (
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
            <Text style={[styles.levelProgressText, { color: colors.muted }]}>
              {nextLevelPoints - points} points to Level {level + 1}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.rewardsButton, { borderColor: colors.primary }]}
          onPress={() => setShowRewardsModal(true)}
        >
          <Ionicons name="gift-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={[styles.rewardsButtonText, { color: colors.primary }]}>View Level Rewards</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Card */}
      <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{points}</Text>
          <Text style={[styles.statLabel, { color: colors.muted }]}>Total Points</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {unlockedCount}/{totalCount}
          </Text>
          <Text style={[styles.statLabel, { color: colors.muted }]}>Unlocked</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
        bounces={true}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[styles.categoryButton, activeCategory === category.id && { backgroundColor: colors.primary }]}
            onPress={() => setActiveCategory(category.id)}
          >
            <Ionicons
              name={category.icon as any}
              size={16}
              color={activeCategory === category.id ? "#ffffff" : colors.text}
              style={styles.categoryIcon}
            />
            <Text style={[styles.categoryText, { color: activeCategory === category.id ? "#ffffff" : colors.text }]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredAchievements}
        renderItem={renderAchievementItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.achievementsList}
        showsVerticalScrollIndicator={false}
      />

      <RewardsModal />
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
  levelCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  levelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  levelSubtitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  pointsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pointsText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  levelProgressContainer: {
    marginBottom: 12,
  },
  levelProgressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },
  levelProgressFill: {
    height: "100%",
    borderRadius: 4,
  },
  levelProgressText: {
    fontSize: 12,
    textAlign: "center",
  },
  rewardsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  rewardsButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  statsCard: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  statDivider: {
    width: 1,
    height: "80%",
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingRight: 16,
    paddingLeft: 4,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginVertical: 4,
  },
  categoryIcon: {
    marginRight: 4,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
  },
  achievementsList: {
    paddingBottom: 16,
  },
  achievementCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  achievementHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  achievementDate: {
    fontSize: 12,
    fontWeight: "500",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    flex: 1,
    marginRight: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "500",
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    borderRadius: 12,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  rewardsList: {
    marginBottom: 16,
  },
  rewardItem: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  rewardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelBadgeText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 12,
  },
  rewardText: {
    fontSize: 14,
  },
  closeButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
})

export default AchievementsScreen


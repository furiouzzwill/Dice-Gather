"use client"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./AuthContext"
import { getUserAchievements, calculateAchievementPoints } from "../data/mockData"

// Define the levels and points required
export const LEVEL_THRESHOLDS = [
  { level: 1, points: 0, title: "Novice" },
  { level: 2, points: 30, title: "Beginner" },
  { level: 3, points: 75, title: "Enthusiast" },
  { level: 4, points: 150, title: "Hobbyist" },
  { level: 5, points: 250, title: "Expert" },
  { level: 6, points: 400, title: "Master" },
  { level: 7, points: 600, title: "Grandmaster" },
  { level: 8, points: 850, title: "Legend" },
  { level: 9, points: 1200, title: "Champion" },
  { level: 10, points: 1600, title: "Board Game Guru" },
]

// Define rewards for each level with app-specific features
export const LEVEL_REWARDS = [
  {
    level: 2,
    reward: "Custom Profile Banner",
    description: "Personalize your profile with a custom banner image",
    feature: "profileBanner",
    options: ["banner1", "banner2", "banner3"],
  },
  {
    level: 3,
    reward: "Custom Profile Themes",
    description: "Change the color theme of your profile page",
    feature: "profileTheme",
    options: ["blue", "green", "purple", "orange"],
  },
  {
    level: 4,
    reward: "Custom Avatar Frames",
    description: "Add decorative frames to your profile avatar",
    feature: "avatarFrame",
    options: ["gold", "silver", "bronze", "wood"],
  },
  {
    level: 5,
    reward: "Game Event Badges",
    description: "Display special badges on your hosted game events",
    feature: "eventBadges",
    options: ["premium", "featured", "expert"],
  },
  {
    level: 6,
    reward: "Custom Username Colors",
    description: "Change the color of your username in chats and comments",
    feature: "usernameColor",
    options: ["gold", "blue", "green", "red", "purple"],
  },
  {
    level: 7,
    reward: "Custom Message Themes",
    description: "Personalize the appearance of your chat messages",
    feature: "messageTheme",
    options: ["classic", "modern", "retro", "minimal"],
  },
  {
    level: 8,
    reward: "Animated Profile Elements",
    description: "Add subtle animations to your profile page",
    feature: "profileAnimations",
    options: ["subtle", "playful", "elegant"],
  },
  {
    level: 9,
    reward: "Custom Game Cards",
    description: "Personalize how your hosted games appear in the listings",
    feature: "gameCardStyle",
    options: ["premium", "classic", "modern", "minimal"],
  },
  {
    level: 10,
    reward: "Profile Spotlight Effects",
    description: "Add special visual effects to your profile that others can see",
    feature: "spotlightEffects",
    options: ["glow", "sparkle", "confetti", "dice"],
  },
]

// Define user unlocks type
export type UserUnlocks = {
  [key: string]: {
    unlocked: boolean
    selected?: string
  }
}

// Define PointsContext type
type PointsContextType = {
  points: number
  level: number
  levelTitle: string
  nextLevelPoints: number
  progress: number
  unlockedFeatures: UserUnlocks
  refreshPoints: () => void
  updateSelectedOption: (feature: string, option: string) => Promise<void>
}

// Create context
const PointsContext = createContext<PointsContextType | undefined>(undefined)

// Define props for PointsProvider
interface PointsProviderProps {
  children: ReactNode
}

// Create PointsProvider component
export const PointsProvider = ({ children }: PointsProviderProps) => {
  const { user, updateUser } = useAuth()
  const [points, setPoints] = useState(0)
  const [level, setLevel] = useState(1)
  const [levelTitle, setLevelTitle] = useState("Novice")
  const [nextLevelPoints, setNextLevelPoints] = useState(30)
  const [progress, setProgress] = useState(0)
  const [unlockedFeatures, setUnlockedFeatures] = useState<UserUnlocks>({})

  // Calculate level based on points
  const calculateLevel = (points: number) => {
    let currentLevel = 1
    let currentTitle = "Novice"
    let nextPoints = 30
    let currentProgress = 0

    // Find the highest level the user has reached
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (points >= LEVEL_THRESHOLDS[i].points) {
        currentLevel = LEVEL_THRESHOLDS[i].level
        currentTitle = LEVEL_THRESHOLDS[i].title

        // Calculate next level points and progress
        if (i < LEVEL_THRESHOLDS.length - 1) {
          nextPoints = LEVEL_THRESHOLDS[i + 1].points
          const levelPointsRange = nextPoints - LEVEL_THRESHOLDS[i].points
          const pointsIntoLevel = points - LEVEL_THRESHOLDS[i].points
          currentProgress = Math.min(pointsIntoLevel / levelPointsRange, 1)
        } else {
          // Max level reached
          nextPoints = -1
          currentProgress = 1
        }
        break
      }
    }

    return { level: currentLevel, title: currentTitle, nextPoints, progress: currentProgress }
  }

  // Get unlocked features based on level
  const getUnlockedFeatures = (level: number, existingUnlocks: UserUnlocks = {}) => {
    const unlocks: UserUnlocks = { ...existingUnlocks }

    LEVEL_REWARDS.forEach((reward) => {
      if (reward.level <= level) {
        if (!unlocks[reward.feature]) {
          unlocks[reward.feature] = {
            unlocked: true,
            selected: reward.options[0], // Default to first option
          }
        } else {
          unlocks[reward.feature].unlocked = true
        }
      }
    })

    return unlocks
  }

  // Load user points
  const loadPoints = () => {
    if (!user) {
      setPoints(0)
      setLevel(1)
      setLevelTitle("Novice")
      setNextLevelPoints(30)
      setProgress(0)
      setUnlockedFeatures({})
      return
    }

    // Get points from achievements
    const achievements = getUserAchievements(user.id)
    const totalPoints = calculateAchievementPoints(achievements)

    // Calculate level and progress
    const { level, title, nextPoints, progress } = calculateLevel(totalPoints)

    // Get unlocked features
    const userUnlocks = user.unlocks || {}
    const updatedUnlocks = getUnlockedFeatures(level, userUnlocks)

    // Update state
    setPoints(totalPoints)
    setLevel(level)
    setLevelTitle(title)
    setNextLevelPoints(nextPoints)
    setProgress(progress)
    setUnlockedFeatures(updatedUnlocks)
  }

  // Update selected option for a feature
  const updateSelectedOption = async (feature: string, option: string) => {
    if (!user) return

    // Check if feature is unlocked
    if (!unlockedFeatures[feature]?.unlocked) return

    // Update local state
    const updatedUnlocks = {
      ...unlockedFeatures,
      [feature]: {
        ...unlockedFeatures[feature],
        selected: option,
      },
    }

    setUnlockedFeatures(updatedUnlocks)

    // Update user data
    await updateUser({
      unlocks: updatedUnlocks,
    })
  }

  // Load points when user changes
  useEffect(() => {
    loadPoints()
  }, [user])

  // Function to refresh points
  const refreshPoints = () => {
    loadPoints()
  }

  return (
    <PointsContext.Provider
      value={{
        points,
        level,
        levelTitle,
        nextLevelPoints,
        progress,
        unlockedFeatures,
        refreshPoints,
        updateSelectedOption,
      }}
    >
      {children}
    </PointsContext.Provider>
  )
}

// Create hook for using points
export const usePoints = () => {
  const context = useContext(PointsContext)
  if (context === undefined) {
    throw new Error("usePoints must be used within a PointsProvider")
  }
  return context
}


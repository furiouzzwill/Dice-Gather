"use client"
import { StyleSheet } from "react-native"
import { createStackNavigator } from "@react-navigation/stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"

// Import your screens
import LoginScreen from "../screens/LoginScreen"
import SignupScreen from "../screens/SignupScreen"
import HomeScreen from "../screens/HomeScreen"
import ProfileScreen from "../screens/ProfileScreen"
import FriendsScreen from "../screens/FriendsScreen"
import FindFriendsScreen from "../screens/FindFriendsScreen"
import UserProfileScreen from "../screens/UserProfileScreen"
import ChatScreen from "../screens/ChatScreen"
import GameDetailsScreen from "../screens/GameDetailsScreen"
import HostGameScreen from "../screens/HostGameScreen"
import GamesScreen from "../screens/GamesScreen"
import AchievementsScreen from "../screens/AchievementsScreen"
import CustomizeProfileScreen from "../screens/CustomizeProfileScreen"

// Define the types for our stack navigator
export type RootStackParamList = {
  Main: undefined
  Login: undefined
  Signup: undefined
  GameDetails: { gameId: string }
  HostGame: undefined
  BrowseGames: { category?: string }
  Search: undefined
  UserProfile: { userId: string }
  FindFriends: undefined
  Chat: { userId?: string }
  Achievements: undefined
  CustomizeProfile: undefined
}

export type TabParamList = {
  Home: undefined
  Friends: undefined
  Messages: undefined
  Profile: undefined
  Games: undefined
}

const Stack = createStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<TabParamList>()

// Bottom Tab Navigator
const MainTabs = () => {
  const { colors } = useTheme()

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline"
          } else if (route.name === "Friends") {
            iconName = focused ? "people" : "people-outline"
          } else if (route.name === "Messages") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline"
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline"
          } else if (route.name === "Games") {
            iconName = focused ? "grid" : "grid-outline"
          } else {
            iconName = "help-circle"
          }

          return <Ionicons name={iconName as any} size={size} color={color} />
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Games" component={GamesScreen} />
      <Tab.Screen name="Friends" component={FriendsScreen} />
      <Tab.Screen
        name="Messages"
        component={ChatScreen}
        options={{
          tabBarBadge: 3,
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}

// Main Stack Navigator
export default function Navigation() {
  const { user } = useAuth()
  const { colors } = useTheme()

  return (
    <Stack.Navigator
      initialRouteName={user ? "Main" : "Login"}
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      {user ? (
        // Authenticated routes
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="GameDetails" component={GameDetailsScreen} />
          <Stack.Screen name="HostGame" component={HostGameScreen} />
          <Stack.Screen name="UserProfile" component={UserProfileScreen} />
          <Stack.Screen name="FindFriends" component={FindFriendsScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="Achievements" component={AchievementsScreen} />
          <Stack.Screen name="CustomizeProfile" component={CustomizeProfileScreen} />
        </>
      ) : (
        // Unauthenticated routes
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})


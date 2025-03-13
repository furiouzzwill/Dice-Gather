import { View, StyleSheet, StatusBar, Platform, LogBox } from "react-native"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"

// Import contexts
import { AuthProvider } from "./src/contexts/AuthContext"
import { ThemeProvider } from "./src/contexts/ThemeContext"
import { FriendsProvider } from "./src/contexts/FriendsContext"
import { PointsProvider } from "./src/contexts/PointsContext"

// Import screens
import HomeScreen from "./src/screens/HomeScreen"
import GamesScreen from "./src/screens/GamesScreen"
import ProfileScreen from "./src/screens/ProfileScreen"
import GameDetailsScreen from "./src/screens/GameDetailsScreen"
import LoginScreen from "./src/screens/LoginScreen"
import SignupScreen from "./src/screens/SignupScreen"
import HostGameScreen from "./src/screens/HostGameScreen"
import FriendsScreen from "./src/screens/FriendsScreen"
import FindFriendsScreen from "./src/screens/FindFriendsScreen"
import UserProfileScreen from "./src/screens/UserProfileScreen"
import ChatScreen from "./src/screens/ChatScreen"
import AchievementsScreen from "./src/screens/AchievementsScreen"
// Add import for CustomizeProfileScreen
import CustomizeProfileScreen from "./src/screens/CustomizeProfileScreen"

// Import the HostGameButton component
import HostGameButton from "./src/components/HostGameButton"

// Suppress warnings
LogBox.ignoreLogs(['Unsupported top level event type "topInsetsChange" dispatched'])

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

// Define the tab navigator with all screens
function MainTabs() {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName

            if (route.name === "Home") {
              iconName = focused ? "home" : "home-outline"
            } else if (route.name === "Games") {
              iconName = focused ? "game-controller" : "game-controller-outline"
            } else if (route.name === "Friends") {
              iconName = focused ? "people" : "people-outline"
            } else if (route.name === "Profile") {
              iconName = focused ? "person" : "person-outline"
            }

            // You must return the component
            return <Ionicons name={iconName as any} size={size} color={color} />
          },
          tabBarActiveTintColor: "#2563eb",
          tabBarInactiveTintColor: "gray",
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Games" component={GamesScreen} />
        <Tab.Screen name="Friends" component={FriendsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>

      {/* Always render the HostGameButton, regardless of user type */}
      <HostGameButton />
    </View>
  )
}

// Define the stack navigator with all screens
function AppNavigator() {
  console.log("Initializing AppNavigator")
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="GameDetails" component={GameDetailsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="HostGame" component={HostGameScreen} options={{ headerShown: false }} />
        <Stack.Screen name="FindFriends" component={FindFriendsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Achievements" component={AchievementsScreen} options={{ headerShown: false }} />
        {/* In the Stack.Navigator, add the CustomizeProfile screen */}
        <Stack.Screen name="CustomizeProfile" component={CustomizeProfileScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

// Main App component
export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ThemeProvider>
        <AuthProvider>
          <FriendsProvider>
            <PointsProvider>
              <AppNavigator />
            </PointsProvider>
          </FriendsProvider>
        </AuthProvider>
      </ThemeProvider>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0,
  },
})


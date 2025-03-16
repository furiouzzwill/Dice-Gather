import { SafeAreaProvider } from "react-native-safe-area-context"
import { StatusBar } from "react-native"
import { NavigationContainer } from "@react-navigation/native"
import { AuthProvider } from "./src/contexts/AuthContext"
import { ThemeProvider } from "./src/contexts/ThemeContext"
import { FriendsProvider } from "./src/contexts/FriendsContext"
import { PointsProvider } from "./src/contexts/PointsContext"
import Navigation from "./src/navigation"

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <AuthProvider>
        <ThemeProvider>
          <FriendsProvider>
            <PointsProvider>
              <NavigationContainer>
                <Navigation />
              </NavigationContainer>
            </PointsProvider>
          </FriendsProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  )
}


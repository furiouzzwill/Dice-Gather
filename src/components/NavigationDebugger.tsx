"use client"

import { useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useAuth } from "../contexts/AuthContext"

export const NavigationDebugger = () => {
  const navigation = useNavigation() as any
  const { user } = useAuth()

  useEffect(() => {
    // Log navigation state on mount
    try {
      const state = navigation.getState()
      console.log("Current navigation state:", JSON.stringify(state))
    } catch (e) {
      console.log("Error getting navigation state:", e)
    }
  }, [])

  const getNavigationInfo = () => {
    try {
      const state = navigation.getState()
      const routes = state?.routes || []
      const currentRoute = routes[state?.index || 0]
      return {
        currentRoute: currentRoute?.name || "Unknown",
        routeCount: routes.length,
        canGoBack: navigation.canGoBack(),
        isAuthenticated: !!user,
      }
    } catch (e) {
      return { error: String(e) }
    }
  }

  const info = getNavigationInfo()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Navigation Debug</Text>
      <Text style={styles.info}>Current: {info.currentRoute}</Text>
      <Text style={styles.info}>Routes: {info.routeCount}</Text>
      <Text style={styles.info}>Can Go Back: {String(info.canGoBack)}</Text>
      <Text style={styles.info}>Auth: {info.isAuthenticated ? "Yes" : "No"}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Home")}>
          <Text style={styles.buttonText}>Go Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: "Home" }],
            })
          }}
        >
          <Text style={styles.buttonText}>Reset to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 50,
    left: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 10,
    borderRadius: 10,
    zIndex: 9999,
  },
  title: {
    color: "white",
    fontWeight: "bold",
    marginBottom: 5,
  },
  info: {
    color: "white",
    fontSize: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "space-between",
  },
  button: {
    backgroundColor: "#4C51BF",
    padding: 8,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 12,
  },
})

export default NavigationDebugger


"use client"
import { createContext, useContext, useState, type ReactNode } from "react"

// Define theme colors
type ThemeColors = {
  background: string
  text: string
  muted: string
  primary: string
  secondary: string
  card: string
  border: string
  error: string
}

// Define light and dark theme colors
const lightColors: ThemeColors = {
  background: "#FFFFFF",
  text: "#000000",
  muted: "#6B7280",
  primary: "#2563EB",
  secondary: "#F3F4F6",
  card: "#FFFFFF",
  border: "#E5E7EB",
  error: "#EF4444",
}

const darkColors: ThemeColors = {
  background: "#1F2937",
  text: "#FFFFFF",
  muted: "#9CA3AF",
  primary: "#3B82F6",
  secondary: "#374151",
  card: "#111827",
  border: "#374151",
  error: "#EF4444",
}

// Define theme context type
type ThemeContextType = {
  theme: "light" | "dark"
  colors: ThemeColors
  toggleTheme: () => void
  isDarkMode: boolean
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  colors: lightColors,
  toggleTheme: () => {},
  isDarkMode: false,
})

// Define props for ThemeProvider
interface ThemeProviderProps {
  children: ReactNode
}

// Create ThemeProvider component
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
  }

  const isDarkMode = theme === "dark"
  const colors = isDarkMode ? darkColors : lightColors

  return <ThemeContext.Provider value={{ theme, colors, toggleTheme, isDarkMode }}>{children}</ThemeContext.Provider>
}

// Create hook for using theme
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}


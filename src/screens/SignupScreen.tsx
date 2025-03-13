"use client"

import { useState, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Switch,
  TextInput,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../contexts/ThemeContext"
import { useAuth } from "../contexts/AuthContext"

const SignupScreen = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isBusinessAccount, setIsBusinessAccount] = useState(false)
  const [businessName, setBusinessName] = useState("")
  const [businessType, setBusinessType] = useState("")
  const [businessAddress, setBusinessAddress] = useState("")
  const [businessCity, setBusinessCity] = useState("")
  const [businessState, setBusinessState] = useState("")
  const [businessZip, setBusinessZip] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [error, setError] = useState("")

  const navigation = useNavigation() as any
  const { colors } = useTheme()
  const { signup } = useAuth()

  // Add refs for input fields
  const nameInputRef = useRef<TextInput>(null)
  const emailInputRef = useRef<TextInput>(null)
  const usernameInputRef = useRef<TextInput>(null)
  const passwordInputRef = useRef<TextInput>(null)
  const confirmPasswordInputRef = useRef<TextInput>(null)
  const businessNameInputRef = useRef<TextInput>(null)
  const businessTypeInputRef = useRef<TextInput>(null)
  const businessAddressInputRef = useRef<TextInput>(null)
  const businessCityInputRef = useRef<TextInput>(null)
  const businessStateInputRef = useRef<TextInput>(null)
  const businessZipInputRef = useRef<TextInput>(null)

  // Log that the component is rendering
  console.log("SignupScreen is rendering")

  const handleSignup = async () => {
    // Validate inputs
    if (!name || !email || !username || !password || !confirmPassword) {
      setError("Please fill in all required fields")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (
      isBusinessAccount &&
      (!businessName || !businessType || !businessAddress || !businessCity || !businessState || !businessZip)
    ) {
      setError("Please fill in all business information")
      return
    }

    setError("")
    setIsLoading(true)

    try {
      const result = await signup(
        name,
        email,
        username,
        password,
        isBusinessAccount ? "business" : "personal",
        isBusinessAccount
          ? {
              businessName,
              businessType,
              location: {
                address: businessAddress,
                city: businessCity,
                state: businessState,
                zip: businessZip,
              },
            }
          : undefined,
      )

      if (result.success) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Main" }],
        })
      } else {
        setError(result.message)
      }
    } catch (error: any) {
      setError("An unexpected error occurred")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const getLocation = () => {
    setIsGettingLocation(true)

    // Simulate getting location
    setTimeout(() => {
      setBusinessAddress("123 Game Street")
      setBusinessCity("Boardville")
      setBusinessState("CA")
      setBusinessZip("90210")
      setIsGettingLocation(false)
    }, 1500)
  }

  // Create a simple Button component for this screen
  const ButtonComponent = ({ title, onPress, loading, variant, size, icon, style }: any) => (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: variant === "outline" ? "transparent" : colors.primary,
          borderColor: colors.primary,
          borderWidth: variant === "outline" ? 1 : 0,
          paddingVertical: size === "small" ? 8 : 12,
        },
        style,
      ]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === "outline" ? colors.primary : "#ffffff"} />
      ) : (
        <View style={styles.buttonContent}>
          {icon}
          <Text
            style={[
              styles.buttonText,
              {
                color: variant === "outline" ? colors.primary : "#ffffff",
                fontSize: size === "small" ? 14 : 16,
              },
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  )

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <Text style={[styles.title, { color: colors.text }]}>Create an account</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Enter your information to create an account</Text>

          {error ? (
            <View style={[styles.errorContainer, { backgroundColor: colors.error + "20" }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.accountTypeContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Account Type</Text>
            <View style={styles.accountTypeToggle}>
              <Text style={[styles.accountTypeText, { color: isBusinessAccount ? colors.muted : colors.text }]}>
                Personal
              </Text>
              <Switch
                value={isBusinessAccount}
                onValueChange={setIsBusinessAccount}
                trackColor={{ false: colors.muted, true: colors.primary }}
                thumbColor="#ffffff"
                style={styles.switch}
              />
              <Text style={[styles.accountTypeText, { color: isBusinessAccount ? colors.text : colors.muted }]}>
                Business
              </Text>
            </View>
            <Text style={[styles.accountTypeDescription, { color: colors.muted }]}>
              {isBusinessAccount
                ? "Business accounts can host events like tournaments and game nights."
                : "Personal accounts can join events but cannot host events."}
            </Text>
          </View>

          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Full Name</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.inputIcon}>
                <Ionicons name="person-outline" size={18} color={colors.muted} />
              </View>
              <TextInput
                ref={nameInputRef}
                style={[styles.input, { color: colors.text }]}
                placeholder="John Doe"
                placeholderTextColor={colors.muted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => emailInputRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Email</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.inputIcon}>
                <Ionicons name="mail-outline" size={18} color={colors.muted} />
              </View>
              <TextInput
                ref={emailInputRef}
                style={[styles.input, { color: colors.text }]}
                placeholder="your.email@example.com"
                placeholderTextColor={colors.muted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => usernameInputRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>
          </View>

          {/* Username Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Username</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.inputIcon}>
                <Ionicons name="at-outline" size={18} color={colors.muted} />
              </View>
              <TextInput
                ref={usernameInputRef}
                style={[styles.input, { color: colors.text }]}
                placeholder="johndoe"
                placeholderTextColor={colors.muted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Password</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.inputIcon}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.muted} />
              </View>
              <TextInput
                ref={passwordInputRef}
                style={[styles.input, { color: colors.text }]}
                placeholder="Your password"
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Confirm Password</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.inputIcon}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.muted} />
              </View>
              <TextInput
                ref={confirmPasswordInputRef}
                style={[styles.input, { color: colors.text }]}
                placeholder="Confirm your password"
                placeholderTextColor={colors.muted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                returnKeyType={isBusinessAccount ? "next" : "done"}
                onSubmitEditing={() => {
                  if (isBusinessAccount) {
                    businessNameInputRef.current?.focus()
                  } else {
                    handleSignup()
                  }
                }}
                blurOnSubmit={!isBusinessAccount}
              />
            </View>
          </View>

          {isBusinessAccount && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Business Information</Text>

              {/* Business Name Input */}
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Business Name</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.inputIcon}>
                    <Ionicons name="business-outline" size={18} color={colors.muted} />
                  </View>
                  <TextInput
                    ref={businessNameInputRef}
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Game Store Inc."
                    placeholderTextColor={colors.muted}
                    value={businessName}
                    onChangeText={setBusinessName}
                    returnKeyType="next"
                    onSubmitEditing={() => businessTypeInputRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                </View>
              </View>

              {/* Business Type Input */}
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Business Type</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.inputIcon}>
                    <Ionicons name="briefcase-outline" size={18} color={colors.muted} />
                  </View>
                  <TextInput
                    ref={businessTypeInputRef}
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Select business type"
                    placeholderTextColor={colors.muted}
                    value={businessType}
                    onChangeText={setBusinessType}
                    returnKeyType="next"
                    onSubmitEditing={() => businessAddressInputRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                </View>
              </View>

              <View style={styles.locationHeader}>
                <Text style={[styles.label, { color: colors.text }]}>Business Location</Text>
                <ButtonComponent
                  title="Detect Location"
                  onPress={getLocation}
                  variant="outline"
                  size="small"
                  loading={isGettingLocation}
                  icon={<Ionicons name="location-outline" size={16} color={colors.primary} />}
                />
              </View>

              {/* Business Address Input */}
              <View style={styles.inputContainer}>
                <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.inputIcon}>
                    <Ionicons name="home-outline" size={18} color={colors.muted} />
                  </View>
                  <TextInput
                    ref={businessAddressInputRef}
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Street Address"
                    placeholderTextColor={colors.muted}
                    value={businessAddress}
                    onChangeText={setBusinessAddress}
                    returnKeyType="next"
                    onSubmitEditing={() => businessCityInputRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                </View>
              </View>

              <View style={styles.row}>
                {/* Business City Input */}
                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <TextInput
                      ref={businessCityInputRef}
                      style={[styles.input, { color: colors.text }]}
                      placeholder="City"
                      placeholderTextColor={colors.muted}
                      value={businessCity}
                      onChangeText={setBusinessCity}
                      returnKeyType="next"
                      onSubmitEditing={() => businessStateInputRef.current?.focus()}
                      blurOnSubmit={false}
                    />
                  </View>
                </View>

                {/* Business State Input */}
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <TextInput
                      ref={businessStateInputRef}
                      style={[styles.input, { color: colors.text }]}
                      placeholder="State"
                      placeholderTextColor={colors.muted}
                      value={businessState}
                      onChangeText={setBusinessState}
                      returnKeyType="next"
                      onSubmitEditing={() => businessZipInputRef.current?.focus()}
                      blurOnSubmit={false}
                    />
                  </View>
                </View>
              </View>

              {/* Business Zip Input */}
              <View style={styles.inputContainer}>
                <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.inputIcon}>
                    <Ionicons name="mail-outline" size={18} color={colors.muted} />
                  </View>
                  <TextInput
                    ref={businessZipInputRef}
                    style={[styles.input, { color: colors.text }]}
                    placeholder="ZIP Code"
                    placeholderTextColor={colors.muted}
                    value={businessZip}
                    onChangeText={setBusinessZip}
                    keyboardType="numeric"
                    returnKeyType="done"
                    onSubmitEditing={handleSignup}
                  />
                </View>
              </View>
            </>
          )}

          <ButtonComponent
            title="Create Account"
            onPress={handleSignup}
            loading={isLoading}
            style={styles.signupButton}
          />

          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: colors.text }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={[styles.loginLink, { color: colors.primary }]}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  backButton: {
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
  },
  accountTypeContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "500",
  },
  accountTypeToggle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  accountTypeText: {
    fontSize: 14,
  },
  switch: {
    marginHorizontal: 8,
  },
  accountTypeDescription: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 16,
  },
  locationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
  },
  signupButton: {
    marginTop: 24,
    marginBottom: 16,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 40,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "600",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    height: 44,
  },
  inputIcon: {
    paddingLeft: 12,
    paddingRight: 8,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    paddingHorizontal: 12,
  },
  button: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontWeight: "600",
  },
})

export default SignupScreen


"use client"

import { useState, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  ActivityIndicator,
  Keyboard,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../contexts/ThemeContext"
import { useAuth } from "../contexts/AuthContext"
import { mockGames } from "../data/mockData"

const HostGameScreen = () => {
  const navigation = useNavigation() as any
  const { colors } = useTheme()
  const { user } = useAuth()

  // Create refs for each input field to enable keyboard navigation
  const titleInputRef = useRef<TextInput>(null)
  const descriptionInputRef = useRef<TextInput>(null)
  const locationInputRef = useRef<TextInput>(null)
  const durationInputRef = useRef<TextInput>(null)
  const totalSpotsInputRef = useRef<TextInput>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("Strategy")
  const [difficulty, setDifficulty] = useState("Beginner")
  const [location, setLocation] = useState("")
  const [date, setDate] = useState(new Date())
  const [duration, setDuration] = useState("120")
  const [totalSpots, setTotalSpots] = useState("4")
  const [image, setImage] = useState<string | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)

  // Sample images for game events
  const sampleImages = [
    "https://picsum.photos/id/1/400/200",
    "https://picsum.photos/id/2/400/200",
    "https://picsum.photos/id/3/400/200",
    "https://picsum.photos/id/4/400/200",
    "https://picsum.photos/id/5/400/200",
    "https://picsum.photos/id/6/400/200",
  ]
  const [showImagePicker, setShowImagePicker] = useState(false)

  // Check if user is logged in
  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorTitle, { color: colors.text }]}>Not Logged In</Text>
        <Text style={[styles.errorMessage, { color: colors.muted }]}>Please log in to host game events.</Text>
        <TouchableOpacity
          style={[styles.navBackButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // All logged-in users can host games now, no need for business account check

  const handleSubmit = () => {
    // Validate inputs
    if (!title || !description || !category || !difficulty || !location || !duration || !totalSpots) {
      setError("Please fill in all fields")
      return
    }

    if (!image) {
      setError("Please select an image for your event")
      return
    }

    setError("")
    setIsSubmitting(true)

    // Generate a unique ID for the new game
    const newGameId = `game${mockGames.length + 1}`

    // Create new game object
    const newGame = {
      id: newGameId,
      title,
      description,
      category,
      date: date.toISOString(),
      location,
      image,
      difficulty,
      duration: Number.parseInt(duration),
      spotsAvailable: Number.parseInt(totalSpots),
      spotsTotal: Number.parseInt(totalSpots),
      host: {
        name: user.name,
        avatar: user.avatar || "https://ui-avatars.com/api/?name=User",
        since: user.joinedDate,
        accountType: user.accountType || "business",
      },
    }

    // Add the new game to the mock data
    mockGames.unshift(newGame)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setShowSuccess(true)
    }, 1500)
  }

  const handleSuccessDone = () => {
    setShowSuccess(false)
    navigation.navigate("Main")
  }

  const incrementDate = () => {
    const newDate = new Date(date)
    newDate.setDate(newDate.getDate() + 1)
    setDate(newDate)
  }

  const decrementDate = () => {
    const newDate = new Date(date)
    newDate.setDate(newDate.getDate() - 1)
    // Don't allow dates in the past
    if (newDate >= new Date()) {
      setDate(newDate)
    }
  }

  const incrementTime = () => {
    const newDate = new Date(date)
    newDate.setHours(newDate.getHours() + 1)
    setDate(newDate)
  }

  const decrementTime = () => {
    const newDate = new Date(date)
    newDate.setHours(newDate.getHours() - 1)
    setDate(newDate)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Create a simple Select component for this screen
  const Select = ({ label, options, value, onValueChange }: any) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, { color: colors.text }]}>{label}</Text>
      <View style={[styles.selectContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {options.map((option: string) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.selectOption,
              {
                backgroundColor: value === option ? colors.primary : "transparent",
              },
            ]}
            onPress={() => onValueChange(option)}
          >
            <Text
              style={[
                styles.selectOptionText,
                {
                  color: value === option ? "#ffffff" : colors.text,
                },
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  // Simple date picker modal
  const DatePickerModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showDatePicker}
      onRequestClose={() => setShowDatePicker(false)}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Select Date</Text>

          <View style={styles.pickerContainer}>
            <TouchableOpacity onPress={decrementDate} style={styles.arrowButton}>
              <Ionicons name="chevron-down" size={24} color={colors.primary} />
            </TouchableOpacity>

            <Text style={[styles.valueText, { color: colors.text }]}>{formatDate(date)}</Text>

            <TouchableOpacity onPress={incrementDate} style={styles.arrowButton}>
              <Ionicons name="chevron-up" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.muted }]}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )

  // Simple time picker modal
  const TimePickerModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showTimePicker}
      onRequestClose={() => setShowTimePicker(false)}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Select Time</Text>

          <View style={styles.pickerContainer}>
            <TouchableOpacity onPress={decrementTime} style={styles.arrowButton}>
              <Ionicons name="chevron-down" size={24} color={colors.primary} />
            </TouchableOpacity>

            <Text style={[styles.valueText, { color: colors.text }]}>{formatTime(date)}</Text>

            <TouchableOpacity onPress={incrementTime} style={styles.arrowButton}>
              <Ionicons name="chevron-up" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.muted }]}
              onPress={() => setShowTimePicker(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={() => setShowTimePicker(false)}
            >
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )

  // Image picker modal
  const ImagePickerModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showImagePicker}
      onRequestClose={() => setShowImagePicker(false)}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: colors.card, width: "90%" }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Select Event Image</Text>

          <View style={styles.imageGrid}>
            {sampleImages.map((img, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.imageItem, image === img && { borderColor: colors.primary, borderWidth: 3 }]}
                onPress={() => setImage(img)}
              >
                <Image source={{ uri: img }} style={styles.thumbnailImage} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.muted }]}
              onPress={() => setShowImagePicker(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={() => setShowImagePicker(false)}
            >
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )

  // Success modal
  const SuccessModal = () => (
    <Modal animationType="slide" transparent={true} visible={showSuccess} onRequestClose={() => setShowSuccess(false)}>
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: colors.card }]}>
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={60} color={colors.primary} />
          </View>

          <Text style={[styles.successTitle, { color: colors.text }]}>Game Event Created!</Text>
          <Text style={[styles.successMessage, { color: colors.muted }]}>
            Your game event has been successfully created and is now visible to other users.
          </Text>

          <TouchableOpacity
            style={[styles.successButton, { backgroundColor: colors.primary }]}
            onPress={handleSuccessDone}
          >
            <Text style={styles.successButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>Host a Game</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Fill in the details to create a new board game event
        </Text>

        {error ? (
          <View style={[styles.errorContainer, { backgroundColor: colors.error + "20" }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Event Title</Text>
          <TextInput
            ref={titleInputRef}
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            placeholder="Enter event title"
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={setTitle}
            returnKeyType="next"
            onSubmitEditing={() => descriptionInputRef.current?.focus()}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Description</Text>
          <TextInput
            ref={descriptionInputRef}
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
                height: 4 * 24,
                textAlignVertical: "top",
              },
            ]}
            placeholder="Describe your event..."
            placeholderTextColor={colors.muted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            returnKeyType="next"
            onSubmitEditing={() => {
              Keyboard.dismiss()
              setShowImagePicker(true)
            }}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Event Image</Text>
          <TouchableOpacity
            style={[styles.imagePickerButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowImagePicker(true)}
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.selectedImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={32} color={colors.muted} />
                <Text style={{ color: colors.muted, marginTop: 8 }}>Select an image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Select
          label="Category"
          options={["Strategy", "Family", "Party", "Card", "Co-op", "Dice"]}
          value={category}
          onValueChange={setCategory}
        />

        <Select
          label="Difficulty"
          options={["Beginner", "Intermediate", "Advanced"]}
          value={difficulty}
          onValueChange={setDifficulty}
        />

        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Location</Text>
          <TextInput
            ref={locationInputRef}
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            placeholder="Enter the event location"
            placeholderTextColor={colors.muted}
            value={location}
            onChangeText={setLocation}
            returnKeyType="next"
            onSubmitEditing={() => {
              Keyboard.dismiss()
              setShowDatePicker(true)
            }}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Date & Time</Text>
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity
              style={[styles.dateTimeButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={18} color={colors.muted} style={styles.dateTimeIcon} />
              <Text style={[styles.dateTimeText, { color: colors.text }]}>{formatDate(date)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dateTimeButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time-outline" size={18} color={colors.muted} style={styles.dateTimeIcon} />
              <Text style={[styles.dateTimeText, { color: colors.text }]}>{formatTime(date)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Duration (minutes)</Text>
            <TextInput
              ref={durationInputRef}
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="120"
              placeholderTextColor={colors.muted}
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              returnKeyType="next"
              onSubmitEditing={() => totalSpotsInputRef.current?.focus()}
            />
          </View>

          <View style={[styles.inputContainer, { flex: 1 }]}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Total Spots</Text>
            <TextInput
              ref={totalSpotsInputRef}
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="4"
              placeholderTextColor={colors.muted}
              value={totalSpots}
              onChangeText={setTotalSpots}
              keyboardType="numeric"
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.primary, opacity: isSubmitting ? 0.7 : 1 }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>Create Event</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <DatePickerModal />
      <TimePickerModal />
      <ImagePickerModal />
      <SuccessModal />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    marginTop: 40,
    marginBottom: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
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
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  selectContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
  selectOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  selectOptionText: {
    fontSize: 14,
  },
  dateTimeContainer: {
    flexDirection: "row",
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
  },
  dateTimeIcon: {
    marginRight: 8,
  },
  dateTimeText: {
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 40,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 40,
    marginBottom: 8,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  navBackButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 40,
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Modal styles
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  pickerContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  arrowButton: {
    padding: 10,
  },
  valueText: {
    fontSize: 18,
    fontWeight: "500",
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  // Image picker styles
  imagePickerButton: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
    height: 150,
  },
  selectedImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginVertical: 15,
  },
  imageItem: {
    width: "30%",
    height: 80,
    marginBottom: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  // Success modal styles
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  successButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  successButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  upgradeButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginRight: 8,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContent: {
    paddingBottom: 100,
  },
})

export default HostGameScreen


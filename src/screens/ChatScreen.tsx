"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../contexts/ThemeContext"
import { useAuth } from "../contexts/AuthContext"
import { getUserById, getConversation, mockMessages } from "../data/mockData"
import type { User } from "../contexts/AuthContext"

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: number
  read: boolean
}

const generateMessageId = () => `msg${Date.now()}${Math.floor(Math.random() * 1000)}`

const ChatScreen = () => {
  const route = useRoute() as any
  const navigation = useNavigation() as any
  const { colors } = useTheme()
  const { user } = useAuth()

  const [receiver, setReceiver] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const { userId } = route.params
  const flatListRef = useRef<FlatList>(null)

  // Define Hinge-like colors
  const hingeColors = {
    primary: "#F3506B", // Hinge's pinkish-red color
    background: "#FFFFFF",
    userBubble: "#F3506B",
    userText: "#FFFFFF",
    otherBubble: "#F0F2F4",
    otherText: "#000000",
    inputBackground: "#F0F2F4",
    headerBackground: "#FFFFFF",
    timeText: "#8E8E93",
  }

  useEffect(() => {
    const loadChatData = () => {
      setIsLoading(true)

      // Get receiver info
      const receiverData = getUserById(userId)
      if (receiverData) {
        // Use type assertion to ensure the accountType is properly typed
        const typedReceiver: User = {
          ...receiverData,
          accountType: receiverData.accountType as "personal" | "business" | undefined,
        }
        setReceiver(typedReceiver)
      }

      // Get conversation
      if (user) {
        const conversation = getConversation(user.id, userId)
        setMessages(conversation)
      }

      setIsLoading(false)
    }

    loadChatData()
  }, [userId, user])

  const sendMessage = () => {
    if (!newMessage.trim() || !user || !receiver) return

    const message: Message = {
      id: generateMessageId(),
      senderId: user.id,
      receiverId: receiver.id,
      content: newMessage.trim(),
      timestamp: Date.now(),
      read: false,
    }

    // In a real app, you would send this to an API
    mockMessages.push(message)

    // Update local state
    setMessages([...messages, message])
    setNewMessage("")

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
  }

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups: { [key: string]: Message[] } = {}

    messages.forEach((message) => {
      const date = formatDate(message.timestamp)
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })

    // Convert to array format for FlatList
    return Object.keys(groups).map((date) => ({
      date,
      data: groups[date],
    }))
  }

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderId === user?.id

    return (
      <View style={[styles.messageContainer, isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer]}>
        <View
          style={[
            styles.messageBubble,
            isOwnMessage
              ? [styles.ownMessageBubble, { backgroundColor: hingeColors.userBubble }]
              : [styles.otherMessageBubble, { backgroundColor: hingeColors.otherBubble }],
          ]}
        >
          <Text style={[styles.messageText, { color: isOwnMessage ? hingeColors.userText : hingeColors.otherText }]}>
            {item.content}
          </Text>
        </View>
        <Text style={[styles.messageTime, { color: hingeColors.timeText }]}>{formatTime(item.timestamp)}</Text>
      </View>
    )
  }

  const renderDateHeader = ({ date }: { date: string }) => (
    <View style={styles.dateHeaderContainer}>
      <View style={styles.dateHeaderLine} />
      <Text style={styles.dateHeaderText}>{date}</Text>
      <View style={styles.dateHeaderLine} />
    </View>
  )

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: hingeColors.background }]}>
        <ActivityIndicator size="large" color={hingeColors.primary} />
      </View>
    )
  }

  if (!receiver) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: hingeColors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={[styles.errorTitle, { color: colors.text }]}>User Not Found</Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: hingeColors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const groupedMessages = groupMessagesByDate()

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: hingeColors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={[styles.container, { backgroundColor: hingeColors.background }]}>
          {/* Hinge-style header */}
          <View style={[styles.header, { backgroundColor: hingeColors.headerBackground }]}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={28} color={hingeColors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.userInfo}
              onPress={() => navigation.navigate("UserProfile", { userId: receiver.id })}
            >
              <Text style={styles.userName}>{receiver.name}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.headerAction}>
              <Ionicons name="ellipsis-horizontal" size={24} color={hingeColors.primary} />
            </TouchableOpacity>
          </View>

          {/* Messages list */}
          {messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptySubtitle}>Say hello to {receiver.name}!</Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={groupedMessages}
              keyExtractor={(item) => item.date}
              renderItem={({ item }) => (
                <View>
                  {renderDateHeader({ date: item.date })}
                  {item.data.map((message: Message) => (
                    <View key={message.id}>{renderMessageItem({ item: message })}</View>
                  ))}
                </View>
              )}
              contentContainerStyle={styles.messagesList}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            />
          )}

          {/* Hinge-style input area */}
          <View style={[styles.inputContainer, { backgroundColor: hingeColors.background }]}>
            <View style={[styles.inputWrapper, { backgroundColor: hingeColors.inputBackground }]}>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor="#8E8E93"
                value={newMessage}
                onChangeText={setNewMessage}
                multiline
              />
              {newMessage.trim() ? (
                <TouchableOpacity
                  style={[styles.sendButton, { backgroundColor: hingeColors.primary }]}
                  onPress={sendMessage}
                >
                  <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              ) : (
                <View style={styles.inputActions}>
                  <TouchableOpacity style={styles.inputAction}>
                    <Ionicons name="image-outline" size={24} color="#8E8E93" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  backButton: {
    padding: 8,
  },
  userInfo: {
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  headerAction: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 16,
  },
  backButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#000000",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#8E8E93",
  },
  messagesList: {
    padding: 16,
  },
  dateHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
  },
  dateHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#EEEEEE",
  },
  dateHeaderText: {
    fontSize: 12,
    color: "#8E8E93",
    marginHorizontal: 8,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: "80%",
  },
  ownMessageContainer: {
    alignSelf: "flex-end",
  },
  otherMessageContainer: {
    alignSelf: "flex-start",
  },
  messageBubble: {
    borderRadius: 18,
    padding: 12,
    minWidth: 40,
  },
  ownMessageBubble: {
    borderBottomRightRadius: 4, // Creates the "tail" effect on own messages
  },
  otherMessageBubble: {
    borderBottomLeftRadius: 4, // Creates the "tail" effect on other messages
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  inputContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    color: "#000000",
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  inputActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputAction: {
    marginLeft: 8,
    padding: 4,
  },
})

export default ChatScreen


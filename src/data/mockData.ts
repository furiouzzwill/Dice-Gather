// Define the allowed account types
type AccountType = "personal" | "business"

// Mock data for users
export const mockUsers = [
  {
    id: "user1",
    name: "John Doe",
    email: "john@example.com",
    username: "johndoe",
    password: "password123",
    avatar: "https://ui-avatars.com/api/?name=John+Doe&background=random",
    joinedDate: "January 2023",
    accountType: "personal" as AccountType,
    online: true,
    friends: ["user2"] as string[],
    friendRequests: [] as string[],
  },
  {
    id: "user2",
    name: "Jane Smith",
    email: "jane@example.com",
    username: "janesmith",
    password: "password123",
    avatar: "https://ui-avatars.com/api/?name=Jane+Smith&background=random",
    joinedDate: "February 2023",
    accountType: "personal" as AccountType,
    online: false,
    friends: ["user1"] as string[],
    friendRequests: ["user3"] as string[],
  },
  {
    id: "user3",
    name: "Game Store",
    email: "store@example.com",
    username: "gamestore",
    password: "password123",
    avatar: "https://ui-avatars.com/api/?name=Game+Store&background=random",
    joinedDate: "March 2023",
    accountType: "business" as AccountType,
    businessInfo: {
      businessName: "Board Game Cafe",
      businessType: "Cafe",
      location: {
        address: "123 Game Street",
        city: "Boardville",
        state: "CA",
        zip: "90210",
      },
    },
    online: true,
    friends: [] as string[],
    friendRequests: [] as string[],
  },
  {
    id: "user4",
    name: "Alice Johnson",
    email: "alice@example.com",
    username: "alicej",
    password: "password123",
    avatar: "https://ui-avatars.com/api/?name=Alice+Johnson&background=random",
    joinedDate: "April 2023",
    accountType: "personal" as AccountType,
    online: true,
    friends: [] as string[],
    friendRequests: [] as string[],
  },
  {
    id: "user5",
    name: "Bob Williams",
    email: "bob@example.com",
    username: "bobw",
    password: "password123",
    avatar: "https://ui-avatars.com/api/?name=Bob+Williams&background=random",
    joinedDate: "May 2023",
    accountType: "personal" as AccountType,
    online: false,
    friends: [] as string[],
    friendRequests: [] as string[],
  },
]

// Define the Game type
export interface Game {
  id: string
  title: string
  description: string
  category: string
  date: string
  location: string
  image?: string
  difficulty: string
  duration: number
  spotsAvailable: number
  spotsTotal: number
  host: {
    name: string
    avatar?: string
    since?: string
    accountType?: string
  }
}

// Mock data for games
export const mockGames: Game[] = [
  {
    id: "game1",
    title: "Catan Tournament",
    description: "Join us for a fun evening of Catan! All skill levels welcome.",
    category: "Strategy",
    date: "2023-12-15T18:00:00",
    location: "Board Game Cafe, 123 Game Street, Boardville",
    image: "https://picsum.photos/id/1/400/200",
    difficulty: "Intermediate",
    duration: 120,
    spotsAvailable: 3,
    spotsTotal: 8,
    host: {
      name: "Game Store",
      avatar: "https://ui-avatars.com/api/?name=Game+Store&background=random",
      since: "March 2023",
      accountType: "business" as AccountType,
    },
  },
  {
    id: "game2",
    title: "Pandemic Co-op Night",
    description: "Can you save humanity? Team up with other players to stop the spread of diseases.",
    category: "Co-op",
    date: "2023-12-20T19:00:00",
    location: "Community Center, 456 Main St, Boardville",
    image: "https://picsum.photos/id/2/400/200",
    difficulty: "Beginner",
    duration: 90,
    spotsAvailable: 0,
    spotsTotal: 4,
    host: {
      name: "John Doe",
      avatar: "https://ui-avatars.com/api/?name=John+Doe&background=random",
      since: "January 2023",
      accountType: "personal" as AccountType,
    },
  },
  {
    id: "game3",
    title: "Ticket to Ride Marathon",
    description: "All aboard! Join us for an evening of railway adventures across North America and Europe.",
    category: "Family",
    date: "2023-12-25T14:00:00",
    location: "Board Game Cafe, 123 Game Street, Boardville",
    image: "https://picsum.photos/id/3/400/200",
    difficulty: "Beginner",
    duration: 150,
    spotsAvailable: 5,
    spotsTotal: 10,
    host: {
      name: "Game Store",
      avatar: "https://ui-avatars.com/api/?name=Game+Store&background=random",
      since: "March 2023",
      accountType: "business" as AccountType,
    },
  },
  {
    id: "game4",
    title: "Chess Championship",
    description: "Test your skills in our monthly chess tournament. Prizes for the top three players!",
    category: "Strategy",
    date: "2023-12-30T10:00:00",
    location: "Library Meeting Room, 789 Book Lane, Boardville",
    image: "https://picsum.photos/id/4/400/200",
    difficulty: "Advanced",
    duration: 240,
    spotsAvailable: 2,
    spotsTotal: 16,
    host: {
      name: "Jane Smith",
      avatar: "https://ui-avatars.com/api/?name=Jane+Smith&background=random",
      since: "February 2023",
      accountType: "personal" as AccountType,
    },
  },
]

// Mock data for chat messages
export const mockMessages = [
  {
    id: "msg1",
    senderId: "user1",
    receiverId: "user2",
    content: "Hey, are you going to the Catan tournament?",
    timestamp: new Date("2023-12-01T14:30:00").getTime(),
    read: true,
  },
  {
    id: "msg2",
    senderId: "user2",
    receiverId: "user1",
    content: "Yes, I already signed up! Are you coming too?",
    timestamp: new Date("2023-12-01T14:35:00").getTime(),
    read: true,
  },
  {
    id: "msg3",
    senderId: "user1",
    receiverId: "user2",
    content: "Definitely! Looking forward to it.",
    timestamp: new Date("2023-12-01T14:40:00").getTime(),
    read: false,
  },
]

// Define Achievement type
export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  progress?: {
    current: number
    total: number
  }
  dateUnlocked?: string
  category: "social" | "events" | "games" | "hosting"
  points: number
}

// Mock data for achievements
export const mockAchievements: Achievement[] = [
  {
    id: "ach1",
    title: "First Steps",
    description: "Attend your first board game event",
    icon: "footsteps-outline",
    unlocked: true,
    dateUnlocked: "March 15, 2023",
    category: "events",
    points: 10,
  },
  {
    id: "ach2",
    title: "Social Butterfly",
    description: "Add 5 friends to your network",
    icon: "people-outline",
    unlocked: false,
    progress: {
      current: 2,
      total: 5,
    },
    category: "social",
    points: 20,
  },
  {
    id: "ach3",
    title: "Game Master",
    description: "Play 10 different board games",
    icon: "trophy-outline",
    unlocked: false,
    progress: {
      current: 3,
      total: 10,
    },
    category: "games",
    points: 30,
  },
  {
    id: "ach4",
    title: "Host Extraordinaire",
    description: "Host your first board game event",
    icon: "star-outline",
    unlocked: true,
    dateUnlocked: "April 2, 2023",
    category: "hosting",
    points: 25,
  },
  {
    id: "ach5",
    title: "Strategy Guru",
    description: "Win 3 strategy games",
    icon: "bulb-outline",
    unlocked: false,
    progress: {
      current: 1,
      total: 3,
    },
    category: "games",
    points: 15,
  },
  {
    id: "ach6",
    title: "Community Pillar",
    description: "Attend 10 board game events",
    icon: "calendar-outline",
    unlocked: false,
    progress: {
      current: 4,
      total: 10,
    },
    category: "events",
    points: 25,
  },
  {
    id: "ach7",
    title: "Friendly Face",
    description: "Send your first message to another user",
    icon: "chatbubbles-outline",
    unlocked: true,
    dateUnlocked: "March 20, 2023",
    category: "social",
    points: 5,
  },
  {
    id: "ach8",
    title: "Dice Roller",
    description: "Play 5 dice-based games",
    icon: "dice-outline",
    unlocked: false,
    progress: {
      current: 2,
      total: 5,
    },
    category: "games",
    points: 15,
  },
  {
    id: "ach9",
    title: "Event Horizon",
    description: "Host 5 board game events",
    icon: "ribbon-outline",
    unlocked: false,
    progress: {
      current: 1,
      total: 5,
    },
    category: "hosting",
    points: 30,
  },
]

// Helper function to determine if a user can host events
export const canHostEvents = (user: any) => {
  // Allow all users to host events
  return true
}

// Helper function to get user by ID
export const getUserById = (userId: string) => {
  return mockUsers.find((user) => user.id === userId)
}

// Helper function to get conversation between two users
export const getConversation = (userId1: string, userId2: string) => {
  return mockMessages
    .filter(
      (msg) =>
        (msg.senderId === userId1 && msg.receiverId === userId2) ||
        (msg.senderId === userId2 && msg.receiverId === userId1),
    )
    .sort((a, b) => a.timestamp - b.timestamp)
}

// Helper function to get user achievements
export const getUserAchievements = (userId: string) => {
  // In a real app, achievements would be associated with specific users
  // For this demo, we'll just return all achievements
  return mockAchievements
}

// Helper function to calculate total achievement points
export const calculateAchievementPoints = (achievements: Achievement[]) => {
  return achievements
    .filter((achievement) => achievement.unlocked)
    .reduce((total, achievement) => total + achievement.points, 0)
}


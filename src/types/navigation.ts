// Define simplified navigation types without external dependencies

// Define the param list for stack navigation
export type RootStackParamList = {
  Login: undefined
  Signup: undefined
  Main: undefined
  GameDetails: { gameId: string }
  HostGame: undefined
}

// Define the param list for tab navigation
export type MainTabParamList = {
  Home: undefined
  Games: { filter?: string }
  Profile: undefined
}

// Define a simplified navigation prop type
export type StackNavigationProps = {
  navigate: (screen: keyof RootStackParamList, params?: any) => void
  goBack: () => void
  reset: (config: { index: number; routes: Array<{ name: keyof RootStackParamList; params?: any }> }) => void
}

// Define a simplified tab navigation prop type
export type TabNavigationProps = {
  navigate: (screen: keyof MainTabParamList, params?: any) => void
}

// Define a simplified route prop type
export type GameDetailsRouteProp = {
  params: {
    gameId: string
  }
}


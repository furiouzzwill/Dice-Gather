import { Ionicons } from "@expo/vector-icons"

type IconProps = {
  name: string
  size: number
  color: string
  style?: any
}

const Icon = ({ name, size, color, style }: IconProps) => {
  return <Ionicons name={name as any} size={size} color={color} style={style} />
}

export default Icon


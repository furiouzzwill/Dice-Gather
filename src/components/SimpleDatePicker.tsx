import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../contexts/ThemeContext"

interface DateTimePickerProps {
  value: Date
  mode: "date" | "time"
  display?: string
  onChange: (event: any, date?: Date) => void
  minimumDate?: Date
  visible: boolean
  onClose: () => void
}

const SimpleDateTimePicker = ({ value, mode, onChange, minimumDate, visible, onClose }: DateTimePickerProps) => {
  const { colors } = useTheme()

  // For a simplified version, we'll just show the current value and provide buttons to increment/decrement

  const incrementValue = () => {
    const newDate = new Date(value)
    if (mode === "date") {
      newDate.setDate(newDate.getDate() + 1)
    } else {
      newDate.setHours(newDate.getHours() + 1)
    }

    // Check if new date is after minimum date
    if (minimumDate && newDate < minimumDate) {
      return
    }

    onChange({ type: "set" }, newDate)
  }

  const decrementValue = () => {
    const newDate = new Date(value)
    if (mode === "date") {
      newDate.setDate(newDate.getDate() - 1)
    } else {
      newDate.setHours(newDate.getHours() - 1)
    }

    // Check if new date is after minimum date
    if (minimumDate && newDate < minimumDate) {
      return
    }

    onChange({ type: "set" }, newDate)
  }

  const formatValue = () => {
    if (mode === "date") {
      return value.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    } else {
      return value.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    }
  }

  if (!visible) return null

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {mode === "date" ? "Select Date" : "Select Time"}
          </Text>

          <View style={styles.pickerContainer}>
            <TouchableOpacity onPress={decrementValue} style={styles.arrowButton}>
              <Ionicons name="chevron-down" size={24} color={colors.primary} />
            </TouchableOpacity>

            <Text style={[styles.valueText, { color: colors.text }]}>{formatValue()}</Text>

            <TouchableOpacity onPress={incrementValue} style={styles.arrowButton}>
              <Ionicons name="chevron-up" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.muted }]} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={() => {
                onChange({ type: "set" }, value)
                onClose()
              }}
            >
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
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
})

export default SimpleDateTimePicker


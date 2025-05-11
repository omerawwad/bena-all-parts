import React, { useRef, useEffect } from "react"
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  StyleSheet,
  Dimensions,
} from "react-native"
import { BlurView } from "expo-blur"
import { LinearGradient } from "expo-linear-gradient"

const { width } = Dimensions.get("window")

interface ModernAIPromptModalProps {
  visible: boolean
  onClose: () => void
  onGenerate: () => void
  aiPrompt: string
  setAIPrompt: (text: string) => void
  aiLoading: boolean
  aiError: string | null
}

export default function AIPromptModal({
  visible,
  onClose,
  onGenerate,
  aiPrompt,
  setAIPrompt,
  aiLoading,
  aiError,
}: ModernAIPromptModalProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(100)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible, fadeAnim, slideAnim])

  return (
    <Modal visible={visible} animationType="none" transparent={true} onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <BlurView style={styles.blurView} blurType="dark" blurAmount={10}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient colors={["#2a2a2a", "#1a1a1a"]} style={styles.gradientBackground}>
              <Text style={styles.title}>Describe Your Dream Trip</Text>

              <TextInput
                style={styles.input}
                placeholder="Example: I want to visit historical places in Cairo"
                placeholderTextColor="#a1a1aa"
                value={aiPrompt}
                onChangeText={setAIPrompt}
                multiline
                numberOfLines={3}
              />

              {aiError && <Text style={styles.errorText}>{aiError}</Text>}

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={aiLoading}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.generateButton} onPress={onGenerate} disabled={aiLoading}>
                  <View style={styles.generateButtonContent}>
                    {aiLoading && <ActivityIndicator color="black" style={styles.loader} />}
                    <Text style={styles.generateButtonText}>{aiLoading ? "Generating..." : "Generate"}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        </BlurView>
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  blurView: {
    width: width - 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  modalContent: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
  },
  gradientBackground: {
    padding: 24,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  errorText: {
    color: "#ff6b6b",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginRight: 12,
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "600",
  },
  generateButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#ffd700",
  },
  generateButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  generateButtonText: {
    color: "black",
    fontWeight: "600",
  },
  loader: {
    marginRight: 8,
  },
})


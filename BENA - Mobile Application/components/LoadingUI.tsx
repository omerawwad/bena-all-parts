import type React from "react"
import { useEffect } from "react"
import { View } from "react-native"
import { Text } from "@/components/ui/text"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
  FadeOut,
} from "react-native-reanimated"
import { BlurView } from "expo-blur"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"

const ICON_SIZE = 48
const ANIMATION_DURATION = 2000

const LoadingUI: React.FC = () => {
  const scale = useSharedValue(1)
  const progress = useSharedValue(0)

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: ANIMATION_DURATION / 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: ANIMATION_DURATION / 2, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    )

    progress.value = withRepeat(
      withTiming(1, { duration: ANIMATION_DURATION * 1.5, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    )
  }, [progress]) // Added progress to the dependency array

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }))

  return (
    <Animated.View
      entering={FadeIn.duration(500)}
      exiting={FadeOut.duration(500)}
      className="flex-1 items-center justify-center bg-zinc-900"
    >
      <BlurView intensity={20} className="p-8 rounded-3xl" style={{ width: "80%", maxWidth: 300 }}>
        <Animated.View style={iconStyle} className="items-center justify-center mb-6">
          <Ionicons name="airplane" size={ICON_SIZE} color="#fcbf49" />
        </Animated.View>
        <Animated.View entering={FadeIn.delay(500).duration(500)} className="items-center">
          <Text className="text-white text-xl font-bold text-center mb-2">Preparing Your Journey</Text>
          <Text className="text-gray-400 text-sm text-center mb-4">Fasten your seatbelts!</Text>

          <View className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
            <Animated.View style={progressStyle}>
              <LinearGradient
                colors={["#fcbf49", "#f77f00"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="w-full h-full"
              />
            </Animated.View>
          </View>
        </Animated.View>
      </BlurView>
    </Animated.View>
  )
}

export default LoadingUI

import React from "react"
import { View } from "react-native"
import Animated, { FadeInRight, FadeOutLeft, useAnimatedStyle, withSpring } from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"
import { Text } from "@/components/ui/text"
import { Ionicons } from "@expo/vector-icons"

interface OnboardingSlideProps {
  title: string
  description: string
  gradientColors: string[]
  icon: string
  index: number
}

export function OnboardingSlide({ title, description, gradientColors, icon, index }: OnboardingSlideProps) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(1, { damping: 5, stiffness: 40 }) }],
    }
  })

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 100)}
      exiting={FadeOutLeft}
      className="flex-1 justify-center items-center px-8"
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="w-64 h-64 rounded-full justify-center items-center mb-8"
      >
        <Animated.View style={animatedStyle}>
          <Ionicons name={icon} size={80} color="white" />
        </Animated.View>
      </LinearGradient>
      <View className="mt-8">
        <Text className="text-3xl text-white font-bold text-center mb-4">{title}</Text>
        <Text className="text-lg text-gray-300 text-center">{description}</Text>
      </View>
    </Animated.View>
  )
}


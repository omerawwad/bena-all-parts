import React from "react"
import { View } from "react-native"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"

interface ProgressDotsProps {
  total: number
  active: number
}

export function ProgressDots({ total, active }: ProgressDotsProps) {
  return (
    <View className="flex-row justify-center items-center space-x-2">
      {[...Array(total)].map((_, index) => (
        <Dot key={index} isActive={index === active} />
      ))}
    </View>
  )
}

function Dot({ isActive }: { isActive: boolean }) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(isActive ? 24 : 8, { duration: 300 }),
      opacity: withTiming(isActive ? 1 : 0.5, { duration: 300 }),
    }
  })

  return <Animated.View style={animatedStyle} className="h-2 bg-secondary rounded-full" />
}


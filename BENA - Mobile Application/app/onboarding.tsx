import React, { useState, useRef } from "react"
import { View, Dimensions, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"
import { Text } from "@/components/ui/text"
import { router } from "expo-router"
import Carousel from "react-native-reanimated-carousel"
import { OnboardingSlide } from "@/components/OnboardingSlides"
import { ProgressDots } from "@/components/ProgressDots"
import { slides } from "@/utils/onboardingSlides"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

export default function Onboarding() {
  const [activeIndex, setActiveIndex] = useState(0)
  const carouselRef = useRef(null)

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      carouselRef.current?.scrollTo({ index: activeIndex + 1, animated: true })
    } else {
      router.push("/sign-in")
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-900">
      <StatusBar style="light" />
      <LinearGradient
        colors={["rgba(252, 191, 73, 0.1)", "rgba(252, 191, 73, 0)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute top-0 left-0 right-0 bottom-0"
      />
      <View className="flex-1">
        <Carousel
          ref={carouselRef}
          loop={false}
          width={SCREEN_WIDTH}
          height={SCREEN_WIDTH * 1.6}
          data={slides}
          scrollAnimationDuration={1000}
          onSnapToItem={(index) => setActiveIndex(index)}
          renderItem={({ item, index }) => (
            <OnboardingSlide
              key={index}
              title={item.title}
              description={item.description}
              gradientColors={item.gradientColors}
              icon={item.icon}
              index={index}
            />
          )}
        />
        <View className="absolute bottom-10 left-0 right-0">
          <ProgressDots total={slides.length} active={activeIndex} />
          <Animated.View entering={FadeInRight.delay(500)} exiting={FadeOutLeft} className="mt-6 px-8">
            <TouchableOpacity onPress={handleNext} className="bg-secondary py-4 rounded-full items-center">
              <Text className="text-primary font-bold text-lg">
                {activeIndex === slides.length - 1 ? "Get Started" : "Next"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  )
}

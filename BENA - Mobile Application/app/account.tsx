import React from "react"
import { View, TouchableOpacity, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { useAuth } from "@/context/AuthProvider"
import { useUser } from "@/hooks/useUser"
import { History, UserPen, Settings, LogOut, ChevronRight } from "lucide-react-native"
import { router } from "expo-router"
import LoadingUI from "@/components/LoadingUI"
import { useAuthCheck } from "@/hooks/useAuthCheck"
import { BlurView } from "expo-blur"
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from "react-native-reanimated"
import { StatusBar } from "expo-status-bar"

const { height } = Dimensions.get("window")
const HEADER_HEIGHT = height * 0.3

export default function Account() {
  const user = useAuthCheck()
  const { signOut } = useAuth()
  const { profile, loading, error } = useUser(user?.id || null)
  const scrollY = useSharedValue(0)

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
    },
  })

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const backgroundOpacity = interpolate(scrollY.value, [0, HEADER_HEIGHT / 2], [0, 0.8], Extrapolate.CLAMP)

    return {
      backgroundColor: `rgba(17, 17, 17, ${backgroundOpacity})`,
    }
  })

  const menuItems = [
    {
      id: "1",
      title: "History",
      icon: History,
      onPress: () => {
        router.push("/history")
      },
    },
    {
      id: "2",
      title: "Edit Profile",
      icon: UserPen,
      onPress: () => {
        router.push("/profile")
      },
    },
    {
      id: "3",
      title: "Settings",
      icon: Settings,
      onPress: () => {
        router.push("/settings")
      },
    },
  ]

  if (loading) {
    return <LoadingUI />
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-900">
        <Text className="text-xl text-red-500">Error: {error}</Text>
      </View>
    )
  }

  return (
    <LinearGradient colors={["#111111", "#1a1a1a"]} className="flex-1">
      <StatusBar style="light" />
      <Animated.ScrollView className="flex-1" onScroll={scrollHandler} scrollEventThrottle={16}>
        <View className="pt-36 pb-8 px-6">
          <Animated.View entering={FadeInDown.delay(200).springify()} className="items-center mb-8">
            <Avatar className="w-32 h-32 border-4 border-[#fcbf49]">
              {profile?.avatar_url ? (
                <AvatarImage source={{ uri: profile.avatar_url }} />
              ) : (
                <AvatarFallback>
                  <Text className="text-4xl text-white">{profile?.username?.charAt(0) || "U"}</Text>
                </AvatarFallback>
              )}
            </Avatar>
            <Text className="text-white text-2xl font-bold mt-4">{profile?.username || "User"}</Text>
            <Text className="text-gray-400 text-lg">{profile?.email || "No email provided"}</Text>
          </Animated.View>

          {menuItems.map((item, index) => (
            <Animated.View key={item.id} entering={FadeInRight.delay(index * 100).springify()}>
              <TouchableOpacity
                className="flex-row items-center bg-zinc-800/30 rounded-2xl mb-4 p-4"
                onPress={item.onPress}
              >
                <BlurView intensity={10} className="absolute inset-0 rounded-2xl" />
                <View className="bg-[#fcbf49]/20 rounded-full p-3 mr-4">
                  <item.icon color="#fcbf49" size={24} />
                </View>
                <Text className="text-white text-lg flex-1">{item.title}</Text>
                <ChevronRight color="#fcbf49" size={20} />
              </TouchableOpacity>
            </Animated.View>
          ))}

          <Animated.View entering={FadeInDown.delay(600).springify()} className="mt-8">
            <Button
              variant="destructive"
              onPress={signOut}
              className="bg-red-500/10 py-4 rounded-2xl flex-row items-center justify-center"
            >
              <LogOut color="#ef4444" size={24} className="mr-2" />
              <Text className="font-semibold text-red-400 text-lg">Sign Out</Text>
            </Button>
          </Animated.View>
        </View>
      </Animated.ScrollView>

      <Animated.View
        className="absolute top-0 left-0 right-0 flex-row justify-between items-center z-10 pt-14 px-6"
        style={[{ height: HEADER_HEIGHT }, headerAnimatedStyle]}
      >
        <BlurView intensity={30} className="absolute inset-0" />
        <Text className="text-white text-3xl font-bold">Account</Text>
      </Animated.View>
    </LinearGradient>
  )
}

import React, { useEffect } from 'react';
import { View, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { images } from '../constants';
import CustomButton from '../components/CustomButton';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/context/AuthProvider';
import { Text } from '@/components/ui/text';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
const { width } = Dimensions.get('window');

export default function App() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      setTimeout(() => {
        router.replace("/home");
      }, 0.250)
    }

  }, [user, loading]);

  // Show a loader or splash screen while checking for the session
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-900 items-center justify-center">
        <Animated.Text
          entering={FadeIn.duration(1000)}
          className="text-white text-xl font-bold"
        >
          Loading...
        </Animated.Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-900">
      <StatusBar style="light" />
      <LinearGradient
        colors={['rgba(252, 191, 73, 0.1)', 'rgba(252, 191, 73, 0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute top-0 left-0 right-0 bottom-0"
      />
      <View className="flex-1 justify-center items-center px-8">
        <Animated.View entering={FadeInDown.duration(1000).springify()}>
          <Image
            source={images.logo}
            style={{ width: width * 0.4, height: width * 0.4 }}
            resizeMode="contain"
          />
        </Animated.View>
        <Animated.View
          entering={FadeInDown.duration(1000).springify().delay(300)}
          className="mt-8"
        >
          <Text className="text-3xl text-white font-bold text-center">
            Plan Your Perfect Getaway with{' '}
            <Text className="text-secondary">Bena</Text>
          </Text>
        </Animated.View>
        <Animated.View
          entering={FadeInDown.duration(1000).springify().delay(600)}
          className="mt-6"
        >
          <Text className="text-lg text-gray-300 text-center">
            Where creativity meets innovation: embark on a journey of limitless exploration
          </Text>
        </Animated.View>
        <Animated.View
          entering={FadeInUp.duration(1000).springify().delay(900)}
          className="mt-12 w-full"
        >
          <CustomButton
            title="Get Started"
            handlePress={() => router.push('/onboarding')}
            icon="arrow-forward-outline"
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}



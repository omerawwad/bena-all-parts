import React from 'react';
import { Dimensions, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown } from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = height * 0.4;

export const Hero: React.FC = () => (
  <Animated.View style={{ height: HEADER_HEIGHT }}>
    <FastImage
      source={{ uri: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }}
      style={{ width, height: HEADER_HEIGHT }}
      resizeMode={FastImage.resizeMode.cover}
    />
    <LinearGradient
      colors={["transparent", "rgba(24, 24, 27, 0.8)", "#18181b"]}
      style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: HEADER_HEIGHT }}
    >
      <BlurView intensity={20} style={{ flex: 1, justifyContent: 'flex-end', padding: 20 }}>
        <Animated.Text
          entering={FadeInDown.delay(300).springify()}
          className="text-white text-4xl font-bold"
        >
          Discover Your Next Adventure
        </Animated.Text>
        <Animated.Text
          entering={FadeInDown.delay(400).springify()}
          className="text-gray-300 text-xl mt-2"
        >
          Explore amazing destinations around rich culture of Egypt
        </Animated.Text>
        <Animated.View
          entering={FadeInDown.delay(500).springify()}
          className="flex-row mt-4"
        >
        </Animated.View>
      </BlurView>
    </LinearGradient>
  </Animated.View>
);

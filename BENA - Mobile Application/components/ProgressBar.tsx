import React from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, withSpring, useAnimatedStyle, withDelay } from 'react-native-reanimated';

interface ProgressBarProps {
  progress: number;
  index: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, index }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withDelay(
      index * 300,
      withSpring(`${progress * 100}%`, { damping: 15 })
    ),
  }));

  return (
    <View className="h-1 bg-zinc-800 rounded-full overflow-hidden">
      <Animated.View
        entering={FadeIn.delay(300)}
        style={animatedStyle}
        className="h-full bg-secondary rounded-full"
      />
    </View>
  );
};

export default ProgressBar;


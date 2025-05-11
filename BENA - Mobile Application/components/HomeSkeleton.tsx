import React from 'react';
import { View, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = height * 0.4;

const SkeletonItem = ({ width, height, style }) => {
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.6, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        { width, height, backgroundColor: '#3f3f46', borderRadius: 8 },
        style,
        animatedStyle,
      ]}
    />
  );
};

const HomeSkeleton: React.FC = () => {
  return (
    <View className="flex-1 bg-zinc-900">
      <SkeletonItem width={width} height={HEADER_HEIGHT} style={{ marginBottom: 20 }} />
      <View className="px-4">
        <SkeletonItem width={200} height={24} style={{ marginBottom: 16 }} />
        <SkeletonItem width={width - 32} height={200} style={{ marginBottom: 24 }} />
        <SkeletonItem width={200} height={24} style={{ marginBottom: 16 }} />
        <SkeletonItem width={width - 32} height={200} style={{ marginBottom: 24 }} />
      </View>
    </View>
  );
};

export default HomeSkeleton;

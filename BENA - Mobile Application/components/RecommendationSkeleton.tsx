import React from 'react';
import { View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = 200;

interface SkeletonItemProps {
  width: number;
  height: number;
  style?: object;
}

const SkeletonItem: React.FC<SkeletonItemProps> = ({ width, height, style }) => {
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
        {
          width,
          height,
          backgroundColor: '#3f3f46',
          borderRadius: 8
        },
        style,
        animatedStyle,
      ]}
    />
  );
};

export const RecommendationSkeleton: React.FC = () => {
  return (
    <View className="mb-8">
      {/* Title Skeleton */}
      <View className="mx-4">
        <SkeletonItem
          width={180}
          height={24}
          style={{ marginBottom: 16 }}
        />
      </View>

      {/* Horizontal Scrolling Cards */}
      <View className="flex-row">
        <View
          style={{
            marginLeft: 16,
          }}
        >
          <View className="rounded-lg overflow-hidden">
            {/* Image Skeleton */}
            <SkeletonItem
              width={CARD_WIDTH}
              height={CARD_HEIGHT}
              style={{ marginBottom: 8 }}
            />

            {/* Title Skeleton */}
            <SkeletonItem
              width={CARD_WIDTH * 0.8}
              height={16}
              style={{ marginBottom: 4 }}
            />

            {/* Description Skeleton */}
            <SkeletonItem
              width={CARD_WIDTH * 0.6}
              height={12}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

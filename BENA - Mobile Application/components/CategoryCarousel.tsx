import React, { useRef, useState } from 'react';
import { View, Dimensions, Animated, PanResponder } from 'react-native';
import { Text } from '@/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import FastImage from 'react-native-fast-image';
import { PlaceSubset } from '@/hooks/useCategoricalPlaces';

const { width } = Dimensions.get('window');

interface CategoryCarouselProps {
  places: PlaceSubset[] | null;
  onPlacePress: (placeId: string) => void;
  cardWidthRatio?: number;
}

export const CategoryCarousel: React.FC<CategoryCarouselProps> = ({ places, onPlacePress, cardWidthRatio=0.85 }) => {
  const CARD_WIDTH = width * cardWidthRatio;
  const [currentIndex, setCurrentIndex] = useState(0);
  const position = useRef(new Animated.Value(0)).current;
  const MAX_VISIBLE_DOTS = 5;

  // Track touch start time and position for distinguishing between taps and swipes
  const touchStartTime = useRef(0);
  const touchStartPosition = useRef({ x: 0, y: 0 });

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      // Record touch start time and position
      touchStartTime.current = Date.now();
      touchStartPosition.current = {
        x: evt.nativeEvent.locationX,
        y: evt.nativeEvent.locationY,
      };
    },
    onMoveShouldSetPanResponder: (_, { dx, dy }) => {
      // Only handle horizontal swipes
      return Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10;
    },
    onPanResponderMove: (_, { dx }) => {
      position.setValue(dx);
    },
    onPanResponderRelease: (evt, gestureState) => {
      const { dx, dy } = gestureState;
      const touchDuration = Date.now() - touchStartTime.current;
      const touchDistance = Math.sqrt(dx * dx + dy * dy);

      // If it's a tap (short duration, minimal movement)
      if (touchDuration < 200 && touchDistance < 10) {
        onPlacePress(places![currentIndex].places_id);
        return;
      }

      // Handle swipe
      const minSwipeDistance = 50;
      if (Math.abs(dx) > minSwipeDistance) {
        if (dx < 0 && currentIndex < places!.length - 1) {
          setCurrentIndex(current => current + 1);
        } else if (dx > 0 && currentIndex > 0) {
          setCurrentIndex(current => current - 1);
        }
      }

      Animated.spring(position, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    },
    onPanResponderTerminate: () => {
      Animated.spring(position, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    },
  });

  const currentPlace = places![currentIndex];

  const generateVisibleDots = () => {
    if (places!.length <= MAX_VISIBLE_DOTS) {
      return places!.map((_, index) => index);
    }

    let start = currentIndex - Math.floor(MAX_VISIBLE_DOTS / 2);
    let end = currentIndex + Math.floor(MAX_VISIBLE_DOTS / 2);

    if (start < 0) {
      start = 0;
      end = MAX_VISIBLE_DOTS - 1;
    } else if (end >= places!.length) {
      end = places!.length - 1;
      start = places!.length - MAX_VISIBLE_DOTS;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visibleDots = generateVisibleDots();

  return (
    <View className="px-4">
      <Animated.View
        style={{
          transform: [{ translateX: position }],
        }}
        {...panResponder.panHandlers}
      >
        <View
          style={{ width: CARD_WIDTH, height: CARD_WIDTH * 1.2 }}
          className="rounded-3xl overflow-hidden"
        >
          <FastImage
            source={{
              uri: currentPlace.image ? currentPlace.image : 'https://placehold.co/600x400',
              priority: FastImage.priority.normal,
            }}
            style={{ width: '100%', height: '100%' }}
            resizeMode={FastImage.resizeMode.cover}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            className="absolute bottom-0 left-0 right-0 p-4"
          >
            <Text className="text-white text-xl font-bold">{currentPlace.name}</Text>
            <Text className="text-gray-300 mt-2" numberOfLines={2}>
              {currentPlace.description}
            </Text>
          </LinearGradient>
        </View>
      </Animated.View>

      <View className="flex-row justify-center gap-7 mt-4 space-x-1 items-center">
        {visibleDots.map((dotIndex) => (
          <View
            key={dotIndex}
            className={`h-2 rounded-full ${dotIndex === currentIndex ? 'w-4 bg-white' : 'w-2 bg-white/50'
              }`}
          />
        ))}
      </View>
    </View>
  );
};

export default CategoryCarousel;

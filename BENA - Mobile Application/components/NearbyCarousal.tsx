import { useRouter } from 'expo-router';
import CategoryCarousel from './CategoryCarousel';
import { Animated, Text, View } from 'react-native';
import { FadeInRight } from 'react-native-reanimated';
import { useSearchPlace } from '@/hooks/useSearchPlace';
import React, { useEffect, useState } from 'react';

interface NearbyCarousalProps {
  mainPlaceId: string;
}

export default function NearbyCarousal({ mainPlaceId }: NearbyCarousalProps) {
  const router = useRouter();
  const { getNearbyPlaces } = useSearchPlace();
  const [nearbyPlaces, setNearbyPlaces] = useState<[]>([]);
  const SEARCH_RADIUS = 2;

  useEffect(() => {
    const fetchNearbyPlaces = async () => {
      const nearbyPlaces = await getNearbyPlaces(mainPlaceId);
      setNearbyPlaces(nearbyPlaces.near_places);
    };

    fetchNearbyPlaces();
  }, [mainPlaceId]);


  const handlePlacePress = (placeId: string) => {
    router.push(`/home/${placeId}`);
  };

  if (!nearbyPlaces?.length) {
    return null; // Or render a "No recommendations" message
  }

  return (
    <Animated.View
      entering={FadeInRight.delay(200).springify()}
      className="  overflow-hidden flex-row flex-wrap justify-center p-1"

    >
      <CategoryCarousel
        cardWidthRatio={0.7}
        places={nearbyPlaces}
        onPlacePress={handlePlacePress}
      />
    </Animated.View>
  );
}

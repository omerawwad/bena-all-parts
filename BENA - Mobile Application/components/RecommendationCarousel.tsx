import { useRouter } from 'expo-router';
import CategoryCarousel from './CategoryCarousel';
import { useRecommendations } from '@/hooks/useRecommendations';
import { Animated, Text, View } from 'react-native';
import { RecommendationSkeleton } from './RecommendationSkeleton';
import { FadeInRight } from 'react-native-reanimated';

export default function RecommendationCarousel() {
  const router = useRouter();
  const { recommendations, loading, error } = useRecommendations();
  // console.log(recommendations);

  const handlePlacePress = (placeId: string) => {
    router.push(`/home/${placeId}`);
  };

  if (loading) {
    return <View className="p-4"></View> //<RecommendationSkeleton />;
  }

  if (error) {
    return (
      <View className="p-4">
        {/* <Text className="text-red-500">
          {error || 'Failed to load recommendations'}
        </Text> */}
      </View>
    );
  }

  if (!recommendations?.length) {
    return null; // Or render a "No recommendations" message
  }

  return (
    <Animated.View
      entering={FadeInRight.delay(200).springify()}
      className="mx-4 mb-8 mt-8"
    >
      <Text className="text-white text-2xl font-bold mb-4">
        Recommended for You
      </Text>
      <CategoryCarousel
        places={recommendations}
        onPlacePress={handlePlacePress}
      />
    </Animated.View>
  );
}

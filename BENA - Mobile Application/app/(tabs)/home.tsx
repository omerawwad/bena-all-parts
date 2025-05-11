import React, { useCallback, useState } from 'react';
import { View, RefreshControl, Dimensions, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import { useCategoricalPlaces } from '@/hooks/useCategoricalPlaces';
import { useRouter } from 'expo-router';
import { CategoryCarousel } from '@/components/CategoryCarousel';
import { FlashList } from '@shopify/flash-list';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeInRight,
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import CustomSuspense from '@/components/CustomSuspense';
import HomeSkeleton from '@/components/HomeSkeleton';
import RecommendationCarousel from '@/components/RecommendationCarousel';
import { PlaceSubset } from '@/hooks/useCategoricalPlaces';
import { Hero } from '@/components/Hero';
import { StatusBar } from 'expo-status-bar';

const { height } = Dimensions.get('window');
const HEADER_HEIGHT = height * 0.4;

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

const HomeContent: React.FC = () => {
  const { categorizedPlaces, error, refetch } = useCategoricalPlaces();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const router = useRouter();
  const scrollY = useSharedValue(0);


  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handlePlacePress = (placeId: string) => {
    router.push(`/home/${placeId}`);
  };

  const handleSearchPress = () => {
    router.push('../search'); // Navigate to the new search screen
  };


  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const backgroundOpacity = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT / 2],
      [0, 1], // Adjusts the alpha from 0 to 1
      Extrapolate.CLAMP
    );

    return {
      backgroundColor: `rgba(17, 17, 17, ${backgroundOpacity})`,
    };
  });


  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-4 bg-zinc-900">
        <Text className="text-red-500 text-center">{error}</Text>
      </View>
    );
  }

  const renderListHeader = () => (
    <>
      <Hero />
      <RecommendationCarousel />
    </>
  );

  return (

    <View className="flex-1 bg-zinc-900">
      <StatusBar style="light" />
      <AnimatedFlashList
        data={categorizedPlaces}
        keyExtractor={(item: unknown, index: number) => {
          if (Array.isArray(item) && item.length > 0) {
            const [category] = item as [string, PlaceSubset[]];
            return category;
          }
          return `item-${index}`;
        }}
        renderItem={(info: { item: unknown; index: number }) => {
          if (!Array.isArray(info.item) || info.item.length !== 2) {
            return null; // or return a fallback component
          }
          const [category, categoryPlaces] = info.item as [string, PlaceSubset[]]; // Type assertion
          return (
            <Animated.View
              entering={FadeInRight.delay(info.index * 100).springify()}
              className="mx-4 mb-8"
            >
              <Text className="text-white text-2xl font-bold mb-4">
                {category
                  .split('_')
                  .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)) // Explicitly type `word`
                  .join(' ')}
              </Text>
              <CategoryCarousel
                places={categoryPlaces}
                onPlacePress={handlePlacePress}
              />
            </Animated.View>
          );
        }}
        estimatedItemSize={200}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={renderListHeader}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      />

      <Animated.View
        className="absolute top-0 left-0 right-0 flex-row justify-between items-center bg-zinc-900 z-10 pt-14"
        style={headerAnimatedStyle}
      >


        <View className="flex-row items-center px-4">
          <Image
            source={require('../../assets/images/logo-wide.png')} // Corrected logo path
            style={{ width: 70, height: 35 }}
            resizeMode="contain"
          />
        </View>
        <View className="flex-row tems-center">
          <BlurView intensity={0} className="rounded-full p-4" onTouchEnd={handleSearchPress} >
            <Ionicons name="search" size={24} color="white" />
          </BlurView>
          <BlurView
            intensity={0}
            className="rounded-full p-4"
            onTouchEnd={() => router.push('/account')}
            style={{ alignSelf: 'flex-end' }}
          >
            <Ionicons name="person-circle-outline" size={24} color="#fcbf49" />
          </BlurView>
        </View>

      </Animated.View>
    </View>
  );
};

const Home: React.FC = () => {
  return (
    <CustomSuspense fallback={<HomeSkeleton />}>
      <HomeContent />
    </CustomSuspense>
  );
};

export default Home;

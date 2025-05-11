import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import FastImage from 'react-native-fast-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Text } from '@/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { usePlaces } from '@/hooks/usePlaces';
import { useUserBookmarks } from '@/hooks/useUserBookmarks';
import { useRecommendations } from '@/hooks/useRecommendations';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';

interface Place {
  places_id: string;
  name: string;
  description: string;
  address: string;
  category: string;
  image: string;
  city: string;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const TabView: React.FC<{
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <View className="flex-row mb-4">
      {tabs.map((tab, index) => {
        const isActive = tab === activeTab;
        return (
          <AnimatedTouchableOpacity
            key={index}
            onPress={() => onTabChange(tab)}
            className={`flex-1 py-2 ${index === 0 ? 'rounded-l-full' : ''} ${index === tabs.length - 1 ? 'rounded-r-full' : ''
              }`}
            style={{
              backgroundColor: isActive ? 'rgba(50, 48, 70, 0.9)' : 'transparent',
            }}
          >
            <Animated.Text
              className={`text-center ${isActive ? 'text-secondary' : 'text-white'} font-semibold`}
            >
              {tab}
            </Animated.Text>
          </AnimatedTouchableOpacity>
        );
      })}
    </View>
  );
};

const PlaceCard: React.FC<{ place: Place; onSelect: (place: Place) => void; isSelected: boolean }> = ({ place, onSelect, isSelected }) => {
  const animatedScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: animatedScale.value }],
    };
  });

  const handlePress = useCallback(() => {
    animatedScale.value = withTiming(0.95, { duration: 100 }, () => {
      animatedScale.value = withTiming(1, { duration: 100 });
    });
    onSelect(place);
  }, [onSelect, place]);

  return (
    <AnimatedTouchableOpacity
      onPress={handlePress}
      className="mb-4 rounded-xl overflow-hidden"
      style={animatedStyle}
    >
      <BlurView intensity={20} className="absolute inset-0" />
      <LinearGradient
        colors={['rgba(26, 12, 35, 0.9)', 'rgba(5, 8, 2, 0.9)']}
        className="p-4"
      >
        <FastImage source={{ uri: place.image, priority: 'high' }}
          style={{ width: '100%', height: 160, marginBottom: 12, borderRadius: 8 }}
          resizeMode='cover'
        />
        <Text className="text-white text-lg font-bold mb-1">{place.name}</Text>
        <Text className="text-gray-300 text-sm mb-2">{place.category} • {place.city}</Text>
        <Text className="text-gray-400 text-xs mb-2" numberOfLines={2}>{place.description}</Text>
        <Text className="text-gray-400 text-xs">{place.address}</Text>
        <View className="absolute top-2 right-2 bg-black/50 rounded-full p-2">
          <Ionicons
            name={isSelected ? "checkmark-circle" : "add-circle-outline"}
            size={20}
            color={isSelected ? "#fcbf49" : "white"}
          />
        </View>
      </LinearGradient>
    </AnimatedTouchableOpacity>
  );
};

const ChoosePlacesScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedPlaces, setSelectedPlaces] = useState<Place[]>([]);

  const { places: allPlaces, loading: loadingAll } = usePlaces();
  const { bookmarkedPlaces, loading: loadingBookmarks } = useUserBookmarks();
  const { recommendations, loading: loadingRecommendations } = useRecommendations();

  const handleConfirmSelection = () => {
    // Convert selected places to a JSON string and pass it back to the CreateTrip screen
    const selectedPlacesJson = JSON.stringify(selectedPlaces);
    router.back();
    router.setParams({ selectedPlaces: selectedPlacesJson })
  };


  const handleSelectPlace = useCallback((place: Place) => {
    setSelectedPlaces(prev =>
      prev.some(p => p.places_id === place.places_id)
        ? prev.filter(p => p.places_id !== place.places_id)
        : [...prev, place]
    );
  }, []);

  const renderPlaces = useCallback((places: Place[]) => (
    <FlashList
      data={places.filter(place => place?.places_id)}
      keyExtractor={(item) => item?.places_id?.toString() || ''}
      renderItem={({ item }) => (
        <PlaceCard
          key={item.places_id}
          place={item}
          onSelect={handleSelectPlace}
          isSelected={selectedPlaces.some(p => p.places_id === item.places_id)}
        />
      )}
      showsVerticalScrollIndicator={false}
      estimatedItemSize={312}
    />
  ), [handleSelectPlace, selectedPlaces]);

  const getPlacesForActiveTab = useCallback(() => {
    switch (activeTab) {
      case 'All':
        return allPlaces;
      case 'Bookmarks':
        return bookmarkedPlaces;
      case 'Suggestions':
        return recommendations;
      default:
        return [];
    }
  }, [activeTab, allPlaces, bookmarkedPlaces, recommendations]);

  return (
    <SafeAreaView className="flex-1 bg-zinc-900">
      <StatusBar style="light" />
      <LinearGradient
        colors={['#121312', '#252431']}
        className="flex-1 p-4"
      >
        <Animated.Text
          entering={FadeInDown.duration(800).springify()}
          className="text-3xl font-bold text-white mb-6"
        >
          Choose Places
        </Animated.Text>

        <TabView
          tabs={['Suggestions', 'Bookmarks', 'All']}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <View className="flex-1">
          {(loadingAll || loadingBookmarks || loadingRecommendations) ? (
            <Text className="text-white">Loading...</Text>
          ) : (
            renderPlaces(getPlacesForActiveTab())
          )}
        </View>

        {selectedPlaces.length > 0 && (
          <Animated.View
            entering={FadeInUp.duration(500)}
            className="mt-4 bg-slate-950"
          >
            <BlurView intensity={20} className="rounded-xl p-4 ">
              <Text className="text-white font-bold mb-2">Selected Places:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {selectedPlaces.map(place => (
                  <TouchableOpacity
                    key={place.places_id}
                    onPress={() => handleSelectPlace(place)}
                    className="bg-zinc-900 rounded-full px-3 py-1 mr-2 flex-row items-center"
                  >
                    <Text className="text-white mr-1">{place.name}</Text>
                    <Ionicons name="close-circle" size={16} color="white" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </BlurView>
          </Animated.View>
        )}

        <TouchableOpacity
          className="mt-4 bg-secondary py-3 rounded-full"
          onPress={handleConfirmSelection}
        >
          <Text className="text-center text-zinc-900 font-bold">
            Confirm Selection ({selectedPlaces.length} places)
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default ChoosePlacesScreen;

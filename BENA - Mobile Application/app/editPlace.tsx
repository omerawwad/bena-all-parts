import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Text } from '@/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { usePlaces } from '@/hooks/usePlaces';
import { Place } from '@/db/schema';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const PlaceCard: React.FC<{ place: Place; onSelect: (place: Place) => void; isSelected: boolean }> = ({ place, onSelect, isSelected }) => {
  const animatedScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: animatedScale.value }],
    };
  });

  const handlePress = () => {
    animatedScale.value = withTiming(0.95, { duration: 100 }, () => {
      animatedScale.value = withTiming(1, { duration: 100 });
    });
    onSelect(place);
  };

  return (
    <AnimatedTouchableOpacity
      onPress={handlePress}
      className="mb-4 rounded-xl overflow-hidden"
      style={animatedStyle}
    >
      <BlurView intensity={20} className="absolute inset-0" />
      <LinearGradient
        colors={['rgba(76, 102, 159, 0.5)', 'rgba(59, 89, 152, 0.5)']}
        className="p-4"
      >
        <Image source={{ uri: place.image }} className="w-full h-40 rounded-lg mb-3" />
        <Text className="text-white text-lg font-bold mb-1">{place.name}</Text>
        <Text className="text-gray-300 text-sm mb-2">{place.category} • {place.city}</Text>
        <Text className="text-gray-400 text-xs mb-2" numberOfLines={2}>{place.description}</Text>
        <Text className="text-gray-400 text-xs">{place.address}</Text>
        <View className="absolute top-2 right-2 bg-black/50 rounded-full p-2">
          <Ionicons
            name={isSelected ? "checkmark-circle" : "add-circle-outline"}
            size={24}
            color={isSelected ? "#fcbf49" : "white"}
          />
        </View>
      </LinearGradient>
    </AnimatedTouchableOpacity>
  );
};

const EditPlace: React.FC = () => {
  const { tripId, stepId } = useLocalSearchParams();
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const { places, loading, error } = usePlaces();

  useEffect(() => {
    const fetchStepDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('tripstep')
          .select('*, place:places(*)')
          .eq('trip_id', tripId)
          .eq('step_id', stepId)
          .single();

        if (error) throw error;

        setSelectedPlace(data.place);
        setStartTime(new Date(data.start_time));
        setEndTime(new Date(data.end_time));
      } catch (error) {
        console.error('Error fetching step details:', error);
      }
    };

    fetchStepDetails();
  }, [tripId, stepId]);

  const handlePlaceSelect = (place: Place) => {
    setSelectedPlace(place);
  };

  const handleSave = async () => {
    try {
      const { data, error } = await supabase
        .from('tripstep')
        .update({
          place_id: selectedPlace?.places_id,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
        })
        .eq('trip_id', tripId)
        .eq('step_id', stepId);

      if (error) throw error;

      router.back();
    } catch (error) {
      console.error('Error updating trip step:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-900 justify-center items-center">
        <StatusBar style="light" />
        <Text className="text-white">Loading places...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-900 justify-center items-center">
        <StatusBar style="light" />
        <Text className="text-red-500">Error: {error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-900">
      <StatusBar style="light" />
      <View className="flex-1 px-4 pt-6">
        <Animated.Text
          entering={FadeInDown.duration(500).springify()}
          className="text-3xl font-bold text-white mb-6"
        >
          Edit Place
        </Animated.Text>

        <FlatList
          data={places}
          keyExtractor={(item) => item.places_id}
          renderItem={({ item }) => (
            <PlaceCard
              place={item}
              onSelect={handlePlaceSelect}
              isSelected={selectedPlace?.places_id === item.places_id}
            />
          )}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View className="mb-4">
              <Text className="text-white text-lg mb-2">Start Time</Text>
              <TouchableOpacity
                className="bg-zinc-800 px-4 py-3 rounded-lg mb-4 flex-row justify-between items-center"
                onPress={() => setShowStartTimePicker(true)}
              >
                <Text className="text-white">{startTime.toLocaleTimeString()}</Text>
                <Ionicons name="time-outline" size={24} color="white" />
              </TouchableOpacity>

              <Text className="text-white text-lg mb-2">End Time</Text>
              <TouchableOpacity
                className="bg-zinc-800 px-4 py-3 rounded-lg mb-4 flex-row justify-between items-center"
                onPress={() => setShowEndTimePicker(true)}
              >
                <Text className="text-white">{endTime.toLocaleTimeString()}</Text>
                <Ionicons name="time-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          }
        />

        <TouchableOpacity
          className="bg-secondary py-3 px-4 rounded-full mt-4"
          onPress={handleSave}
        >
          <Text className="text-center text-zinc-900 font-bold">Save Changes</Text>
        </TouchableOpacity>
      </View>

      {showStartTimePicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartTimePicker(false);
            if (selectedDate) setStartTime(selectedDate);
          }}
        />
      )}

      {showEndTimePicker && (
        <DateTimePicker
          value={endTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(event, selectedDate) => {
            setShowEndTimePicker(false);
            if (selectedDate) setEndTime(selectedDate);
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default EditPlace;

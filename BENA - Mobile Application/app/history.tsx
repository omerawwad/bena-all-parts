import React from 'react';
import { View, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Text } from '@/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { format } from 'date-fns';
import useCompletedTrips from '@/hooks/useCompletedTrips';
import { Trips as Trip } from '@/db/schema';


const TripCard: React.FC<{ trip: Trip; index: number }> = ({ trip, index }) => {
  const handlePress = () => {
    router.push(`/trips/${trip.trip_id}`);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      className="mb-4"
    >
      <TouchableOpacity onPress={handlePress}>
        <BlurView intensity={30} className="rounded-2xl overflow-hidden">
          <LinearGradient
            colors={['rgba(31, 41, 55, 0.8)', 'rgba(17, 24, 39, 0.8)']}
            className="p-4"
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-white text-xl font-bold">{trip.title}</Text>
              <View className="bg-secondary rounded-full px-2 py-1">
                <Text className="text-xs text-zinc-900 font-semibold">Completed</Text>
              </View>
            </View>
            <Text className="text-gray-300 mb-2" numberOfLines={2}>{trip.description}</Text>
            <View className="flex-row justify-between items-center mb-2">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={16} color="#fcbf49" />
                <Text className="text-gray-300 ml-1">
                  {format(new Date(trip.start_date), 'MMM d')} - {format(new Date(trip.end_date), 'MMM d, yyyy')}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="location-outline" size={16} color="#fcbf49" />
                <Text className="text-gray-300 ml-1">{trip.steps.length} places</Text>
              </View>
            </View>
            <View className="flex-row">
              {trip.steps.slice(0, 3).map((step, stepIndex) => (
                <Image
                  key={stepIndex}
                  source={{ uri: step.place.image }}
                  className="w-12 h-12 rounded-full mr-2 border-2 border-white"
                />
              ))}
              {trip.steps.length > 3 && (
                <View className="w-12 h-12 rounded-full bg-zinc-700 items-center justify-center">
                  <Text className="text-white font-bold">+{trip.steps.length - 3}</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

const History: React.FC = () => {
  const { trips, loading, isError, error } = useCompletedTrips();
  console.log(trips)

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-900 justify-center items-center">
        <StatusBar style="light" />
        <Text className="text-white">Loading your travel history...</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-900 justify-center items-center">
        <StatusBar style="light" />
        <Text className="text-red-500">Error: {error?.message}</Text>
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
          Travel History
        </Animated.Text>
        {trips.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Ionicons name="airplane-outline" size={64} color="#fcbf49" />
            <Text className="text-white text-lg mt-4 text-center">
              You haven't completed any trips yet.{'\n'}Time to start exploring!
            </Text>
          </View>
        ) : (
          <FlatList
            data={trips}
            keyExtractor={(item) => item.trip_id}
            renderItem={({ item, index }) => <TripCard trip={item} index={index} />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default History;

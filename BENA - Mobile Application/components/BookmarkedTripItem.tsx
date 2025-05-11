import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Place } from '@/db/schema';

interface BookmarkedTripItemProps {
  item: Place;
  index: number;
  onRemoveBookmark: (id: string) => void;
}

const BookmarkedTripItem: React.FC<BookmarkedTripItemProps> = ({ item, index, onRemoveBookmark }) => {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(400)}
      className="bg-zinc-800 rounded-xl overflow-hidden mb-4"
    >
      <Image
        source={{ uri: item.image }}
        className="w-full h-40"
        resizeMode="cover"
      />
      <View className="p-4">
        <Text className="text-white text-xl font-bold mb-2">{item.name}</Text>
        <View className="flex-row items-center">
          <Ionicons name="location-outline" size={16} color="#a1a1aa" />
          <Text className="text-zinc-400 ml-2">{item.city}</Text>
        </View>
        <Text className="text-zinc-400 mt-2 mb-4" numberOfLines={2}>{item.description}</Text>
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Ionicons name="star" size={16} color="#fcbf49" />
            <Text className="text-white ml-1">{item.rating.toFixed(1)}</Text>
          </View>
          <TouchableOpacity
            className="bg-zinc-700 px-3 py-1 rounded-full"
            onPress={() => onRemoveBookmark(item.places_id)}
          >
            <Text className="text-white">Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

export default BookmarkedTripItem;



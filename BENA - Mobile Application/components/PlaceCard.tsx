import React from 'react';
import { Image, Pressable, View } from 'react-native';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Place } from '@/db/schema';

interface PlaceCardProps {
  place: Place;
  onPress?: (place: Place) => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({ place, onPress }) => {
  return (
    <Pressable onPress={() => onPress?.(place)}>
      <Card className="dark w-full overflow-hidden rounded-2xl">
        <Image
          source={{ uri: place.image }}
          className="w-full h-48 rounded-t-lg"
          resizeMode="cover"
        />
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{place.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex-row justify-between items-center pb-3">
          <Text className="text-sm text-gray-400">
            {place.location}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-sm text-yellow-400">{place.rating.toFixed(1)}</Text>
          </View>
        </CardContent>
      </Card>
    </Pressable>
  );
};


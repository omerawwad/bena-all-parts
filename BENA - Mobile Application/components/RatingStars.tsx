import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RatingStarsProps {
  rating: number;
  size?: number;
}

const RatingStars: React.FC<RatingStarsProps> = ({ rating, size = 16 }) => {
  return (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? 'star' : 'star-outline'}
          size={size}
          color={star <= rating ? '#fcbf49' : '#71717a'}
        />
      ))}
    </View>
  );
};

export default RatingStars;


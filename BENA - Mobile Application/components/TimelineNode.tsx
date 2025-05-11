import React from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface TimelineNodeProps {
  isCompleted: boolean;
  isActive: boolean;
  isLast: boolean;
}

const TimelineNode: React.FC<TimelineNodeProps> = ({ isCompleted, isActive, isLast }) => {
  return (
    <View className="items-center">
      <Animated.View
        entering={FadeIn.delay(300)}
        className={`w-10 h-10 rounded-full border-2 ${isActive
          ? 'bg-zinc-800 border-[#fcbf49]'
          : isCompleted
            ? 'bg-green-500 border-green-500'
            : 'bg-zinc-800 border-zinc-700'
          }`}
      />
      {!isLast && (
        <View
          className={`w-1 h-[200px] ${isCompleted ? 'bg-green-500' : 'bg-zinc-700'
            }`}
        />
      )}
    </View>
  );
};

export default TimelineNode;


import { LucideIcon } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Text, View, Animated } from 'react-native';

type TabIconProps = {
  icon: LucideIcon;
  color: string;
  name: string;
  focused: boolean;
};

export const TabIcon = ({ icon: Icon, color, name, focused }: TabIconProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.5)).current;
  const textOpacityAnim = useRef(new Animated.Value(0)).current;
  const textTranslateYAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: focused ? 1.2 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.timing(opacityAnim, {
      toValue: focused ? 1 : 0.5,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (focused) {
      Animated.timing(textOpacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      Animated.timing(textTranslateYAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      textOpacityAnim.setValue(0);
      textTranslateYAnim.setValue(10);
    }
  }, [focused]);

  return (
    <View className="flex items-center justify-center w-16 h-16">
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }}
      >
        <Icon size={25} color={color} />
      </Animated.View>
      {focused && (
        <Animated.View
          style={{
            opacity: textOpacityAnim,
            transform: [{ translateY: textTranslateYAnim }],
          }}
        >
          <Text
            className="text-[10px] mt-1 font-psemibold"
            style={{ color: color }}
          >
            {name}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

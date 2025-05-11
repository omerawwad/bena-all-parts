import React, { useState, useEffect } from 'react';
import { View, ScrollView, Switch, TouchableOpacity, Animated } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthProvider';
import { useColorScheme } from '@/lib/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const SettingItem = ({ iconName, title, onPress, value, toggle }) => {
  const scaleAnim = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedTouchableOpacity
      className="flex-row items-center justify-between py-4 border-b border-gray-700"
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ transform: [{ scale: scaleAnim }] }}
    >
      <View className="flex-row items-center">
        <Ionicons name={iconName} size={24} color="#a0aec0" />
        <Text className="text-white text-lg ml-3">{title}</Text>
      </View>
      {toggle ? (
        <Switch
          value={value}
          onValueChange={onPress}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={value ? "#f5dd4b" : "#f4f3f4"}
        />
      ) : (
        <Ionicons name="chevron-forward" size={24} color="#a0aec0" />
      )}
    </AnimatedTouchableOpacity>
  );
};

export default function Settings() {
  const { user, signOut } = useAuth();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(colorScheme === 'dark');
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
    toggleColorScheme();
  };

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        { iconName: 'person-outline', title: 'Edit Profile', onPress: () => { } },
        { iconName: 'notifications-outline', title: 'Notifications', onPress: () => setNotifications(!notifications), value: notifications, toggle: true },
        { iconName: 'lock-closed-outline', title: 'Privacy', onPress: () => { } },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { iconName: 'moon-outline', title: 'Dark Mode', onPress: handleDarkModeToggle, value: darkMode, toggle: true },
        { iconName: 'language-outline', title: 'Language', onPress: () => { } },
        { iconName: 'volume-high-outline', title: 'Sound', onPress: () => { } },
      ],
    },
    {
      title: 'Support',
      items: [
        { iconName: 'help-circle-outline', title: 'Help & Support', onPress: () => { } },
        { iconName: 'information-circle-outline', title: 'About', onPress: () => { } },
      ],
    },
  ];

  return (
    <View className="flex-1 bg-gray-900">
      <Animated.View
        className="flex-1 px-6 py-12"
        style={{ opacity: fadeAnim }}
      >
        <Text className="text-white text-3xl font-bold mb-8">Settings</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {settingsGroups.map((group, index) => (
            <View key={index} className="mb-8">
              <Text className="text-gray-400 text-lg font-semibold mb-4">{group.title}</Text>
              {group.items.map((item, itemIndex) => (
                <SettingItem key={itemIndex} {...item} />
              ))}
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
}



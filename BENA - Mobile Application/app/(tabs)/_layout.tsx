import { Tabs } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { TabIcon } from '@/components/TabIcon';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { View } from 'react-native';
import { Bookmark, PlusIcon, Bike, MapIcon, CompassIcon } from 'lucide-react-native';

const tabScreens = [
  { name: 'home', title: 'Explore', icon: CompassIcon },
  { name: 'bookmark', title: 'Bookmark', icon: Bookmark },
  { name: 'create', title: 'Create', icon: PlusIcon },
  { name: 'mytrips', title: 'My Trips', icon: MapIcon },
  { name: 'trip', title: 'Current Trip', icon: Bike },
];

const TabsLayout = () => {
  const [hideBlurView, setHideBlurView] = useState(false);
  const hideScreens: any = []

  return (
    <View className='flex-1'>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#fcbf49',
          tabBarInactiveTintColor: '#777777',
          tabBarStyle: {
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            elevation: 50,
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            height: 60,
            zIndex: 1,
          },
        }}
      >
        {tabScreens.map(({ name, title, icon }) => (
          <Tabs.Screen
            key={name}
            name={name}
            listeners={{
              focus: () => {
                // Hide the BlurView when the 'trip' or 'create' tab is focused
                if (hideScreens.includes(name)) {
                  setHideBlurView(true);
                } else {
                  setHideBlurView(false);
                }
              },
            }}
            options={{
              title,
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icon}
                  color={color}
                  name={title}
                  focused={focused}
                />
              ),
              tabBarStyle: hideScreens.includes(name) ? { display: 'none' } : {
                position: 'absolute',
                bottom: 0,
                left: 20,
                right: 20,
                elevation: 10,
                backgroundColor: 'transparent',
                borderTopWidth: 0,
                height: 80,
                zIndex: 1,
                paddingTop: 20,
              },
            }}
          />
        ))}
      </Tabs>

      {!hideBlurView && (
        <BlurView
          intensity={80}
          tint="light"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            borderRadius: 0,
            overflow: 'hidden',
            zIndex: 0,
          }}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(12, 12, 12, 0.98)' }} />
        </BlurView>
      )}

      <StatusBar backgroundColor="#161622" style="light" />
    </View>
  );
};

export default TabsLayout;

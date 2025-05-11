import './global.css';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ThemeProvider } from '@react-navigation/native';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Platform } from 'react-native';
import { NAV_THEME } from '../lib/constants';
import { useColorScheme } from '../lib/useColorScheme';
import { useEffect } from 'react';
import { useFonts } from 'expo-font'
import AuthProvider from '../context/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
const queryClient = new QueryClient();


const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#00F000', //
        backgroundColor: '#27272a', // Tailwind's bg-zinc-800
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
        backgroundColor: '#27272a', // Ensures consistent background
      }}
      text1Style={{
        fontSize: 15,
        fontWeight: '400',
        color: '#f4f4f5', // Light text for contrast
      }}
      text2Style={{
        fontSize: 13,
        color: '#a1a1aa', // Subtle text color
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: '#ef4444', // Red for errors
        backgroundColor: '#27272a', // Tailwind's bg-zinc-800
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
        backgroundColor: '#27272a', // Ensures consistent background
      }}
      text1Style={{
        fontSize: 17,
        fontWeight: '600',
        color: '#f4f4f5', // Light text for contrast
      }}
      text2Style={{
        fontSize: 13,
        color: '#a1a1aa', // Subtle text color
      }}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#2563eb', // Blue accent for info
        backgroundColor: '#27272a', // Tailwind's bg-zinc-800
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
        backgroundColor: '#27272a',
      }}
      text1Style={{
        fontSize: 15,
        fontWeight: '400',
        color: '#f4f4f5', // Light text for contrast
      }}
      text2Style={{
        fontSize: 13,
        color: '#a1a1aa', // Subtle text color
      }}
    />
  ),
};

const LIGHT_THEME: Theme = {
  dark: false,
  colors: NAV_THEME.light,
  fonts: {
    regular: require("../assets/fonts/Poppins-Regular.ttf"),
    medium: require("../assets/fonts/Poppins-Medium.ttf"),
    bold: require("../assets/fonts/Poppins-Bold.ttf"),
    heavy: require("../assets/fonts/Poppins-ExtraBold.ttf")
  }
};
const DARK_THEME: Theme = {
  dark: true,
  colors: NAV_THEME.dark,
  fonts: {
    regular: require("../assets/fonts/Poppins-Regular.ttf"),
    medium: require("../assets/fonts/Poppins-Medium.ttf"),
    bold: require("../assets/fonts/Poppins-Bold.ttf"),
    heavy: require("../assets/fonts/Poppins-ExtraBold.ttf")
  }
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before getting the color scheme.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });

  // useEffect(() => {
  //   if (error) throw error;
  //
  //   if (fontsLoaded) {
  //     SplashScreen.hideAsync();
  //   }
  // }, [fontsLoaded, error]);


  useEffect(() => {
    (async () => {
      const theme = await AsyncStorage.getItem('theme');
      if (Platform.OS === 'web') {
        // Adds the background color to the html element to prevent white background on overscroll.
        document.documentElement.classList.add('bg-background');
      }
      if (!theme) {
        AsyncStorage.setItem('theme', colorScheme);
        setIsColorSchemeLoaded(true);
        return;
      }
      const colorTheme = theme === 'dark' ? 'dark' : 'light';
      if (colorTheme !== colorScheme) {
        setColorScheme(colorTheme);

        setIsColorSchemeLoaded(true);
        return;
      }
      setIsColorSchemeLoaded(true);
    })().finally(() => {
      SplashScreen.hideAsync();
    });

    if (error) throw error;

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);


  if (!fontsLoaded && !error) {
    return null;
  }

  if (!isColorSchemeLoaded) {
    return null;
  }



  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
        <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
        <AuthProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="search" options={{ headerShown: true, title: 'Smart Search' }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="history" options={{ headerShown: false }} />
            <Stack.Screen name="home/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="mytrips/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="share/trip/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="editPlace" options={{ headerShown: false }} />
            <Stack.Screen name="choosePlace"
              options={{
                headerShown: false,
                presentation: 'modal',
                // This ensures it behaves like a modal and returns to previous screen
                gestureEnabled: true,
                gestureDirection: 'vertical'
              }}
            />
          </Stack>
        </AuthProvider>
      </ThemeProvider>
      <Toast
        position='top'
        topOffset={30}
        config={toastConfig}
      />
    </QueryClientProvider>
  );
}

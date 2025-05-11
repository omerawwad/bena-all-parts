import React, { useState, useEffect } from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface CustomSuspenseProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

const CustomSuspense: React.FC<CustomSuspenseProps> = ({ fallback, children }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 0);

    return () => clearTimeout(timeout);
  }, []);

  if (isLoading) {
    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(300)}
        style={{ flex: 1 }} // Ensure the fallback takes up the full space
      >
        {fallback}
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      style={{ flex: 1 }} // Ensure the children take up the full space
    >
      {children}
    </Animated.View>
  );
};

export default CustomSuspense;

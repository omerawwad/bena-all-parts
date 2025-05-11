import { useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { router } from 'expo-router';

// Custom hook that return the user if authed or redirects the user to sign-in if not
export const useAuthCheck = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.replace('/');
    }
  }, [user]);

  return user;
};

import { Users } from '@/db/schema'
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';


interface UseProfileResult {
  profile: Users | null;
  loading: boolean;
  error: string | null;
  updateUserName: (name: string) => Promise<void>;
  checkNullUserNames: () => Promise<Boolean>
}

const fetchUser = async (userId: string | null): Promise<Users | null> => {
  if (!userId) return null;
  const { data } = await supabase.from('users').select('*').eq('id', userId).single();
  return data
};



/**
 * Custom hook to fetch the user profile data
 * @param userId - The ID of the user whose profile is to be fetched.
 */
export function useUser(userId: string | null): UseProfileResult {
  const {
    data: profile = null,
    isLoading: loading,
    isError,
    error,
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    enabled: !!userId, // Only run the query if userId is provided
    staleTime: Infinity, // Prevent automatic refetching
  });

  const checkNullUserNames = async () => {
    const { data, error } = await supabase.from('users').select('username').eq('id', userId);
    if (error) throw error;
    if (!data[0]?.username) return true;
    return false;
  };
  const updateUserName = async (name: string) => {
    await supabase.from('users').update({ username: name }).eq('id', userId);
  };

  return {
    profile,
    loading,
    error: isError ? (error as Error).message : null,
    updateUserName,
    checkNullUserNames,
    
  };
}

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Place } from '@/db/schema';
import { useAuth } from '@/context/AuthProvider'; 

const fetchUserBookmarks = async (userId: string): Promise<Place[]> => {
  if (!userId) return [];

  // Fetch bookmarked places with their details in a single query
  const { data, error } = await supabase
    .from('bookmarks')
    .select(`
      bookmark_id,
      place_id,
      places (
        places_id,
        name,
        description,
        address,
        location,
        category,
        rating,
        image,
        latitude,
        longitude,
        external_link,
        arabic_name,
        city,
        tags,
        maps_id
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bookmarks:', error.message);
    throw new Error(error.message);
  }

  // If no bookmarks are found, return an empty array
  if (!data || data.length === 0) {
    return [];
  }

  // Transform the data to return just the places array
  return data?.map(bookmark => bookmark.places) || [];
};

const addToBookmarks = async (userId: string, placeId: string) => {
  const { data, error } = await supabase.from('bookmarks').insert({
    place_id: placeId,
    user_id: userId,
  });

  if (error) {
    console.error('Error adding to bookmarks:', error.message);
    throw new Error(error.message);
  }

  return data;
};

const removeFromBookmarks = async (userId: string, placeId: string) => {
  const { data, error } = await supabase.from('bookmarks').delete().eq('place_id', placeId).eq('user_id', userId);

  if (error) {
    console.error('Error removing from bookmarks:', error.message);
    throw new Error(error.message);
  }

  return data;
};

export const useUserBookmarks = () => {
  const { user } = useAuth();

  const {
    data: bookmarkedPlaces = [],
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['bookmarks', user?.id], // Include user.id in the query key
    queryFn: () => fetchUserBookmarks(user?.id || ''),
    refetchOnMount: 'always', // Always refetch data when the component mounts
  });


  return {
    bookmarkedPlaces,
    loading,
    error: isError ? (error as Error).message : null,
    refetch,
    addToBookmarks,
    removeFromBookmarks,
  };
};

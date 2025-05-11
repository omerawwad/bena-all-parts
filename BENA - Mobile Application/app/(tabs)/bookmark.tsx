import { FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Text } from '@/components/ui/text';
import BookmarkedTripItem from '@/components/BookmarkedTripItem';
import { useUserBookmarks } from '@/hooks/useUserBookmarks';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { supabase } from '@/lib/supabase';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

const BookmarkScreen = () => {
  const { bookmarkedPlaces, loading, error, refetch } = useUserBookmarks();
  const user = useAuthCheck()
  const queryClient = useQueryClient();

  const { mutate: removeBookmark } = useMutation({
    mutationFn: async (placeId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('place_id', placeId)
        .eq('user_id', user.id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch the bookmarks query
      queryClient.invalidateQueries({ queryKey: ['bookmarks', user?.id] });

      Toast.show({
        type: 'success',
        text1: 'Bookmark removed successfully',
      });
    },
    onError: (error) => {
      console.error('Error removing bookmark:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to remove bookmark',
        text2: error instanceof Error ? error.message : 'Please try again later',
      });
    }
  });

  const handleRemoveBookmark = async (placeId: string) => {
    removeBookmark(placeId);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-900 justify-center items-center">
        <ActivityIndicator size="large" color="#fcbf49" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-900 justify-center items-center">
        <Text className="text-red-500 text-center">{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-900" style={{ paddingBottom: 40 }}>
      <StatusBar style="light" />
      <Animated.View
        entering={FadeInDown.duration(500)}
        className="px-4 py-6 flex-1"
      >
        <Text className="text-3xl font-bold text-white mb-6">Your Bookmarks</Text>
        {bookmarkedPlaces.length === 0 ? (
          <Text className="text-white text-center mt-10">You haven't bookmarked any places yet.</Text>
        ) : (
          <FlatList
            data={bookmarkedPlaces}
            renderItem={({ item, index }) => (
              <BookmarkedTripItem
                item={item}
                index={index}
                onRemoveBookmark={handleRemoveBookmark}
              />
            )}
            keyExtractor={(item) => item.places_id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshing={loading}
            onRefresh={refetch}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

export default BookmarkScreen;

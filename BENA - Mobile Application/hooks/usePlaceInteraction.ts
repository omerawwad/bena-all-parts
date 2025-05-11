import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';

interface PlaceUserInteractions {
  id: string;
  place_id: string;
  user_id: string;
  overall: 'empty' | 'above' | 'below';
  expense: 'empty' | 'cheap' | 'high';
  comfort: 'empty' | 'comfortable' | 'exhausting';
}

// Fetch PlaceUserInteractions
const fetchPlaceInteractions = async (
  placeId: string,
  userId: string
): Promise<PlaceUserInteractions[]> => {
  const { data, error } = await supabase
    .from('place_user_interactions')
    .select('*')
    .eq('place_id', placeId)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  return data || [];
};

// Create PlaceUserInteraction if not exists
const createPlaceInteraction = async (
  placeId: string,
  userId: string
): Promise<void> => {
  const { data, error } = await supabase
    .from('place_user_interactions')
    .select('id')
    .eq('place_id', placeId)
    .eq('user_id', userId)
    .single();

  if (data === null) {
    const { error: insertError } = await supabase
      .from('place_user_interactions')
      .insert({ place_id: placeId, user_id: userId });

    if (insertError) throw new Error(insertError.message);
  } else if (error) {
    throw new Error(error.message);
  }
};

// Update PlaceUserInteraction
const updatePlaceInteraction = async (
  placeId: string,
  userId: string,
  updates: Partial<PlaceUserInteractions>
): Promise<void> => {
  await createPlaceInteraction(placeId, userId);

  const { error } = await supabase
    .from('place_user_interactions')
    .update(updates)
    .eq('place_id', placeId)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
};

export const usePlaceInteraction = (placeId: string) => {
  const queryClient = useQueryClient();
  const userId = useAuth().user?.id;

  // Fetch interactions
  const {
    data: interactions = [],
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['placeInteractions', placeId, userId],
    queryFn: () => fetchPlaceInteractions(placeId, userId || ''),
    enabled: !!userId,
  });

  // Count interactions
  const fetchCounts = async (): Promise<{
    countAbove: number;
    countBelow: number;
    countCheap: number;
    countHigh: number;
    countComfortable: number;
    countExhausting: number;
  }> => {
    const { data, error } = await supabase
      .from('place_user_interactions')
      .select('overall, expense, comfort')
      .eq('place_id', placeId);

    if (error) throw new Error(error.message);

    const counts = {
      countAbove: 0,
      countBelow: 0,
      countCheap: 0,
      countHigh: 0,
      countComfortable: 0,
      countExhausting: 0,
    };

    if (data) {
      data.forEach((interaction) => {
        if (interaction.overall === 'above') counts.countAbove++;
        if (interaction.overall === 'below') counts.countBelow++;
        if (interaction.expense === 'cheap') counts.countCheap++;
        if (interaction.expense === 'high') counts.countHigh++;
        if (interaction.comfort === 'comfortable') counts.countComfortable++;
        if (interaction.comfort === 'exhausting') counts.countExhausting++;
      });
    }

    return counts;
  };

  // Update interaction functions
  const updateOverall = async (overall: PlaceUserInteractions['overall']) => {
    if (!userId) return;
    await updatePlaceInteraction(placeId, userId, { overall });
    queryClient.invalidateQueries({ queryKey: ['placeInteractions', placeId, userId] });
  };

  const updateExpense = async (expense: PlaceUserInteractions['expense']) => {
    if (!userId) return;
    await updatePlaceInteraction(placeId, userId, { expense });
    queryClient.invalidateQueries({ queryKey: ['placeInteractions', placeId, userId] });
  };

  const updateComfort = async (comfort: PlaceUserInteractions['comfort']) => {
    if (!userId) return;
    await updatePlaceInteraction(placeId, userId, { comfort });
    queryClient.invalidateQueries({ queryKey: ['placeInteractions', placeId, userId] });
  };

  // Fetch PlaceUserInteractions using only placeId
    const getInteractions = async (placeId: string): Promise<PlaceUserInteractions[]> => {
        const userId = useAuth().user?.id; // Get user ID from context (AuthProvider)
    
        if (!userId) {
        throw new Error('User ID is missing');
        }
    
        const { data, error } = await supabase
        .from('place_user_interactions')
        .select('*')
        .eq('place_id', placeId)
        .eq('user_id', userId);
    
        if (error) throw new Error(error.message);
        return data || [];
    };


  return {
    interactions,
    loading,
    error: isError ? (error as Error).message : null,
    refetch,
    updateOverall,
    updateExpense,
    updateComfort,
    fetchCounts,
    getInteractions,
  };
};

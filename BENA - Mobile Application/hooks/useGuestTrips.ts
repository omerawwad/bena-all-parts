import { Trips } from '@/db/schema';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthProvider';

interface UseGuestTrips {
  pendingTrips: Trips[] | null;
  acceptedTrips: Trips[] | null;
  loading: boolean;
  error: string | null;
  addGuest: (username: string, tripId: string) => Promise<void>;
  getGuests: (tripId: string) => Promise<any[] | null>;
}

const fetchGuestTrips = async (userId: string | null): Promise<Trips[] | null> => {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching trips:', error);
    return null;
  }

  return data || [];
};

export function useGuestTrips(): UseGuestTrips {
  const userId = useAuth().user?.id;

  const {
    data: trips = [],
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ['trips', userId],
    queryFn: () => fetchGuestTrips(userId),
    enabled: !!userId, // Only fetch data if userId exists
    staleTime: Infinity,
  });

  const pendingTrips = trips.filter(trip => trip.status === 'pending');
  const acceptedTrips = trips.filter(trip => trip.status === 'accepted');

  const addGuest = async (username: string, tripId: string) => {
    // const  user  = useAuth().user.id;

    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();

      if (userError) throw new Error(`User fetch error: ${userError.message}`);
      const guestId = userData?.id;

      if (!guestId) throw new Error(`Guest with username "${username}" not found.`);

      
      if(guestId === userId) { 
        throw new Error('You cannot add yourself as a guest.');
        return;
      }


      const { error: insertError } = await supabase
        .from('trips_guests')
        .insert([{ guest_id: guestId, trip_id: tripId, status: 'pending' }]);

      if (insertError) throw new Error(`Error adding guest: ${insertError.message}`);
    } catch (err) {
        throw err; 
    }
  };

  const getGuests = async (tripId: string): Promise<any[] | null> => {
    try {
      const { data, error } = await supabase
        .from('trips_guests')
        .select(`
          *,
          users(*)
        `)
        .eq('trip_id', tripId);

      if (error) throw new Error(`Error fetching guests: ${error.message}`);
      return data || [];
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  return {
    pendingTrips,
    acceptedTrips,
    loading: isLoading || isFetching, // Reflects loading during both initial fetch and refetches
    error: isError ? (error as Error).message : null,
    addGuest,
    getGuests,
  };
}

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthCheck } from '@/hooks/useAuthCheck';

const useCompletedTrips = () => {
  const user = useAuthCheck();

  const fetchCompletedTrips = async () => {
    if (!user) throw new Error('User not authenticated');

    // Fetch completed trips
    const { data: trips, error: tripsError } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'completed');

    if (tripsError) throw tripsError;

    // Fetch trip steps and their associated places for each trip
    const tripsWithStepsAndPlaces = await Promise.all(
      trips.map(async (trip) => {
        // Fetch steps for the current trip
        const { data: steps, error: stepsError } = await supabase
          .from('tripstep')
          .select('*')
          .eq('trip_id', trip.trip_id)
          .order('step_num', { ascending: true });

        if (stepsError) throw stepsError;

        // Fetch places for each step
        const stepsWithPlaces = await Promise.all(
          steps.map(async (step) => {
            const { data: placeData, error: placeError } = await supabase
              .from('places')
              .select('*')
              .eq('places_id', step.place_id)
              .single();

            if (placeError) throw placeError;

            return {
              ...step,
              place: placeData,
            };
          })
        );

        return {
          ...trip,
          steps: stepsWithPlaces,
        };
      })
    );

    return tripsWithStepsAndPlaces;
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['completedTrips', user?.id],
    queryFn: fetchCompletedTrips,
    enabled: !!user,
  });

  return {
    trips: data,
    loading: isLoading,
    isError,
    error,
  };
};

export default useCompletedTrips;

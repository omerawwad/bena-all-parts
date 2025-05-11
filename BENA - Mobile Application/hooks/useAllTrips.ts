import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useState } from 'react';

const useAllTrips = () => {
  const user = useAuthCheck();
  const [ isSyncing, setIsSyncing ] = useState(false);


  const fetchAllTrips = async () => {
    if (!user) throw new Error('User not authenticated');
  
    // Fetch all trips for the user, sorted by start_date
    const { data: trips, error: tripsError } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: true }); // Sort trips by start_date
  
    if (tripsError) throw tripsError;

    try {
      const { data: guestTrips, error: guestTripsError } = await supabase
        .from('trips_guests')
        .select(`*,
          trips: trip_id(*)
        `)
        .eq('guest_id', user.id);
    
      if (guestTripsError) {
        throw guestTripsError;
      }
    
      const refinedGuestTrips = guestTrips.map(item => item.trips)
      refinedGuestTrips.forEach(element => {
        element.user_id = "guest";
      });
      // console.log('Guest trips:', refinedGuestTrips);
      trips.push(...refinedGuestTrips);
    } catch (error) {
      console.error('Error fetching trips by guest:', error);
    }
  
    // Group trips by status
    const groupedTrips = {
      in_progress: [],
      planned: [],
      completed: [],
      // guest: [],
    };
  
  
    // Sort trips into their respective status groups
    trips.forEach((trip) => {
      if (trip.status === 'in_progress') {
        groupedTrips.in_progress.push(trip);
      } else if (trip.status === 'planned') {
        groupedTrips.planned.push(trip);
      } else if (trip.status === 'completed') {
        groupedTrips.completed.push(trip);
      }
    });

    // groupedTrips.guest.push(guestTrips);

  
    // Fetch trip steps and their associated places for each trip
    const tripsWithStepsAndPlaces = await Promise.all(
      [...groupedTrips.in_progress, ...groupedTrips.planned, ...groupedTrips.completed].map(async (trip) => {
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
  
    // Return a single array of trips, grouped by status and sorted by start_date
    return tripsWithStepsAndPlaces;
  };
  
  // Mark a trip as 'in progress'
  const markAsInProgress = async (tripId) => {
    setIsSyncing(true);
     // Step 1: Update all trips for the user with status 'in_progress' to 'planned'
    const { error: resetError } = await supabase
    .from('trips')
    .update({ status: 'planned' })
    .eq('user_id', user.id)
    .eq('status', 'in_progress'); // Target only in_progress trips

    if (resetError) throw resetError;

     // update the trip status to in_progress
    const { data, error } = await supabase
      .from('trips')
      .update({ status: 'in_progress' })
      .eq('trip_id', tripId);

    if (error) throw error;

    setIsSyncing(false);

    return data;
  };

  // Mark a trip as 'completed'
  const markAsCompleted = async (tripId) => {
    const { data, error } = await supabase
      .from('trips')
      .update({ status: 'completed' })
      .eq('trip_id', tripId);

    if (error) throw error;
    await refetch();
    return data;
  };

  // Mark a trip as 'planned'
  const markAsPlanned = async (tripId) => {
    const { data, error } = await supabase
      .from('trips')
      .update({ status: 'planned' })
      .eq('trip_id', tripId);

    if (error) throw error;
    await refetch();
    return data;
  };

  // Delete a trip
  const deleteTrip = async (tripId) => {
    const { data, error } = await supabase
      .from('trips')
      .delete()
      .eq('trip_id', tripId);

    if (error) throw error;
    await refetch();
    return data;
  };

  const markAsVisited = async (stepId) => {
    const { data, error } = await supabase
      .from('tripstep')
      .update({ status: 'visited' })  // Update the status to 'visited'
      .eq('step_id', stepId);

    if (error) throw error;
    await refetch();
    return data;
  };

  const markAsPending = async (stepId) => {
    const { data, error } = await supabase
      .from('tripstep')
      .update({ status: 'pending' })  // Update the status to 'visited'
      .eq('step_id', stepId);

    if (error) throw error;
    await refetch();
    return data;
  };

  const deleteStep = async (stepId) => {
    const { data, error } = await supabase
      .from('tripstep')
      .delete()
      .eq('step_id', stepId);

    if (error) throw error;
    await refetch();
    return data;
  };

  const getSteoNum = async (stepId) => {
    const { data, error } = await supabase
      .from('tripstep')
      .select('step_num')
      .eq('step_id', stepId);

    if (error) throw error;
    return data[0].step_num;
  };
  const swapSteps = async (stepId1: string, stepId2: string) => {
    console.log('Swapping steps:', stepId1, stepId2);
    
    const step1 = await getSteoNum(stepId1);
    const step2 = await getSteoNum(stepId2);

    const { data, error } = await supabase
      .from('tripstep')
      .update({ step_num: step2 })  // Update the status to 'visited'
      .eq('step_id', stepId1);

    const { data: data2, error: error2 } = await supabase
      .from('tripstep')
      .update({ step_num: step1 })  // Update the status to 'visited'
      .eq('step_id', stepId2);

    if (error) throw error;
    await refetch();
    return data;
  };


  const {
    data,
    isLoading,
    isError,
    error,
    refetch, // This is the method to trigger a manual fetch
  } = useQuery({
    queryKey: ['allTrips', user?.id],
    queryFn: fetchAllTrips,
    enabled: !!user, // Ensures the query runs only when the user is authenticated
  });


  return {
    trips: data,
    loading: isLoading,
    isError,
    error,
    refetch, // Expose the refetch method
    markAsInProgress,
    markAsCompleted,
    markAsPlanned,
    deleteTrip,
    isSyncing,
    markAsVisited,
    markAsPending,
    deleteStep,
    swapSteps,
  };
};

export default useAllTrips;

import React, { useState } from 'react';
import TripStepCard from '@/components/TripStepCard';
import { Text } from '@/components/ui/text';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, TouchableOpacity, ScrollView, View, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import useAllTrips from '@/hooks/useAllTrips';
import HomeSkeleton from '@/components/HomeSkeleton';



const TripTimeline = () => {
  const user = useAuthCheck();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const { markAsCompleted, markAsPlanned, deleteTrip, swapSteps } = useAllTrips();
  const [selectedSteps, setSelectedSteps] = useState<string[]>([]); // Track selected step IDs
  const [isSwapping, setIsSwapping] = useState(false);

  const handleStepSelect = (stepId: string) => {
    setSelectedSteps((prev) => {
      if (prev.includes(stepId)) {
        return prev.filter((id) => id !== stepId);
      }
      return prev.length < 2 ? [...prev, stepId] : prev; // Allow up to 2 selections
    });
  };

  const handleSwapSteps = async () => {
    if (selectedSteps.length === 2) {
      try {
        await swapSteps(selectedSteps[0], selectedSteps[1]);
        setSelectedSteps([]);
        await fetchInProgressTrip(); // Refresh the trip data
        setIsSwapping(false);
      } catch (error) {
        console.log("Error swapping steps:", error);
      }
    }
  };

  if (selectedSteps.length === 2 && !isSwapping) {
    setIsSwapping(true);
    // console.log('Selected Steps:', selectedSteps);
    handleSwapSteps();
    //timeout to prevent multiple swaps
    setTimeout(() => {
      setIsSwapping(false);
    }, 10000);
  }





  const fetchInProgressTrip = async () => {
    if (!user) return;

    try {
      // Fetch the trip with status 'in_progress' for the current user
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .single();

      if (tripError && tripError.code !== 'PGRST116') throw tripError; // PGRST116 means no rows found

      if (!tripData) {
        setTrip(null);
        return;
      }

      // Fetch the steps for the trip
      const { data: stepsData, error: stepsError } = await supabase
        .from('tripstep')
        .select('*')
        .eq('trip_id', tripData.trip_id)
        .order('step_num', { ascending: true });

      if (stepsError) throw stepsError;

      // Fetch places for each step
      const stepsWithPlaces = await Promise.all(
        stepsData.map(async (step) => {
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

      // Construct the trip object
      const constructedTrip = {
        ...tripData,
        steps: stepsWithPlaces,
      };

      setTrip(constructedTrip);
    } catch (error) {
      console.error('Error fetching trip:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(() => {
    fetchInProgressTrip();
  });

  const handleEditStep = (stepId: string) => {
    router.push({
      pathname: '/editPlace',
      params: { tripId: trip.trip_id, stepId }
    });
  };

  const afterAction = async () => {
    // await refetch();
    // setUpdated(false);
    // setSyncing(false);
  };

  const beforeAction = async () => {
    // setSyncing(true);
    // setUpdated(true);
  }
  const handleSwitchToCompleted = async () => {
    setIsCompleted(true);
    setLoading(true);
    await markAsCompleted(trip.trip_id);
    setTrip(null);
    // await fetchInProgressTrip();
    router.push('/mytrips');
    setIsCompleted(false);

  };

  const handleSwitchToPlanned = async () => {
    setIsCompleted(true);
    setLoading(true);
    await markAsPlanned(trip.trip_id);
    setTrip(null);
    // await fetchInProgressTrip();
    router.push('/mytrips');
    setIsCompleted(false);
  };

  const handleDeleteTrip = async () => {
    Alert.alert(
      'Delete Trip',
      'Are you sure you want to delete this trip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsCompleted(true);
            await deleteTrip(trip.trip_id);
            setLoading(true);
            setTrip(null);
            // await fetchInProgressTrip();
            setIsCompleted(false);
            if (error) {
              Alert.alert('Error', error.message);
            } else {
              await fetchInProgressTrip();
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleShareTrip = async () => {
    router.push(`share/trip/${trip.trip_id}`);
    // TODO: Implement share trip functionality
  };

  const handleOpenOnMaps = async () => {
    // TODO: Implement open on maps functionality 
  }

  // TODO: add swap order functionality


  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-900">
        <HomeSkeleton />
      </SafeAreaView>
    );
  }

  if (!trip) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-900 justify-center items-center">
        <Text className="text-white text-lg mb-4">No ongoing trips found.</Text>
        <TouchableOpacity
          className="bg-zinc-600 px-6 py-3 rounded-lg"
          onPress={() => router.push('/mytrips')}
        >
          <Text className="text-white">Start a planned Trip</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-900 pb-24 pt-20 px-2">
      <StatusBar style="light" />
      <View className="flex-row items-center mb-4 justify-between">
        <View className="flex-row items-center">
          <View className="flex-row items-center px-4">
            <Animated.Text
              entering={FadeInDown.duration(500).springify()}
              className="text-3xl font-bold text-white "
            >
              <Text className="text-3xl font-bold text-white text-white">{trip.title}</Text>
            </Animated.Text>
          </View>
          <View className="flex-row items-center ">
            {isSwapping &&
              <Animated.View
                entering={FadeInDown.duration(500).springify()}
                className="flex-row items-center px-4">
                <Ionicons name="swap-vertical-outline" size={10} color="gray" className='pr-2' />
                <Text className="text-sm italic text-gray-500">Swapping Steps...</Text>
              </Animated.View>
            }
          </View>
        </View>

        <View className="flex-row items-center px-4">
          <Animated.Text
            entering={FadeInDown.duration(500).springify()}
            className="text-3xl font-bold text-white"
          >
            <TouchableOpacity onPress={handleShareTrip} className="px-4">
              <Ionicons name="share-outline" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteTrip} className="px-4">
              <Ionicons name="trash-outline" size={20} color="white" />
            </TouchableOpacity>

          </Animated.Text>
        </View>
      </View>
      <View className="flex-row items-center justify-between px-2 pb-4">
        <TouchableOpacity
          style={{ width: 120 }}
          onPress={handleSwitchToPlanned}
          className={`p-2 mt-2 rounded-xl flex-row items-center justify-center bg-gray-300 mx-1`}>
          <Ionicons
            name='pause-circle-outline'
            size={18}
            color="black"
          />
          <Text className="ml-1 text-sm font-bold text-black">Hold for Later</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ width: 120 }}
          onPress={handleSwitchToCompleted}
          className={`p-2 mt-2 rounded-xl  flex-row items-center justify-center bg-green-400 mr-1`}>
          <Ionicons
            name='checkmark-done-circle-outline'
            size={18}
            color="black"
          />
          <Text className="ml-1 text-sm font-bold text-black">Mark Completed</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ width: 120 }}
          onPress={handleOpenOnMaps}
          className={`p-2 mt-2 rounded-xl  flex-row items-center justify-center ml-1 bg-white border border-black`}>

          <Ionicons
            name='navigate-circle-outline'
            size={18}
            color="black"
          />
          <Text className="ml-1 text-sm font-bold text-black">Open On Maps</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        {trip.steps.map((step, index) => (
          <TripStepCard
            key={step.step_id}
            step={step}
            index={index}
            onEdit={() => handleEditStep(step.step_id)}
            isLast={index === trip.steps.length - 1}
            totalSteps={trip.steps.length}
            onStepSelect={handleStepSelect}
            isSelected={selectedSteps.includes(step.step_id)}
          />
        ))}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default TripTimeline;

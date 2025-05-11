import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import TripStepCard from '@/components/TripStepCard';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { supabase } from '@/lib/supabase';
import { StatusBar } from 'expo-status-bar';
import useAllTrips from '@/hooks/useAllTrips';
import HomeSkeleton from '@/components/HomeSkeleton';


const TripTimeline: React.FC = () => {
  const { id } = useLocalSearchParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'in_progress' | 'planned' | 'completed'>('in_progress');
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
        setIsSwapping(false);
      } catch (error) {
        console.log("Error swapping steps:", error);
      }
    }
  };

  if (selectedSteps.length === 2 && !isSwapping) {
    setIsSwapping(true);
    console.log('Selected Steps:', selectedSteps);
    handleSwapSteps();
    //timeout to prevent multiple swaps
    setTimeout(() => {
      setIsSwapping(false);
    }, 10000);
  }

  const fetchTrip = async () => {
    // console.log(id);
    try {
      // Fetch the trip
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .eq('trip_id', id)
        .single();
      if (tripError) throw tripError;
      // Fetch the steps for the trip
      const { data: stepsData, error: stepsError } = await supabase
        .from('tripstep')
        .select('*')
        .eq('trip_id', id)
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
    }
    setStatus(trip.status);
    setLoading(false);
  };
  fetchTrip();


  useFocusEffect(() => {
    fetchTrip();
  });

  const handleCompleteTrip = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('trips')
        .update({ status: 'completed' })
        .eq('trip_id', id);

      if (error) throw error;

      setTrip((prev: any) => ({
        ...prev,
        status: 'completed'
      }));

      Alert.alert('Success', 'Trip marked as completed!');
    } catch (error) {
      console.error('Error updating trip status:', error);
      Alert.alert('Error', 'Failed to update trip status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditStep = (stepId: string) => {
    router.push({
      pathname: '/editPlace',
      params: { tripId: id, stepId }
    });
  };

  const handleSwitchToCompleted = async () => {
    setStatus('completed');
    await markAsCompleted(trip.trip_id);

  };

  const handleSwitchToPlanned = async () => {
    setIsCompleted(true);
    setLoading(true);
    await markAsPlanned(trip.trip_id);
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
              await fetchTrip();
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleShareTrip = async () => {
    router.push(`share/trip/${trip.trip_id}`);
  };

  const handleOpenOnMaps = async () => {
    // TODO: Implement open on maps functionality 
  }



  if (!trip || loading) return <SafeAreaView className="flex-1 bg-zinc-900"><HomeSkeleton /></SafeAreaView>;

  return (
    <SafeAreaView className="flex-1 bg-zinc-900 pt-5">
      <StatusBar style="light" />
      <View className="flex-row items-center mb-4 justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()}
            className=" p-2 rounded-full px-6"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-row items-center px-4">
            <Animated.Text
              entering={FadeInDown.duration(500).springify()}
              className="text-3xl font-bold text-white "
            >
              <Text className="text-3xl font-bold text-white text-white">{trip.title.length > 20 ? trip.title.slice(0, 20) + '...' : trip.title}</Text>
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
        {/* First Button */}
        <TouchableOpacity
          style={{ width: 120 }}
          onPress={handleSwitchToCompleted}
          className={`p-2 mt-2 rounded-xl  flex-row items-center justify-center mr-1
        ${status === 'in_progress' ? 'bg-gray-300'
              : status === 'completed' ? 'bg-blue-400' : 'bg-[#fcbf49]'}`}>
          <Ionicons
            name={status === 'in_progress' ? 'pause-circle-outline'
              : status === 'completed' ? 'refresh' : 'play'}
            size={18}
            color="black"
          />
          <Text className="ml-1 text-sm font-bold text-black">{
            status === 'in_progress' ? 'Hold For Later'
              : status === 'completed' ? 'Restart Trip' : 'Mark As Active'}
          </Text>
        </TouchableOpacity>
        {/* Second Button */}
        <TouchableOpacity
          style={{ width: 120 }}
          onPress={handleSwitchToCompleted}
          className={`p-2 mt-2 rounded-xl flex-row items-center justify-center gap-1 
        ${status === 'completed' ? 'bg-green-400' : 'border border-white'}`}>
          <Ionicons
            name={status === 'completed' ? 'checkmark-done-circle' : 'checkmark-done-circle-outline'}
            size={18}
            color={status === 'completed' ? 'black' : 'white'}
          />
          <Text className={`ml-1 text-sm font-bold trim ${status === 'completed' ? 'text-black' : 'text-white'}`}>{
            status === 'completed' ? 'Completed' : 'Mark Completed'}
          </Text>
        </TouchableOpacity>
        {/* Third Button */}
        <TouchableOpacity
          style={{ width: 120 }}
          onPress={handleOpenOnMaps}
          className={`p-2 mt-2 rounded-xl  flex-row items-center justify-center ml-1 bg-white`}>
          <Ionicons
            name='navigate-circle-outline'
            size={18}
            color="black"
          />
          <Text className="ml-1 text-sm font-bold text-black">Open On Maps</Text>
        </TouchableOpacity>
      </View>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-1 px-4 pb-8">
          <View className="flex-1">
            {trip.steps.map((step, index) => (
              <View key={step.step_id} className="mb-4">
                <TripStepCard
                  step={step}
                  index={index}
                  onEdit={() => handleEditStep(step.step_id)}
                  isLast={index === trip.steps.length - 1}
                  totalSteps={trip.steps.length}
                  onStepSelect={handleStepSelect}
                  isSelected={selectedSteps.includes(step.step_id)}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TripTimeline;

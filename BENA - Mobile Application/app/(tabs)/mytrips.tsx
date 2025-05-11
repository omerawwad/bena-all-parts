import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, Image, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Text } from '@/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { format } from 'date-fns';
import useAllTrips from '@/hooks/useAllTrips';
import LoadingUI from '@/components/LoadingUI';


const TripCard = ({ trip, index, setSyncing, setSyncedDate }) => {
  const { refetch, markAsInProgress, markAsPlanned, deleteTrip } = useAllTrips(); // useAllTrips hook
  const [status, setStatus] = useState<'in_progress' | 'planned' | 'completed'>(trip.status);
  const [deleted, setDeleted] = useState<boolean>(false);
  const [isUpdated, setUpdated] = useState<boolean>(false);

  const handlePress = () => {
    if (trip.status === 'in_progress') {
      router.push(`/trip`);
    } else {
      router.push(`/mytrips/${trip.trip_id}`);
    }
  };

  const afterAction = async () => {
    setSyncedDate(new Date());
    await refetch();
    setUpdated(false);
    setSyncing(false);
  };

  const beforeAction = async () => {
    setSyncing(true);
    setUpdated(true);
  }

  const handleSwitchToInProgress = async () => {
    await beforeAction();
    setStatus('in_progress');
    await markAsInProgress(trip.trip_id);
    await afterAction();


  };

  const handleSwitchToPlanned = async () => {
    await beforeAction();
    setStatus('planned');
    await markAsPlanned(trip.trip_id);
    await afterAction();
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
            await beforeAction();
            setDeleted(true);
            await deleteTrip(trip.trip_id);
            await afterAction();
            if (error) {
              Alert.alert('Error', error.message);
            } else {
              refetch();
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleShareTrip = async () => {
    try {
      const result = await Share.share({
        message:
          `http://54.84.91.107/share/trip/${trip.trip_id}`,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      className="mb-4"
    >
      {!deleted && <Animated.View className={`rounded-2xl overflow-hidden border-2 p-2 border-zinc-800 bg-gray-600`}>
        <TouchableOpacity onPress={handlePress}>
          <BlurView intensity={30} className="rounded-2xl overflow-hidden">
            <LinearGradient
              colors={['rgba(31, 41, 55, 0.8)', 'rgba(17, 24, 39, 0.8)']}
              className="p-4"
            >
              <View className="flex-row justify-between items-center mb-2">

                <View className="flex-row items-center gap-4">
                  {trip.user_id === "guest" && (
                    <View className="flex-row items-center rounded-full px-2 py-1 bg-gray-300">
                      <Ionicons name="people" size={16} color="black" />
                      <Text className="text-xs text-black font-semibold ml-1">Guest</Text>
                    </View>
                  )}
                  <Text className="text-white text-xl font-bold">{trip.title}</Text>

                </View>



                <View className={` flex-row items-center rounded-full px-2 py-1 ${isUpdated ? status === 'planned' ? 'bg-gray-300' : status === 'in_progress' ? 'bg-[#fcbf49]' : 'bg-gray-300'
                  : trip.status === 'planned' ? 'bg-gray-300' : trip.status === 'in_progress' ? 'bg-[#fcbf49]' : 'bg-gray-300'}`}>
                  <Ionicons name={
                    isUpdated ? status === 'planned' ? 'time-outline' : status === 'in_progress' ? 'airplane-outline' : 'checkmark-done'
                      : trip.status === 'planned' ? 'time-outline' : trip.status === 'in_progress' ? 'airplane-outline' : 'checkmark-done'
                  } size={16} color="black" />
                  <Text className="text-xs text-zinc-900 font-semibold ml-1">
                    {isUpdated ? status === 'planned'
                      ? 'Planned'
                      : status === 'in_progress'
                        ? 'Currently Active'
                        : 'Completed' : trip.status === 'planned'
                      ? 'Planned'
                      : trip.status === 'in_progress'
                        ? 'Currently Active'
                        : 'Completed'
                    }
                  </Text>
                </View>

              </View>
              <Text className="text-gray-300 mb-2" numberOfLines={2}>
                {trip.description}
              </Text>
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center">
                  <Ionicons name="calendar-outline" size={16} color="#fcbf49" />
                  <Text className="text-gray-300 ml-1">
                    {format(new Date(trip.start_date), 'MMM d')} -{' '}
                    {format(new Date(trip.end_date), 'MMM d, yyyy')}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="location-outline" size={16} color="#fcbf49" />
                  <Text className="text-gray-300 ml-1">{trip.steps.length} places</Text>
                </View>
              </View>
              <View className="flex-row">
                {trip.steps.slice(0, 3).map((step, stepIndex) => (
                  <Image
                    key={stepIndex}
                    source={{ uri: step.place.image }}
                    className="w-12 h-12 rounded-full mr-2 border-2 border-white"
                  />
                ))}
                {trip.steps.length > 3 && (
                  <View className="w-12 h-12 rounded-full bg-zinc-700 items-center justify-center">
                    <Text className="text-white font-bold">+{trip.steps.length - 3}</Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          </BlurView>
        </TouchableOpacity>
        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            disabled={isUpdated}
            style={{ width: 115 }}
            onPress={trip.status === 'planned' ? handleSwitchToInProgress : trip.status === 'in_progress' ? handleSwitchToPlanned : handleSwitchToPlanned}
            className={`p-2 mt-2 rounded-xl  flex-row items-center justify-center ${isUpdated ? status === 'planned' ? 'bg-green-300' : status === 'in_progress' ? 'bg-gray-300' : 'bg-blue-300'
              : trip.status === 'planned' ? 'bg-green-300' : trip.status === 'in_progress' ? 'bg-gray-300' : 'bg-blue-300'} `}>
            <Ionicons
              name={
                isUpdated ? status === 'planned' ? 'play' : status === 'in_progress' ? 'pause' : 'refresh'
                  : trip.status === 'planned' ? 'play' : trip.status === 'in_progress' ? 'pause' : 'refresh'}
              size={18}
              color="black"
            />
            <Text className="ml-1 text-sm font-bold text-black">{
              isUpdated ? status === 'planned' ? 'Mark As Active' : status === 'in_progress' ? 'Hold For Later' : 'Repeat Trip'
                : trip.status === 'planned' ? 'Mark As Active' : trip.status === 'in_progress' ? 'Hold For Later' : 'Repeat Trip'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ width: 115 }}
            onPress={handleShareTrip}
            className={`p-2 mt-2 rounded-xl  flex-row items-center justify-center bg-zinc-900`}>
            <Ionicons
              name='share-outline'
              size={18}
              color="white"
            />
            <Text className="ml-2 text-sm font-bold text-white">Share Trip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ width: 115 }}
            onPress={handleDeleteTrip}
            className={`p-2 mt-2 rounded-xl  flex-row items-center justify-center bg-red-400`}>
            <Ionicons
              name='trash-outline'
              size={18}
              color="black"
            />
            <Text className="ml-2 text-sm font-bold text-black">Delete Trip</Text>
          </TouchableOpacity>
        </View>

      </Animated.View>
      }
    </Animated.View>
  );
};

const AllTrips = () => {
  const { trips, loading, isError, error, refetch } = useAllTrips(); // useAllTrips hook
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isSyncing, setSyncing] = useState<boolean>(false);
  const [syncedDate, setSyncedDate] = useState<Date | null>(new Date());

  useEffect(() => {
    refetch();
  }, []);


  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setSyncing(true);
    setSyncedDate(new Date());
    await refetch();
    setRefreshing(false);
    setSyncing(false);
  }, [refetch]);

  if (loading) {
    return <LoadingUI />
  }

  if (!trips || trips.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-900 justify-center items-center">
        <StatusBar style="light" />
        <Text className="text-white">No trips found.</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-900 justify-center items-center">
        <StatusBar style="light" />
        <Text className="text-red-500">Error: {error?.message}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-900 pb-24">
      <StatusBar style="light" />
      <View className="flex-1 px-4 pt-6">
        <View className="flex-row items-center mb-4 justify-between">


          <View className="flex-row items-center ">
            <Animated.Text
              entering={FadeInDown.duration(500).springify()}
              className="text-3xl font-bold text-white "
            >
              {isSyncing && <Ionicons name="refresh" size={10} color="gray" className='pr-2' />}
              <Text className="text-sm italic text-gray-500">
                {isSyncing
                  ? 'syncing...'
                  : (syncedDate && syncedDate < new Date(Date.now() - 86400000))
                    ? `last synced at ${syncedDate?.toLocaleString([], {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}`
                    : `last synced at ${syncedDate?.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      hourCycle: 'h12'
                    })}`
                }
              </Text>
            </Animated.Text>
          </View>
          <View className="flex-row items-center px-4">
            <Animated.Text
              entering={FadeInDown.duration(500).springify()}
              className="text-3xl font-bold text-white"
            >
              <Text className="text-white text-sm ml-2">{trips.length} Trips</Text>
            </Animated.Text>
          </View>
        </View>
        {trips.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Ionicons name="airplane-outline" size={64} color="#fcbf49" />
            <Text className="text-white text-lg mt-4 text-center">
              You don't have any trips yet. Start planning your adventures!
            </Text>
          </View>
        ) : (
          <FlatList
            data={trips}
            keyExtractor={(item) => item.trip_id}
            renderItem={({ item, index }) => <TripCard trip={item} index={index} setSyncing={setSyncing} setSyncedDate={setSyncedDate} />}
            showsVerticalScrollIndicator={false}
            refreshing={false}
            onRefresh={handleRefresh}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default AllTrips;

import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, TextInput, ActivityIndicator, Share, Keyboard } from 'react-native';
import { Text } from '@/components/ui/text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { supabase } from '@/lib/supabase';
import { StatusBar } from 'expo-status-bar';
import HomeSkeleton from '@/components/HomeSkeleton';
import { useGuestTrips } from '@/hooks/useGuestTrips';
import GuestCard from '@/components/GuestCard';
import QRCode from 'react-native-qrcode-svg';

interface FormData {
  username: string
}
const TripTimeline: React.FC = () => {
  const { id } = useLocalSearchParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isaddingGuest, setIsAddingGuest] = useState(false);
  const [addingGuestError, setAddingGuestError] = useState<'empty' | 'duplicate' | 'notFound'>('empty');
  const [form, setForm] = useState<FormData>({ username: '' });
  const [guests, setGuests] = useState([]);
  const { addGuest, getGuests } = useGuestTrips();

  const fetchTrip = async () => {
    try {
      // Fetch the trip
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .eq('trip_id', id)
        .single();
      if (tripError) throw tripError;



      setTrip(tripData);
    } catch (error) {
      console.error('Error fetching trip:', error);
    }
    // console.log(pendingTrips);

    try {
      const result = await getGuests(id);
      setGuests(result);
      // console.log(guests);
    } catch (error) {
      console.error('Error fetching guests:', error);
    }
    setLoading(false);
  };
  fetchTrip();

  // useEffect(() => {
  //   // getGuests(id);
  //   fetchTrip();
  // }, [id]);

  // useFocusEffect(() => {
  //   fetchTrip();
  // });

  const validateForm = (): boolean => {
    if (!form.username) {
      setAddingGuestError('empty');
      return false
    }
    return true
  }




  const handleSendInvitation = async () => {
    // TODO: Implement send invitation functionality
    setAddingGuestError('empty');
    setIsAddingGuest(true);
    Keyboard.dismiss();

    try {
      const result = await addGuest(form.username.trim(), id);
    } catch (error) {
      console.log(error.message);

      if (error.message.includes('avoid_duplicate_invite')) {
        setAddingGuestError('duplicate');
      } else {
        setAddingGuestError('notFound');
      }



      // console.error('Error adding guest:', error);
      return;
    } finally {
      setIsAddingGuest(false);
      setForm({ username: '' });
      // setAddingGuestError('success');
    }
  }

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

  const handleDeleteGuest = () => {
    Alert.alert(
      'Remove Guest',
      `Are you sure you want to remove ${guest.users.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('trips_guests')
                .delete()
                .eq('id', guest.id);
              if (error) {
                console.error('Error deleting guest:', error);
                Alert.alert('Error', 'Failed to remove guest.');
                return;
              }
              setGuests((prevGuests) =>
                prevGuests.filter((g) => g.id !== guest.id)
              );
            } catch (err) {
              console.error('Error:', err);
            }
          },
        },
      ]
    );
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
              <Text className="text-2xl font-bold text-white text-white">Share {trip.title.length > 20 ? trip.title.slice(0, 20) + '...' : trip.title}</Text>
            </Animated.Text>
          </View>
        </View>
        <View className="flex-row items-center px-4">
          <Animated.Text
            entering={FadeInDown.duration(500).springify()}
            className="text-3xl font-bold text-white"
          >
            {/* <TouchableOpacity  className="px-4">
            <Ionicons name="share-outline" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity  className="px-4">
            <Ionicons name="trash-outline" size={20} color="white" />
          </TouchableOpacity> */}

          </Animated.Text>
        </View>
      </View>

      <Animated.View
        entering={FadeInDown.duration(500).springify()}
        className="flex-col items-center p-2 m-4 bg-zinc-800 rounded-lg"
      >
        <View className="flex-row items-center bg-zinc-700 rounded-lg p-4">
          <TextInput
            className="flex-1 text-white font-psemibold text-base"
            placeholder="Invite other users to trip by username"
            placeholderTextColor="gray"
            value={form.username}
            onChangeText={(text) => setForm({ ...form, username: text })}
            autoCapitalize="none"
            autoComplete="off"
          />

          <TouchableOpacity onPress={handleSendInvitation} className="px-4">
            {isaddingGuest ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="send" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row px-2 py-2">
          <Text
            className={`flex-1 text-white text-xs ${addingGuestError === 'empty' ? 'text-zinc-400' : 'text-red-500'
              }`}
          >
            {addingGuestError === 'empty'
              ? '* Enter a username'
              : addingGuestError === 'duplicate'
                ? '* User already invited'
                : '* User not found'}
          </Text>
        </View>

        {/* Fixed-height ScrollView for Guest Cards */}
        <View className="w-full  rounded-lg overflow-hidden">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 10 }}
          >
            {guests.length > 0 ? (
              guests.map((guest) => (
                <GuestCard
                  key={guest.id}
                  guest={guest}
                />
              ))
            ) : (
              <Text className="text-center text-zinc-400 mt-4">
                No guests found.
              </Text>
            )}
          </ScrollView>
        </View>
      </Animated.View>
      <Animated.View
        entering={FadeInDown.duration(500).springify()}
        className="flex-col items-center p-4 mb-4 mx-4 bg-zinc-800 rounded-lg" >
        <View className="flex-row items-center rounded-lg  justify-between">
          {/* <View className=" flex-1 bg-zinc-700 p-2"> */}
            {/* <Text className="text-white text-sm italic font-light">`http://54.84.91.107/share/trip/${trip.trip_id}`</Text> */}
            {/* </View> */}
            <TouchableOpacity onPress={handleShareTrip} className="">
            <Ionicons className='px-8' name="share-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>

      </Animated.View>
      <Animated.View
        entering={FadeInDown.duration(500).springify()}
        className="flex-col items-center p-4 mb-4 mx-4 bg-zinc-800 rounded-lg"
      >
        <View className="flex-row items-center rounded-lg  justify-between">
          <View className="p-4 bg-zinc-700 rounded-lg mt-4">
            <QRCode
              value={`http://54.84.91.107/share/trip/${trip.trip_id}`}
              size={300}
              logo={require('@/assets/images/logo.png')}
              logoBackgroundColor='black'
              logoSize={50}
            />
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default TripTimeline;

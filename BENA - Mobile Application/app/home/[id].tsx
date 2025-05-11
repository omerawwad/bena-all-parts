import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { View, ScrollView, Text, ActivityIndicator, Dimensions, TouchableOpacity, Linking, Platform, FlatList, Image } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Place } from '@/db/schema';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import { useAuth } from '@/context/AuthProvider';
import { router } from 'expo-router';
import NearbyCarousal from '@/components/NearbyCarousal';
import { usePlaceInteraction } from '@/hooks/usePlaceInteraction';
import ModalSelector from 'react-native-modal-selector';

const { width } = Dimensions.get('window');

const PlaceDetails: React.FC = () => {
  const { user } = useAuth()
  const navigation = useNavigation()
  const { id } = useLocalSearchParams();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [overall, setOverall] = useState<'empty' | 'above' | 'below'>('empty');
  const [expense, setExpense] = useState<'empty' | 'cheap' | 'high'>('empty');
  const [comfort, setComfort] = useState<'empty' | 'comfortable' | 'exhausting'>('empty');
  const [isExpanded, setIsExpanded] = useState(false);
  const maxDescriptionLength = 150;
  const [translatedDescription, setTranslatedDescription] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [language, setLanguage] = useState('ar');
  const { interactions, updateOverall, updateExpense, updateComfort, fetchCounts, refetch } = usePlaceInteraction(id);
  const [ratings, setRatings] = useState<'average' | 'good' | 'amazing'>('good');
  const [price, setPrice] = useState<'average' | 'cheap' | 'expensive'>('average');
  const [comfortness, setComfortness] = useState<'average' | 'comfortable' | 'exhausting'>('average');
  const languageData = [
    { key: 0, label: 'Spanish', value: 'es' },
    { key: 1, label: 'French', value: 'fr' },
    { key: 2, label: 'German', value: 'de' },
    { key: 3, label: 'Arabic', value: 'ar' },
    { key: 4, label: 'Chinese', value: 'zh' },
    { key: 5, label: 'Russian', value: 'ru' },
    { key: 6, label: 'Italian', value: 'it' },
    { key: 7, label: 'Japanese', value: 'jp' },
  ];
  const translateDescription = async () => {
    if (!place?.description) return;
    setIsTranslating(true);
    setTranslatedDescription(null);
    try {
      const { data, error } = await supabase.functions.invoke('translate', {
        body: {
          text: place.description,
          targetLanguage: language
        }
      });
      setTranslatedDescription(data.translation);
    } catch (error) {
      console.error('Error translating description:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const checkBookmarkStatus = async () => {
    // const nearbyPlaces = await getNearbyPlaces(id,SEARCH_RADIUS);
    // setNearbyPlaces(nearbyPlaces.near_places);
    if (!user || !id) return;

    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('bookmark_id')
        .eq('place_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      // console.log(data);

      if (error) throw error;
      setIsBookmarked(!!data);
      // console.log(data);
    } catch (err) {
      console.error('Error checking bookmark status:', err);
    }

  };

  const fetchInteractions = async () => {
    try {
      const InteractionsCouts = await fetchCounts();
      // console.log(InteractionsCouts);
      if (InteractionsCouts.countHigh > InteractionsCouts.countCheap) {
        setPrice('expensive');
      }
      else if (InteractionsCouts.countHigh < InteractionsCouts.countCheap) {
        setPrice('cheap');
      }
      else {
        setPrice('average');
      }

      if (InteractionsCouts.countComfortable > InteractionsCouts.countExhausting) {
        setComfortness('comfortable');
      }
      else if (InteractionsCouts.countComfortable < InteractionsCouts.countExhausting) {
        setComfortness('exhausting');
      }
      else {
        setComfortness('average');
      }

      if (InteractionsCouts.countAbove > InteractionsCouts.countBelow) {
        setRatings('amazing');
      }
      else if (InteractionsCouts.countAbove < InteractionsCouts.countBelow) {
        setRatings('average');
      }
      else {
        setRatings('good');
      }

    } catch (error) {
      console.error('Error fetching interactions:', error);
    }

  };

  const fetchUserInteractions = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('Error fetching interactions:', error);
    } finally {
      if (overall === 'empty') setOverall(interactions[0]?.overall || overall);
      if (expense === 'empty') setExpense(interactions[0]?.expense || expense);
      if (comfort === 'empty') setComfort(interactions[0]?.comfort || comfort);
      // setExpense(interactions[0]?.expense || expense);
      // setComfort(interactions[0]?.comfort || comfort);

    }

  };

  fetchUserInteractions();
  // Check if place is bookmarked on component mount
  useEffect(() => {

    checkBookmarkStatus();
    fetchInteractions();
    // fetchUserInteractions();
  }, [user, id]);

  const handleBookmark = async () => {
    if (!user) {
      // Handle unauthenticated user case
      return;
    }

    try {
      if (isBookmarked) {
        setIsBookmarked(false);
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('place_id', id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        setIsBookmarked(true);
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            place_id: id,
            user_id: user.id,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      // You might want to show an error message to the user
    }

  }

  const handleFeedbackUp = async () => {
    setOverall('above');
    updateOverall('above');
  };

  const handleFeedbackDown = async () => {
    setOverall('below');
    updateOverall('below');
  };

  const handleFeedbackExpensive = async () => {
    setExpense('high');
    updateExpense('high');
  };

  const handleFeedbackAffordable = async () => {
    setExpense('cheap');
    updateExpense('cheap');
  };

  const handleFeedbackRelaxing = async () => {
    setComfort('comfortable');
    updateComfort('comfortable');
  };

  const handleFeedbackExhausting = async () => {
    setComfort('exhausting');
    updateComfort('exhausting');
  };

  const handleClickOnLocation = async () => {
    Linking.openURL(place?.external_link!);
  }

  const handleClickOnTiktok = async () => {
    Linking.openURL(`https://www.google.com/search?q=site%3Atiktok.com+${place?.name} ${place?.city}  ${!(place?.arabic_name === "Not available yet") ? place?.arabic_name : ''}`);
  };

  const handleClickOnInstagram = async () => {
    Linking.openURL(`https://www.google.com/search?q=site%3Ainstagram.com+${place?.name} ${place?.city}  ${!(place?.arabic_name === "Not available yet") ? place?.arabic_name : ''}`);

  }

  const handleClickOnPinterest = async () => {
    Linking.openURL(`https://www.google.com/search?q=site%3Apinterest.com+${place?.name}`);
  }

  const handleClickOnYoutube = async () => {
    Linking.openURL(`https://www.google.com/search?q=site%3Ayoutube.com+${!(place?.arabic_name === "Not available yet") ? place?.arabic_name : place?.name + place?.city}`);

  }

  const toggleExpanded = async () => {
    setIsExpanded(!isExpanded);
  };

  const description =
    place?.description.length > maxDescriptionLength && !isExpanded
      ? `${place?.description.slice(0, maxDescriptionLength)}...`
      : place?.description;

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .from('places')
          .select('*')
          .eq('places_id', id)
          .single();

        if (supabaseError) throw supabaseError;
        setPlace(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch place details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPlace();
    }

  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-900">
        <ActivityIndicator size="large" color="#fcbf49" />
      </View>
    );
  }

  if (!place) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-900">
        <Text className="text-red-500 text-center">No place found</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-900">
        <Text className="text-red-500 text-center">{error}</Text>
      </View>
    );
  }

  const renderNearbyPlace = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="bg-zinc-800 p-4 rounded-lg mr-4"
      onPress={() => handlePlaceClick(item.place_id)} // Update place_id to match your data model
    >
      <FastImage
        source={{ uri: item.image }}
        style={{ width: 160, height: 96, borderRadius: 8 }} // Adjusted to match "w-40 h-24 rounded-lg"
        resizeMode={FastImage.resizeMode.cover}
      />
      <View className="mt-2">
        <Text className="text-white text-sm font-bold">{item.name}</Text>
        <Text className="text-gray-400 text-xs">{item.city}</Text>
      </View>
    </TouchableOpacity>
  );

  const handlePlaceClick = (place_id: string) => {
    router.push(`../home/${place_id}`); // Navigate to the Place screen with the placeId
  };

  const renderDropdownRow = (option: { label: string, value: string }, index: number, isSelected: boolean) => (
    <View className={`px-4 py-2 ${isSelected ? 'bg-blue-500' : 'bg-zinc-800'}`}>
      <Text className="text-white">{option.label}</Text>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-zinc-900">
      <View className="relative">
        <FastImage
          source={{ uri: place?.image }}
          style={{ width, height: width * 0.8 }}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(24, 24, 27, 0.8)', '#18181b']}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 }}
        />
        <BlurView intensity={0} style={{ position: 'absolute', top: 40, left: 20, right: 20, borderRadius: 20, overflow: 'hidden' }}>
          <View className="flex-row justify-between items-center p-2">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </BlurView>
        <TouchableOpacity onPress={handleBookmark} className={`ml-2 absolute bottom-0 right-10 flex-row items-center p-4 rounded-xl drop-shadow-xl ${!isBookmarked ? 'bg-zinc-800' : 'bg-zinc-800'}`}>
          <Text className={`text-xl text-gray-300 mr-2 flex-col ${!isBookmarked ? 'text-white' : 'text-[#fcbf49]'}`}>{!isBookmarked ? 'Add to Bookmark' : 'Added to Bookmarkes'}</Text>
          {
            !isBookmarked ?
              <Ionicons className="" name="bookmark-outline" size={25} color="#fff" />
              : <Ionicons name="bookmark" size={25} color="#fcbf49" />
          }
        </TouchableOpacity>
      </View>

      <Animated.View entering={FadeInUp.delay(300).duration(500)} className="p-6">
        <Animated.Text entering={FadeInDown.delay(400).duration(500)} className="text-4xl font-bold text-white width-full mb-2 flex-row justify-between items-center"><Text className="mr-4">{place?.name}</Text>
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(500).duration(500)} className="flex-row items-center mb-4 ">
          <TouchableOpacity className="bg-zinc-800 py-1 px-2 mr-2 rounded-full flex-row items-center" onPress={handleClickOnLocation}>
            <Ionicons name="location-outline" size={14} color="#fcbf49" />
            <Text className="text-gray-300 ml-1 " style={{ fontSize: 12 }}>{place?.city || 'Unknown Location'}</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-zinc-800 py-1 px-2 mr-5 rounded-full flex-row items-center">
            <Ionicons name="pricetag-outline" size={14} color="#fcbf49" />
            <Text className="text-gray-300 ml-1" style={{ fontSize: 12 }}>{place?.category}</Text>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(500).duration(500)} className="flex-row items-center mb-4 ">
          <TouchableOpacity className=" py-1 px-2 mr-2 rounded-full flex-row items-center gap-2">
            <Ionicons name={ratings === "good" ? "thumbs-up" : ratings === "average" ? "thumbs-down-outline" : "star"} size={14} color="#e3e3e3" />
            <Text className="text-[#e3e3e3]" style={{ fontSize: 12 }}>{ratings === "good" ? "Good place" : ratings === "average" ? "Average place" : "Amazing place"}</Text>
          </TouchableOpacity>
          <TouchableOpacity className=" py-1 px-2 mr-2 rounded-full flex-row items-center gap-2">
            <Ionicons name="card" size={14} color="#e3e3e3" />
            <Text className="text-[#e3e3e3]" style={{ fontSize: 12 }}>{price === 'average' ? "Average prices" : price === 'cheap' ? "Cheap prices" : "Expensive prices"}</Text>
          </TouchableOpacity>
          <TouchableOpacity className=" py-1 px-2 mr-2 rounded-full flex-row items-center gap-2">
            <Ionicons name="walk" size={14} color="#e3e3e3" />
            <Text className="text-[#e3e3e3]" style={{ fontSize: 12 }}>{comfortness === 'average' ? "Not much effort" : comfortness === 'comfortable' ? "Easy trip" : "Takes some effort"}</Text>
          </TouchableOpacity>
        </Animated.View>

        {!(description === 'No description yet') && <TouchableOpacity onPress={toggleExpanded} >
          <Animated.Text
            entering={FadeInDown.delay(600).duration(500)}
            className="text-gray-300 text-base leading-6 mb-2 rounded-xl p-4 bg-zinc-800"
          >
            <Text>{translatedDescription || description}</Text>
            {isExpanded || description.length < maxDescriptionLength ? null : (<Text className="text-blue-400">Show More</Text>)}
          </Animated.Text>
        </TouchableOpacity>}
        <View className="flex-row items-center mt-4 mb-4 gap-4">
          <ModalSelector
            data={languageData}
            initValue="Select Language"
            onChange={(option) => { setLanguage(option.value) }}
            cancelText="Cancel" // Customize cancel button text (optional)
            style={{ flex: 1 }} // Adjust styling as needed
            selectStyle={{ backgroundColor: '#3f3f46', borderWidth: 0, padding: 10, borderRadius: 8 }} // Style for the select/input button
            selectTextStyle={{ color: 'white', fontSize: 16 }} // Style for the text inside the select/input button
            optionStyle={{ backgroundColor: '#3f3f46', borderBottomWidth: 1, borderBottomColor: '#666' }} // Style for each option
            optionTextStyle={{ color: 'white', fontSize: 16 }} // Style for the text of each option
            cancelStyle={{ backgroundColor: '#fcbf49', padding: 10, borderRadius: 8 }} // Style for the cancel button
            cancelTextStyle={{ color: 'white', fontWeight: 'bold' }} // Style for the cancel button text
          />

          <TouchableOpacity
            onPress={translateDescription}
            className=" p-3 bg-amber-500 rounded-lg"
          >
            <Text className="text-white">
              {isTranslating ? 'Translating...' : 'Translate'}
            </Text>
          </TouchableOpacity>
        </View>

        <Animated.View
          entering={FadeInDown.delay(800).duration(500)}
          className="py-2 mt-0 mb-4 bg-zinc-800 pb-8 pt-4 px-2 rounded-xl border-2 border-zinc-700"
        >
          <Text className="text-white text-xl font-bold mb-4 py-2 px-2" style={{ color: '#AAA' }}>Share Your Experience With The Place</Text>
          <View className="flex-row justify-center items-center my-2">
            <TouchableOpacity
              style={{ width: 145 }}
              onPress={handleFeedbackUp}
              className={`p-2 rounded-lg mx-4 flex-row items-center justify-center ${overall === 'above' ? 'bg-blue-400' : 'bg-white'
                }`}
            >
              <Text className={`mr-2 text-sm font-bold ${overall === 'above' ? 'text-zinc-900' : 'text-zinc-800'}`}>Place is Amazing</Text>
              <Ionicons
                name={overall === 'above' ? 'thumbs-up' : 'thumbs-up-outline'}
                size={18}
                color={overall === 'above' ? '#18181b' : '#18181b'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{ width: 145 }}
              onPress={handleFeedbackDown}
              className={`p-2 rounded-lg mx-4 flex-row items-center justify-center ${overall === 'below' ? 'bg-red-400' : 'bg-white'
                }`}
            >

              <Ionicons
                name={overall === 'below' ? 'thumbs-down' : 'thumbs-down-outline'}
                size={18}
                color={overall === 'below' ? '#18181b' : '#18181b'}
              />
              <Text className={`ml-2 text-sm font-bold ${overall === 'below' ? 'text-zinc-900' : 'text-zinc-800'}`}>Below Expectations</Text>
            </TouchableOpacity>
          </View>

          {/* Feedback for Place is Expensive */}
          <View className="flex-row justify-center items-center my-2">
            <TouchableOpacity
              style={{ width: 145 }}
              onPress={handleFeedbackAffordable}
              className={`p-2 rounded-lg mx-4 flex-row items-center ${expense === 'cheap' ? 'bg-orange-400' : 'bg-white'
                }`}
            >
              <Text className={`mr-2 text-sm font-bold ${expense === 'cheap' ? 'text-zinc-900' : 'text-zinc-800'}`} >Cheaper than Expect</Text>
              <Ionicons
                name={expense === 'cheap' ? 'flame' : 'flame-outline'}
                size={18}
                color="#18181b"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{ width: 145 }}
              onPress={handleFeedbackExpensive}
              className={`p-2 rounded-lg mx-4 flex-row items-center justify-center ${expense === 'high' ? 'bg-yellow-400' : 'bg-white'
                }`}
            >
              <Ionicons
                name={expense === 'high' ? 'cash' : 'cash-outline'}
                size={18}
                color="#18181b"
              />
              <Text className={`ml-2 text-sm font-bold ${expense === 'high' ? 'text-zinc-900' : 'text-zinc-800'}`}>Place is Expensive</Text>
            </TouchableOpacity>
          </View>

          {/* Feedback for Place is Exhausting */}
          <View className="flex-row justify-center items-center my-2">

            <TouchableOpacity
              style={{ width: 145 }}
              onPress={handleFeedbackRelaxing}
              className={`p-2 rounded-lg mx-4 flex-row items-center justify-center ${comfort === 'comfortable' ? 'bg-green-400' : 'bg-white'
                }`}
            >

              <Text className={`mr-2 text-sm font-bold ${comfort === 'comfortable' ? 'text-zinc-900' : 'text-zinc-800'}`}>Place is Relaxing</Text>
              <Ionicons
                name={comfort === 'comfortable' ? 'leaf' : 'leaf-outline'}
                size={18}
                color="#18181b"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{ width: 145 }}
              onPress={handleFeedbackExhausting}
              className={`p-2 rounded-lg mx-4 flex-row items-center justify-center ${comfort === 'exhausting' ? 'bg-gray-400' : 'bg-white'
                }`}
            >
              <Ionicons
                name={comfort === 'exhausting' ? 'battery-dead' : 'battery-dead-outline'}
                size={18}
                color="#18181b"
              />
              <Text className={`ml-2 text-sm font-bold ${comfort === 'exhausting' ? 'text-zinc-900' : 'text-zinc-800'}`}>Place is Exhausting</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Explore More */}
        <Animated.View
          entering={FadeInDown.delay(800).duration(500)}
          className="py-2 mt-0 mb-4 bg-zinc-800 border-2 pb-8 pt-4 px-2 rounded-xl border-2 border-zinc-900 shadow-lg"
        >
          <Text className="text-white text-xl font-bold mb-4 py-2 px-2" style={{ color: '#AAA' }}>Explore More About The Place</Text>

          <View className="flex-row justify-center items-center my-2">

            <TouchableOpacity
              style={{ width: 145 }}
              onPress={handleClickOnTiktok}
              className="p-2 rounded-lg mx-4 flex-row items-center justify-center bg-black">
              <Ionicons
                name="logo-tiktok"
                size={18}
                color="white"
              />
              <Text className="ml-2 text-sm font-bold text-white">Explore on TikTok</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ width: 145 }}
              onPress={handleClickOnYoutube}
              className="p-2 rounded-lg mx-4 flex-row items-center justify-center bg-red-600">
              <Ionicons
                name="logo-youtube"
                size={18}
                color="white"
              />
              <Text className="ml-2 text-sm font-bold text-white">Explore on YouTube</Text>
            </TouchableOpacity>

          </View>
          <View className="flex-row justify-center items-center my-2">

            <TouchableOpacity
              style={{ width: 145 }}
              onPress={handleClickOnInstagram}
              className="p-2 rounded-lg mx-4 flex-row items-center justify-center bg-pink-600">
              <Ionicons
                name="logo-instagram"
                size={18}
                color="white"
              />
              <Text className="ml-2 text-sm font-bold text-white">Explore on Instagram</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ width: 145 }}
              onPress={handleClickOnPinterest}
              className="p-2 rounded-lg mx-4 flex-row items-center justify-center bg-red-400">
              <Ionicons
                name="logo-pinterest"
                size={18}
                color="white"
              />
              <Text className="ml-2 text-sm font-bold text-white">Explore on Pinterest</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
        <Animated.View
          entering={FadeInDown.delay(800).duration(500)}
          className="py-2 mt-0 mb-4 bg-zinc-800 border-2 pb-8 pt-4 rounded-xl border-2 border-zinc-900 shadow-lg"
        >
          <Text className="text-white text-xl font-bold mb-4 py-2 px-2 mx-4" style={{ color: '#AAA' }}>Nearby Places</Text>

          <NearbyCarousal mainPlaceId={id} />

        </Animated.View>
      </Animated.View>

    </ScrollView>
  );
};

export default PlaceDetails;

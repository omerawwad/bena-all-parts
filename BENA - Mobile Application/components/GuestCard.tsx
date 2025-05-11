import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';


interface GuestCardProps {
  guest: {
    status: string;
    users: {
      username: string;
    };
  };
}

const GuestCard: React.FC<GuestCardProps> = ({ guest }) => {
  const handleDelete = () => {
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
              } catch (err) {
                console.error('Error:', err);
              }
            },
          },
        ]
      );
    
  };

  return (
    <View className="flex-row items-center justify-between bg-zinc-900 pl-4 pr-1 rounded-lg mb-2">
      <View className='flex-row items-center gap-4'>
      <TouchableOpacity className={`py-2 rounded-full 
          ${guest.status === 'accepted' ? '' : ''}`}>
          <Ionicons
            name={guest.status === 'accepted' ? 'checkmark-done-outline' : 'time-outline'}
            size={15}
            color={guest.status === 'accepted' ? 'green' : 'gray'}
          />

        </TouchableOpacity>
        <Text className="text-zinc-400 font-semibold py-2">{guest.users.username}</Text>
      </View>
      <View >
        
        <TouchableOpacity onPress={handleDelete} className="py-1 bg-[#f87171] px-6 rounded-lg">
          <Ionicons name="close" size={14} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GuestCard;

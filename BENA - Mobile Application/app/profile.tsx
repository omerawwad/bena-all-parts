import { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Text } from '@/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useAuth } from '@/context/AuthProvider';
import * as ImagePicker from 'expo-image-picker';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useUser } from '@/hooks/useUser';
import { router } from 'expo-router';
import { updateUserProfile } from '@/utils/updateUserProfile'

const Profile = () => {
  const user = useAuthCheck()
  const { signOut } = useAuth();
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const { profile } = useUser(user!.id)
  const [username, setUsername] = useState(profile?.username || 'User');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || 'https://placehold.co/400x400/png');

  console.log(avatarUrl)

  const handleUsernameEdit = () => {
    if (isEditingUsername) {
      updateUserProfile({
        username,
        userId: user?.id
      });
    }
    setIsEditingUsername(!isEditingUsername);
  };

  const handleAvatarUpload = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to grant permission to access your photos to change your avatar.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const newAvatarUrl = result.assets[0].uri;
      setAvatarUrl(newAvatarUrl);
      updateUserProfile({
        avatar_url: newAvatarUrl,
        userId: user?.id
      });
    }
  };

  const handleChangePassword = () => {
    // TODO: Implement change password logic
    console.log('Change password');
  };

  const handleLogout = () => {
    signOut();
  };


  return (
    <SafeAreaView className="flex-1 bg-zinc-900">
      <StatusBar style="light" />
      <ScrollView className="flex-1">
        <LinearGradient
          colors={['#4c669f', '#3b5998', '#192f6a']}
          className="h-[30%] justify-center items-center"
        >
          <TouchableOpacity onPress={handleAvatarUpload}>
            <Animated.Image
              entering={FadeInDown.duration(800).springify()}
              source={{ uri: avatarUrl }}
              className="w-32 h-32 rounded-full border-4 border-white"
            />
            <BlurView intensity={20} className="absolute bottom-0 right-0 rounded-full p-2">
              <Ionicons name="camera" size={24} color="#fcbf49" />
            </BlurView>
          </TouchableOpacity>
        </LinearGradient>

        <Animated.View
          entering={FadeInUp.duration(800).springify()}
          className="flex-1 px-6 pt-6"
        >
          <View className="flex-row items-center justify-between mb-4">
            {isEditingUsername ? (
              <TextInput
                value={username}
                onChangeText={setUsername}
                className="text-2xl font-bold text-white flex-1 mr-2"
                autoFocus
              />
            ) : (
              <Text className="text-2xl font-bold text-white">{username}</Text>
            )}
            <TouchableOpacity onPress={handleUsernameEdit}>
              <BlurView intensity={20} className="rounded-full p-2">
                <Ionicons
                  name={isEditingUsername ? "checkmark" : "pencil"}
                  size={24}
                  color="#fcbf49"
                />
              </BlurView>
            </TouchableOpacity>
          </View>

          <View className="mb-6">
            <Text className="text-zinc-400 mb-1">Email</Text>
            <Text className="text-white text-lg">{user?.email}</Text>
          </View>

          <TouchableOpacity
            className="bg-zinc-800 py-3 px-4 rounded-lg mb-4 flex-row items-center justify-between"
            onPress={handleChangePassword}
          >
            <Text className="text-white font-semibold">Change Password</Text>
            <Ionicons name="chevron-forward" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-zinc-800 py-3 px-4 rounded-lg mb-4 flex-row items-center justify-between"
            onPress={() => router.push('/settings')}
          >
            <Text className="text-white font-semibold">Settings</Text>
            <Ionicons name="settings-outline" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-red-500 py-3 px-4 rounded-lg mb-4 flex-row items-center justify-center"
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="white" className="mr-2" />
            <Text className="text-white font-semibold">Logout</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;



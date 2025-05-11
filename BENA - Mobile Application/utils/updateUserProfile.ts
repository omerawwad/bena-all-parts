import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { decode } from "base64-arraybuffer";

// Define the type for the function parameters
interface UpdateUserProfileParams {
  username?: string;
  avatar_url?: string;
  userId: string | undefined;
}

// Define the return type of the function
interface UpdateUserProfileResult {
  success: boolean;
  error?: Error;
}

export const updateUserProfile = async ({
  username,
  avatar_url,
  userId,
}: UpdateUserProfileParams): Promise<UpdateUserProfileResult> => {
  try {
    // Only update the fields that are provided
    const updates: { username?: string; avatar_url?: string } = {};
    if (username) updates.username = username;

    if (avatar_url) {
      // If avatar_url is a local file URI, upload it first
      if (avatar_url.startsWith('file://')) {
        const fileName = `avatar_${userId}_${Date.now()}.jpg`;
        const filePath = `avatars/${fileName}`;

        // Read the file as a base64 string using expo-file-system
        const fileData = await FileSystem.readAsStringAsync(avatar_url, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const arrayBuffer = decode(fileData);

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, arrayBuffer, {
            upsert: true,
            contentType: "image/*",
          });

        if (uploadError) throw uploadError;

        // Get public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        updates.avatar_url = publicUrl;
      } else {
        updates.avatar_url = avatar_url;
      }
    }

    // Update the user profile
    const { error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (updateError) throw updateError;

    Alert.alert('Success', 'Profile updated successfully');
    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    Alert.alert('Error', 'Failed to update profile. Please try again.');
    return { success: false, error: error as Error };
  }
};

export default updateUserProfile;

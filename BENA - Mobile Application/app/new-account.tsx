import React, { useState } from 'react'
import { View, Text, Image, TouchableOpacity, KeyboardAvoidingView, Platform, TextInput, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '@/constants'
import FormField from '@/components/FormField'
import CustomButton from '@/components/CustomButton'
import { Link, router } from 'expo-router'
import { useAuth } from '@/context/AuthProvider'
import { Ionicons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { supabase } from '@/lib/supabase'

interface FormData {
  username: string
}

const NewAccount = () => {
  const { user, completedSignUp } = useAuth()
  if (!user) {
    router.replace('../index');
  }
  const [form, setForm] = useState<FormData>({
    username: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userNameAlreadyExists, setUserNameAlreadyExists] = useState(false)

  const validateForm = (): boolean => {
    if (!form.username) {
      Toast.show({
        type: 'error',
        text1: "Error",
        text2: 'Please fill in all fields'
      });
      return false
    }
    return true
  }

  const handleSignUp = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    if (user) {
      const { error: dbError } = await supabase
        .from('users')
        .update([{ username: form.username.trim() }])
        .eq('id', user.id);

      if (dbError) {
        console.log(dbError)
        setUserNameAlreadyExists(true);
        setIsSubmitting(false);
        return;
      }
      setUserNameAlreadyExists(true);
      // setCompletedSignUp();
      router.replace('/home');
    }

    setIsSubmitting(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-6 justify-center gap-6">
          <View className="flex-col items-center justify-center gap-6 ">
            {/* <Ionicons name="planet" size={40} color="#fcbf49" /> */}
            <Text className="text-gray-400 text-4xl font-bold text-center">
              Welcome, get ready to explore the world with us
            </Text>
          </View>
          <View className="flex-row bg-zinc-800 p-2 rounded-full items-center justify-between gap-2">
            <View className="h-16 px-4 rounded-full border-white  flex-1">
              <TextInput
                placeholder="Choose Your Username"
                value={form.username}
                onChangeText={(text) => setForm({ ...form, username: text })}
                className="flex-1 text-white font-psemibold text-base"
                placeholderTextColor="#a1a1aa"
                autoCapitalize='none'

              />
            </View>

            <TouchableOpacity onPress={handleSignUp} className="bg-amber-800 p-4 rounded-full">
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fcbf49" />
              ) : (
                <Ionicons name="arrow-forward" size={24} color="#fcbf49" />
              )}
            </TouchableOpacity>
          </View>
          {userNameAlreadyExists &&
            <View className="flex-row w-full items-center justify-center">
              <Text className="text-red-400 text-sm absolute ">Username already exists choose another one
              </Text>
            </View>}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default NewAccount



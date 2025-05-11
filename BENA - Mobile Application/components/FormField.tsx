import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import React from 'react'
import { Eye, EyeOff } from 'lucide-react-native'

type FormFieldProps = {
  title: string,
  value: string, // I could make this generic in the future
  placeholder?: string,
  handleChangeText: (e: string) => void,
  otherStyles?: string,
  isLoading?: boolean
  keyboardType?: string,
}

const FormField = ({ title, value, placeholder, handleChangeText, otherStyles, ...props }: FormFieldProps) => {
  const [showPassword, setshowPassword] = useState(false)
  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className="text-base text-gray-100 font-pmedium">{title}</Text>
      <View className="border-2 w-full h-16 px-4 rounded-2xl border-white focus:border-amber-800 items-center flex-row">
        <TextInput
          className="flex-1 text-white font-psemibold text-base"
          value={value}
          placeholder={placeholder}
          onChangeText={handleChangeText}
          secureTextEntry={title === 'Password' && !showPassword}
        />
        {title === 'Password' && (
          <TouchableOpacity onPress={() => { setshowPassword(!showPassword) }}>
            {showPassword ? <Eye color={'white'} /> : <EyeOff color={'white'} />}
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default FormField

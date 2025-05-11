import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '@/constants';
import CustomButton from '@/components/CustomButton';
import { Link, router } from 'expo-router';
import { useAuth } from '@/context/AuthProvider';
import { Ionicons } from '@expo/vector-icons';

interface FormData {
  email: string;
  password: string;
}

const SignIn = () => {
  const { signIn } = useAuth();
  const [form, setForm] = useState<FormData>({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [emailError, setEmailError] = useState<'valid' | 'empty' | 'wrong_format'>('valid');
  const [passwordError, setPasswordError] = useState<'valid' | 'empty' | 'wrong_format'>('valid');
  const [showPassword, setShowPassword] = useState(false);

  const passwordRules = [
    { regex: /.{8,}/, label: 'At least 8 characters' },
    { regex: /[A-Z]/, label: 'At least 1 uppercase letter' },
    { regex: /[a-z]/, label: 'At least 1 lowercase letter' },
    { regex: /\d/, label: 'At least 1 number' },
    { regex: /[@$!%*?&]/, label: 'At least 1 special character (@, $, !, %, *, ?, &)' },
  ];

  const validatePassword = (password: string) => {
    const errors = passwordRules
      .filter((rule) => !rule.regex.test(password))
      .map((rule) => rule.label);
    setPasswordErrors(errors);
    setPasswordStrength(((passwordRules.length - errors.length) / passwordRules.length) * 100);
  };

  const handlePasswordChange = (password: string) => {
    setForm({ ...form, password });
    validatePassword(password);
  };

  const validateForm = (): boolean => {
    if (!form.email && !form.password) {
      setEmailError('empty');
      setPasswordError('empty');
      return false;
    }
    if (!form.email) {
      setEmailError('empty');
      return false;
    }
    if (!form.password) {
      setPasswordError('empty');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setEmailError('wrong_format');
      return false;
    }
    if (passwordErrors.length > 0) {
      setPasswordError('empty');
      return false;
    }
    setEmailError('valid');
    setPasswordError('valid');
    return true;
  };

  const handleSignIn = async () => {
    console.log('signing in');
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      const { user } = await signIn({
        email: form.email.trim(),
        password: form.password,
      });
      if (user) {
        router.replace('/home');
      }
    } catch (error) {
      console.error('Sign In Failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} className='bg-zinc-900'>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <View className='flex-1 justify-center '>
          <View style={styles.header}>
            <Image source={images.logo} style={styles.logo} resizeMode="contain" />
            <Text style={styles.welcomeText}>
              <Text style={styles.welcomeHighlight}>Welcome to Bena</Text> – Plan, Explore, and Experience Like Never Before!
            </Text>
          </View>

          <TextInput
            style={[styles.input, { marginBottom: 16 }, emailError === 'empty' && styles.errorBorder, emailError === 'wrong_format' && styles.errorBorder]}
            placeholder="Email"
            placeholderTextColor="#A1A1AA"
            value={form.email}
            onChangeText={(e) => setForm({ ...form, email: e })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={[styles.passwordContainer, passwordError === 'empty' && styles.errorBorder]} className='flex-row items-center justify-between'>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Password"
              placeholderTextColor="#A1A1AA"
              value={form.password}
              onChangeText={handlePasswordChange}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={18}
                color="#A1A1AA"
              />
            </TouchableOpacity>

          </View>


          <TouchableOpacity>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>

          <CustomButton icon="log-in-outline" title="Start Exploring The World" handlePress={handleSignIn} isLoading={isSubmitting} />
          <Link href="/sign-up" style={styles.footer}>
            <Text style={styles.footerText}>
              Don't have an account?{' '}
              <Text style={styles.signUpText}>Sign Up</Text>
            </Text>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 96,
    height: 96,
  },
  welcomeText: {
    color: '#A1A1AA',
    textAlign: 'center',
    marginTop: 8,
  },
  welcomeHighlight: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#374151',
    color: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  errorBorder: {
    borderColor: '#EF9999',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    marginVertical: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  rule: {
    fontSize: 14,
    marginBottom: 4,
  },
  validRule: {
    color: '#ffffff',
  },
  invalidRule: {
    color: '#EF9999',
  },
  forgotPassword: {
    color: '#3B82F6',
    textAlign: 'right',
    marginBottom: 20,
    marginTop: 12,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    textAlign: 'center',
  },
  footerText: {
    color: '#9CA3AF',
  },
  signUpText: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 8,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: '#374151',
  },
  eyeIcon: { marginRight: 8, paddingHorizontal: 12 },
  submitButton: {
    marginTop: 16,
  }
});

export default SignIn;

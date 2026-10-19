import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function RegisterScreen({ onRegisterSuccess, onNavigateToLogin }) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = () => {
    setError('');
    if (!name.trim() || !username.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const newUser = {
        id: `user_${Date.now()}`,
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        avatar: null,
        about: 'Hey there! I am using PulseChat.',
        phone: '+91 98000 12345',
      };
      onRegisterSuccess && onRegisterSuccess(newUser);
    }, 800);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={onNavigateToLogin} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <View style={styles.logoCircle}>
              <Ionicons name="person-add" size={32} color="#111b21" />
            </View>
            <Text style={styles.brandTitle}>Create Account</Text>
            <Text style={styles.brandSubtitle}>Join PulseChat today</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {Boolean(error) && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color={COLORS.iconDefault} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Shamshad Khan"
                  placeholderTextColor={COLORS.textMuted}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>USERNAME</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="at-outline" size={20} color={COLORS.iconDefault} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. shamshad"
                  placeholderTextColor={COLORS.textMuted}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>EMAIL</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color={COLORS.iconDefault} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="name@example.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PASSWORD (MIN 6 CHARACTERS)</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.iconDefault} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.iconDefault}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.registerBtn}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#111b21" />
              ) : (
                <Text style={styles.registerBtnText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Login Link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={onNavigateToLogin}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    top: 4,
    left: 0,
    padding: 8,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.badgeGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  brandSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: COLORS.headerBackground,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b1c24',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  errorText: {
    color: '#ff8595',
    fontSize: 13,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#182229',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2a3942',
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  eyeBtn: {
    padding: 6,
  },
  registerBtn: {
    backgroundColor: COLORS.badgeGreen,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    elevation: 3,
  },
  registerBtnText: {
    color: '#111b21',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: COLORS.accentGreen,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

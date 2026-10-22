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
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { CURRENT_USER } from '../data/mockData';

export default function LoginScreen({
  onLoginSuccess,
  onNavigateToRegister,
  registeredUsers = [CURRENT_USER],
}) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    setError('');
    if (!identifier.trim() || !password) {
      setError('Please enter both email/username and password');
      return;
    }

    const trimmed = identifier.trim().toLowerCase();
    const matchedUser = (registeredUsers || []).find(
      (u) =>
        (u.email && u.email.toLowerCase() === trimmed) ||
        (u.username && u.username.toLowerCase() === trimmed) ||
        (u.name && u.name.toLowerCase() === trimmed)
    );

    if (matchedUser) {
      if (matchedUser.password && matchedUser.password !== password) {
        setError('Incorrect password. Please try again.');
        return;
      }

      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        onLoginSuccess && onLoginSuccess(matchedUser);
      }, 500);
      return;
    }

    // If logging in on a new device or across networks, log in smoothly with full profile
    const dynamicUser = {
      id: `user_${Date.now()}`,
      name: identifier.trim(),
      username: trimmed.replace(/[^a-z0-9_]/g, '') || `user_${Date.now()}`,
      email: trimmed.includes('@') ? trimmed : `${trimmed}@pulsechat.io`,
      password: password,
      avatar: null,
      about: 'Available on PulseChat',
      phone: '+91 98000 ' + Math.floor(10000 + Math.random() * 90000),
      isOnline: true,
    };

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess && onLoginSuccess(dynamicUser);
    }, 500);
  };

  const handleQuickDemo = () => {
    setIdentifier('user@pulsechat.com');
    setPassword('password123');
    onLoginSuccess && onLoginSuccess(CURRENT_USER);
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
          {/* Brand Header */}
          <View style={styles.brandContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="chatbubbles" size={38} color="#111b21" />
            </View>
            <Text style={styles.brandTitle}>PulseChat</Text>
            <Text style={styles.brandSubtitle}>Real-time messaging & calls</Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign In</Text>
            <Text style={styles.cardInstruction}>
              Enter your credentials to continue
            </Text>

            {Boolean(error) && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Email / Username Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>EMAIL OR USERNAME</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color={COLORS.iconDefault} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="name@example.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
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

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#111b21" />
              ) : (
                <Text style={styles.loginBtnText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Quick Demo Button */}
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={handleQuickDemo}
              activeOpacity={0.8}
            >
              <Ionicons name="flash" size={16} color={COLORS.accentGreen} style={{ marginRight: 6 }} />
              <Text style={styles.demoBtnText}>Quick Demo Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Register Link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={onNavigateToRegister}>
              <Text style={styles.registerLink}>Register</Text>
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
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.badgeGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 4,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.headerBackground,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  cardInstruction: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b1c24',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
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
    marginBottom: 16,
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
  loginBtn: {
    backgroundColor: COLORS.badgeGreen,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 12,
    elevation: 3,
  },
  loginBtnText: {
    color: '#111b21',
    fontSize: 16,
    fontWeight: 'bold',
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#103629',
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#00a88440',
  },
  demoBtnText: {
    color: COLORS.accentGreen,
    fontSize: 14,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  registerLink: {
    color: COLORS.accentGreen,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

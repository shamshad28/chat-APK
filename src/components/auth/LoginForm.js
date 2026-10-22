import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { CURRENT_USER } from '../../data/mockData';

export default function LoginForm({ onSubmit, onNavigateToRegister, initialIdentifier = 'user@pulsechat.com' }) {
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [password, setPassword] = useState('password123');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    setError('');
    if (!identifier.trim() || !password) {
      setError('Please enter both your email/username and password');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSubmit && onSubmit(CURRENT_USER);
    }, 700);
  };

  const handleQuickDemo = () => {
    setIdentifier('user@pulsechat.com');
    setPassword('password123');
    onSubmit && onSubmit(CURRENT_USER);
  };

  return (
    <View style={styles.formContainer}>
      {/* Error Banner */}
      {Boolean(error) && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={18} color="#ef4444" style={{ marginRight: 8 }} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Email / Username Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>EMAIL OR USERNAME</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={18} color={COLORS.iconDefault} style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="e.g. user@pulsechat.com"
            placeholderTextColor={COLORS.textMuted}
            value={identifier}
            onChangeText={(txt) => {
              setIdentifier(txt);
              if (error) setError('');
            }}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
      </View>

      {/* Password Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>PASSWORD</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={18} color={COLORS.iconDefault} style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Enter password"
            placeholderTextColor={COLORS.textMuted}
            value={password}
            onChangeText={(txt) => {
              setPassword(txt);
              if (error) setError('');
            }}
            secureTextEntry={!isPasswordVisible}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.eyeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={19}
              color={COLORS.iconDefault}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sign In Button */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleLogin}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#111b21" size="small" />
        ) : (
          <Text style={styles.primaryButtonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      {/* Quick 1-Tap Demo Button */}
      <TouchableOpacity
        style={styles.demoButton}
        onPress={handleQuickDemo}
        activeOpacity={0.8}
      >
        <Ionicons name="flash" size={15} color={COLORS.badgeGreen} style={{ marginRight: 6 }} />
        <Text style={styles.demoButtonText}>Quick Demo Sign In</Text>
      </TouchableOpacity>

      {/* Footer Switch to Register */}
      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={onNavigateToRegister}>
          <Text style={styles.footerLink}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 7,
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202c33',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a3942',
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14.5,
  },
  eyeBtn: {
    padding: 4,
  },
  primaryButton: {
    backgroundColor: COLORS.badgeGreen,
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: COLORS.badgeGreen,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#111b21',
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 168, 132, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 168, 132, 0.3)',
    borderRadius: 12,
    height: 44,
    marginTop: 12,
  },
  demoButtonText: {
    color: COLORS.badgeGreen,
    fontSize: 14,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 13.5,
    color: COLORS.textSecondary,
  },
  footerLink: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.badgeGreen,
  },
});

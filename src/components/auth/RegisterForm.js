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

export default function RegisterForm({ onSubmit, onNavigateToLogin }) {
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
        about: '',
        phone: '+91 98765 43210',
      };
      onSubmit && onSubmit(newUser);
    }, 700);
  };

  return (
    <View style={styles.formContainer}>
      {/* Error Alert */}
      {Boolean(error) && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={18} color="#ef4444" style={{ marginRight: 8 }} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Full Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>FULL NAME</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={18} color={COLORS.iconDefault} style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Shamshad Khan"
            placeholderTextColor={COLORS.textMuted}
            value={name}
            onChangeText={(txt) => {
              setName(txt);
              if (error) setError('');
            }}
          />
        </View>
      </View>

      {/* Username */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>USERNAME</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="at" size={18} color={COLORS.iconDefault} style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="e.g. shamshad"
            placeholderTextColor={COLORS.textMuted}
            value={username}
            onChangeText={(txt) => {
              setUsername(txt.toLowerCase().replace(/[^a-z0-9_]/g, ''));
              if (error) setError('');
            }}
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Email */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>EMAIL ADDRESS</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={18} color={COLORS.iconDefault} style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="e.g. name@domain.com"
            placeholderTextColor={COLORS.textMuted}
            value={email}
            onChangeText={(txt) => {
              setEmail(txt);
              if (error) setError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Password */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>PASSWORD (MIN 6 CHARACTERS)</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={18} color={COLORS.iconDefault} style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Choose password"
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
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={19}
              color={COLORS.iconDefault}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Create Account Button */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleRegister}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#111b21" size="small" />
        ) : (
          <Text style={styles.primaryButtonText}>Create Account</Text>
        )}
      </TouchableOpacity>

      {/* Footer Switch to Login */}
      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={onNavigateToLogin}>
          <Text style={styles.footerLink}>Sign in</Text>
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
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
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
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
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
    marginTop: 10,
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
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

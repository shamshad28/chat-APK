import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import storageService from '../../services/storageService';
import { useTheme } from '../../context/ThemeContext';

export default function AccountSettingsModal({
  visible,
  onClose,
  currentUser,
  onLogout,
  onUpdateUser,
}) {
  const { isLight } = useTheme();
  const [securityNotifs, setSecurityNotifs] = useState(true);
  const [twoStepEnabled, setTwoStepEnabled] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phone || '+1 (555) 019-2834');
  const [passkeysEnabled, setPasskeysEnabled] = useState(true);

  useEffect(() => {
    (async () => {
      const saved = await storageService.getSettings();
      if (saved?.account) {
        if (saved.account.securityNotifs !== undefined) setSecurityNotifs(saved.account.securityNotifs);
        if (saved.account.twoStepEnabled !== undefined) setTwoStepEnabled(saved.account.twoStepEnabled);
        if (saved.account.passkeysEnabled !== undefined) setPasskeysEnabled(saved.account.passkeysEnabled);
        if (saved.account.phoneNumber) setPhoneNumber(saved.account.phoneNumber);
      }
    })();
  }, [visible]);

  const handleSaveSettings = async () => {
    const existing = (await storageService.getSettings()) || {};
    const account = {
      securityNotifs,
      twoStepEnabled,
      passkeysEnabled,
      phoneNumber,
    };
    await storageService.saveSettings({ ...existing, account });
    if (onUpdateUser) {
      await onUpdateUser({ phone: phoneNumber });
    }
    Alert.alert('Account Settings Saved', 'Your account security preferences have been updated.');
    onClose();
  };

  const handleToggleTwoStep = () => {
    if (!twoStepEnabled) {
      Alert.prompt
        ? Alert.prompt(
            'Two-Step Verification PIN',
            'Enter a 6-digit PIN you will be asked for when registering your phone number again:',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Enable PIN',
                onPress: (pin) => {
                  if (pin && pin.length >= 4) {
                    setTwoStepEnabled(true);
                    Alert.alert('PIN Enabled', 'Two-step verification is now active.');
                  } else {
                    Alert.alert('Invalid PIN', 'Please enter at least 4 digits.');
                  }
                },
              },
            ],
            'secure-text'
          )
        : Alert.alert(
            'Two-Step Verification',
            'Enable 6-digit PIN protection for your account?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Enable',
                onPress: () => {
                  setTwoStepEnabled(true);
                  Alert.alert('PIN Enabled', 'Two-step verification has been enabled.');
                },
              },
            ]
          );
    } else {
      Alert.alert(
        'Disable Two-Step Verification',
        'Are you sure you want to disable two-step verification PIN?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: () => setTwoStepEnabled(false),
          },
        ]
      );
    }
  };

  const handleRequestInfo = () => {
    Alert.alert(
      'Request Account Info',
      'A report of your PulseChat account information and settings will be ready in approximately 3 business days. You will receive a notification when it is ready to download.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Report',
          onPress: () => {
            Alert.alert('Request Submitted', 'Your account report request (REF #PULSE-REP-882) has been sent.');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete This Account?',
      'WARNING: Deleting your account will:\n• Delete your account info & profile\n• Erase all message history\n• Remove you from all groups\n\nThis action is permanent and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            await storageService.setCurrentUser(null);
            Alert.alert('Account Deleted', 'Your account has been successfully removed.');
            onClose();
            if (onLogout) onLogout();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, isLight && styles.containerLight]}>
        {/* Ambient Glows */}
        <View style={styles.ambientGlowTop} pointerEvents="none" />

        {/* Header */}
        <View style={[styles.glassHeader, isLight && styles.glassHeaderLight]}>
          <TouchableOpacity onPress={onClose} style={[styles.glassBackBtn, isLight && styles.glassBackBtnLight]} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={isLight ? "#ffffff" : "#e9edef"} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerTitle, isLight && { color: '#ffffff' }]}>Account</Text>
            <Text style={[styles.headerSubtitle, isLight && { color: '#e7fed8' }]}>Security, number & verification</Text>
          </View>
          <View style={[styles.keyBadge, isLight && { backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.4)' }]}>
            <Ionicons name="key-outline" size={18} color={isLight ? "#ffffff" : COLORS.accentGreen} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Security Notifications Card */}
          <View style={styles.glassRowCard}>
            <View style={styles.settingInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.accentGreen} style={{ marginRight: 8 }} />
                <Text style={styles.rowTitle}>Security notifications</Text>
              </View>
              <Text style={styles.rowSubtitle}>
                Get notified when your security code changes for an end-to-end encrypted chat.
              </Text>
            </View>
            <Switch
              value={securityNotifs}
              onValueChange={setSecurityNotifs}
              thumbColor={securityNotifs ? COLORS.accentGreen : '#8696a0'}
              trackColor={{ false: '#2a3942', true: 'rgba(0, 168, 132, 0.45)' }}
            />
          </View>

          {/* Passkeys Card */}
          <View style={styles.glassRowCard}>
            <View style={styles.settingInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <Ionicons name="finger-print-outline" size={18} color="#38bdf8" style={{ marginRight: 8 }} />
                <Text style={styles.rowTitle}>Passkeys for simple login</Text>
              </View>
              <Text style={styles.rowSubtitle}>
                Use your device lock, fingerprint, or face recognition to sign in safely without a password.
              </Text>
            </View>
            <Switch
              value={passkeysEnabled}
              onValueChange={setPasskeysEnabled}
              thumbColor={passkeysEnabled ? COLORS.accentGreen : '#8696a0'}
              trackColor={{ false: '#2a3942', true: 'rgba(0, 168, 132, 0.45)' }}
            />
          </View>

          {/* Two-Step Verification Card */}
          <TouchableOpacity
            style={styles.glassActionCard}
            onPress={handleToggleTwoStep}
            activeOpacity={0.75}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.iconPill, { backgroundColor: twoStepEnabled ? 'rgba(0, 168, 132, 0.15)' : 'rgba(255, 255, 255, 0.05)' }]}>
                <Ionicons name="lock-closed-outline" size={18} color={twoStepEnabled ? COLORS.accentGreen : '#8696a0'} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.rowTitle}>Two-step verification</Text>
                <Text style={[styles.rowSubtitle, { color: twoStepEnabled ? COLORS.accentGreen : '#8696a0' }]}>
                  {twoStepEnabled ? 'Enabled with PIN protection' : 'Disabled (Tap to setup PIN)'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8696a0" />
          </TouchableOpacity>

          {/* Change Phone Number Card */}
          <View style={styles.glassInputCard}>
            <View style={styles.actionLeft}>
              <View style={[styles.iconPill, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
                <Ionicons name="call-outline" size={18} color="#c084fc" />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.rowTitle}>Change Phone Number</Text>
                {isEditingPhone ? (
                  <View style={styles.inlineEditRow}>
                    <TextInput
                      style={styles.phoneInput}
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      placeholder="+1 (555) 000-0000"
                      placeholderTextColor="#8696a0"
                      keyboardType="phone-pad"
                    />
                    <TouchableOpacity
                      style={styles.savePhoneBtn}
                      onPress={() => setIsEditingPhone(false)}
                    >
                      <Ionicons name="checkmark" size={16} color="#0b141a" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={styles.rowSubtitle}>{phoneNumber || 'No phone set'}</Text>
                    <TouchableOpacity onPress={() => setIsEditingPhone(true)}>
                      <Text style={styles.editLinkText}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Request Account Info */}
          <TouchableOpacity
            style={styles.glassActionCard}
            onPress={handleRequestInfo}
            activeOpacity={0.75}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.iconPill, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
                <Ionicons name="document-text-outline" size={18} color="#38bdf8" />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.rowTitle}>Request account info</Text>
                <Text style={styles.rowSubtitle}>Download report of your settings and data</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8696a0" />
          </TouchableOpacity>

          {/* Delete My Account */}
          <TouchableOpacity
            style={[styles.glassActionCard, { borderColor: 'rgba(239, 68, 68, 0.25)', marginTop: 8 }]}
            onPress={handleDeleteAccount}
            activeOpacity={0.75}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.iconPill, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.rowTitle, { color: '#ef4444' }]}>Delete my account</Text>
                <Text style={styles.rowSubtitle}>Permanently remove all chats & data</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#ef4444" />
          </TouchableOpacity>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.glassFooter, isLight && styles.glassFooterLight]}>
          <TouchableOpacity
            style={styles.saveGlassBtn}
            onPress={handleSaveSettings}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-done" size={20} color="#0b141a" style={{ marginRight: 8 }} />
            <Text style={styles.saveBtnText}>Save Account Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070d10',
    position: 'relative',
  },
  containerLight: {
    backgroundColor: '#f0f2f5',
  },
  glassHeaderLight: {
    backgroundColor: '#008069',
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  glassBackBtnLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  glassCardLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e9edef',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  glassFooterLight: {
    backgroundColor: '#ffffff',
    borderTopColor: '#e9edef',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  ambientGlowTop: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(0, 168, 132, 0.1)',
    ...(Platform.OS === 'web' ? { filter: 'blur(70px)' } : {}),
  },
  glassHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 14,
    backgroundColor: 'rgba(17, 27, 33, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(16px)' } : {}),
  },
  glassBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e9edef',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#8696a0',
    marginTop: 1,
  },
  keyBadge: {
    marginLeft: 'auto',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 168, 132, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 168, 132, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  glassRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(20, 31, 38, 0.72)',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(12px)' } : {}),
  },
  glassActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(20, 31, 38, 0.72)',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(12px)' } : {}),
  },
  glassInputCard: {
    backgroundColor: 'rgba(20, 31, 38, 0.72)',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(12px)' } : {}),
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconPill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    paddingRight: 14,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e9edef',
  },
  rowSubtitle: {
    fontSize: 11.5,
    color: '#8696a0',
    marginTop: 2,
    lineHeight: 16,
  },
  editLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accentGreen,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  inlineEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    color: '#e9edef',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  savePhoneBtn: {
    backgroundColor: COLORS.accentGreen,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassFooter: {
    padding: 16,
    backgroundColor: 'rgba(17, 27, 33, 0.85)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(16px)' } : {}),
  },
  saveGlassBtn: {
    backgroundColor: COLORS.accentGreen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: COLORS.accentGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#070d10',
    letterSpacing: 0.3,
  },
});

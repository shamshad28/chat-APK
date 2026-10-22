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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import storageService from '../../services/storageService';
import { useTheme } from '../../context/ThemeContext';

export default function PrivacySettingsModal({ visible, onClose }) {
  const { isLight } = useTheme();
  const [lastSeen, setLastSeen] = useState('Everyone');
  const [profilePhoto, setProfilePhoto] = useState('Everyone');
  const [about, setAbout] = useState('Everyone');
  const [readReceipts, setReadReceipts] = useState(true);
  const [disappearingTimer, setDisappearingTimer] = useState('Off');
  const [screenLock, setScreenLock] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await storageService.getSettings();
      if (saved?.privacy) {
        if (saved.privacy.lastSeen) setLastSeen(saved.privacy.lastSeen);
        if (saved.privacy.profilePhoto) setProfilePhoto(saved.privacy.profilePhoto);
        if (saved.privacy.about) setAbout(saved.privacy.about);
        if (saved.privacy.readReceipts !== undefined) setReadReceipts(saved.privacy.readReceipts);
        if (saved.privacy.disappearingTimer) setDisappearingTimer(saved.privacy.disappearingTimer);
        if (saved.privacy.screenLock !== undefined) setScreenLock(saved.privacy.screenLock);
      }
    })();
  }, [visible]);

  const handleSave = async () => {
    const existing = (await storageService.getSettings()) || {};
    const privacy = {
      lastSeen,
      profilePhoto,
      about,
      readReceipts,
      disappearingTimer,
      screenLock,
    };
    await storageService.saveSettings({ ...existing, privacy });
    Alert.alert('Privacy Updated ✨', 'Your privacy preferences have been securely saved.');
    onClose();
  };

  const AUDIENCE_OPTIONS = ['Everyone', 'My contacts', 'Nobody'];
  const TIMER_OPTIONS = ['Off', '24 hours', '7 days', '90 days'];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, isLight && styles.containerLight]}>
        {/* Glassmorphic Ambient Background Glow Orbs */}
        <View style={styles.ambientGlowTop} pointerEvents="none" />
        <View style={styles.ambientGlowBottom} pointerEvents="none" />

        {/* Frosted Header */}
        <View style={[styles.glassHeader, isLight && styles.glassHeaderLight]}>
          <TouchableOpacity onPress={onClose} style={[styles.glassBackBtn, isLight && styles.glassBackBtnLight]} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={isLight ? "#ffffff" : "#e9edef"} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerTitle, isLight && { color: '#ffffff' }]}>Privacy & Security</Text>
            <Text style={[styles.headerSubtitle, isLight && { color: '#e7fed8' }]}>End-to-end encrypted controls</Text>
          </View>
          <View style={[styles.shieldBadge, isLight && { backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.4)' }]}>
            <Ionicons name="shield-checkmark" size={18} color={isLight ? "#ffffff" : COLORS.accentGreen} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Privacy Banner Pill */}
          <View style={styles.glassBanner}>
            <Ionicons name="lock-closed" size={16} color={COLORS.accentGreen} style={{ marginRight: 8 }} />
            <Text style={styles.glassBannerText}>
              Your chats, media, and status updates are protected by 256-bit encryption.
            </Text>
          </View>

          {/* Section: Who can see my personal info */}
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="eye-outline" size={15} color={COLORS.accentGreen} />
            <Text style={styles.sectionHeader}>Who can see my personal info</Text>
          </View>

          {/* Last Seen & Online Card */}
          <View style={styles.glassCard}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconPill, { backgroundColor: 'rgba(0, 168, 132, 0.15)' }]}>
                <Ionicons name="time-outline" size={18} color={COLORS.accentGreen} />
              </View>
              <View style={styles.cardHeaderTextGroup}>
                <Text style={styles.cardTitle}>Last seen and online</Text>
                <Text style={styles.cardSubtitle}>Controls when others see you active</Text>
              </View>
            </View>
            <View style={styles.chipsRow}>
              {AUDIENCE_OPTIONS.map((opt) => {
                const isSelected = lastSeen === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.glassChip, isSelected && styles.glassChipActive]}
                    onPress={() => setLastSeen(opt)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Profile Photo Visibility */}
          <View style={styles.glassCard}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconPill, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
                <Ionicons name="person-circle-outline" size={18} color="#38bdf8" />
              </View>
              <View style={styles.cardHeaderTextGroup}>
                <Text style={styles.cardTitle}>Profile photo</Text>
                <Text style={styles.cardSubtitle}>Who can view your avatar picture</Text>
              </View>
            </View>
            <View style={styles.chipsRow}>
              {AUDIENCE_OPTIONS.map((opt) => {
                const isSelected = profilePhoto === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.glassChip, isSelected && styles.glassChipActive]}
                    onPress={() => setProfilePhoto(opt)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* About Visibility */}
          <View style={styles.glassCard}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconPill, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
                <Ionicons name="information-circle-outline" size={18} color="#c084fc" />
              </View>
              <View style={styles.cardHeaderTextGroup}>
                <Text style={styles.cardTitle}>About bio</Text>
                <Text style={styles.cardSubtitle}>Who can read your bio and status</Text>
              </View>
            </View>
            <View style={styles.chipsRow}>
              {AUDIENCE_OPTIONS.map((opt) => {
                const isSelected = about === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.glassChip, isSelected && styles.glassChipActive]}
                    onPress={() => setAbout(opt)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Section: Messaging & Security */}
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="shield-outline" size={15} color={COLORS.accentGreen} />
            <Text style={styles.sectionHeader}>Messaging & Security</Text>
          </View>

          {/* Read Receipts Switch */}
          <View style={styles.glassRowCard}>
            <View style={styles.settingInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <Ionicons name="checkmark-done" size={18} color={readReceipts ? COLORS.blueTicks : '#8696a0'} style={{ marginRight: 8 }} />
                <Text style={styles.rowTitle}>Read receipts</Text>
              </View>
              <Text style={styles.rowSubtitle}>
                Show blue checkmarks when messages are read. If turned off, you won't send or receive read receipts.
              </Text>
            </View>
            <Switch
              value={readReceipts}
              onValueChange={setReadReceipts}
              thumbColor={readReceipts ? COLORS.accentGreen : '#8696a0'}
              trackColor={{ false: '#2a3942', true: 'rgba(0, 168, 132, 0.45)' }}
            />
          </View>

          {/* Disappearing Messages Card */}
          <View style={styles.glassCard}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconPill, { backgroundColor: 'rgba(234, 179, 8, 0.15)' }]}>
                <Ionicons name="hourglass-outline" size={18} color="#eab308" />
              </View>
              <View style={styles.cardHeaderTextGroup}>
                <Text style={styles.cardTitle}>Default message timer</Text>
                <Text style={styles.cardSubtitle}>Start new chats with disappearing messages</Text>
              </View>
            </View>
            <View style={styles.chipsRow}>
              {TIMER_OPTIONS.map((t) => {
                const isSelected = disappearingTimer === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[styles.glassChip, isSelected && styles.glassChipActive]}
                    onPress={() => setDisappearingTimer(t)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* App Security / Biometrics */}
          <View style={styles.glassRowCard}>
            <View style={styles.settingInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <Ionicons name="finger-print-outline" size={18} color={screenLock ? COLORS.accentGreen : '#8696a0'} style={{ marginRight: 8 }} />
                <Text style={styles.rowTitle}>Fingerprint & Face Lock</Text>
              </View>
              <Text style={styles.rowSubtitle}>
                Require biometric verification or device passcode to unlock PulseChat.
              </Text>
            </View>
            <Switch
              value={screenLock}
              onValueChange={setScreenLock}
              thumbColor={screenLock ? COLORS.accentGreen : '#8696a0'}
              trackColor={{ false: '#2a3942', true: 'rgba(0, 168, 132, 0.45)' }}
            />
          </View>

          {/* Blocked Contacts */}
          <TouchableOpacity
            style={styles.glassActionCard}
            onPress={() => Alert.alert('Blocked Contacts', 'You currently have 0 blocked contacts.')}
            activeOpacity={0.75}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.iconPill, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <Ionicons name="ban-outline" size={18} color="#ef4444" />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.rowTitle}>Blocked contacts</Text>
                <Text style={styles.rowSubtitle}>0 contacts blocked</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8696a0" />
          </TouchableOpacity>
        </ScrollView>

        {/* Frosted Glass Footer */}
        <View style={[styles.glassFooter, isLight && styles.glassFooterLight]}>
          <TouchableOpacity
            style={styles.saveGlassBtn}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-done" size={20} color="#0b141a" style={{ marginRight: 8 }} />
            <Text style={styles.saveBtnText}>Save Privacy Settings</Text>
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
  glassChipLight: {
    backgroundColor: '#f0f2f5',
    borderColor: '#e9edef',
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
    left: -40,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(0, 168, 132, 0.12)',
    ...(Platform.OS === 'web' ? { filter: 'blur(70px)' } : {}),
  },
  ambientGlowBottom: {
    position: 'absolute',
    bottom: -60,
    right: -40,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(14, 165, 233, 0.09)',
    ...(Platform.OS === 'web' ? { filter: 'blur(80px)' } : {}),
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
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#8696a0',
    marginTop: 1,
  },
  shieldBadge: {
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
  glassBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 168, 132, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 168, 132, 0.25)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  glassBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#aebac1',
    lineHeight: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 10,
    gap: 6,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accentGreen,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  glassCard: {
    backgroundColor: 'rgba(20, 31, 38, 0.72)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(12px)' } : {}),
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconPill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeaderTextGroup: {
    marginLeft: 12,
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e9edef',
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#8696a0',
    marginTop: 1,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  glassChip: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  glassChipActive: {
    backgroundColor: 'rgba(0, 168, 132, 0.18)',
    borderColor: COLORS.accentGreen,
    shadowColor: COLORS.accentGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  chipText: {
    fontSize: 12,
    color: '#8696a0',
    fontWeight: '500',
  },
  chipTextActive: {
    color: COLORS.accentGreen,
    fontWeight: '700',
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
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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

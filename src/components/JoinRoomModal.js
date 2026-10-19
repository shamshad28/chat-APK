import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function JoinRoomModal({
  visible,
  onClose,
  onJoinSuccess,
  onOpenScanner,
}) {
  const [inviteCode, setInviteCode] = useState('');

  if (!visible) return null;

  const handleJoin = (codeToJoin) => {
    const code = (codeToJoin || inviteCode).trim();
    if (!code) {
      Alert.alert('Invite Code Required', 'Please enter a valid room code or invite link.');
      return;
    }

    // Clean code if link format
    const cleanedCode = code.replace(/^https?:\/\/[^/]+\/join\//i, '').replace(/[^a-zA-Z0-9_-]/g, '');

    Alert.alert(
      'Joining Room 🚀',
      `Connecting to room: #${cleanedCode || code}...`,
      [
        {
          text: 'Proceed',
          onPress: () => {
            onClose();
            onJoinSuccess && onJoinSuccess(cleanedCode || code);
          },
        },
      ]
    );
  };

  const QUICK_ROOMS = [
    {
      id: 'room_priya',
      code: 'priya_mali_direct',
      name: 'Priya Mali (Direct Room)',
      desc: 'Instant 1-on-1 WebRTC & Chat room',
      icon: 'person',
      color: '#00a884',
    },
    {
      id: 'room_llm',
      code: 'pulse_llm_ai',
      name: 'Pulse LLM AI Assistant',
      desc: 'Multimodal AI knowledge & code chat',
      icon: 'sparkles',
      color: '#a855f7',
    },
    {
      id: 'room_devs',
      code: 'webrtc_dev_group',
      name: 'React Native & WebRTC Devs',
      desc: 'Realtime collaborative group room',
      icon: 'people',
      color: '#38bdf8',
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Join via Code or Link</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Hero Banner */}
          <View style={styles.heroBanner}>
            <View style={styles.heroIconCircle}>
              <Ionicons name="link" size={32} color={COLORS.accentGreen} />
            </View>
            <Text style={styles.heroTitle}>Connect to Any Room</Text>
            <Text style={styles.heroSubtitle}>
              Enter an invite code, paste a join link, or scan a QR code to join an active room or call.
            </Text>
          </View>

          {/* Code Input Card */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>INVITE CODE OR LINK</Text>
            <View style={styles.inputRow}>
              <Ionicons name="key-outline" size={20} color={COLORS.iconDefault} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. pulse.chat/join/room123 or ABC-99"
                placeholderTextColor={COLORS.textMuted}
                value={inviteCode}
                onChangeText={setInviteCode}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {Boolean(inviteCode) && (
                <TouchableOpacity onPress={() => setInviteCode('')} style={styles.clearBtn}>
                  <Ionicons name="close-circle" size={18} color={COLORS.iconDefault} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[styles.joinBtn, !inviteCode.trim() && styles.joinBtnDisabled]}
              onPress={() => handleJoin()}
              disabled={!inviteCode.trim()}
              activeOpacity={0.8}
            >
              <Ionicons name="enter-outline" size={20} color="#0b141a" style={{ marginRight: 8 }} />
              <Text style={styles.joinBtnText}>Join Room</Text>
            </TouchableOpacity>
          </View>

          {/* QR Scanner Shortcut */}
          <TouchableOpacity
            style={styles.scannerCard}
            onPress={() => {
              onClose();
              onOpenScanner && onOpenScanner();
            }}
            activeOpacity={0.75}
          >
            <View style={styles.scannerIconCircle}>
              <Ionicons name="qr-code-outline" size={24} color={COLORS.accentGreen} />
            </View>
            <View style={styles.scannerTextWrap}>
              <Text style={styles.scannerTitle}>Scan QR Code to Join</Text>
              <Text style={styles.scannerSubtitle}>Point your camera at a friend's QR code</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.iconDefault} />
          </TouchableOpacity>

          {/* Quick Join Public Rooms */}
          <View style={styles.quickRoomsSection}>
            <Text style={styles.sectionHeading}>QUICK JOIN SUGGESTIONS</Text>

            {QUICK_ROOMS.map((room) => (
              <TouchableOpacity
                key={room.id}
                style={styles.quickRoomItem}
                onPress={() => handleJoin(room.code)}
                activeOpacity={0.7}
              >
                <View style={[styles.quickRoomIcon, { backgroundColor: `${room.color}20` }]}>
                  <Ionicons name={room.icon} size={22} color={room.color} />
                </View>
                <View style={styles.quickRoomDetails}>
                  <Text style={styles.quickRoomName}>{room.name}</Text>
                  <Text style={styles.quickRoomDesc}>{room.desc}</Text>
                  <Text style={styles.quickRoomCode}>#{room.code}</Text>
                </View>
                <View style={styles.quickJoinBadge}>
                  <Text style={styles.quickJoinBadgeText}>Join</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: COLORS.headerBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heroBanner: {
    alignItems: 'center',
    marginBottom: 24,
  },
  heroIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(0, 168, 132, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 168, 132, 0.3)',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  inputCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accentGreen,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.searchBarBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: 48,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  clearBtn: {
    padding: 6,
  },
  joinBtn: {
    backgroundColor: COLORS.accentGreen,
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinBtnDisabled: {
    opacity: 0.45,
  },
  joinBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0b141a',
  },
  scannerCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  scannerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 168, 132, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  scannerTextWrap: {
    flex: 1,
  },
  scannerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  scannerSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  quickRoomsSection: {
    marginTop: 4,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  quickRoomItem: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickRoomIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quickRoomDetails: {
    flex: 1,
  },
  quickRoomName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  quickRoomDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  quickRoomCode: {
    fontSize: 11,
    color: COLORS.accentGreen,
    fontWeight: '500',
    marginTop: 2,
  },
  quickJoinBadge: {
    backgroundColor: 'rgba(0, 168, 132, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 168, 132, 0.3)',
  },
  quickJoinBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accentGreen,
  },
});

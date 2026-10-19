import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  Feather,
} from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { CURRENT_USER } from '../data/mockData';
import QRCodeModal from '../components/profile/QRCodeModal';

export default function SettingsScreen({
  onOpenProfile,
  onLogout,
  onOpenCreateGroup,
  isSocketConnected = false,
  socketUrl = 'http://localhost:5000',
  onUpdateSocketUrl,
}) {
  const [isServerModalVisible, setIsServerModalVisible] = useState(false);
  const [isQrModalVisible, setIsQrModalVisible] = useState(false);
  const [tempUrl, setTempUrl] = useState(socketUrl);
  const settingsOptions = [
    {
      id: 'account',
      title: 'Account',
      subtitle: 'Security notifications, change number',
      icon: 'key-outline',
      iconFamily: 'Ionicons',
    },
    {
      id: 'profile',
      title: 'Profile & Status',
      subtitle: 'Edit name, username, bio, and phone',
      icon: 'person-outline',
      iconFamily: 'Ionicons',
      onPress: onOpenProfile,
    },
    {
      id: 'server_network',
      title: 'Socket.IO & WebRTC Server',
      subtitle: `${isSocketConnected ? '🟢 Connected' : '🔴 Disconnected'} • ${socketUrl}`,
      icon: 'radio-outline',
      iconFamily: 'Ionicons',
      onPress: () => {
        setTempUrl(socketUrl);
        setIsServerModalVisible(true);
      },
    },
    {
      id: 'new_group',
      title: 'New Group',
      subtitle: 'Create group with participants and subject',
      icon: 'people-outline',
      iconFamily: 'Ionicons',
      onPress: onOpenCreateGroup,
    },
    {
      id: 'privacy',
      title: 'Privacy',
      subtitle: 'Block contacts, disappearing messages',
      icon: 'lock-closed-outline',
      iconFamily: 'Ionicons',
    },
    {
      id: 'avatar',
      title: 'Avatar',
      subtitle: 'Create, edit, profile photo',
      icon: 'happy-outline',
      iconFamily: 'Ionicons',
    },
    {
      id: 'chats',
      title: 'Chats',
      subtitle: 'Theme, wallpapers, chat history',
      icon: 'chatbox-ellipses-outline',
      iconFamily: 'Ionicons',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Message, group & call tones',
      icon: 'notifications-outline',
      iconFamily: 'Ionicons',
    },
    {
      id: 'storage',
      title: 'Storage and Data',
      subtitle: 'Network usage, auto-download',
      icon: 'pie-chart-outline',
      iconFamily: 'Ionicons',
    },
    {
      id: 'help',
      title: 'Help',
      subtitle: 'Help center, contact us, privacy policy',
      icon: 'help-circle-outline',
      iconFamily: 'Ionicons',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={onOpenProfile}
          activeOpacity={0.7}
        >
          <Image source={{ uri: CURRENT_USER.avatar }} style={styles.profileAvatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{CURRENT_USER.name}</Text>
            <Text style={styles.profileAbout} numberOfLines={1}>
              {CURRENT_USER.about || 'Available'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.qrButton}
            onPress={() => setIsQrModalVisible(true)}
          >
            <Ionicons name="qr-code-outline" size={24} color={COLORS.accentGreen} />
          </TouchableOpacity>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Settings Options List */}
        {settingsOptions.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.optionRow}
            onPress={
              item.onPress
                ? item.onPress
                : () => Alert.alert(item.title, `Configuring ${item.title} settings`)
            }
            activeOpacity={0.7}
          >
            <Ionicons
              name={item.icon}
              size={22}
              color={COLORS.iconDefault}
              style={styles.optionIcon}
            />
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>{item.title}</Text>
              {Boolean(item.subtitle) && (
                <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* Log out Row */}
        <TouchableOpacity
          style={[styles.optionRow, { marginTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border }]}
          onPress={onLogout}
          activeOpacity={0.7}
        >
          <Ionicons
            name="log-out-outline"
            size={22}
            color="#ef4444"
            style={styles.optionIcon}
          />
          <View style={styles.optionTextContainer}>
            <Text style={[styles.optionTitle, { color: '#ef4444' }]}>Log out</Text>
            <Text style={styles.optionSubtitle}>Sign out of your account on this device</Text>
          </View>
        </TouchableOpacity>

        {/* Footer Branding */}
        <View style={styles.footerBranding}>
          <Text style={styles.fromMetaText}>from</Text>
          <Text style={styles.metaBrandText}>Meta</Text>
        </View>
      </ScrollView>

      {/* Socket.IO & WebRTC Server Config Modal */}
      <Modal
        visible={isServerModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsServerModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="server-outline" size={24} color={COLORS.accentGreen} />
              <Text style={styles.modalTitle}>Backend Server URL</Text>
            </View>

            <Text style={styles.modalDescription}>
              Configure the Socket.IO & WebRTC signaling server address for real-time messaging, typing indicators, and video/voice calls.
            </Text>

            <View style={styles.statusIndicatorRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isSocketConnected ? '#22c55e' : '#ef4444' },
                ]}
              />
              <Text style={styles.statusIndicatorText}>
                {isSocketConnected ? 'Connected to Socket Server' : 'Disconnected (Check server status)'}
              </Text>
            </View>

            <TextInput
              style={styles.urlInput}
              value={tempUrl}
              onChangeText={setTempUrl}
              placeholder="e.g. http://192.168.1.15:5000"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />

            {/* Quick Presets */}
            <Text style={styles.presetsLabel}>Quick Presets:</Text>
            <View style={styles.presetsContainer}>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => setTempUrl('http://10.0.2.2:5000')}
              >
                <Text style={styles.presetChipText}>Android (10.0.2.2:5000)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => setTempUrl('http://localhost:5000')}
              >
                <Text style={styles.presetChipText}>iOS/Web (localhost:5000)</Text>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsServerModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => {
                  if (onUpdateSocketUrl) {
                    onUpdateSocketUrl(tempUrl.trim());
                  }
                  setIsServerModalVisible(false);
                  Alert.alert('Server Updated', `Connecting to ${tempUrl.trim()}`);
                }}
              >
                <Text style={styles.saveButtonText}>Connect</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* QR Code & Scanner Modal */}
      <QRCodeModal
        visible={isQrModalVisible}
        onClose={() => setIsQrModalVisible(false)}
        user={CURRENT_USER}
        onJoinUser={onOpenProfile}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.headerBackground,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 14,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  profileAbout: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  qrButton: {
    padding: 8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  optionIcon: {
    width: 28,
    marginRight: 18,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  optionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  footerBranding: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  fromMetaText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  metaBrandText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: 10,
  },
  modalDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusIndicatorText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  urlInput: {
    backgroundColor: COLORS.headerBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    fontSize: 14,
    marginBottom: 14,
  },
  presetsLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  presetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  presetChip: {
    backgroundColor: 'rgba(37, 211, 102, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(37, 211, 102, 0.3)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  presetChipText: {
    color: COLORS.accentGreen,
    fontSize: 11,
    fontWeight: '500',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: COLORS.accentGreen,
  },
  saveButtonText: {
    color: '#0b141a',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons, Feather, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import QRCodeModal from '../components/profile/QRCodeModal';
import PrivacySettingsModal from '../components/settings/PrivacySettingsModal';
import AvatarSettingsModal from '../components/settings/AvatarSettingsModal';
import ChatsSettingsModal from '../components/settings/ChatsSettingsModal';
import NotificationsSettingsModal from '../components/settings/NotificationsSettingsModal';
import AccountSettingsModal from '../components/settings/AccountSettingsModal';
import StorageDataSettingsModal from '../components/settings/StorageDataSettingsModal';
import HelpSettingsModal from '../components/settings/HelpSettingsModal';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen({
  currentUser,
  onOpenProfile,
  onUpdateUser,
  onClearAllChats,
  onOpenCreateGroup,
  onLogout,
  isSocketConnected,
  socketUrl,
  onUpdateSocketUrl,
  theme,
  onThemeChange,
  wallpaper,
  onWallpaperChange,
}) {
  const themeContext = useTheme();
  const activeTheme = theme || themeContext.theme;
  const isLight = activeTheme === 'Light' || themeContext.isLight;
  const activeWallpaper = wallpaper || themeContext.chatWallpaper;

  const [isServerModalVisible, setIsServerModalVisible] = useState(false);
  const [tempUrl, setTempUrl] = useState(socketUrl || 'http://192.168.1.15:5000');
  const [isQrModalVisible, setIsQrModalVisible] = useState(false);

  // Settings Sub-screens Modals
  const [isPrivacyModalVisible, setIsPrivacyModalVisible] = useState(false);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [isChatsModalVisible, setIsChatsModalVisible] = useState(false);
  const [isNotificationsModalVisible, setIsNotificationsModalVisible] = useState(false);
  const [isAccountModalVisible, setIsAccountModalVisible] = useState(false);
  const [isStorageModalVisible, setIsStorageModalVisible] = useState(false);
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);

  const activeUser = currentUser || {
    name: 'PulseChat User',
    about: 'Available',
    avatar: null,
  };

  const handleSaveSocketUrl = () => {
    if (onUpdateSocketUrl) {
      onUpdateSocketUrl(tempUrl);
    }
    setIsServerModalVisible(false);
    Alert.alert('Server Configured', `Updated real-time socket URL to ${tempUrl}`);
  };

  const settingsOptions = [
    {
      id: 'account',
      title: 'Account',
      subtitle: 'Security notifications, change number',
      icon: 'key-outline',
      onPress: () => setIsAccountModalVisible(true),
    },
    {
      id: 'group',
      title: 'New Group',
      subtitle: 'Create a group with friends or team',
      icon: 'people-outline',
      onPress: onOpenCreateGroup,
    },
    {
      id: 'privacy',
      title: 'Privacy',
      subtitle: 'Block contacts, disappearing messages',
      icon: 'lock-closed-outline',
      onPress: () => setIsPrivacyModalVisible(true),
    },
    {
      id: 'avatar',
      title: 'Avatar',
      subtitle: 'Create, edit, profile photo',
      icon: 'happy-outline',
      onPress: () => setIsAvatarModalVisible(true),
    },
    {
      id: 'chats',
      title: 'Chats',
      subtitle: `Theme: ${activeTheme} • Wallpaper & history`,
      icon: 'chatbox-ellipses-outline',
      onPress: () => setIsChatsModalVisible(true),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Message, group & call tones',
      icon: 'notifications-outline',
      onPress: () => setIsNotificationsModalVisible(true),
    },
    {
      id: 'storage',
      title: 'Storage and Data',
      subtitle: 'Network usage, auto-download',
      icon: 'pie-chart-outline',
      onPress: () => setIsStorageModalVisible(true),
    },
    {
      id: 'help',
      title: 'Help',
      subtitle: 'Help center, contact us, privacy policy',
      icon: 'help-circle-outline',
      onPress: () => setIsHelpModalVisible(true),
    },
  ];

  return (
    <View style={[styles.container, isLight && styles.containerLight]}>
      {/* Ambient Glass Glow Orbs */}
      <View style={styles.ambientGlowEmerald} pointerEvents="none" />
      <View style={styles.ambientGlowCyan} pointerEvents="none" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Glass Card */}
        <TouchableOpacity
          style={[styles.profileCard, isLight && styles.profileCardLight]}
          onPress={onOpenProfile}
          activeOpacity={0.75}
        >
          <View style={styles.glassSheen} />
          {activeUser.avatar ? (
            <Image source={{ uri: activeUser.avatar }} style={styles.profileAvatar} />
          ) : (
            <View style={styles.profileAvatarPlaceholder}>
              <Text style={styles.profileAvatarInitial}>
                {activeUser.name ? activeUser.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, isLight && styles.profileNameLight]}>
              {activeUser.name}
            </Text>
            <Text style={styles.profileAbout} numberOfLines={1}>
              {activeUser.about || activeUser.email || 'Available'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.qrButton, isLight && styles.qrButtonLight]}
            onPress={() => setIsQrModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="qr-code-outline" size={22} color={COLORS.accentGreen} />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Server Connection Status Chip */}
        <TouchableOpacity
          style={[styles.serverChip, isLight && styles.serverChipLight]}
          onPress={() => setIsServerModalVisible(true)}
          activeOpacity={0.75}
        >
          <View
            style={[
              styles.statusPulseDot,
              { backgroundColor: isSocketConnected ? '#22c55e' : '#ef4444' },
            ]}
          />
          <Text style={[styles.serverChipText, isLight && styles.serverChipTextLight]} numberOfLines={1}>
            Signaling Server: <Text style={{ color: COLORS.accentGreen, fontWeight: '700' }}>
              {isSocketConnected ? 'Connected' : 'Offline (Tap to configure)'}
            </Text>
          </Text>
          <Ionicons name="settings-sharp" size={14} color={isLight ? '#54656f' : '#8696a0'} />
        </TouchableOpacity>

        {/* Grouped Settings Options in Frosted Glass Container */}
        <View style={[styles.optionsGroupContainer, isLight && styles.optionsGroupContainerLight]}>
          <View style={styles.glassSheen} />
          {settingsOptions.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.optionRow,
                index > 0 && [styles.optionDivider, isLight && styles.optionDividerLight],
              ]}
              onPress={
                item.onPress
                  ? item.onPress
                  : () => Alert.alert(item.title, `Configuring ${item.title} settings`)
              }
              activeOpacity={0.7}
            >
              <View style={[styles.optionIconWrapper, isLight && styles.optionIconWrapperLight]}>
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={isLight ? '#008069' : COLORS.accentGreen}
                />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, isLight && styles.optionTitleLight]}>
                  {item.title}
                </Text>
                {Boolean(item.subtitle) && (
                  <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={18} color={isLight ? '#8696a0' : '#8696a0'} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Log out Card */}
        <TouchableOpacity
          style={[styles.logoutCard, isLight && styles.logoutCardLight]}
          onPress={onLogout}
          activeOpacity={0.75}
        >
          <View style={styles.logoutIconWrapper}>
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={[styles.optionTitle, { color: '#ef4444' }]}>Log out</Text>
            <Text style={styles.optionSubtitle}>Sign out of your account on this device</Text>
          </View>
        </TouchableOpacity>

        {/* Footer Branding */}
        <View style={styles.footerBranding}>
          <Text style={styles.fromMetaText}>from</Text>
          <Text style={styles.metaBrandText}>PulseChat • Meta</Text>
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
          <View style={[styles.modalContent, isLight && styles.modalContentLight]}>
            <View style={styles.modalHeader}>
              <Ionicons name="server-outline" size={24} color={COLORS.accentGreen} />
              <Text style={[styles.modalTitle, isLight && styles.modalTitleLight]}>Backend Server URL</Text>
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
              <Text style={[styles.statusIndicatorText, isLight && styles.statusIndicatorTextLight]}>
                {isSocketConnected ? 'Connected to Socket Server' : 'Disconnected (Check server status)'}
              </Text>
            </View>

            <TextInput
              style={[styles.urlInput, isLight && styles.urlInputLight]}
              value={tempUrl}
              onChangeText={setTempUrl}
              placeholder="e.g. http://192.168.1.15:5000"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsServerModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveSocketUrl}
              >
                <Text style={styles.saveBtnText}>Save URL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* QR Code & Scanner Modal */}
      <QRCodeModal
        visible={isQrModalVisible}
        onClose={() => setIsQrModalVisible(false)}
        user={activeUser}
        onJoinUser={onOpenProfile}
      />

      {/* Privacy Settings Modal */}
      <PrivacySettingsModal
        visible={isPrivacyModalVisible}
        onClose={() => setIsPrivacyModalVisible(false)}
      />

      {/* Avatar Settings Modal */}
      <AvatarSettingsModal
        visible={isAvatarModalVisible}
        onClose={() => setIsAvatarModalVisible(false)}
        currentUser={activeUser}
        onUpdateUser={onUpdateUser}
      />

      {/* Chats Settings Modal */}
      <ChatsSettingsModal
        visible={isChatsModalVisible}
        onClose={() => setIsChatsModalVisible(false)}
        onClearAllChats={onClearAllChats}
        currentTheme={activeTheme}
        onThemeChange={(t) => {
          if (onThemeChange) onThemeChange(t);
          if (themeContext.setTheme) themeContext.setTheme(t);
        }}
        currentWallpaper={activeWallpaper}
        onWallpaperChange={(wp) => {
          if (onWallpaperChange) onWallpaperChange(wp);
          if (themeContext.setWallpaper) themeContext.setWallpaper(wp);
        }}
      />

      {/* Notifications Settings Modal */}
      <NotificationsSettingsModal
        visible={isNotificationsModalVisible}
        onClose={() => setIsNotificationsModalVisible(false)}
      />

      {/* Account Settings Modal */}
      <AccountSettingsModal
        visible={isAccountModalVisible}
        onClose={() => setIsAccountModalVisible(false)}
        currentUser={activeUser}
        onLogout={onLogout}
        onUpdateUser={onUpdateUser}
      />

      {/* Storage & Data Settings Modal */}
      <StorageDataSettingsModal
        visible={isStorageModalVisible}
        onClose={() => setIsStorageModalVisible(false)}
      />

      {/* Help Settings Modal */}
      <HelpSettingsModal
        visible={isHelpModalVisible}
        onClose={() => setIsHelpModalVisible(false)}
      />
    </View>
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
  ambientGlowEmerald: {
    position: 'absolute',
    top: -40,
    left: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(0, 168, 132, 0.12)',
    ...(Platform.OS === 'web' ? { filter: 'blur(70px)' } : {}),
  },
  ambientGlowCyan: {
    position: 'absolute',
    bottom: 80,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    ...(Platform.OS === 'web' ? { filter: 'blur(60px)' } : {}),
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  glassSheen: {
    position: 'absolute',
    top: 2,
    left: '12%',
    right: '12%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 1,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(20, 31, 38, 0.76)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    marginBottom: 14,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(16px)' } : {}),
  },
  profileCardLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
  },
  profileAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    marginRight: 14,
    borderWidth: 2,
    borderColor: COLORS.accentGreen,
  },
  profileAvatarPlaceholder: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(0, 168, 132, 0.25)',
    borderWidth: 1.5,
    borderColor: COLORS.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileAvatarInitial: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.accentGreen,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#e9edef',
    marginBottom: 4,
  },
  profileNameLight: {
    color: '#111b21',
  },
  profileAbout: {
    fontSize: 12.5,
    color: '#8696a0',
  },
  qrButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 168, 132, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 168, 132, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrButtonLight: {
    backgroundColor: 'rgba(0, 168, 132, 0.1)',
  },
  serverChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 31, 38, 0.65)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    gap: 8,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(10px)' } : {}),
  },
  serverChipLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  statusPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  serverChipText: {
    flex: 1,
    fontSize: 11.5,
    color: '#8696a0',
  },
  serverChipTextLight: {
    color: '#54656f',
  },
  optionsGroupContainer: {
    backgroundColor: 'rgba(20, 31, 38, 0.72)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 14,
    overflow: 'hidden',
    position: 'relative',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(16px)' } : {}),
  },
  optionsGroupContainerLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionDivider: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  optionDividerLight: {
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  optionIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 168, 132, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionIconWrapperLight: {
    backgroundColor: 'rgba(0, 168, 132, 0.1)',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    color: '#e9edef',
    fontWeight: '600',
  },
  optionTitleLight: {
    color: '#111b21',
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#8696a0',
    marginTop: 2,
  },
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 31, 38, 0.72)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    marginBottom: 18,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(12px)' } : {}),
  },
  logoutCardLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  footerBranding: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  fromMetaText: {
    fontSize: 11,
    color: '#8696a0',
  },
  metaBrandText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.accentGreen,
    letterSpacing: 0.5,
    marginTop: 2,
  },

  // Modal Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#1f2c34',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalContentLight: {
    backgroundColor: '#ffffff',
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#e9edef',
  },
  modalTitleLight: {
    color: '#111b21',
  },
  modalDescription: {
    fontSize: 13,
    color: '#8696a0',
    lineHeight: 18,
    marginBottom: 14,
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusIndicatorText: {
    fontSize: 12,
    color: '#8696a0',
  },
  statusIndicatorTextLight: {
    color: '#54656f',
  },
  urlInput: {
    backgroundColor: '#111b21',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#e9edef',
    fontSize: 14,
    marginBottom: 18,
  },
  urlInputLight: {
    backgroundColor: '#f0f2f5',
    borderColor: 'rgba(0, 0, 0, 0.15)',
    color: '#111b21',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelBtnText: {
    color: '#8696a0',
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: COLORS.accentGreen,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#111b21',
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 110,
  },
});

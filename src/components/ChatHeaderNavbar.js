import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

/**
 * Mobile Chat Header Navbar
 * Modeled after WhatsApp Mobile Active Chat View with Frosted Glassmorphism
 */
export default function ChatHeaderNavbar({
  title = 'Chat',
  subtitle = 'online',
  avatarUrl = null,
  isOnline = true,
  isTyping = false,
  isLight = false,
  onBack,
  onProfilePress,
  onVideoCall,
  onVoiceCall,
  onMenuPress,
}) {
  const iconColor = isLight ? '#ffffff' : '#aebac1';
  const textColor = isLight ? '#ffffff' : '#e9edef';
  const subtextColor = isLight ? '#d9fdd3' : '#8696a0';

  return (
    <View style={[styles.headerContainer, isLight && styles.headerContainerLight]}>
      {/* Specular Top Rim */}
      <View style={[styles.glassTopRim, isLight && styles.glassTopRimLight]} />

      {/* Left section: Back button + Avatar + User Info */}
      <View style={styles.leftSection}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileTouchable}
          onPress={onProfilePress}
          activeOpacity={0.8}
        >
          {/* Avatar with optional online badge */}
          <View style={styles.avatarWrapper}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarPlaceholder, isLight && styles.avatarPlaceholderLight]}>
                <Text style={styles.avatarText}>
                  {title ? title.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
            )}
            {isOnline && <View style={[styles.onlineBadge, isLight && styles.onlineBadgeLight]} />}
          </View>

          {/* Contact Details (Name + Online/Typing Status) */}
          <View style={styles.titleContainer}>
            <Text style={[styles.contactName, { color: textColor }]} numberOfLines={1}>
              {title}
            </Text>
            <View style={styles.statusRow}>
              {isTyping ? (
                <Text style={[styles.typingStatus, isLight && { color: '#ffffff' }]}>typing...</Text>
              ) : (
                <Text
                  style={[
                    styles.contactStatus,
                    { color: subtextColor },
                    isOnline && (isLight ? { color: '#e7f7ef', fontWeight: '600' } : styles.onlineStatusText),
                  ]}
                  numberOfLines={1}
                >
                  {isOnline ? 'online' : subtitle === 'online' ? 'offline' : subtitle || 'offline'}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Right Section: Action Buttons (Video, Voice, Menu) */}
      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onVideoCall}
          activeOpacity={0.7}
        >
          <Ionicons name="videocam" size={22} color={iconColor} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onVoiceCall}
          activeOpacity={0.7}
        >
          <Ionicons name="call" size={20} color={iconColor} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onMenuPress}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="more-vert"
            size={22}
            color={iconColor}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 60,
    backgroundColor: 'rgba(32, 44, 51, 0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    position: 'relative',
    ...(Platform.OS === 'web'
      ? { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }
      : {}),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerContainerLight: {
    backgroundColor: '#008069',
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  glassTopRim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  glassTopRimLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 6,
    marginRight: 2,
    borderRadius: 20,
  },
  profileTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  avatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.cardBackground,
  },
  avatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#005c4b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#00a884',
  },
  avatarPlaceholderLight: {
    backgroundColor: '#006a55',
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: COLORS.onlineDot,
    borderWidth: 2,
    borderColor: '#202c33',
  },
  onlineBadgeLight: {
    borderColor: '#008069',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  contactStatus: {
    fontSize: 12,
  },
  onlineStatusText: {
    color: COLORS.accentGreen,
    fontWeight: '500',
  },
  typingStatus: {
    fontSize: 12,
    color: COLORS.accentGreen,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 2,
    borderRadius: 20,
  },
});

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

/**
 * Mobile Chat Header Navbar
 * Modeled after WhatsApp Mobile Active Chat View
 */
export default function ChatHeaderNavbar({
  title = 'Shamshad Khan',
  subtitle = 'online',
  avatarUrl = null,
  isOnline = true,
  isTyping = false,
  onBack,
  onProfilePress,
  onVideoCall,
  onVoiceCall,
  onMenuPress,
}) {
  return (
    <View style={styles.headerContainer}>
      {/* Left section: Back button + Avatar + User Info */}
      <View style={styles.leftSection}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
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
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {title ? title.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
            )}
            {isOnline && <View style={styles.onlineBadge} />}
          </View>

          {/* Contact Details (Name + Online/Typing Status) */}
          <View style={styles.titleContainer}>
            <Text style={styles.contactName} numberOfLines={1}>
              {title}
            </Text>
            <View style={styles.statusRow}>
              {isTyping ? (
                <Text style={styles.typingStatus}>typing...</Text>
              ) : (
                <Text
                  style={[
                    styles.contactStatus,
                    isOnline && styles.onlineStatusText,
                  ]}
                  numberOfLines={1}
                >
                  {subtitle}
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
          <Ionicons name="videocam" size={22} color={COLORS.iconDefault} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onVoiceCall}
          activeOpacity={0.7}
        >
          <Ionicons name="call" size={20} color={COLORS.iconDefault} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onMenuPress}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="more-vert"
            size={22}
            color={COLORS.iconDefault}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 60,
    backgroundColor: COLORS.headerBackground,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  avatarText: {
    color: COLORS.textWhite,
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
    borderColor: COLORS.headerBackground,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  contactStatus: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  onlineStatusText: {
    color: COLORS.accentGreen,
    fontWeight: '500',
  },
  typingStatus: {
    fontSize: 12,
    color: COLORS.accentGreen,
    fontWeight: '600',
    fontStyle: 'italic',
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

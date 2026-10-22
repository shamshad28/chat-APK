import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { getInitials } from './chat/NotificationBanner';
import TypingIndicator from './chat/TypingIndicator';

function ConversationItem({
  conversation,
  onPress,
  onLongPress,
  isLight = false,
}) {
  const isMetaAI = conversation.isMetaAI || conversation.isLLM;
  const isGroup = conversation.type === 'group';
  const hasUnread = (conversation.unreadCount || 0) > 0;
  const isTyping = conversation.isTyping;
  const lastMsg = conversation.lastMessage || {};

  return (
    <TouchableOpacity
      style={[styles.container, isLight && styles.containerLight]}
      onPress={() => onPress && onPress(conversation)}
      onLongPress={() => onLongPress && onLongPress(conversation)}
      activeOpacity={0.7}
    >
      {/* Left: Avatar with Online indicator */}
      <View style={styles.avatarWrapper}>
        {isMetaAI ? (
          <View style={styles.metaAiAvatar}>
            <View style={styles.metaAiRing}>
              <View style={styles.metaAiDot} />
            </View>
          </View>
        ) : conversation.avatar ? (
          <Image source={{ uri: conversation.avatar }} style={styles.avatarImage} />
        ) : (
          <View
            style={[
              styles.avatarPlaceholder,
              isLight && styles.avatarPlaceholderLight,
              isGroup && (isLight ? styles.groupAvatarBgLight : styles.groupAvatarBg),
            ]}
          >
            {isGroup ? (
              <Ionicons name="people" size={22} color={isLight ? '#54656f' : '#aebac1'} />
            ) : (
              <Text style={[styles.avatarInitial, isLight && styles.avatarInitialLight]}>
                {getInitials(conversation.name)}
              </Text>
            )}
          </View>
        )}

        {/* Small Status Dot only when online (like real WhatsApp) */}
        {!isGroup && !isMetaAI && conversation.isOnline && (
          <View style={[styles.statusDotOnline, isLight && styles.statusDotOnlineLight]} />
        )}
      </View>

      {/* Center: Contact Name & Last Message */}
      <View style={styles.contentContainer}>
        <View style={styles.topRow}>
          <Text
            style={[
              styles.nameText,
              isLight && styles.nameTextLight,
            ]}
            numberOfLines={1}
          >
            {conversation.name}
          </Text>
          <Text
            style={[
              styles.timeText,
              isLight && styles.timeTextLight,
              hasUnread && (isLight ? styles.timeTextUnreadLight : styles.timeTextUnread),
            ]}
          >
            {lastMsg.time || '12:00 PM'}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          {isTyping ? (
            <View style={styles.typingContainer}>
              <Text style={styles.typingText}>typing...</Text>
            </View>
          ) : (
            <View style={styles.messageSnippetContainer}>
              {/* Sent Status Tick for My Messages */}
              {lastMsg.isSentByMe && (
                <Ionicons
                  name={
                    lastMsg.status === 'read'
                      ? 'checkmark-done'
                      : lastMsg.status === 'delivered'
                      ? 'checkmark-done'
                      : 'checkmark'
                  }
                  size={16}
                  color={
                    lastMsg.status === 'read'
                      ? COLORS.blueTicks
                      : isLight
                      ? '#667781'
                      : '#8696a0'
                  }
                  style={styles.tickIcon}
                />
              )}

              {/* Message Type Icon (Audio, Photo, Call) */}
              {lastMsg.type === 'call' && (
                <Ionicons
                  name={lastMsg.callType === 'video' ? 'videocam' : 'call'}
                  size={14}
                  color={
                    lastMsg.callStatus === 'ended' && (!lastMsg.duration || lastMsg.duration === 0)
                      ? '#ef4444'
                      : '#00a884'
                  }
                  style={{ marginRight: 4 }}
                />
              )}
              {lastMsg.type === 'audio' && (
                <Ionicons
                  name="mic"
                  size={14}
                  color={isLight ? '#54656f' : '#8696a0'}
                  style={{ marginRight: 4 }}
                />
              )}
              {lastMsg.type === 'image' && (
                <Ionicons
                  name="image"
                  size={14}
                  color={isLight ? '#54656f' : '#8696a0'}
                  style={{ marginRight: 4 }}
                />
              )}

              {/* Snippet text */}
              {lastMsg.text ? (
                <Text
                  style={[
                    styles.snippetText,
                    isLight && styles.snippetTextLight,
                    hasUnread && (isLight ? styles.snippetTextUnreadLight : styles.snippetTextUnread),
                  ]}
                  numberOfLines={1}
                >
                  {lastMsg.text}
                </Text>
              ) : (
                <Text style={styles.noMessagesText}>Tap to start chat</Text>
              )}
            </View>
          )}

          {/* Right Badges: Pinned, Muted, Unread Count */}
          <View style={styles.badgesRight}>
            {conversation.isMuted && (
              <Ionicons
                name="volume-mute"
                size={16}
                color={isLight ? '#8696a0' : '#8696a0'}
                style={styles.badgeIcon}
              />
            )}
            {conversation.isPinned && (
              <MaterialCommunityIcons
                name="pin"
                size={16}
                color={isLight ? '#8696a0' : '#8696a0'}
                style={styles.badgeIcon}
              />
            )}
            {hasUnread && (
              <View style={[styles.unreadBadge, isLight && styles.unreadBadgeLight]}>
                <Text style={[styles.unreadCountText, isLight && styles.unreadCountTextLight]}>
                  {conversation.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  containerLight: {
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#202c33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderLight: {
    backgroundColor: '#e9edef',
  },
  groupAvatarBg: {
    backgroundColor: '#2a3942',
  },
  groupAvatarBgLight: {
    backgroundColor: '#dfe5e7',
  },
  avatarInitial: {
    color: '#e9edef',
    fontWeight: '700',
    fontSize: 18,
  },
  avatarInitialLight: {
    color: '#111b21',
  },
  metaAiAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderWidth: 1.5,
    borderColor: '#c084fc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaAiRing: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#c084fc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaAiDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38bdf8',
  },
  statusDotOnline: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#25d366',
    borderWidth: 2,
    borderColor: '#111b21',
  },
  statusDotOnlineLight: {
    borderColor: '#ffffff',
  },
  contentContainer: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    minWidth: 0,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e9edef',
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  nameTextLight: {
    color: '#111b21',
  },
  timeText: {
    fontSize: 12,
    color: '#8696a0',
    flexShrink: 0,
  },
  timeTextLight: {
    color: '#667781',
  },
  timeTextUnread: {
    color: COLORS.badgeGreen,
    fontWeight: '600',
  },
  timeTextUnreadLight: {
    color: '#008069',
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 0,
  },
  messageSnippetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },
  tickIcon: {
    marginRight: 4,
  },
  snippetText: {
    fontSize: 13.5,
    color: '#8696a0',
    flex: 1,
  },
  snippetTextLight: {
    color: '#54656f',
  },
  snippetTextUnread: {
    color: '#e9edef',
    fontWeight: '500',
  },
  snippetTextUnreadLight: {
    color: '#111b21',
    fontWeight: '600',
  },
  noMessagesText: {
    fontSize: 13,
    color: '#667781',
    fontStyle: 'italic',
  },
  typingContainer: {
    flex: 1,
  },
  typingText: {
    color: COLORS.accentGreen,
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  badgesRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeIcon: {
    marginRight: 2,
  },
  unreadBadge: {
    backgroundColor: COLORS.badgeGreen,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeLight: {
    backgroundColor: '#00a884',
  },
  unreadCountText: {
    color: '#111b21',
    fontSize: 11,
    fontWeight: '800',
  },
  unreadCountTextLight: {
    color: '#ffffff',
  },
});

export default React.memo(ConversationItem);

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { getInitials } from './chat/NotificationBanner';
import TypingIndicator from './chat/TypingIndicator';

export default function ConversationItem({
  conversation,
  onPress,
  onLongPress,
}) {
  const isMetaAI = conversation.isMetaAI || conversation.isLLM;
  const isGroup = conversation.type === 'group';
  const hasUnread = (conversation.unreadCount || 0) > 0;
  const isTyping = conversation.isTyping;
  const lastMsg = conversation.lastMessage || {};

  return (
    <TouchableOpacity
      style={styles.container}
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
          <View style={[styles.avatarPlaceholder, isGroup && styles.groupAvatarBg]}>
            {isGroup ? (
              <Ionicons name="people" size={22} color="#aebac1" />
            ) : (
              <Text style={styles.avatarInitial}>
                {getInitials(conversation.name)}
              </Text>
            )}
          </View>
        )}

        {/* Small Status Dot only when online (like real WhatsApp) */}
        {!isGroup && !isMetaAI && conversation.isOnline && (
          <View style={styles.statusDotOnline} />
        )}
      </View>

      {/* Center: Contact Name & Last Message */}
      <View style={styles.contentContainer}>
        <View style={styles.topRow}>
          <Text style={styles.nameText} numberOfLines={1}>
            {conversation.name}
          </Text>
          <Text
            style={[
              styles.timeText,
              hasUnread && styles.timeTextUnread,
            ]}
          >
            {lastMsg.time || conversation.time || ''}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.messageSnippetContainer}>
            {isTyping ? (
              <TypingIndicator compact />
            ) : lastMsg.text ? (
              <>
                {lastMsg.isSentByMe && (
                  <Ionicons
                    name={lastMsg.status === 'read' ? 'checkmark-done' : 'checkmark'}
                    size={16}
                    color={lastMsg.status === 'read' ? COLORS.blueTicks : COLORS.textSecondary}
                    style={styles.tickIcon}
                  />
                )}
                <Text
                  style={[
                    styles.snippetText,
                    hasUnread && styles.snippetTextUnread,
                  ]}
                  numberOfLines={1}
                >
                  {lastMsg.text}
                </Text>
              </>
            ) : (
              <Text style={styles.noMessagesText}>No messages yet</Text>
            )}
          </View>

          {/* Right badges: Unread count, Pin, Mute */}
          <View style={styles.badgesRight}>
            {conversation.isMuted && (
              <Ionicons
                name="volume-mute"
                size={15}
                color={COLORS.textSecondary}
                style={styles.badgeIcon}
              />
            )}
            {conversation.isPinned && (
              <MaterialCommunityIcons
                name="pin"
                size={15}
                color={COLORS.textSecondary}
                style={styles.badgeIcon}
              />
            )}
            {hasUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCountText}>
                  {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
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
    backgroundColor: '#111b21',
  },
  avatarWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 14,
    position: 'relative',
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
    backgroundColor: '#374248',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupAvatarBg: {
    backgroundColor: '#2a3942',
  },
  avatarInitial: {
    color: '#e9edef',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  metaAiAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1f2c34',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaAiRing: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: '#a855f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaAiDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#a855f7',
  },
  statusDotOnline: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.badgeGreen,
    borderWidth: 2,
    borderColor: '#111b21',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e9edef',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#8696a0',
  },
  timeTextUnread: {
    color: COLORS.badgeGreen,
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  messageSnippetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  snippetTextUnread: {
    color: '#e9edef',
    fontWeight: '500',
  },
  noMessagesText: {
    fontSize: 13,
    color: '#667781',
    fontStyle: 'italic',
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
  unreadCountText: {
    color: '#111b21',
    fontSize: 11,
    fontWeight: '800',
  },
});

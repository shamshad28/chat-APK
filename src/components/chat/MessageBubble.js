import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Clipboard,
  Alert,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import ReactionPicker from './ReactionPicker';
import { getInitials } from './NotificationBanner';

/**
 * Rich WhatsApp Message Bubble with reactions, audio, images, status ticks & actions
 * Directly refers to client MessageBubble.jsx
 */
export default function MessageBubble({
  message,
  onLongPress,
  onImagePress,
  onReply,
  onReact,
  onDelete,
  onOpenCustomReaction,
  isGroup = false,
}) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackSec, setPlaybackSec] = useState(0);
  const audioIntervalRef = useRef(null);

  // Parse total duration in seconds from '0:24' or default to 14
  const parseTotalSec = () => {
    if (!message.audioDuration) return 14;
    const parts = message.audioDuration.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10) || 14;
    }
    return 14;
  };

  const totalSec = parseTotalSec();

  const toggleAudioPlayback = () => {
    if (isPlayingAudio) {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      audioIntervalRef.current = setInterval(() => {
        setPlaybackSec((prev) => {
          if (prev + 1 >= totalSec) {
            clearInterval(audioIntervalRef.current);
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, []);

  const isMe = message.isSentByMe;
  const isAudio = message.type === 'audio';
  const isImage = message.type === 'image';

  // Group reactions: { [emoji]: count }
  const reactionsMap = (message.reactions || []).reduce((acc, r) => {
    const emoji = typeof r === 'string' ? r : r.emoji;
    if (emoji) {
      acc[emoji] = (acc[emoji] || 0) + 1;
    }
    return acc;
  }, {});

  // Legacy single reaction fallback
  if (message.reaction && !reactionsMap[message.reaction]) {
    reactionsMap[message.reaction] = 1;
  }

  const reactionEntries = Object.entries(reactionsMap);

  const handleLongPress = () => {
    setShowReactionPicker(true);
    onLongPress && onLongPress(message);
  };

  const handleSelectReaction = (emoji) => {
    setShowReactionPicker(false);
    onReact && onReact(message.id, emoji);
  };

  const handleCopy = () => {
    if (message.text || message.caption) {
      Clipboard.setString(message.text || message.caption);
      Alert.alert('Copied', 'Message copied to clipboard');
    }
  };

  return (
    <View style={[styles.bubbleRow, isMe ? styles.rowSent : styles.rowReceived]}>
      {/* Left Avatar for Received messages in Group */}
      {!isMe && isGroup && (
        <View style={styles.groupAvatar}>
          <Text style={styles.groupAvatarText}>
            {getInitials(message.senderName || 'User')}
          </Text>
        </View>
      )}

      <View style={styles.bubbleWrapper}>
        {/* Floating Reaction Picker Popup */}
        {showReactionPicker && (
          <ReactionPicker
            visible={showReactionPicker}
            onSelect={handleSelectReaction}
            onOpenCustom={() => {
              setShowReactionPicker(false);
              onOpenCustomReaction && onOpenCustomReaction(message);
            }}
            onClose={() => setShowReactionPicker(false)}
            position="top"
          />
        )}

        <TouchableOpacity
          style={[styles.bubble, isMe ? styles.sentBubble : styles.receivedBubble]}
          onLongPress={handleLongPress}
          delayLongPress={280}
          activeOpacity={0.9}
        >
          {/* Sender Name in Group Chat */}
          {!isMe && isGroup && Boolean(message.senderName) && (
            <Text style={styles.senderName}>{message.senderName}</Text>
          )}

          {/* Quoted Reply Preview */}
          {message.replyTo && (
            <View style={styles.replyQuote}>
              <View style={styles.replyBar} />
              <View style={styles.replyContent}>
                <Text style={styles.replySender}>
                  {message.replyTo.senderName || 'Reply'}
                </Text>
                <Text style={styles.replyText} numberOfLines={1}>
                  {message.replyTo.text || 'Message'}
                </Text>
              </View>
            </View>
          )}

          {/* Attached Image */}
          {isImage && (
            <TouchableOpacity
              style={styles.imageWrapper}
              onPress={() => onImagePress && onImagePress(message.imageUri)}
              activeOpacity={0.85}
            >
              <Image
                source={{ uri: message.imageUri }}
                style={styles.attachedImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}

          {/* Audio Message with Dynamic Playback & Waveform */}
          {isAudio && (
            <View style={styles.audioRow}>
              <TouchableOpacity
                style={styles.playButton}
                onPress={toggleAudioPlayback}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isPlayingAudio ? 'pause' : 'play'}
                  size={18}
                  color="#ffffff"
                />
              </TouchableOpacity>

              <View style={styles.waveformContainer}>
                {[4, 9, 14, 18, 11, 16, 22, 12, 19, 15, 8, 12, 6, 15, 20, 11, 7].map(
                  (height, idx) => {
                    const activeCutoff = Math.floor((playbackSec / totalSec) * 17);
                    const isActive = isPlayingAudio && idx <= activeCutoff;
                    return (
                      <View
                        key={idx}
                        style={[
                          styles.waveformBar,
                          { height },
                          isActive && styles.activeWaveformBar,
                        ]}
                      />
                    );
                  }
                )}
              </View>

              <Text style={styles.audioDurationText}>
                {isPlayingAudio
                  ? `0:${playbackSec < 10 ? '0' : ''}${playbackSec}`
                  : message.audioDuration || '0:14'}
              </Text>
            </View>
          )}

          {/* Text Message Content */}
          {Boolean(message.text || message.caption) && (
            <Text style={styles.messageText}>
              {message.text || message.caption}
            </Text>
          )}

          {/* Timestamp and Double Checkmark Status */}
          <View style={styles.metaRow}>
            <Text style={styles.timeText}>{message.time}</Text>
            {isMe && (
              <Ionicons
                name={
                  message.status === 'read'
                    ? 'checkmark-done'
                    : message.status === 'delivered'
                    ? 'checkmark-done'
                    : 'checkmark'
                }
                size={15}
                color={message.status === 'read' ? COLORS.blueTicks : '#8696a0'}
                style={styles.tickIcon}
              />
            )}
          </View>
        </TouchableOpacity>

        {/* Reaction Badges Row at Bottom of Bubble */}
        {reactionEntries.length > 0 && (
          <View style={[styles.reactionsRow, isMe ? styles.reactionsRight : styles.reactionsLeft]}>
            {reactionEntries.map(([emoji, count], index) => (
              <TouchableOpacity
                key={index}
                style={styles.reactionPill}
                onPress={() => onReact && onReact(message.id, emoji)}
                activeOpacity={0.75}
              >
                <Text style={styles.reactionEmoji}>{emoji}</Text>
                {count > 1 && <Text style={styles.reactionCount}>{count}</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubbleRow: {
    marginVertical: 3,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  rowSent: {
    justifyContent: 'flex-end',
  },
  rowReceived: {
    justifyContent: 'flex-start',
  },
  groupAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#374248',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    marginBottom: 4,
  },
  groupAvatarText: {
    color: '#e9edef',
    fontSize: 10,
    fontWeight: '700',
  },
  bubbleWrapper: {
    position: 'relative',
    maxWidth: '82%',
  },
  bubble: {
    paddingHorizontal: 11,
    paddingTop: 7,
    paddingBottom: 6,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sentBubble: {
    backgroundColor: COLORS.messageSent,
    borderTopRightRadius: 2,
  },
  receivedBubble: {
    backgroundColor: COLORS.messageReceived,
    borderTopLeftRadius: 2,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accentGreen,
    marginBottom: 4,
  },
  replyQuote: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 8,
    padding: 6,
    marginBottom: 6,
    overflow: 'hidden',
  },
  replyBar: {
    width: 3.5,
    backgroundColor: COLORS.accentGreen,
    borderRadius: 2,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replySender: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accentGreen,
  },
  replyText: {
    fontSize: 11,
    color: '#8696a0',
    marginTop: 1,
  },
  messageText: {
    color: '#e9edef',
    fontSize: 14.5,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 3,
    alignSelf: 'flex-end',
  },
  timeText: {
    color: '#8696a0',
    fontSize: 10.5,
  },
  tickIcon: {
    marginLeft: 4,
  },
  imageWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 5,
  },
  attachedImage: {
    width: 220,
    height: 160,
    borderRadius: 10,
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  playButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  waveformBar: {
    width: 3,
    backgroundColor: '#8696a0',
    borderRadius: 2,
  },
  activeWaveformBar: {
    backgroundColor: COLORS.accentGreen,
  },
  audioDurationText: {
    color: '#8696a0',
    fontSize: 11,
    marginLeft: 8,
  },
  reactionsRow: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: -11,
    zIndex: 10,
    gap: 4,
  },
  reactionsRight: {
    right: 8,
  },
  reactionsLeft: {
    left: 8,
  },
  reactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202c33',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a3942',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  reactionEmoji: {
    fontSize: 12,
  },
  reactionCount: {
    fontSize: 10,
    fontWeight: '700',
    color: '#e9edef',
    marginLeft: 3,
  },
});

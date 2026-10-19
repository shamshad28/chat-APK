import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  TextInput,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STORY_DURATION = 5000; // 5 seconds per story

export default function StatusViewerModal({
  visible,
  statusList = [],
  initialIndex = 0,
  onClose,
  onSendReply,
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [replyText, setReplyText] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const currentStatus = statusList[currentIndex] || statusList[0];

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, visible]);

  useEffect(() => {
    if (!visible || !currentStatus) return;

    progressAnim.setValue(0);
    const animation = Animated.timing(progressAnim, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    });

    if (!isPaused) {
      animation.start(({ finished }) => {
        if (finished) {
          handleNext();
        }
      });
    }

    return () => animation.stop();
  }, [visible, currentIndex, isPaused]);

  if (!visible || !currentStatus) return null;

  const handleNext = () => {
    if (currentIndex < statusList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      progressAnim.setValue(0);
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    onSendReply && onSendReply(currentStatus, replyText.trim());
    setReplyText('');
    Alert.alert('Reply Sent', `Sent reply to ${currentStatus.userName || currentStatus.contactName}`);
  };

  const quickEmojis = ['❤️', '😂', '😮', '😢', '🙏', '👏'];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Top Multi-Segment Progress Bars */}
          <View style={styles.progressBarContainer}>
            {statusList.map((st, idx) => {
              let barWidth = '0%';
              if (idx < currentIndex) {
                barWidth = '100%';
              } else if (idx === currentIndex) {
                // Animated width
              }

              return (
                <View key={st.id || idx} style={styles.progressTrack}>
                  {idx === currentIndex ? (
                    <Animated.View
                      style={[
                        styles.progressBarFill,
                        {
                          width: progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                          }),
                        },
                      ]}
                    />
                  ) : (
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: idx < currentIndex ? '100%' : '0%' },
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>

          {/* Top User Header */}
          <View style={styles.topHeader}>
            <View style={styles.userInfoRow}>
              {currentStatus.avatar ? (
                <Image source={{ uri: currentStatus.avatar }} style={styles.userAvatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {(currentStatus.userName || currentStatus.contactName || 'U').charAt(0)}
                  </Text>
                </View>
              )}
              <View style={styles.userNameCol}>
                <Text style={styles.userName}>
                  {currentStatus.userName || currentStatus.contactName}
                </Text>
                <Text style={styles.statusTime}>
                  {currentStatus.time || currentStatus.timestamp || 'Just now'}
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Main Story Canvas with Left/Right Tap Zones */}
          <View style={styles.canvasArea}>
            {/* Story Media / Background */}
            {currentStatus.mediaUrl || currentStatus.image ? (
              <Image
                source={{ uri: currentStatus.mediaUrl || currentStatus.image }}
                style={styles.storyMedia}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.textStoryBg,
                  { backgroundColor: currentStatus.bgColor || '#065f46' },
                ]}
              >
                <Text style={styles.textStoryContent}>
                  {currentStatus.text || currentStatus.caption || 'No text'}
                </Text>
              </View>
            )}

            {/* Tap Zones for Navigation & Pause */}
            <TouchableOpacity
              style={styles.leftTapZone}
              onPress={handlePrev}
              onPressIn={() => setIsPaused(true)}
              onPressOut={() => setIsPaused(false)}
              activeOpacity={1}
            />
            <TouchableOpacity
              style={styles.rightTapZone}
              onPress={handleNext}
              onPressIn={() => setIsPaused(true)}
              onPressOut={() => setIsPaused(false)}
              activeOpacity={1}
            />

            {/* Caption Overlay if Media */}
            {(Boolean(currentStatus.mediaUrl) || Boolean(currentStatus.image)) &&
              Boolean(currentStatus.caption) && (
                <View style={styles.captionOverlay}>
                  <Text style={styles.captionText}>{currentStatus.caption}</Text>
                </View>
              )}
          </View>

          {/* Bottom Reply Bar & Emoji Reactions */}
          <View style={styles.bottomDock}>
            <View style={styles.emojiRow}>
              {quickEmojis.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.emojiChip}
                  onPress={() => {
                    onSendReply && onSendReply(currentStatus, emoji);
                    Alert.alert('Reacted', `Sent ${emoji} to ${currentStatus.userName || currentStatus.contactName}`);
                  }}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.replyBar}>
              <TextInput
                style={styles.replyInput}
                placeholder="Reply..."
                placeholderTextColor="#8696a0"
                value={replyText}
                onChangeText={setReplyText}
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
              />
              <TouchableOpacity
                style={[styles.sendBtn, !replyText.trim() && { opacity: 0.5 }]}
                onPress={handleSendReply}
                disabled={!replyText.trim()}
              >
                <Ionicons name="send" size={18} color="#111b21" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardContainer: {
    flex: 1,
  },
  progressBarContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 8,
    gap: 4,
    zIndex: 20,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ffffff',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 20,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  avatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#202c33',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarInitial: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  userNameCol: {},
  userName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  statusTime: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
  },
  canvasArea: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyMedia: {
    width: '100%',
    height: '100%',
  },
  textStoryBg: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  textStoryContent: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 34,
  },
  leftTapZone: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.35,
    zIndex: 10,
  },
  rightTapZone: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.65,
    zIndex: 10,
  },
  captionOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    zIndex: 15,
  },
  captionText: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  bottomDock: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 25,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  emojiChip: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 18,
  },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#202c33',
    borderRadius: 22,
    paddingHorizontal: 16,
    color: '#ffffff',
    fontSize: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#2a3942',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.badgeGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

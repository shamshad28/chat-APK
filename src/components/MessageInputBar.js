import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  Text,
} from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function MessageInputBar({
  onSendMessage,
  onOpenAttachment,
  onToggleEmoji,
  onQuickCamera,
  replyingTo,
  onCancelReply,
  onFocus,
  isLight = false,
}) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const timerRef = useRef(null);

  const startRecording = () => {
    setIsRecording(true);
    setRecordSecs(0);
    timerRef.current = setInterval(() => {
      setRecordSecs((prev) => prev + 1);
    }, 1000);
  };

  const cancelRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setRecordSecs(0);
  };

  const sendVoiceNote = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const secs = Math.max(recordSecs, 1);
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    const formatted = `${mins}:${rem < 10 ? '0' : ''}${rem}`;

    setIsRecording(false);
    setRecordSecs(0);

    onSendMessage &&
      onSendMessage({
        type: 'audio',
        audioDuration: formatted,
      });
  };

  const handleSend = () => {
    if (!text.trim()) return;
    onSendMessage && onSendMessage({ text: text.trim(), type: 'text' });
    setText('');
  };

  const iconColor = isLight ? '#54656f' : COLORS.iconDefault;

  return (
    <View style={[styles.container, isLight && styles.containerLight]}>
      {/* Quoted Replying Header Preview */}
      {replyingTo && (
        <View style={[styles.replyContainer, isLight && styles.replyContainerLight]}>
          <View style={styles.replyBorder} />
          <View style={styles.replyContent}>
            <Text style={styles.replySender}>{replyingTo.senderName || 'Replying to message'}</Text>
            <Text style={[styles.replyText, isLight && styles.replyTextLight]} numberOfLines={1}>
              {replyingTo.text || 'Photo/Media'}
            </Text>
          </View>
          <TouchableOpacity onPress={onCancelReply} style={styles.replyClose}>
            <Ionicons name="close" size={18} color={iconColor} />
          </TouchableOpacity>
        </View>
      )}

      {/* Main Input Controls Row */}
      <View style={styles.inputRow}>
        {isRecording ? (
          /* VOICE RECORDING STRIP */
          <View style={[styles.recordingStrip, isLight && styles.recordingStripLight]}>
            <View style={styles.recordPill}>
              <View style={styles.pulsingRedDot} />
              <Text style={[styles.recordingTimerText, isLight && styles.recordingTimerTextLight]}>
                0:{recordSecs < 10 ? '0' : ''}
                {recordSecs}
              </Text>
            </View>

            <TouchableOpacity style={styles.slideCancelBtn} onPress={cancelRecording}>
              <Text style={styles.slideCancelText}>Cancel</Text>
              <MaterialIcons name="chevron-left" size={20} color="#ef4444" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteRecordBtn} onPress={cancelRecording}>
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ) : (
          /* REGULAR MESSAGE INPUT CAPSULE (Frosted Glassmorphism) */
          <View style={[styles.inputCapsule, isLight && styles.inputCapsuleLight]}>
            <View style={styles.glassSheen} />
            <TouchableOpacity
              style={styles.capsuleIcon}
              onPress={onToggleEmoji}
              activeOpacity={0.7}
            >
              <Ionicons name="happy-outline" size={24} color={iconColor} />
            </TouchableOpacity>

            <TextInput
              style={[styles.textInput, isLight && styles.textInputLight]}
              placeholder="Message"
              placeholderTextColor={isLight ? '#8696a0' : COLORS.textMuted}
              value={text}
              onChangeText={setText}
              onFocus={onFocus}
              multiline
              maxLength={1000}
            />

            <TouchableOpacity
              style={styles.capsuleIcon}
              onPress={onOpenAttachment}
              activeOpacity={0.7}
            >
              <Ionicons name="attach" size={24} color={iconColor} style={styles.attachRotate} />
            </TouchableOpacity>

            {!text.trim() && (
              <TouchableOpacity
                style={styles.capsuleIcon}
                onPress={onQuickCamera}
                activeOpacity={0.7}
              >
                <Feather name="camera" size={20} color={iconColor} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Dynamic Action Button: Send or Mic */}
        {isRecording ? (
          <TouchableOpacity
            style={[styles.sendButton, isLight && styles.sendButtonLight]}
            onPress={sendVoiceNote}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={19} color={isLight ? '#ffffff' : '#111b21'} style={styles.sendIconOffset} />
          </TouchableOpacity>
        ) : text.trim() ? (
          <TouchableOpacity
            style={[styles.sendButton, isLight && styles.sendButtonLight]}
            onPress={handleSend}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={19} color={isLight ? '#ffffff' : '#111b21'} style={styles.sendIconOffset} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.micButton, isLight && styles.sendButtonLight]}
            onPress={startRecording}
            activeOpacity={0.8}
          >
            <Ionicons
              name="mic"
              size={22}
              color={isLight ? '#ffffff' : '#111b21'}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 6,
    paddingTop: 4,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    backgroundColor: 'transparent',
  },
  containerLight: {},
  replyContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(32, 44, 51, 0.95)',
    borderRadius: 14,
    padding: 8,
    marginBottom: 6,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(12px)' } : {}),
  },
  replyContainerLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  replyBorder: {
    width: 4,
    height: '100%',
    backgroundColor: COLORS.accentGreen,
    borderRadius: 2,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replySender: {
    color: COLORS.accentGreen,
    fontWeight: '700',
    fontSize: 12,
  },
  replyText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  replyTextLight: {
    color: '#54656f',
  },
  replyClose: {
    padding: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  inputCapsule: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(32, 44, 51, 0.92)',
    borderRadius: 25,
    paddingHorizontal: 8,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    minHeight: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(16px)' } : {}),
  },
  inputCapsuleLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  glassSheen: {
    position: 'absolute',
    top: 2,
    left: '15%',
    right: '15%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
  },
  capsuleIcon: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachRotate: {
    transform: [{ rotate: '-45deg' }],
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#e9edef',
    maxHeight: 110,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  textInputLight: {
    color: '#111b21',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.badgeGreen,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  sendButtonLight: {
    backgroundColor: '#00a884',
  },
  sendIconOffset: {
    marginLeft: 3,
  },
  micButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.badgeGreen,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  recordingStrip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(32, 44, 51, 0.95)',
    borderRadius: 25,
    paddingHorizontal: 16,
    minHeight: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  recordingStripLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  recordPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulsingRedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
  },
  recordingTimerText: {
    color: '#e9edef',
    fontSize: 15,
    fontWeight: '600',
  },
  recordingTimerTextLight: {
    color: '#111b21',
  },
  slideCancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slideCancelText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '500',
  },
  deleteRecordBtn: {
    padding: 6,
  },
});

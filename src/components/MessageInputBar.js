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

  const formatRecordTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.outerContainer}>
      {/* Replying preview banner if present */}
      {replyingTo && (
        <View style={styles.replyBanner}>
          <View style={styles.replyBar} />
          <View style={styles.replyContent}>
            <Text style={styles.replySender}>{replyingTo.senderName}</Text>
            <Text style={styles.replyText} numberOfLines={1}>
              {replyingTo.text || 'Photo / Media'}
            </Text>
          </View>
          <TouchableOpacity onPress={onCancelReply} style={styles.replyClose}>
            <Ionicons name="close" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputRow}>
        {isRecording ? (
          /* ACTIVE VOICE RECORDING CAPSULE */
          <View style={styles.recordingCapsule}>
            <View style={styles.recordingLeft}>
              <View style={styles.redBlinkDot} />
              <Ionicons name="mic" size={20} color="#ef4444" style={{ marginRight: 6 }} />
              <Text style={styles.recordingTimerText}>{formatRecordTimer(recordSecs)}</Text>
            </View>

            {/* Simulated Live Audio Sound Waves */}
            <View style={styles.liveAudioWaves}>
              {[8, 16, 24, 14, 20, 26, 12, 18, 22, 10, 16].map((h, i) => (
                <View
                  key={i}
                  style={[
                    styles.liveWaveBar,
                    { height: h * ((recordSecs % 2 === 0 ? 1 : 0.75)) },
                  ]}
                />
              ))}
            </View>

            {/* Cancel / Trash Button */}
            <TouchableOpacity
              style={styles.cancelRecordBtn}
              onPress={cancelRecording}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={22} color="#8696a0" />
            </TouchableOpacity>
          </View>
        ) : (
          /* REGULAR MESSAGE INPUT CAPSULE */
          <View style={styles.inputCapsule}>
            <TouchableOpacity
              style={styles.capsuleIcon}
              onPress={onToggleEmoji}
              activeOpacity={0.7}
            >
              <Ionicons name="happy-outline" size={24} color={COLORS.iconDefault} />
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              placeholder="Message"
              placeholderTextColor={COLORS.textMuted}
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
              <Ionicons name="attach" size={24} color={COLORS.iconDefault} style={styles.attachRotate} />
            </TouchableOpacity>

            {!text.trim() && (
              <TouchableOpacity
                style={styles.capsuleIcon}
                onPress={onQuickCamera}
                activeOpacity={0.7}
              >
                <Feather name="camera" size={20} color={COLORS.iconDefault} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Dynamic Action Button: Send or Mic */}
        {isRecording ? (
          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendVoiceNote}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={19} color="#111b21" style={styles.sendIconOffset} />
          </TouchableOpacity>
        ) : text.trim() ? (
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={19} color="#111b21" style={styles.sendIconOffset} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.micButton}
            onPress={startRecording}
            activeOpacity={0.8}
          >
            <Ionicons
              name="mic"
              size={22}
              color="#111b21"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: COLORS.chatBackground,
    paddingHorizontal: 6,
    paddingBottom: Platform.OS === 'ios' ? 12 : 8,
    paddingTop: 6,
  },
  replyBanner: {
    backgroundColor: '#202c33',
    borderRadius: 8,
    marginBottom: 6,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#2a3942',
  },
  replyBar: {
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
    fontSize: 12,
    fontWeight: '600',
  },
  replyText: {
    color: COLORS.textSecondary,
    fontSize: 13,
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
    backgroundColor: COLORS.headerBackground,
    borderRadius: 25,
    paddingHorizontal: 8,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    fontSize: 16,
    color: COLORS.textPrimary,
    maxHeight: 110,
    paddingHorizontal: 6,
    paddingVertical: 4,
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
  micButtonActive: {
    backgroundColor: COLORS.danger,
    transform: [{ scale: 1.1 }],
  },
  recordingCapsule: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2c34',
    borderRadius: 25,
    paddingHorizontal: 12,
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#2a3942',
    justifyContent: 'space-between',
  },
  recordingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  redBlinkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginRight: 6,
  },
  recordingTimerText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  liveAudioWaves: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
  },
  liveWaveBar: {
    width: 3,
    backgroundColor: COLORS.accentGreen,
    borderRadius: 2,
  },
  cancelRecordBtn: {
    padding: 6,
  },
});

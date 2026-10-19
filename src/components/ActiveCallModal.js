import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function ActiveCallModal({
  visible,
  contact,
  callType = 'video', // 'video' | 'voice'
  onEndCall,
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval;
    if (visible) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setSeconds(0);
    }
    return () => clearInterval(interval);
  }, [visible]);

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!visible || !contact) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onEndCall}
    >
      <SafeAreaView style={styles.container}>
        {/* Top Bar info */}
        <View style={styles.topInfo}>
          <View style={styles.securityPill}>
            <Ionicons name="lock-closed" size={12} color="#8696a0" />
            <Text style={styles.securityText}>End-to-end encrypted</Text>
          </View>
          <Text style={styles.callerName}>{contact.name}</Text>
          <Text style={styles.callTimer}>
            {seconds > 0 ? formatTimer(seconds) : 'Ringing...'}
          </Text>
        </View>

        {/* Center: Video preview or large Avatar */}
        <View style={styles.centerArea}>
          {callType === 'video' && !isVideoOff ? (
            <View style={styles.videoSimContainer}>
              {contact.avatar && (
                <Image
                  source={{ uri: contact.avatar }}
                  style={styles.videoBgImage}
                  blurRadius={10}
                />
              )}
              <View style={styles.videoOverlay}>
                <Image
                  source={{ uri: contact.avatar }}
                  style={styles.videoCenterAvatar}
                />
                <Text style={styles.videoOverlayText}>Live WebRTC Connected</Text>
              </View>

              {/* Pip preview */}
              <View style={styles.pipWindow}>
                <Text style={styles.pipText}>You</Text>
              </View>
            </View>
          ) : (
            <View style={styles.avatarContainer}>
              {contact.avatar ? (
                <Image source={{ uri: contact.avatar }} style={styles.voiceAvatar} />
              ) : (
                <View style={styles.voicePlaceholder}>
                  <Text style={styles.voiceInitial}>{contact.name?.charAt(0)}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Bottom Call Controls */}
        <View style={styles.controlsBar}>
          <TouchableOpacity
            style={[styles.controlBtn, isSpeaker && styles.controlBtnActive]}
            onPress={() => setIsSpeaker(!isSpeaker)}
          >
            <Ionicons
              name={isSpeaker ? 'volume-high' : 'volume-medium-outline'}
              size={24}
              color={isSpeaker ? '#111b21' : COLORS.textPrimary}
            />
          </TouchableOpacity>

          {callType === 'video' && (
            <TouchableOpacity
              style={[styles.controlBtn, isVideoOff && styles.controlBtnActive]}
              onPress={() => setIsVideoOff(!isVideoOff)}
            >
              <Ionicons
                name={isVideoOff ? 'videocam-off' : 'videocam-outline'}
                size={24}
                color={isVideoOff ? '#111b21' : COLORS.textPrimary}
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
            onPress={() => setIsMuted(!isMuted)}
          >
            <Ionicons
              name={isMuted ? 'mic-off' : 'mic-outline'}
              size={24}
              color={isMuted ? '#111b21' : COLORS.textPrimary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.endCallBtn}
            onPress={onEndCall}
          >
            <Ionicons name="call" size={28} color="#ffffff" style={styles.endCallIcon} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b141a',
    justifyContent: 'space-between',
  },
  topInfo: {
    alignItems: 'center',
    paddingTop: 24,
  },
  securityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  securityText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  callerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  callTimer: {
    fontSize: 14,
    color: COLORS.accentGreen,
    fontWeight: '500',
  },
  centerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  voiceAvatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: '#00a884',
  },
  voicePlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#005c4b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceInitial: {
    fontSize: 54,
    color: COLORS.textWhite,
    fontWeight: 'bold',
  },
  videoSimContainer: {
    width: '100%',
    height: '95%',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1f2c34',
  },
  videoBgImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoCenterAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#00a884',
    marginBottom: 12,
  },
  videoOverlayText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  pipWindow: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 80,
    height: 110,
    borderRadius: 12,
    backgroundColor: '#2a3942',
    borderWidth: 1.5,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  controlsBar: {
    backgroundColor: '#202c33',
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 36,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#2a3942',
  },
  controlBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2a3942',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnActive: {
    backgroundColor: COLORS.textPrimary,
  },
  endCallBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endCallIcon: {
    transform: [{ rotate: '135deg' }],
  },
});

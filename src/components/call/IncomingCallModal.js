import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { COLORS } from '../../constants/theme';

export default function IncomingCallModal({
  visible,
  caller,
  callType = 'video', // 'video' | 'voice'
  onAccept,
  onDecline,
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (visible) {
      const pulseLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.45,
              duration: 1100,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1100,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 0.15,
              duration: 1100,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.6,
              duration: 1100,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      pulseLoop.start();
      return () => pulseLoop.stop();
    }
  }, [visible]);

  if (!visible || !caller) return null;

  const isVideo = callType === 'video';
  const callerName = caller.name || caller.username || 'Someone';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onDecline}
    >
      <View style={styles.modalBackdrop}>
        <SafeAreaView style={styles.safeContainer}>
          <View style={styles.callCard}>
            {/* Frosted Glass Backdrop */}
            <BlurView
              intensity={Platform.OS === 'ios' ? 70 : 85}
              tint="dark"
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.cardTintOverlay} />

            {/* Ambient Top Glow */}
            <View style={styles.ambientGlow} />

            {/* WhatsApp Call Badge */}
            <View style={styles.badgeRow}>
              <Ionicons
                name={isVideo ? 'videocam' : 'call'}
                size={14}
                color={COLORS.badgeGreen}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.badgeText}>
                WhatsApp {isVideo ? 'Video' : 'Voice'} Call
              </Text>
            </View>

            {/* Caller Avatar with Pulsing Waves */}
            <View style={styles.avatarArea}>
              <Animated.View
                style={[
                  styles.pulseRing,
                  {
                    transform: [{ scale: pulseAnim }],
                    opacity: opacityAnim,
                  },
                ]}
              />
              <View style={styles.avatarRing}>
                {caller.avatar ? (
                  <Image source={{ uri: caller.avatar }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitial}>{callerName.charAt(0)}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Caller Info */}
            <Text style={styles.callerName}>{callerName}</Text>
            {Boolean(caller.username) && (
              <Text style={styles.callerUsername}>@{caller.username}</Text>
            )}
            <Text style={styles.incomingLabel}>Incoming call...</Text>

            {/* Action Buttons: Decline & Accept */}
            <View style={styles.actionsRow}>
              {/* Decline Button */}
              <View style={styles.actionCol}>
                <TouchableOpacity
                  style={styles.declineButton}
                  onPress={onDecline}
                  activeOpacity={0.8}
                >
                  <Ionicons name="call" size={28} color="#ffffff" style={{ transform: [{ rotate: '135deg' }] }} />
                </TouchableOpacity>
                <Text style={styles.actionLabel}>Decline</Text>
              </View>

              {/* Accept Button */}
              <View style={styles.actionCol}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={onAccept}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={isVideo ? 'videocam' : 'call'}
                    size={28}
                    color="#ffffff"
                  />
                </TouchableOpacity>
                <Text style={[styles.actionLabel, { color: COLORS.badgeGreen }]}>Accept</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  safeContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
        }
      : {}),
  },
  cardTintOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 29, 0.85)',
  },
  ambientGlow: {
    position: 'absolute',
    top: -40,
    left: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(0, 168, 132, 0.15)',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 168, 132, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 168, 132, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    marginBottom: 28,
  },
  badgeText: {
    fontSize: 12,
    color: COLORS.badgeGreen,
    fontWeight: '600',
  },
  avatarArea: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 168, 132, 0.35)',
  },
  avatarRing: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    borderColor: COLORS.badgeGreen,
    overflow: 'hidden',
    shadowColor: COLORS.badgeGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#202c33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 34,
    fontWeight: '700',
    color: COLORS.badgeGreen,
  },
  callerName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  callerUsername: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  incomingLabel: {
    fontSize: 13,
    color: COLORS.accentGreen,
    marginTop: 8,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 36,
    paddingHorizontal: 20,
  },
  actionCol: {
    alignItems: 'center',
  },
  declineButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  acceptButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  actionLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 8,
  },
});

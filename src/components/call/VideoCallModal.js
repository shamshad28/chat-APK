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
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, Camera } from 'expo-camera';
import { COLORS } from '../../constants/theme';

export default function VideoCallModal({
  visible,
  contact,
  callType = 'video', // 'video' | 'voice'
  duration: propDuration,
  isMuted: propMuted,
  isVideoOff: propVideoOff,
  isSpeaker: propSpeaker,
  isFrontCamera: propFrontCamera,
  isMinimized: propMinimized,
  onToggleMute,
  onToggleVideo,
  onToggleSpeaker,
  onFlipCamera,
  onToggleMinimized,
  onEndCall,
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraMountError, setCameraMountError] = useState(null);
  const [isSwapped, setIsSwapped] = useState(false);
  const [internalMuted, setInternalMuted] = useState(false);
  const [internalVideoOff, setInternalVideoOff] = useState(false);
  const [internalSpeaker, setInternalSpeaker] = useState(true);
  const [internalFrontCamera, setInternalFrontCamera] = useState(true);
  const [internalMinimized, setInternalMinimized] = useState(false);
  const [internalSeconds, setInternalSeconds] = useState(0);

  const isMuted = propMuted !== undefined ? propMuted : internalMuted;
  const isVideoOff = propVideoOff !== undefined ? propVideoOff : internalVideoOff;
  const isSpeaker = propSpeaker !== undefined ? propSpeaker : internalSpeaker;
  const isFrontCamera = propFrontCamera !== undefined ? propFrontCamera : internalFrontCamera;
  const isMinimized = propMinimized !== undefined ? propMinimized : internalMinimized;
  const seconds = propDuration !== undefined ? propDuration : internalSeconds;

  const handleToggleMute = onToggleMute || (() => setInternalMuted(!internalMuted));
  const handleToggleVideo = onToggleVideo || (() => setInternalVideoOff(!internalVideoOff));
  const handleToggleSpeaker = onToggleSpeaker || (() => setInternalSpeaker(!internalSpeaker));
  const handleFlipCamera = onFlipCamera || (() => setInternalFrontCamera(!internalFrontCamera));
  const handleToggleMinimized = onToggleMinimized || (() => setInternalMinimized(!internalMinimized));

  useEffect(() => {
    let interval;
    if (visible && propDuration === undefined) {
      interval = setInterval(() => {
        setInternalSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setInternalSeconds(0);
      setInternalMinimized(false);
      setCameraMountError(null);
    }
    return () => clearInterval(interval);
  }, [visible, propDuration]);

  const isVideo = callType === 'video' && !isVideoOff;

  // Auto-request camera permissions once when entering video call
  useEffect(() => {
    if (visible && callType === 'video') {
      (async () => {
        try {
          if (!permission?.granted) {
            const res = await requestPermission();
            if (!res?.granted) {
              await Camera.requestCameraPermissionsAsync();
            }
          }
        } catch (e) {
          console.warn('Call camera permission request error:', e);
        }
      })();
    }
  }, [visible, callType]);

  if (!visible || !contact) return null;

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Local camera view mode (defaults to full screen camera for local testing; tap PiP to swap to peer view)
  const showLocalOnMain = !isSwapped;

  // 1. Minimized View (Floating Picture-in-Picture)
  if (isMinimized) {
    return (
      <View style={styles.minimizedContainer}>
        <View style={styles.minimizedContent}>
          <View style={styles.minimizedLeft}>
            <View style={styles.pulsingGreenDot} />
            <Text style={styles.minimizedName} numberOfLines={1}>
              {contact.name}
            </Text>
          </View>
          <Text style={styles.minimizedTimer}>{formatTimer(seconds)}</Text>
          <TouchableOpacity
            onPress={() => handleToggleMinimized()}
            style={styles.minimizedIconBtn}
          >
            <Ionicons name="expand" size={18} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onEndCall}
            style={[styles.minimizedIconBtn, { backgroundColor: '#dc2626' }]}
          >
            <Ionicons name="call" size={16} color="#ffffff" style={{ transform: [{ rotate: '135deg' }] }} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 2. Full-Screen Call Modal
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onEndCall}
    >
      <SafeAreaView style={styles.container}>
        {/* Top Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={() => handleToggleMinimized()}
            style={styles.headerBtn}
          >
            <Ionicons name="chevron-down" size={26} color="#ffffff" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.securityPill}>
              <Ionicons name="lock-closed" size={11} color="#8696a0" />
              <Text style={styles.securityText}>End-to-end encrypted</Text>
            </View>
            <Text style={styles.headerContactName}>{contact.name}</Text>
            <Text style={styles.headerTimer}>
              {seconds > 0 ? formatTimer(seconds) : 'Calling...'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => handleFlipCamera()}
            style={styles.headerBtn}
          >
            <Ionicons name="camera-reverse-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Video / Voice Call Main Canvas */}
        <View style={styles.callCanvas}>
          {isVideo ? (
            <>
              <View style={styles.videoStreamContainer}>
                {/* MAIN FULL-SCREEN FEED */}
                {showLocalOnMain ? (
                  /* Main View Shows Local Camera */
                  permission?.granted && !isVideoOff && !cameraMountError ? (
                    <View style={StyleSheet.absoluteFillObject}>
                      <CameraView
                        style={StyleSheet.absoluteFillObject}
                        facing={isFrontCamera ? 'front' : 'back'}
                        active={!isVideoOff}
                        onMountError={(err) => {
                          console.warn('Call CameraView mount error:', err);
                          setCameraMountError(err?.message || 'Camera error');
                        }}
                      />
                      {/* Live Cam Watermark & Facing Tag */}
                      <TouchableOpacity
                        style={styles.mainCameraTag}
                        onPress={() => setIsSwapped(!isSwapped)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.liveGreenDot} />
                        <Text style={styles.mainCameraTagText}>
                          Live Camera ({isFrontCamera ? 'Front' : 'Back'}) • Tap to swap
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.cameraOffPlaceholder}>
                      <View style={styles.cameraOffCircle}>
                        <Ionicons
                          name={isVideoOff ? 'videocam-off' : 'camera'}
                          size={48}
                          color={COLORS.accentGreen}
                        />
                      </View>
                      <Text style={styles.cameraOffHeading}>
                        {isVideoOff
                          ? 'Camera Turned Off'
                          : cameraMountError
                          ? 'Camera Preview Note'
                          : 'Camera Access Needed'}
                      </Text>
                      <Text style={styles.cameraOffText}>
                        {isVideoOff
                          ? 'Tap the video icon below to turn your camera back on.'
                          : cameraMountError
                          ? `Live video stream active.\n(${cameraMountError})`
                          : 'PulseChat needs camera permission so your video is visible during calls.'}
                      </Text>
                      {!permission?.granted && !isVideoOff && (
                        <TouchableOpacity
                          style={styles.enableCamBtn}
                          onPress={async () => {
                            try {
                              const res = await requestPermission();
                              if (!res?.granted) {
                                await Camera.requestCameraPermissionsAsync();
                              }
                            } catch (e) {
                              console.warn(e);
                            }
                          }}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="videocam" size={20} color="#0b141a" style={{ marginRight: 8 }} />
                          <Text style={styles.enableCamBtnText}>Grant Camera Permission</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )
                ) : (
                  /* Main View Shows Remote Peer (Priya Mali) */
                  <>
                    {contact.avatar && (
                      <Image
                        source={{ uri: contact.avatar }}
                        style={styles.videoStreamBg}
                        blurRadius={12}
                      />
                    )}
                    <View style={styles.videoStreamCenter}>
                      <Image
                        source={{ uri: contact.avatar }}
                        style={styles.videoRemoteAvatar}
                      />
                      <Text style={styles.liveWebRtcBadge}>Live WebRTC 1080p</Text>
                      <Text style={styles.remotePeerName}>{contact.name}</Text>
                    </View>
                  </>
                )}

                {/* OVERLAY WHILE CALLING / DIALING */}
                {seconds === 0 && (
                  <View style={styles.callingOverlayCard}>
                    <Image
                      source={{ uri: contact.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }}
                      style={styles.callingAvatar}
                    />
                    <Text style={styles.callingTitle}>Calling {contact.name}...</Text>
                    <Text style={styles.callingSubtitle}>Ringing • Camera Ready</Text>
                  </View>
                )}
              </View>

              {/* PICTURE-IN-PICTURE (PiP) VIEW - Positioned at Top Right */}
              <TouchableOpacity
                style={styles.pipSelfView}
                onPress={() => setIsSwapped(!isSwapped)}
                activeOpacity={0.88}
              >
                {showLocalOnMain ? (
                  /* PiP Shows Remote Peer */
                  <View style={styles.pipRemoteWrapper}>
                    <Image
                      source={{ uri: contact.avatar }}
                      style={styles.pipRemoteAvatar}
                    />
                    <View style={styles.pipTag}>
                      <Text style={styles.pipLabel} numberOfLines={1}>
                        {contact.name}
                      </Text>
                    </View>
                  </View>
                ) : (
                  /* PiP Shows Local Camera */
                  permission?.granted && !isVideoOff && !cameraMountError ? (
                    <View style={styles.pipCameraWrapper}>
                      <CameraView
                        style={StyleSheet.absoluteFillObject}
                        facing={isFrontCamera ? 'front' : 'back'}
                        active={!isVideoOff}
                        onMountError={(err) => {
                          console.warn('PiP CameraView mount error:', err);
                          setCameraMountError(err?.message || 'Camera error');
                        }}
                      />
                      <View style={styles.pipTag}>
                        <Text style={styles.pipLabel}>
                          You ({isFrontCamera ? 'Front' : 'Back'})
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.pipCamSim}>
                      <Ionicons
                        name={isVideoOff ? 'videocam-off' : 'camera'}
                        size={26}
                        color={COLORS.accentGreen}
                      />
                      <Text style={styles.pipOffText}>
                        {isVideoOff ? 'Cam Off' : 'Enable'}
                      </Text>
                    </View>
                  )
                )}
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.voiceCallContainer}>
              <View style={styles.voiceAvatarWrapper}>
                {contact.avatar ? (
                  <Image source={{ uri: contact.avatar }} style={styles.voiceAvatar} />
                ) : (
                  <View style={styles.voicePlaceholder}>
                    <Text style={styles.voiceInitial}>{contact.name?.charAt(0)}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.voiceStatusText}>
                {seconds > 0 ? 'Audio Connected' : 'Calling...'}
              </Text>
            </View>
          )}
        </View>

        {/* Bottom Call Controls Dock */}
        <View style={styles.controlsDock}>
          <View style={styles.controlsRow}>
            {/* Speaker Toggle */}
            <TouchableOpacity
              style={[styles.controlBtn, isSpeaker && styles.controlBtnActive]}
              onPress={() => handleToggleSpeaker()}
              activeOpacity={0.75}
            >
              <Ionicons
                name={isSpeaker ? 'volume-high' : 'volume-mute'}
                size={22}
                color={isSpeaker ? '#111b21' : '#ffffff'}
              />
            </TouchableOpacity>

            {/* Video Toggle */}
            <TouchableOpacity
              style={[styles.controlBtn, isVideoOff && styles.controlBtnDanger]}
              onPress={() => handleToggleVideo()}
              activeOpacity={0.75}
            >
              <Ionicons
                name={isVideoOff ? 'videocam-off' : 'videocam'}
                size={22}
                color="#ffffff"
              />
            </TouchableOpacity>

            {/* Mute Mic Toggle */}
            <TouchableOpacity
              style={[styles.controlBtn, isMuted && styles.controlBtnDanger]}
              onPress={() => handleToggleMute()}
              activeOpacity={0.75}
            >
              <Ionicons
                name={isMuted ? 'mic-off' : 'mic'}
                size={22}
                color="#ffffff"
              />
            </TouchableOpacity>

            {/* Flip Camera */}
            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => handleFlipCamera()}
              activeOpacity={0.75}
            >
              <Ionicons name="camera-reverse" size={22} color="#ffffff" />
            </TouchableOpacity>

            {/* End Call Button */}
            <TouchableOpacity
              style={styles.endCallBtn}
              onPress={onEndCall}
              activeOpacity={0.8}
            >
              <Ionicons
                name="call"
                size={28}
                color="#ffffff"
                style={{ transform: [{ rotate: '135deg' }] }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b141a',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 10,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  securityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 4,
  },
  securityText: {
    fontSize: 10,
    color: '#8696a0',
    marginLeft: 4,
  },
  headerContactName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerTimer: {
    fontSize: 13,
    color: COLORS.accentGreen,
    fontWeight: '600',
    marginTop: 2,
  },
  callCanvas: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#0b141a',
  },
  videoStreamContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111b21',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoStreamBg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
  },
  videoStreamCenter: {
    alignItems: 'center',
  },
  videoRemoteAvatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: COLORS.badgeGreen,
    marginBottom: 16,
  },
  liveWebRtcBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: COLORS.badgeGreen,
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 168, 132, 0.3)',
  },
  remotePeerName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  mainCameraTag: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  liveGreenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accentGreen,
    marginRight: 6,
  },
  mainCameraTagText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  callingOverlayCard: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(17, 27, 33, 0.88)',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 168, 132, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  callingAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.accentGreen,
    marginRight: 14,
  },
  callingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
  },
  callingSubtitle: {
    fontSize: 12,
    color: COLORS.accentGreen,
    fontWeight: '500',
    marginTop: 2,
  },
  cameraOffPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    backgroundColor: 'rgba(17, 27, 33, 0.95)',
    borderRadius: 24,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cameraOffCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(0, 168, 132, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 168, 132, 0.3)',
  },
  cameraOffHeading: {
    fontSize: 19,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  cameraOffText: {
    color: '#8696a0',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  enableCamBtn: {
    marginTop: 18,
    backgroundColor: COLORS.accentGreen,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: COLORS.accentGreen,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  enableCamBtnText: {
    color: '#0b141a',
    fontSize: 14,
    fontWeight: 'bold',
  },
  pipSelfView: {
    position: 'absolute',
    top: 20,
    right: 16,
    width: 115,
    height: 165,
    borderRadius: 16,
    backgroundColor: '#111b21',
    borderWidth: 2,
    borderColor: '#00a884',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 12,
    zIndex: 9999,
  },
  pipCameraWrapper: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  pipRemoteWrapper: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111b21',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipRemoteAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: COLORS.accentGreen,
  },
  pipTag: {
    position: 'absolute',
    bottom: 6,
    left: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  pipLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  pipCamSim: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#202c33',
  },
  pipOffText: {
    fontSize: 11,
    color: '#8696a0',
    marginTop: 4,
    fontWeight: '500',
  },
  voiceCallContainer: {
    alignItems: 'center',
  },
  voiceAvatarWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#202c33',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLORS.badgeGreen,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  voiceAvatar: {
    width: '100%',
    height: '100%',
  },
  voicePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#202c33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceInitial: {
    fontSize: 50,
    fontWeight: '700',
    color: COLORS.badgeGreen,
  },
  voiceStatusText: {
    color: '#8696a0',
    fontSize: 14,
    marginTop: 18,
    fontWeight: '500',
  },
  controlsDock: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 16,
    backgroundColor: 'rgba(17, 27, 33, 0.95)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderTopColor: '#202c33',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#202c33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnActive: {
    backgroundColor: COLORS.badgeGreen,
  },
  controlBtnDanger: {
    backgroundColor: '#dc2626',
  },
  endCallBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  minimizedContainer: {
    position: 'absolute',
    bottom: 84,
    right: 16,
    zIndex: 9999,
  },
  minimizedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111b21',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#202c33',
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  minimizedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 100,
    marginRight: 8,
  },
  pulsingGreenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.badgeGreen,
    marginRight: 6,
  },
  minimizedName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  minimizedTimer: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accentGreen,
    marginRight: 10,
  },
  minimizedIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#202c33',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
});

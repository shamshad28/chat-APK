import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, Camera } from 'expo-camera';
import { BlurView } from 'expo-blur';
import { COLORS } from '../../constants/theme';
import { requestCameraPermission as requestAppCameraPermission } from '../../services/cameraService';

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
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [hasPermission, setHasPermission] = useState(() => Boolean(permission?.granted));
  const [cameraMountError, setCameraMountError] = useState(null);
  const [cameraKey, setCameraKey] = useState(0);
  const [isSwapped, setIsSwapped] = useState(false);
  const [internalMuted, setInternalMuted] = useState(false);
  const [internalVideoOff, setInternalVideoOff] = useState(false);
  const [internalSpeaker, setInternalSpeaker] = useState(true);
  const [internalFrontCamera, setInternalFrontCamera] = useState(true);
  const [internalMinimized, setInternalMinimized] = useState(false);
  const [internalSeconds, setInternalSeconds] = useState(0);

  // Web camera refs & stream for React Native Web fallback
  const mainWebVideoRef = useRef(null);
  const pipWebVideoRef = useRef(null);
  const [webStream, setWebStream] = useState(null);

  // Sync internal state with external props
  useEffect(() => {
    if (propMuted !== undefined) setInternalMuted(propMuted);
  }, [propMuted]);

  useEffect(() => {
    if (propVideoOff !== undefined) setInternalVideoOff(propVideoOff);
  }, [propVideoOff]);

  useEffect(() => {
    if (propSpeaker !== undefined) setInternalSpeaker(propSpeaker);
  }, [propSpeaker]);

  useEffect(() => {
    if (propFrontCamera !== undefined) setInternalFrontCamera(propFrontCamera);
  }, [propFrontCamera]);

  useEffect(() => {
    if (propMinimized !== undefined) setInternalMinimized(propMinimized);
  }, [propMinimized]);

  useEffect(() => {
    if (permission?.granted) {
      setHasPermission(true);
    }
  }, [permission?.granted]);

  const isMuted = propMuted !== undefined ? propMuted : internalMuted;
  const isVideoOff = propVideoOff !== undefined ? propVideoOff : internalVideoOff;
  const isSpeaker = propSpeaker !== undefined ? propSpeaker : internalSpeaker;
  const isFrontCamera = propFrontCamera !== undefined ? propFrontCamera : internalFrontCamera;
  const isMinimized = propMinimized !== undefined ? propMinimized : internalMinimized;
  const seconds = propDuration !== undefined ? propDuration : internalSeconds;

  const isCameraAllowed = Boolean(hasPermission || permission?.granted);

  const handleToggleMute = () => {
    setInternalMuted((prev) => !prev);
    if (onToggleMute) onToggleMute();
  };

  const handleToggleVideo = () => {
    setCameraMountError(null);
    setCameraKey((prev) => prev + 1);
    setInternalVideoOff((prev) => !prev);
    if (onToggleVideo) onToggleVideo();
  };

  const handleToggleSpeaker = () => {
    setInternalSpeaker((prev) => !prev);
    if (onToggleSpeaker) onToggleSpeaker();
  };

  const handleFlipCamera = () => {
    setCameraMountError(null);
    setCameraKey((prev) => prev + 1);
    setInternalFrontCamera((prev) => !prev);
    if (onFlipCamera) onFlipCamera();
  };

  const handleToggleMinimized = () => {
    setInternalMinimized((prev) => !prev);
    if (onToggleMinimized) onToggleMinimized();
  };

  useEffect(() => {
    let interval;
    if (visible) {
      setCameraKey((prev) => prev + 1);
      if (propDuration === undefined) {
        interval = setInterval(() => {
          setInternalSeconds((prev) => prev + 1);
        }, 1000);
      }
    } else {
      setInternalSeconds(0);
      setInternalMinimized(false);
      setCameraMountError(null);
      setIsSwapped(false);
    }
    return () => clearInterval(interval);
  }, [visible, propDuration]);

  const isVideo = callType === 'video';

  // Resilient multi-tier camera permission requester
  const requestCameraAccess = async () => {
    try {
      setCameraMountError(null);
      if (requestPermission) {
        const res = await requestPermission();
        if (res?.granted) {
          setHasPermission(true);
          return true;
        }
      }
      const camRes = await Camera.requestCameraPermissionsAsync();
      if (camRes?.granted) {
        setHasPermission(true);
        return true;
      }
      const ok = await requestAppCameraPermission();
      if (ok) {
        setHasPermission(true);
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Call camera permission request error:', e);
      return false;
    }
  };

  // Auto-request camera permissions once when entering video call
  useEffect(() => {
    if (visible && callType === 'video') {
      setCameraMountError(null);
      (async () => {
        try {
          const camStatus = await Camera.getCameraPermissionsAsync();
          if (camStatus?.granted) {
            setHasPermission(true);
          } else if (permission?.granted) {
            setHasPermission(true);
          } else {
            await requestCameraAccess();
          }
        } catch (e) {
          await requestCameraAccess();
        }
      })();
    }
  }, [visible, callType]);

  // Web Browser Camera handling (React Native Web)
  useEffect(() => {
    let active = true;
    if (Platform.OS === 'web' && visible && callType === 'video' && !isVideoOff) {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({
            video: {
              facingMode: isFrontCamera ? 'user' : 'environment',
            },
            audio: false,
          })
          .then((stream) => {
            if (active) {
              setWebStream(stream);
              setHasPermission(true);
            } else {
              stream.getTracks().forEach((t) => t.stop());
            }
          })
          .catch(() => {
            // Fallback without facingMode for desktops/laptops
            navigator.mediaDevices
              ?.getUserMedia({ video: true, audio: false })
              .then((fallbackStream) => {
                if (active) {
                  setWebStream(fallbackStream);
                  setHasPermission(true);
                } else {
                  fallbackStream.getTracks().forEach((t) => t.stop());
                }
              })
              .catch((err) => {
                console.warn('Web webcam access failed:', err);
                setCameraMountError('Webcam access was denied or not found');
              });
          });
      }
    }

    return () => {
      active = false;
      if (webStream) {
        webStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [visible, callType, isVideoOff, isFrontCamera]);

  // Render camera stream with cross-platform native + web support
  const renderCameraStream = (isPip = false) => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.cameraFill}>
          <video
            ref={(el) => {
              if (isPip) {
                pipWebVideoRef.current = el;
              } else {
                mainWebVideoRef.current = el;
              }
              if (el && webStream) {
                if (el.srcObject !== webStream) {
                  el.srcObject = webStream;
                }
                el.play().catch(() => {});
              }
            }}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: isFrontCamera ? 'scaleX(-1)' : 'none',
              backgroundColor: '#111b21',
            }}
          />
        </View>
      );
    }

    return (
      <CameraView
        key={`call_cam_${isFrontCamera ? 'front' : 'back'}_${isPip ? 'pip' : 'main'}_${cameraKey}`}
        style={styles.cameraFill}
        facing={isFrontCamera ? 'front' : 'back'}
        mirror={isFrontCamera}
        ratio="16:9"
        mode="picture"
        active={true}
        onMountError={(err) => {
          console.warn(`${isPip ? 'PiP' : 'Main'} CameraView mount error:`, err);
          if (isFrontCamera) {
            setInternalFrontCamera(false);
          } else {
            setCameraMountError(err?.message || 'Camera error');
          }
        }}
      />
    );
  };

  if (!visible || !contact) return null;

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // During dialing/ringing (seconds === 0): local camera is on main screen by default so caller sees themselves.
  // When connected (seconds > 0): remote peer is on main screen by default, local in PiP.
  // `isSwapped` flips the default for the current phase.
  const showLocalOnMain = seconds === 0 ? !isSwapped : isSwapped;

  // 1. Minimized View (Floating Picture-in-Picture Capsule)
  if (isMinimized) {
    return (
      <View style={styles.minimizedContainer}>
        <View style={styles.minimizedContent}>
          <BlurView
            intensity={Platform.OS === 'ios' ? 70 : 85}
            tint="dark"
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.minimizedTintOverlay} />
          <View style={styles.minimizedLeft}>
            <View style={styles.pulsingGreenDot} />
            <Text style={styles.minimizedName} numberOfLines={1}>
              {contact.name}
            </Text>
          </View>
          <Text style={styles.minimizedTimer}>{formatTimer(seconds)}</Text>
          <TouchableOpacity
            onPress={handleToggleMinimized}
            style={styles.minimizedIconBtn}
          >
            <Ionicons name="expand" size={17} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onEndCall}
            style={[styles.minimizedIconBtn, { backgroundColor: '#dc2626' }]}
          >
            <Ionicons name="call" size={15} color="#ffffff" style={{ transform: [{ rotate: '135deg' }] }} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 2. Full-Screen Call Modal
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent={true}
      onRequestClose={onEndCall}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        {/* Full-Screen Edge-to-Edge Video Canvas */}
        <View style={styles.callCanvas}>
          {isVideo ? (
            <>
              {/* MAIN FULL-SCREEN FEED */}
              {showLocalOnMain ? (
                /* Main View Shows Local Camera */
                isCameraAllowed && !isVideoOff && !cameraMountError ? (
                  <View style={StyleSheet.absoluteFillObject}>
                    {renderCameraStream(false)}

                    {/* Live Camera Tag */}
                    <View style={[styles.cameraFacingTag, { top: Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 20) : 20) + 56 }]}>
                      <View style={styles.liveGreenDot} />
                      <Text style={styles.cameraFacingTagText}>
                        You ({isFrontCamera ? 'Front' : 'Back'}){seconds > 0 ? ' • Tap PiP to swap' : ' • Live Preview'}
                      </Text>
                    </View>

                    {/* During Ringing / Calling: Floating Contact Card over Full-Screen Live Camera */}
                    {seconds === 0 && (
                      <View style={[styles.callingOverlayCard, { top: Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 20) : 20) + 68 }]}>
                        <BlurView
                          intensity={Platform.OS === 'ios' ? 70 : 85}
                          tint="dark"
                          style={StyleSheet.absoluteFillObject}
                        />
                        <View style={styles.callingOverlayTint} />
                        <View style={styles.callingAvatarRing}>
                          <Image
                            source={{ uri: contact.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' }}
                            style={styles.callingAvatar}
                          />
                        </View>
                        <Text style={styles.callingContactName} numberOfLines={1}>{contact.name}</Text>
                        <View style={styles.encryptedPill}>
                          <Ionicons name="lock-closed" size={11} color={COLORS.badgeGreen} style={{ marginRight: 4 }} />
                          <Text style={styles.encryptedPillText}>End-to-end encrypted</Text>
                        </View>
                        <View style={styles.ringingBadge}>
                          <View style={styles.pulsingGreenDot} />
                          <Text style={styles.ringingBadgeText}>Ringing...</Text>
                        </View>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.cameraOffPlaceholder}>
                    <View style={styles.cameraOffCircle}>
                      <Ionicons
                        name={isVideoOff ? 'videocam-off' : 'camera'}
                        size={52}
                        color={COLORS.accentGreen}
                      />
                    </View>
                    <Text style={styles.cameraOffHeading}>
                      {isVideoOff ? 'Camera Turned Off' : 'Camera Access Needed'}
                    </Text>
                    <Text style={styles.cameraOffText}>
                      {isVideoOff
                        ? 'Tap the camera button below to turn your video on.'
                        : 'Grant camera access to enable your video preview.'}
                    </Text>
                    {!isCameraAllowed && !isVideoOff && (
                      <TouchableOpacity
                        style={styles.enableCamBtn}
                        onPress={requestCameraAccess}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="videocam" size={20} color="#0b141a" style={{ marginRight: 8 }} />
                        <Text style={styles.enableCamBtnText}>Grant Camera Access</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )
              ) : (
                /* Main View Shows Remote Peer Video / Canvas */
                <View style={styles.remotePeerContainer}>
                  {contact.avatar && (
                    <Image
                      source={{ uri: contact.avatar }}
                      style={styles.remotePeerBgBlur}
                      blurRadius={Platform.OS === 'web' ? 24 : 18}
                    />
                  )}
                  <View style={styles.remotePeerDarkOverlay} />

                  {/* Remote Peer Identity Card */}
                  <View style={styles.remotePeerCenterCard}>
                    <View style={styles.remotePeerAvatarRing}>
                      <Image
                        source={{ uri: contact.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' }}
                        style={styles.remotePeerAvatar}
                      />
                    </View>
                    <Text style={styles.remotePeerName}>{contact.name}</Text>
                    <View style={styles.encryptedPill}>
                      <Ionicons name="lock-closed" size={11} color={COLORS.badgeGreen} style={{ marginRight: 4 }} />
                      <Text style={styles.encryptedPillText}>End-to-end encrypted</Text>
                    </View>
                    <Text style={styles.remotePeerStatus}>
                      {seconds > 0 ? (
                        <Text style={styles.connectedText}>Connected • HD 1080p</Text>
                      ) : (
                        <Text style={styles.ringingText}>Ringing...</Text>
                      )}
                    </Text>
                  </View>
                </View>
              )}

              {/* PICTURE-IN-PICTURE (PiP) VIEW - Positioned at Top Right (Only shown once call is connected) */}
              {seconds > 0 && (
                <TouchableOpacity
                  style={[styles.pipSelfView, { top: Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 20) : 20) + 60 }]}
                  onPress={() => {
                    setCameraKey((k) => k + 1);
                    setIsSwapped(!isSwapped);
                  }}
                  activeOpacity={0.9}
                >
                  {showLocalOnMain ? (
                    /* PiP Shows Remote Peer */
                    <View style={styles.pipRemoteWrapper}>
                      <Image
                        source={{ uri: contact.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }}
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
                    isCameraAllowed && !isVideoOff && !cameraMountError ? (
                      <View style={styles.pipCameraWrapper}>
                        {renderCameraStream(true)}
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
                  {/* Swap Indicator Corner Badge */}
                  <View style={styles.pipSwapBadge}>
                    <Ionicons name="swap-horizontal" size={12} color="#ffffff" />
                  </View>
                </TouchableOpacity>
              )}
            </>
          ) : (
            /* Dedicated Voice Call Canvas */
            <View style={styles.voiceCallContainer}>
              {contact.avatar && (
                <Image
                  source={{ uri: contact.avatar }}
                  style={styles.remotePeerBgBlur}
                  blurRadius={Platform.OS === 'web' ? 24 : 18}
                />
              )}
              <View style={styles.remotePeerDarkOverlay} />

              <View style={styles.voiceCallContent}>
                {/* Voice Avatar with Audio Pulse Ring */}
                <View style={styles.voiceAvatarOuterGlow}>
                  <View style={styles.voiceAvatarWrapper}>
                    {contact.avatar ? (
                      <Image source={{ uri: contact.avatar }} style={styles.voiceAvatar} />
                    ) : (
                      <View style={styles.voicePlaceholder}>
                        <Text style={styles.voiceInitial}>{contact.name?.charAt(0)}</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Contact Name */}
                <Text style={styles.voiceContactName}>{contact.name}</Text>

                {/* Encryption Pill */}
                <View style={styles.encryptedPill}>
                  <Ionicons name="lock-closed" size={11} color={COLORS.badgeGreen} style={{ marginRight: 4 }} />
                  <Text style={styles.encryptedPillText}>End-to-end encrypted voice</Text>
                </View>

                {/* Status / Audio Waves & Live Timer */}
                <View style={styles.voiceTimerContainer}>
                  {seconds > 0 ? (
                    <View style={styles.voiceTimerRow}>
                      <View style={styles.voiceWavesRow}>
                        {[10, 18, 24, 16, 22, 14, 8].map((h, i) => (
                          <View key={i} style={[styles.voiceWaveBar, { height: h }]} />
                        ))}
                      </View>
                      <Text style={styles.voiceTimerText}>{formatTimer(seconds)}</Text>
                    </View>
                  ) : (
                    <View style={styles.voiceCallingRow}>
                      <View style={styles.pulsingGreenDot} />
                      <Text style={styles.voiceStatusText}>Calling...</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Floating Top Header Bar */}
        <View style={[styles.floatingHeaderSafeArea, { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 20) : 20) }]}>
          <View style={styles.headerBar}>
            {/* Minimize button */}
            <TouchableOpacity
              onPress={handleToggleMinimized}
              style={styles.headerCircleBtn}
              activeOpacity={0.75}
            >
              <Ionicons name="chevron-down" size={24} color="#ffffff" />
            </TouchableOpacity>

            {/* Center Info: Video displays contact/timer; Voice displays security badge without duplication */}
            <View style={styles.headerCenter}>
              {isVideo ? (
                <>
                  <Text style={styles.headerContactName} numberOfLines={1}>{contact.name}</Text>
                  <Text style={styles.headerTimer}>
                    {seconds > 0 ? formatTimer(seconds) : 'Calling...'}
                  </Text>
                </>
              ) : (
                <View style={styles.headerVoicePill}>
                  <Ionicons name="lock-closed" size={11} color={COLORS.badgeGreen} style={{ marginRight: 5 }} />
                  <Text style={styles.headerVoicePillText}>WhatsApp Audio</Text>
                </View>
              )}
            </View>

            {/* Quick Action: Only displayed in Video Call */}
            {isVideo ? (
              <TouchableOpacity
                onPress={() => {
                  if (seconds > 0) {
                    setCameraKey((k) => k + 1);
                    setIsSwapped(!isSwapped);
                  } else {
                    handleFlipCamera();
                  }
                }}
                style={styles.headerCircleBtn}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={seconds > 0 ? 'swap-horizontal' : 'camera-reverse'}
                  size={20}
                  color="#ffffff"
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.headerCircleBtnPlaceholder} />
            )}
          </View>
        </View>

        {/* Floating Frosted Glass Bottom Call Controls Dock */}
        <View style={[styles.floatingDockSafeArea, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <View style={styles.controlsDock}>
            <BlurView
              intensity={Platform.OS === 'ios' ? 75 : 90}
              tint="dark"
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.dockTintOverlay} />
            <View style={styles.dockRimGlow} />

            <View style={styles.controlsRow}>
              {/* Speaker Toggle */}
              <TouchableOpacity
                style={[styles.controlBtn, isSpeaker && styles.controlBtnActive]}
                onPress={handleToggleSpeaker}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={isSpeaker ? 'volume-high' : 'volume-mute'}
                  size={22}
                  color={isSpeaker ? '#111b21' : '#ffffff'}
                />
              </TouchableOpacity>

              {/* Video Camera Toggle in Video Call / Switch to Video in Voice Call */}
              {isVideo ? (
                <TouchableOpacity
                  style={[styles.controlBtn, isVideoOff && styles.controlBtnDanger]}
                  onPress={handleToggleVideo}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name={isVideoOff ? 'videocam-off' : 'videocam'}
                    size={22}
                    color="#ffffff"
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.controlBtn}
                  onPress={() => {
                    if (onToggleVideo) onToggleVideo();
                  }}
                  activeOpacity={0.75}
                >
                  <Ionicons name="videocam" size={22} color="#ffffff" />
                </TouchableOpacity>
              )}

              {/* Mic Toggle */}
              <TouchableOpacity
                style={[styles.controlBtn, isMuted && styles.controlBtnDanger]}
                onPress={handleToggleMute}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={isMuted ? 'mic-off' : 'mic'}
                  size={22}
                  color={isMuted ? '#ef4444' : '#ffffff'}
                />
              </TouchableOpacity>

              {/* Flip Camera - ONLY in Video Call */}
              {isVideo && (
                <TouchableOpacity
                  style={styles.controlBtn}
                  onPress={handleFlipCamera}
                  activeOpacity={0.75}
                >
                  <Ionicons name="camera-reverse" size={22} color="#ffffff" />
                </TouchableOpacity>
              )}

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
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070d10',
    position: 'relative',
  },
  callCanvas: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#070d10',
  },

  // Floating Header Bar
  floatingHeaderSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 12,
  },
  headerContactName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  headerTimer: {
    fontSize: 13,
    color: COLORS.accentGreen,
    fontWeight: '600',
    marginTop: 2,
  },

  // Remote Peer Full Screen Canvas
  remotePeerContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#070d10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  remotePeerBgBlur: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.38,
  },
  remotePeerDarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 13, 16, 0.55)',
  },
  remotePeerCenterCard: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  remotePeerAvatarRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3.5,
    borderColor: COLORS.badgeGreen,
    overflow: 'hidden',
    shadowColor: COLORS.badgeGreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: 18,
  },
  remotePeerAvatar: {
    width: '100%',
    height: '100%',
  },
  remotePeerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
    textAlign: 'center',
  },
  encryptedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 168, 132, 0.3)',
  },
  encryptedPillText: {
    fontSize: 11,
    color: '#8696a0',
  },
  remotePeerStatus: {
    marginTop: 4,
  },
  connectedText: {
    color: COLORS.accentGreen,
    fontSize: 13,
    fontWeight: '600',
  },
  ringingText: {
    color: '#8696a0',
    fontSize: 14,
    fontWeight: '500',
  },

  // Local Facing Tag
  cameraFacingTag: {
    position: 'absolute',
    top: 90,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 10,
  },
  liveGreenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accentGreen,
    marginRight: 6,
  },
  cameraFacingTagText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '600',
  },

  cameraFill: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  // Ringing / Calling Overlay Card on Full-Screen Camera
  callingOverlayCard: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 95,
    alignSelf: 'center',
    width: '86%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 30,
  },
  callingOverlayTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 20, 26, 0.72)',
  },
  callingAvatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: COLORS.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accentGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 14,
    backgroundColor: '#202c33',
  },
  callingAvatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
  },
  callingContactName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 6,
  },
  ringingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 168, 132, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 168, 132, 0.4)',
    marginTop: 10,
  },
  pulsingGreenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accentGreen,
    marginRight: 6,
  },
  ringingBadgeText: {
    color: COLORS.accentGreen,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Picture-in-Picture (PiP) Floating Self Window
  pipSelfView: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 96 : 76,
    right: 16,
    width: 110,
    height: 160,
    borderRadius: 16,
    backgroundColor: '#111b21',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 12,
    zIndex: 90,
  },
  pipCameraWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  pipRemoteWrapper: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111b21',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipRemoteAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: COLORS.accentGreen,
  },
  pipTag: {
    position: 'absolute',
    bottom: 6,
    left: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
  pipSwapBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Camera Off Placeholder
  cameraOffPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
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
    paddingHorizontal: 16,
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

  // Dedicated Voice Call Layout — fully flex-based, no hardcoded pixel offsets
  voiceCallContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#070d10',
    flexDirection: 'column',
  },
  voiceCallContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    width: '100%',
    zIndex: 10,
  },
  voiceAvatarOuterGlow: {
    width: Math.min(SCREEN_W * 0.44, 190),
    height: Math.min(SCREEN_W * 0.44, 190),
    borderRadius: Math.min(SCREEN_W * 0.22, 95),
    backgroundColor: 'rgba(0, 168, 132, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SCREEN_H * 0.025,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 168, 132, 0.3)',
  },
  voiceAvatarWrapper: {
    width: Math.min(SCREEN_W * 0.36, 155),
    height: Math.min(SCREEN_W * 0.36, 155),
    borderRadius: Math.min(SCREEN_W * 0.18, 77.5),
    backgroundColor: '#202c33',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3.5,
    borderColor: COLORS.badgeGreen,
    overflow: 'hidden',
    shadowColor: COLORS.badgeGreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
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
    fontSize: Math.min(SCREEN_W * 0.13, 54),
    fontWeight: '700',
    color: COLORS.badgeGreen,
  },
  voiceContactName: {
    fontSize: Math.min(SCREEN_W * 0.065, 28),
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  voiceTimerContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  voiceTimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  voiceWavesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginRight: 10,
  },
  voiceWaveBar: {
    width: 3,
    backgroundColor: COLORS.accentGreen,
    borderRadius: 1.5,
  },
  voiceTimerText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  voiceCallingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 168, 132, 0.18)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 168, 132, 0.35)',
  },
  voiceStatusText: {
    color: COLORS.accentGreen,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  floatingHeaderSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  headerContactName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerTimer: {
    fontSize: 13,
    color: COLORS.accentGreen,
    fontWeight: '600',
    marginTop: 2,
  },
  headerVoicePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 168, 132, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 168, 132, 0.3)',
  },
  headerVoicePillText: {
    color: COLORS.accentGreen,
    fontSize: 12,
    fontWeight: '600',
  },
  headerCircleBtnPlaceholder: {
    width: 42,
    height: 42,
  },

  // Floating Frosted Glass Bottom Controls Dock — fully flexible
  floatingDockSafeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: SCREEN_W * 0.04,
    zIndex: 100,
  },
  controlsDock: {
    width: '100%',
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
    position: 'relative',
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(30px) saturate(210%)',
          WebkitBackdropFilter: 'blur(30px) saturate(210%)',
        }
      : {}),
  },
  dockTintOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 29, 0.72)',
  },
  dockRimGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: SCREEN_H * 0.016,
    paddingHorizontal: SCREEN_W * 0.04,
  },
  controlBtn: {
    width: Math.min(SCREEN_W * 0.13, 54),
    height: Math.min(SCREEN_W * 0.13, 54),
    borderRadius: Math.min(SCREEN_W * 0.065, 27),
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
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
    width: Math.min(SCREEN_W * 0.15, 60),
    height: Math.min(SCREEN_W * 0.15, 60),
    borderRadius: Math.min(SCREEN_W * 0.075, 30),
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },

  // Minimized Widget
  minimizedContainer: {
    position: 'absolute',
    bottom: 96,
    right: 16,
    zIndex: 9999,
  },
  minimizedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    overflow: 'hidden',
    position: 'relative',
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }
      : {}),
  },
  minimizedTintOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 29, 0.85)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
});

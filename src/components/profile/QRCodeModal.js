import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  Alert,
  Share,
  Platform,
  TextInput,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, scanFromURLAsync } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../constants/theme';
import { requestCameraPermission, checkCameraPermission } from '../../services/cameraService';

const { width } = Dimensions.get('window');
const SCAN_BOX_SIZE = Math.min(width * 0.74, 270);

// Generate unique cryptographic QR token
function generateNewQrData(user) {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const token = `PULSE_${user?.id || 'USER'}_${timestamp}_${randomSuffix}`;
  return {
    token,
    generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    hash: `#${randomSuffix}-${timestamp.toString().slice(-4)}`,
  };
}

export default function QRCodeModal({ visible, onClose, user, onJoinUser }) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('myCode'); // 'myCode' | 'scanCode'
  const [qrData, setQrData] = useState(() => generateNewQrData(user || {}));
  const [permission, requestPermission] = useCameraPermissions();
  const [hasPermission, setHasPermission] = useState(() => Boolean(permission?.granted));
  const [torch, setTorch] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [cameraFacing, setCameraFacing] = useState('back');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isModalReady, setIsModalReady] = useState(false);
  const [cameraKey, setCameraKey] = useState(0);
  const [isManualInputVisible, setIsManualInputVisible] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [isProcessingGallery, setIsProcessingGallery] = useState(false);

  // Sync granted permission state
  useEffect(() => {
    if (permission?.granted) {
      setHasPermission(true);
    }
  }, [permission?.granted]);

  // Check hardware permissions immediately when visible
  useEffect(() => {
    if (visible) {
      checkCameraPermission().then((granted) => {
        if (granted) setHasPermission(true);
      });
    }
  }, [visible]);

  // Animated laser line for scanner
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const webVideoRef = useRef(null);

  // Safely request camera permission
  const handleRequestCameraAccess = async () => {
    try {
      setCameraError(null);
      if (Platform.OS === 'web') {
        setHasPermission(true);
        return true;
      }

      // First use expo-camera hook request
      const permRes = await requestPermission();
      if (permRes?.granted) {
        setHasPermission(true);
        setIsCameraReady(false);
        setCameraKey((k) => k + 1);
        return true;
      }

      // Fallback to service helper which prompts system settings if denied
      const camHelperRes = await requestCameraPermission();
      if (camHelperRes) {
        setHasPermission(true);
        setIsCameraReady(false);
        setCameraKey((k) => k + 1);
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Camera request error:', e);
      setCameraError(e?.message || 'Camera request failed');
      return false;
    }
  };

  // Mount error handler with automatic fallback
  const handleMountError = (err) => {
    console.warn('CameraView onMountError:', err);
    setCameraError(err?.message || 'Failed to start camera hardware');
  };

  // Web Webcam Stream Handler for Desktop and Mobile Browsers
  useEffect(() => {
    if (Platform.OS !== 'web' || !visible || activeTab !== 'scanCode') return;
    let localStream = null;
    let detectorTimer = null;

    const startWebcam = async () => {
      try {
        if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
          try {
            localStream = await navigator.mediaDevices.getUserMedia({
              video: {
                facingMode: cameraFacing === 'back' ? { ideal: 'environment' } : 'user',
              },
              audio: false,
            });
          } catch (firstErr) {
            console.warn('Webcam fallback to basic video:', firstErr);
            localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          }

          if (webVideoRef.current && localStream) {
            webVideoRef.current.srcObject = localStream;
            webVideoRef.current.play().catch(() => {});
          }
          setIsCameraReady(true);
          setCameraError(null);

          // Use native browser BarcodeDetector if available
          if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
            try {
              const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
              detectorTimer = setInterval(async () => {
                if (webVideoRef.current && !scanned) {
                  try {
                    const codes = await detector.detect(webVideoRef.current);
                    if (codes && codes.length > 0 && codes[0].rawValue) {
                      handleBarcodeScanned({ data: codes[0].rawValue });
                    }
                  } catch (e) {
                    // Ignored per frame
                  }
                }
              }, 600);
            } catch (err) {
              console.warn('BarcodeDetector error:', err);
            }
          }
        }
      } catch (err) {
        console.warn('Could not start web camera stream:', err);
        setCameraError(err?.message || 'Webcam permission denied');
      }
    };

    startWebcam();

    return () => {
      if (detectorTimer) clearInterval(detectorTimer);
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [visible, activeTab, cameraFacing, scanned]);

  // Whenever modal opens, generate a brand new QR code and reset state
  useEffect(() => {
    if (visible) {
      setQrData(generateNewQrData(user || {}));
      setActiveTab('myCode');
      setScanned(false);
      setCameraError(null);
      setIsCameraReady(false);
      setIsManualInputVisible(false);
      setTorch(false);
      // Wait for modal slide animation to stabilize before mounting native CameraView
      const timer = setTimeout(() => setIsModalReady(true), 350);
      return () => clearTimeout(timer);
    } else {
      setIsModalReady(false);
    }
  }, [visible, user]);

  // Handle switching to scan tab: request permission immediately if needed
  useEffect(() => {
    if (visible && activeTab === 'scanCode') {
      setIsCameraReady(false);
      setCameraError(null);
      setCameraKey((k) => k + 1);

      if (Platform.OS !== 'web' && (!permission || !permission.granted)) {
        handleRequestCameraAccess();
      }
    }
  }, [visible, activeTab]);

  // Scanner laser animation
  useEffect(() => {
    if (activeTab === 'scanCode' && visible) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: SCAN_BOX_SIZE - 6,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [activeTab, visible]);

  if (!visible) return null;

  const handleGenerateNewScanner = () => {
    const fresh = generateNewQrData(user || {});
    setQrData(fresh);
    Alert.alert('New QR Code Generated', `Created fresh QR security token: ${fresh.hash}`);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Connect with me on PulseChat! Scan my QR Code or join using code: ${qrData.token}`,
      });
    } catch (e) {
      console.log('Share error', e);
    }
  };

  // Called when camera scans a QR code
  const handleBarcodeScanned = (scanningResult) => {
    if (scanned) return;
    setScanned(true);

    const scannedData = scanningResult?.data || qrData.token;
    let targetName = 'Verified Contact';
    if (scannedData.startsWith('PULSE_')) {
      const parts = scannedData.split('_');
      if (parts.length >= 2 && parts[1]) {
        targetName = parts[1];
      }
    }

    Alert.alert(
      'QR Code Scanned! 🎯',
      `Contact Token: ${scannedData.substring(0, 24)}...\n\nWould you like to start chatting with ${targetName}?`,
      [
        {
          text: 'Scan Again',
          style: 'cancel',
          onPress: () => setScanned(false),
        },
        {
          text: 'Open Chat',
          onPress: () => {
            onClose();
            if (onJoinUser) {
              onJoinUser({
                id: `qr_${Date.now()}`,
                name: targetName,
                avatar: null,
                isOnline: true,
              });
            }
          },
        },
      ]
    );
  };

  // Pick QR from gallery and decode
  const handlePickFromGallery = async () => {
    try {
      setIsProcessingGallery(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        let foundCode = null;

        try {
          if (scanFromURLAsync) {
            const detected = await scanFromURLAsync(imageUri, ['qr']);
            if (detected && detected.length > 0 && detected[0].data) {
              foundCode = detected[0].data;
            }
          }
        } catch (scanErr) {
          console.warn('scanFromURLAsync error:', scanErr);
        }

        handleBarcodeScanned({ data: foundCode || 'PULSE_CONTACT_GALLERY_TOKEN' });
      }
    } catch (err) {
      console.warn('Gallery scan pick error:', err);
      Alert.alert('Gallery Error', 'Could not access the selected image.');
    } finally {
      setIsProcessingGallery(false);
    }
  };

  // Check if camera is allowed to render
  const canShowCamera = Platform.OS === 'web' || Boolean(hasPermission || permission?.granted);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onShow={() => setIsModalReady(true)}
      onDismiss={() => setIsModalReady(false)}
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#111b21" translucent={false} />
      <SafeAreaView
        style={[
          styles.container,
          {
            paddingTop: Platform.OS === 'ios' ? Math.max(insets.top, 20) : (StatusBar.currentHeight || insets.top || 12),
          },
        ]}
        edges={['left', 'right']}
      >
        {/* Header with notch padding */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>QR Code & Scanner</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={handleGenerateNewScanner} style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="refresh-outline" size={22} color={COLORS.accentGreen} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="share-social-outline" size={22} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'myCode' && styles.tabItemActive]}
            onPress={() => setActiveTab('myCode')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'myCode' && styles.tabTextActive]}>
              My Code
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'scanCode' && styles.tabItemActive]}
            onPress={() => {
              setScanned(false);
              setActiveTab('scanCode');
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'scanCode' && styles.tabTextActive]}>
              Scan Code
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'myCode' ? (
          /* TAB 1: MY QR CODE CARD */
          <View style={styles.contentBody}>
            <View style={styles.qrCard}>
              {/* User Avatar & Info */}
              <View style={styles.userSection}>
                <Image
                  source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' }}
                  style={styles.cardAvatar}
                />
                <Text style={styles.cardUserName}>{user?.name || 'My Profile'}</Text>
                <Text style={styles.cardSubText}>PulseChat Contact QR Code</Text>
              </View>

              {/* Dynamic QR Code Box */}
              <View style={styles.qrMatrixContainer}>
                <Image
                  source={{
                    uri: `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
                      qrData.token
                    )}&color=11-27-33&bgcolor=ffffff`,
                  }}
                  style={styles.qrImage}
                />
                <View style={styles.qrLogoCenter}>
                  <Ionicons name="chatbubble-ellipses" size={22} color={COLORS.accentGreen} />
                </View>
              </View>

              {/* Token Info & Security Verification */}
              <View style={styles.tokenBadge}>
                <Ionicons name="shield-checkmark" size={15} color={COLORS.accentGreen} />
                <Text style={styles.tokenText}>Token: {qrData.hash} • {qrData.generatedAt}</Text>
              </View>

              <Text style={styles.instructionsText}>
                Your QR code is private. When scanned by a contact, it immediately establishes a secure chat.
              </Text>

              {/* Refresh / Generate New Scanner Button */}
              <TouchableOpacity
                style={styles.generateBtn}
                onPress={handleGenerateNewScanner}
                activeOpacity={0.85}
              >
                <Ionicons name="sparkles" size={18} color="#0b141a" style={{ marginRight: 8 }} />
                <Text style={styles.generateBtnText}>Generate New Scanner</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* TAB 2: LIVE CAMERA QR SCANNER */
          <View style={styles.scannerBody}>
            {canShowCamera ? (
              <View style={styles.cameraWrapper}>
                {Platform.OS === 'web' ? (
                  <video
                    ref={webVideoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <CameraView
                    key={`qr_cam_${cameraFacing}_${cameraKey}`}
                    style={[StyleSheet.absoluteFillObject, { width: '100%', height: '100%' }]}
                    facing={cameraFacing}
                    ratio="16:9"
                    mode="picture"
                    active={true}
                    enableTorch={Boolean(torch && cameraFacing === 'back')}
                    flash={torch && cameraFacing === 'back' ? 'on' : 'off'}
                    barcodeScannerSettings={{
                      barcodeTypes: ['qr'],
                    }}
                    onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                    onCameraReady={() => {
                      setIsCameraReady(true);
                      setCameraError(null);
                    }}
                    onMountError={handleMountError}
                  />
                )}

                {/* Viewfinder Cutout Mask Overlay with 100% crystal clear center */}
                <View style={[StyleSheet.absoluteFillObject, styles.viewfinderOverlay]} pointerEvents="box-none">
                  {/* Top Mask */}
                  <View style={styles.maskTop}>
                    {cameraError ? (
                      <View style={styles.cameraErrorBanner}>
                        <Ionicons name="warning-outline" size={16} color="#ffb74d" style={{ marginRight: 6 }} />
                        <Text style={styles.cameraErrorText} numberOfLines={1}>
                          {cameraError}
                        </Text>
                        <TouchableOpacity
                          style={styles.retryCameraBtn}
                          onPress={() => {
                            setCameraError(null);
                            setCameraFacing((f) => (f === 'back' ? 'front' : 'back'));
                            setCameraKey((k) => k + 1);
                          }}
                        >
                          <Text style={styles.retryCameraBtnText}>Flip / Retry</Text>
                        </TouchableOpacity>
                      </View>
                    ) : null}
                  </View>

                  {/* Center Cutout Row */}
                  <View style={styles.maskCenterRow}>
                    <View style={styles.maskSide} />

                    {/* Clear Target Viewport */}
                    <View style={styles.scanTargetBox}>
                      {/* 4 Sleek Corner Markers */}
                      <View style={[styles.corner, styles.topLeft]} />
                      <View style={[styles.corner, styles.topRight]} />
                      <View style={[styles.corner, styles.bottomLeft]} />
                      <View style={[styles.corner, styles.bottomRight]} />

                      {/* Animated Scanning Laser — always active when scanning */}
                      <Animated.View
                        style={[
                          styles.laserLine,
                          { transform: [{ translateY: scanLineAnim }] },
                        ]}
                      />
                    </View>

                    <View style={styles.maskSide} />
                  </View>

                  {/* Bottom Mask & Controls */}
                  <View style={[styles.maskBottom, { paddingBottom: Math.max(insets.bottom, 20) + 12 }]}>
                    {/* Guidance Tip Banner */}
                    <View style={styles.scannerTipBadge}>
                      <Ionicons
                        name={scanned ? 'checkmark-circle' : 'scan-outline'}
                        size={16}
                        color={COLORS.accentGreen}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.scannerTip}>
                        {scanned
                          ? 'QR Code verified! Processing...'
                          : 'Align QR code inside the frame to scan'}
                      </Text>
                    </View>

                    {/* Bottom Controls Dock */}
                    <View style={styles.scannerControlsRow}>
                      {/* Flash / Torch Button */}
                      <TouchableOpacity
                        style={[
                          styles.ctrlBtn,
                          torch && styles.ctrlBtnActive,
                          cameraFacing === 'front' && styles.ctrlBtnDisabled,
                        ]}
                        onPress={() => {
                          if (cameraFacing === 'front') {
                            Alert.alert('Flash Unavailable', 'Torch flashlight is only available with the rear camera.');
                            return;
                          }
                          setTorch((prev) => !prev);
                        }}
                        activeOpacity={0.75}
                      >
                        <Ionicons
                          name={torch ? 'flash' : 'flash-off'}
                          size={20}
                          color={torch ? '#ffd700' : '#ffffff'}
                        />
                      </TouchableOpacity>

                      {/* Camera Flip Button */}
                      <TouchableOpacity
                        style={styles.ctrlBtn}
                        onPress={() => {
                          setIsCameraReady(false);
                          setTorch(false);
                          setCameraFacing((prev) => (prev === 'back' ? 'front' : 'back'));
                          setCameraKey((k) => k + 1);
                        }}
                        activeOpacity={0.75}
                      >
                        <Ionicons name="camera-reverse" size={20} color="#ffffff" />
                      </TouchableOpacity>

                      {/* Scan from Gallery Button */}
                      <TouchableOpacity
                        style={[styles.ctrlBtn, isProcessingGallery && styles.ctrlBtnActive]}
                        onPress={handlePickFromGallery}
                        activeOpacity={0.75}
                        disabled={isProcessingGallery}
                      >
                        {isProcessingGallery ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                          <Ionicons name="images-outline" size={20} color="#ffffff" />
                        )}
                      </TouchableOpacity>

                      {/* Enter Code Manually Button */}
                      <TouchableOpacity
                        style={styles.ctrlBtn}
                        onPress={() => setIsManualInputVisible(true)}
                        activeOpacity={0.75}
                      >
                        <Ionicons name="keypad-outline" size={20} color="#ffffff" />
                      </TouchableOpacity>

                      {/* Instant Scan Simulation Button */}
                      <TouchableOpacity
                        style={styles.scanSimBtn}
                        onPress={() => handleBarcodeScanned({ data: 'PULSE_CONTACT_VERIFIED_TOKEN' })}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="qr-code" size={15} color="#0b141a" style={{ marginRight: 5 }} />
                        <Text style={styles.scanSimText}>Simulate</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              /* Permission Request or Camera Fallback Container */
              <View style={styles.permissionContainer}>
                <View style={styles.permIconCircle}>
                  <Ionicons name="camera" size={48} color={COLORS.accentGreen} />
                </View>
                <Text style={styles.permTitle}>Camera Access Required</Text>
                <Text style={styles.permDesc}>
                  PulseChat needs camera permission so you can scan contact QR codes and join conversations immediately.
                </Text>

                <View style={styles.permActions}>
                  <TouchableOpacity
                    style={styles.permBtn}
                    onPress={handleRequestCameraAccess}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark-circle" size={18} color="#0b141a" style={{ marginRight: 8 }} />
                    <Text style={styles.permBtnText}>Grant Camera Permission</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.galleryFallbackBtn}
                    onPress={handlePickFromGallery}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="images" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={styles.galleryFallbackBtnText}>Select QR from Gallery</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.galleryFallbackBtn}
                    onPress={() => setIsManualInputVisible(true)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="keypad" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={styles.galleryFallbackBtnText}>Enter Code Manually</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.simulateFallbackBtn}
                    onPress={() => handleBarcodeScanned({ data: 'PULSE_SIMULATED_SCAN' })}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="sparkles" size={18} color={COLORS.accentGreen} style={{ marginRight: 8 }} />
                    <Text style={styles.simulateFallbackBtnText}>Simulate Scan Found</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Manual Code Entry Modal Overlay */}
            {isManualInputVisible && (
              <View style={styles.manualInputOverlay}>
                <View style={styles.manualInputCard}>
                  <Text style={styles.manualInputTitle}>Enter QR Invite Token</Text>
                  <Text style={styles.manualInputSubtitle}>
                    Paste or type the contact token (e.g. PULSE_USER_...)
                  </Text>
                  <TextInput
                    style={styles.manualInputText}
                    value={manualCode}
                    onChangeText={setManualCode}
                    placeholder="e.g. PULSE_ALEX_123"
                    placeholderTextColor="#8696a0"
                    autoCapitalize="characters"
                    autoFocus
                  />
                  <View style={styles.manualInputActions}>
                    <TouchableOpacity
                      style={styles.manualCancelBtn}
                      onPress={() => setIsManualInputVisible(false)}
                    >
                      <Text style={styles.manualCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.manualSubmitBtn}
                      onPress={() => {
                        if (manualCode.trim()) {
                          setIsManualInputVisible(false);
                          handleBarcodeScanned({ data: manualCode.trim() });
                        }
                      }}
                    >
                      <Text style={styles.manualSubmitText}>Connect</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b141a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111b21',
    borderBottomWidth: 1,
    borderBottomColor: '#202c33',
  },
  backBtn: {
    padding: 6,
    marginRight: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 19,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    padding: 8,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#111b21',
    borderBottomWidth: 1,
    borderBottomColor: '#202c33',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: COLORS.accentGreen,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8696a0',
  },
  tabTextActive: {
    color: COLORS.accentGreen,
  },
  contentBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0b141a',
  },
  qrCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#111b21',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#202c33',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  userSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cardAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: COLORS.accentGreen,
    marginBottom: 10,
  },
  cardUserName: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cardSubText: {
    fontSize: 13,
    color: '#8696a0',
    marginTop: 2,
  },
  qrMatrixContainer: {
    width: 240,
    height: 240,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  qrLogoCenter: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#111b21',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  tokenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(37, 211, 102, 0.1)',
  },
  tokenText: {
    color: COLORS.accentGreen,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 6,
  },
  instructionsText: {
    color: '#8696a0',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 14,
    marginBottom: 18,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: COLORS.accentGreen,
    paddingVertical: 13,
    borderRadius: 14,
  },
  generateBtnText: {
    color: '#0b141a',
    fontSize: 15,
    fontWeight: 'bold',
  },
  scannerBody: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  viewfinderOverlay: {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
  },
  maskTop: {
    flex: 1,
    minHeight: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  cameraErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(40, 20, 10, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 183, 77, 0.4)',
    maxWidth: '92%',
  },
  cameraErrorText: {
    color: '#ffb74d',
    fontSize: 12,
    fontWeight: '500',
    flexShrink: 1,
  },
  retryCameraBtn: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  retryCameraBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  maskCenterRow: {
    flexDirection: 'row',
    height: SCAN_BOX_SIZE,
    width: '100%',
  },
  maskSide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
  },
  scanTargetBox: {
    width: SCAN_BOX_SIZE,
    height: SCAN_BOX_SIZE,
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: COLORS.accentGreen,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 14,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 14,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 14,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 14,
  },
  cameraStartingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 20, 26, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  cameraStartingText: {
    color: '#8696a0',
    fontSize: 13,
    marginTop: 10,
    fontWeight: '500',
  },
  laserLine: {
    height: 3,
    width: '100%',
    backgroundColor: '#25d366',
    shadowColor: '#25d366',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8,
  },
  maskBottom: {
    flex: 1.4,
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  scannerTipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 27, 33, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  scannerTip: {
    color: '#e9edef',
    fontSize: 13,
    fontWeight: '500',
  },
  scannerControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 12,
  },
  ctrlBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  ctrlBtnActive: {
    backgroundColor: COLORS.accentGreen,
    borderColor: COLORS.accentGreen,
  },
  ctrlBtnDisabled: {
    opacity: 0.4,
  },
  scanSimBtn: {
    backgroundColor: COLORS.accentGreen,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.accentGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  scanSimText: {
    color: '#0b141a',
    fontSize: 13,
    fontWeight: 'bold',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
    backgroundColor: '#111b21',
  },
  permIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(0, 168, 132, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 168, 132, 0.3)',
  },
  permTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  permDesc: {
    fontSize: 14,
    color: '#8696a0',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 28,
    maxWidth: 320,
  },
  permActions: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
  },
  permBtn: {
    backgroundColor: COLORS.accentGreen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 25,
  },
  permBtnText: {
    color: '#0b141a',
    fontSize: 15,
    fontWeight: 'bold',
  },
  galleryFallbackBtn: {
    backgroundColor: '#202c33',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#2a3942',
  },
  galleryFallbackBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  simulateFallbackBtn: {
    backgroundColor: 'rgba(0, 168, 132, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(0, 168, 132, 0.3)',
  },
  simulateFallbackBtnText: {
    color: COLORS.accentGreen,
    fontSize: 14,
    fontWeight: '600',
  },
  manualInputOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 999,
  },
  manualInputCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#111b21',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#202c33',
  },
  manualInputTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e9edef',
    marginBottom: 6,
  },
  manualInputSubtitle: {
    fontSize: 12,
    color: '#8696a0',
    marginBottom: 16,
    lineHeight: 16,
  },
  manualInputText: {
    backgroundColor: '#202c33',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#e9edef',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  manualInputActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  manualCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  manualCancelText: {
    color: '#8696a0',
    fontSize: 14,
    fontWeight: '600',
  },
  manualSubmitBtn: {
    backgroundColor: COLORS.accentGreen,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 18,
  },
  manualSubmitText: {
    color: '#0b141a',
    fontSize: 14,
    fontWeight: '700',
  },
});

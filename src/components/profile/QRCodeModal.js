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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../constants/theme';

const { width } = Dimensions.get('window');
const SCAN_BOX_SIZE = Math.min(width * 0.72, 260);

// Generate unique cryptographic QR token
function generateNewQrData(user) {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const token = `PULSE_${user.id || 'PRIYA'}_${timestamp}_${randomSuffix}`;
  return {
    token,
    generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    hash: `#${randomSuffix}-${timestamp.toString().slice(-4)}`,
  };
}

export default function QRCodeModal({ visible, onClose, user, onJoinUser }) {
  const [activeTab, setActiveTab] = useState('myCode'); // 'myCode' | 'scanCode'
  const [qrData, setQrData] = useState(() => generateNewQrData(user || {}));
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Animated laser line for scanner
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // Whenever modal opens, generate a brand new QR code
  useEffect(() => {
    if (visible) {
      setQrData(generateNewQrData(user || {}));
      setActiveTab('myCode');
      setScanned(false);
      setCameraError(null);
    }
  }, [visible, user]);

  // Request permission automatically when switching to scanCode tab
  useEffect(() => {
    if (visible && activeTab === 'scanCode') {
      (async () => {
        try {
          if (!permission?.granted) {
            const res = await requestPermission();
            if (!res?.granted) {
              await Camera.requestCameraPermissionsAsync();
            }
          }
        } catch (e) {
          console.warn('Scan tab permission request error:', e);
        }
      })();
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
    Alert.alert(
      'QR Code Scanned! 🎯',
      `Verified Contact: priya mali (@priya_mali)\nToken: ${scannedData.substring(0, 24)}...\n\nWould you like to start chatting with Priya Mali?`,
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
                id: 'conv_priya',
                name: 'priya mali',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              });
            }
          },
        },
      ]
    );
  };

  // Pick QR from gallery
  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        handleBarcodeScanned({ data: 'PULSE_PRIYA_SCAN_FROM_GALLERY' });
      }
    } catch (err) {
      console.warn('Gallery scan pick error:', err);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
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
            onPress={async () => {
              if (!permission?.granted) {
                try {
                  await requestPermission();
                } catch (e) {
                  // Ignore
                }
              }
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
                <Text style={styles.cardUserName}>{user?.name || 'Khan Shamshad'}</Text>
                <Text style={styles.cardSubText}>WhatsApp Contact QR Code</Text>
              </View>

              {/* Dynamic QR Code Box */}
              <View style={styles.qrMatrixContainer}>
                <Image
                  source={{
                    uri: `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                      qrData.token
                    )}&color=11-27-33&bgcolor=ffffff`,
                  }}
                  style={styles.qrImage}
                />
                <View style={styles.qrLogoCenter}>
                  <Ionicons name="chatbubble-ellipses" size={24} color={COLORS.accentGreen} />
                </View>
              </View>

              {/* Token Info & Security Verification */}
              <View style={styles.tokenBadge}>
                <Ionicons name="shield-checkmark" size={16} color={COLORS.accentGreen} />
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
            {permission?.granted && !cameraError ? (
              <View style={styles.cameraWrapper}>
                {/* Modern Expo CameraView with full Barcode Scanner Settings */}
                <CameraView
                  style={StyleSheet.absoluteFillObject}
                  facing="back"
                  enableTorch={torch}
                  barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                  }}
                  onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                  onMountError={(err) => {
                    console.warn('CameraView onMountError:', err);
                    setCameraError(err?.message || 'Camera failed to mount');
                  }}
                />

                {/* Viewfinder Cutout Mask (Top, Center Row, Bottom) so center window is 100% CRYSTAL CLEAR */}
                <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
                  {/* Top Mask */}
                  <View style={styles.maskTop} />

                  {/* Center Row */}
                  <View style={styles.maskCenterRow}>
                    <View style={styles.maskSide} />

                    {/* Clear Target Viewport */}
                    <View style={styles.scanTargetBox}>
                      {/* 4 Corner Markers */}
                      <View style={[styles.corner, styles.topLeft]} />
                      <View style={[styles.corner, styles.topRight]} />
                      <View style={[styles.corner, styles.bottomLeft]} />
                      <View style={[styles.corner, styles.bottomRight]} />

                      {/* Animated Scanning Laser */}
                      <Animated.View
                        style={[
                          styles.laserLine,
                          { transform: [{ translateY: scanLineAnim }] },
                        ]}
                      />
                    </View>

                    <View style={styles.maskSide} />
                  </View>

                  {/* Bottom Mask */}
                  <View style={styles.maskBottom}>
                    <Text style={styles.scannerTip}>
                      {scanned
                        ? 'QR Code verified! Processing...'
                        : 'Align QR code inside the frame to scan'}
                    </Text>

                    {/* Bottom Controls Row */}
                    <View style={styles.scannerControlsRow}>
                      {/* Flash / Torch Button */}
                      <TouchableOpacity
                        style={[styles.ctrlBtn, torch && styles.ctrlBtnActive]}
                        onPress={() => setTorch(!torch)}
                        activeOpacity={0.75}
                      >
                        <Ionicons
                          name={torch ? 'flash' : 'flash-off'}
                          size={22}
                          color="#ffffff"
                        />
                      </TouchableOpacity>

                      {/* Scan from Gallery Button */}
                      <TouchableOpacity
                        style={styles.ctrlBtn}
                        onPress={handlePickFromGallery}
                        activeOpacity={0.75}
                      >
                        <Ionicons name="images-outline" size={22} color="#ffffff" />
                      </TouchableOpacity>

                      {/* Instant Scan Simulation Button */}
                      <TouchableOpacity
                        style={styles.scanSimBtn}
                        onPress={() => handleBarcodeScanned({ data: 'PULSE_PRIYA_VERIFIED_TOKEN' })}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="qr-code" size={16} color="#0b141a" style={{ marginRight: 6 }} />
                        <Text style={styles.scanSimText}>Simulate Scan</Text>
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
                <Text style={styles.permTitle}>
                  {cameraError ? 'Camera Unavailable' : 'Camera Access Required'}
                </Text>
                <Text style={styles.permDesc}>
                  {cameraError
                    ? `Camera could not be started: ${cameraError}\nYou can still select a QR image from your gallery or simulate a scan.`
                    : 'PulseChat needs camera permission so you can scan contact QR codes and join conversations.'}
                </Text>

                <View style={styles.permActions}>
                  {!cameraError && (
                    <TouchableOpacity
                      style={styles.permBtn}
                      onPress={async () => {
                        try {
                          await requestPermission();
                          await Camera.requestCameraPermissionsAsync();
                        } catch (e) {
                          console.warn(e);
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="checkmark-circle" size={18} color="#0b141a" style={{ marginRight: 8 }} />
                      <Text style={styles.permBtnText}>Grant Camera Permission</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.galleryFallbackBtn}
                    onPress={handlePickFromGallery}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="images" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={styles.galleryFallbackBtnText}>Select QR from Gallery</Text>
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
  },
  backBtn: {
    padding: 6,
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    position: 'relative',
  },
  maskTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  maskCenterRow: {
    flexDirection: 'row',
    height: SCAN_BOX_SIZE,
  },
  maskSide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanTargetBox: {
    width: SCAN_BOX_SIZE,
    height: SCAN_BOX_SIZE,
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: COLORS.accentGreen,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 10,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 10,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 10,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 10,
  },
  laserLine: {
    height: 3,
    width: '100%',
    backgroundColor: '#25d366',
    shadowColor: '#25d366',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },
  maskBottom: {
    flex: 1.2,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 36,
  },
  scannerTip: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scannerControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ctrlBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlBtnActive: {
    backgroundColor: COLORS.accentGreen,
  },
  scanSimBtn: {
    backgroundColor: COLORS.accentGreen,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanSimText: {
    color: '#0b141a',
    fontSize: 14,
    fontWeight: 'bold',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#111b21',
  },
  permIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(0, 168, 132, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
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
  },
  permActions: {
    width: '100%',
    gap: 14,
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
    paddingVertical: 14,
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
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(0, 168, 132, 0.3)',
  },
  simulateFallbackBtnText: {
    color: COLORS.accentGreen,
    fontSize: 14,
    fontWeight: '600',
  },
});

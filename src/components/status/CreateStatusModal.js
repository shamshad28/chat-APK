import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import cameraService from '../../services/cameraService';

const STATUS_BACKGROUNDS = [
  '#065f46', // Emerald
  '#0e7490', // Cyan
  '#4338ca', // Indigo
  '#701a75', // Fuchsia
  '#991b1b', // Red
  '#854d0e', // Amber
  '#1e293b', // Slate
];

export default function CreateStatusModal({
  visible,
  onClose,
  onPublishStatus,
}) {
  const [text, setText] = useState('');
  const [selectedBg, setSelectedBg] = useState(STATUS_BACKGROUNDS[0]);
  const [mediaUri, setMediaUri] = useState(null);

  if (!visible) return null;

  const handlePickImage = async () => {
    const uri = await cameraService.pickImageFromGallery();
    if (uri) setMediaUri(uri);
  };

  const handleCapturePhoto = async () => {
    const uri = await cameraService.capturePhoto();
    if (uri) setMediaUri(uri);
  };

  const handlePublish = () => {
    if (!text.trim() && !mediaUri) {
      Alert.alert('Empty Status', 'Please enter some text or capture/choose a photo for your status.');
      return;
    }

    const newStatus = {
      id: `st_${Date.now()}`,
      userName: 'My status',
      avatar: null,
      text: text.trim(),
      mediaUrl: mediaUri,
      bgColor: mediaUri ? '#0b141a' : selectedBg,
      time: 'Just now',
      createdAt: new Date().toISOString(),
      isMine: true,
      hasUnviewed: false,
    };

    onPublishStatus && onPublishStatus(newStatus);
    setText('');
    setMediaUri(null);
    onClose();
    Alert.alert('Status Updated', 'Your status will disappear after 24 hours.');
  };

  const cycleBackground = () => {
    const curIndex = STATUS_BACKGROUNDS.indexOf(selectedBg);
    const nextIndex = (curIndex + 1) % STATUS_BACKGROUNDS.length;
    setSelectedBg(STATUS_BACKGROUNDS[nextIndex]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: mediaUri ? '#0b141a' : selectedBg }]}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Top Bar with Close, Color Cycle, Camera, Gallery */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
              <Ionicons name="close" size={26} color="#ffffff" />
            </TouchableOpacity>

            <View style={styles.topRightIcons}>
              {/* Camera Button */}
              <TouchableOpacity onPress={handleCapturePhoto} style={styles.iconBtn}>
                <Ionicons name="camera-outline" size={22} color="#ffffff" />
              </TouchableOpacity>

              {/* Gallery Button */}
              <TouchableOpacity onPress={handlePickImage} style={styles.iconBtn}>
                <Ionicons name="images-outline" size={22} color="#ffffff" />
              </TouchableOpacity>

              {/* Color Cycle Button (if no image attached) */}
              {!mediaUri && (
                <TouchableOpacity onPress={cycleBackground} style={styles.iconBtn}>
                  <Ionicons name="color-palette-outline" size={24} color="#ffffff" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Attached Media Preview (if photo selected) */}
          {mediaUri && (
            <View style={styles.mediaPreviewContainer}>
              <Image source={{ uri: mediaUri }} style={styles.mediaPreviewImage} resizeMode="contain" />
              <TouchableOpacity
                style={styles.removeMediaBtn}
                onPress={() => setMediaUri(null)}
                activeOpacity={0.8}
              >
                <Ionicons name="close-circle" size={26} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}

          {/* Centered Large Text / Caption Input */}
          <View style={styles.inputArea}>
            <TextInput
              style={[styles.statusInput, Boolean(mediaUri) && styles.captionInput]}
              placeholder={mediaUri ? 'Add a caption...' : 'Type a status...'}
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              multiline
              value={text}
              onChangeText={setText}
              autoFocus={!mediaUri}
              maxLength={700}
            />
          </View>

          {/* Bottom Dock with 24h notice and Floating Send FAB */}
          <View style={styles.bottomBar}>
            <View style={styles.statusNotice}>
              <Ionicons name="time-outline" size={14} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.statusNoticeText}>Disappears in 24 hours</Text>
            </View>

            <TouchableOpacity
              style={[styles.sendFab, !text.trim() && !mediaUri && { opacity: 0.5 }]}
              onPress={handlePublish}
              disabled={!text.trim() && !mediaUri}
              activeOpacity={0.85}
            >
              <Ionicons name="send" size={22} color="#111b21" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  inputArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  statusInput: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 40,
    width: '100%',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
  },
  statusNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusNoticeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
  sendFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.badgeGreen,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  mediaPreviewContainer: {
    height: 260,
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    marginVertical: 10,
  },
  mediaPreviewImage: {
    width: '100%',
    height: '100%',
  },
  removeMediaBtn: {
    position: 'absolute',
    top: 10,
    right: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 14,
  },
  captionInput: {
    fontSize: 20,
    lineHeight: 28,
    maxHeight: 100,
  },
});

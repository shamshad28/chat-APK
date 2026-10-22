import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { capturePhoto, pickImageFromGallery } from '../../services/cameraService';
import storageService from '../../services/storageService';

const PRESET_AVATARS = [
  { id: 'av1', uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', label: 'Elegance' },
  { id: 'av2', uri: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80', label: 'Urban' },
  { id: 'av3', uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80', label: 'Professional' },
  { id: 'av4', uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80', label: 'Casual' },
  { id: 'av5', uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80', label: 'Classic' },
  { id: 'av6', uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80', label: 'Artistic' },
  { id: 'av7', uri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80', label: 'Vibrant' },
  { id: 'av8', uri: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80', label: 'Studio' },
];

export default function AvatarSettingsModal({
  visible,
  onClose,
  currentUser,
  onUpdateUser,
}) {
  const [selectedUri, setSelectedUri] = useState(currentUser?.avatar || null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setSelectedUri(currentUser?.avatar || null);
    }
  }, [visible, currentUser]);

  const handleCaptureCamera = async () => {
    try {
      setLoading(true);
      const uri = await capturePhoto({ allowsEditing: true, quality: 0.85, cameraType: 'front' });
      if (uri) {
        setSelectedUri(uri);
      }
    } catch (err) {
      Alert.alert('Camera Error', 'Could not capture photo: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handlePickGallery = async () => {
    try {
      setLoading(true);
      const uri = await pickImageFromGallery();
      if (uri) {
        setSelectedUri(uri);
      }
    } catch (err) {
      Alert.alert('Gallery Error', 'Could not open gallery: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhoto = () => {
    Alert.alert(
      'Remove Profile Photo',
      'Are you sure you want to remove your current profile picture?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setSelectedUri(null),
        },
      ]
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (onUpdateUser) {
        await onUpdateUser({ avatar: selectedUri });
      }
      Alert.alert('Avatar Updated', 'Your profile avatar has been successfully updated!');
      onClose();
    } catch (err) {
      Alert.alert('Error', 'Failed to update avatar: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const initial = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#e9edef" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Avatar & Profile Photo</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Main Avatar Preview */}
          <View style={styles.previewContainer}>
            <View style={styles.avatarWrapper}>
              {selectedUri ? (
                <Image source={{ uri: selectedUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>{initial}</Text>
                </View>
              )}
              {loading && (
                <View style={styles.loaderOverlay}>
                  <ActivityIndicator size="large" color={COLORS.accentGreen} />
                </View>
              )}
            </View>
            <Text style={styles.userNameText}>{currentUser?.name || 'Registered User'}</Text>
            <Text style={styles.userSubtitleText}>
              {selectedUri ? 'Custom photo set' : 'Default initials avatar'}
            </Text>
          </View>

          {/* Quick Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleCaptureCamera}
              activeOpacity={0.75}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: '#00a88422' }]}>
                <Ionicons name="camera-outline" size={22} color={COLORS.accentGreen} />
              </View>
              <Text style={styles.actionLabel}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handlePickGallery}
              activeOpacity={0.75}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: '#38bdf822' }]}>
                <Ionicons name="image-outline" size={22} color="#38bdf8" />
              </View>
              <Text style={styles.actionLabel}>Gallery</Text>
            </TouchableOpacity>

            {selectedUri && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={handleRemovePhoto}
                activeOpacity={0.75}
              >
                <View style={[styles.actionIconCircle, { backgroundColor: '#ef444422' }]}>
                  <Ionicons name="trash-outline" size={22} color="#ef4444" />
                </View>
                <Text style={[styles.actionLabel, { color: '#ef4444' }]}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Preset Avatars Gallery */}
          <Text style={styles.sectionHeader}>Choose from WhatsApp Avatars</Text>
          <View style={styles.presetsGrid}>
            {PRESET_AVATARS.map((av) => {
              const isSelected = selectedUri === av.uri;
              return (
                <TouchableOpacity
                  key={av.id}
                  style={[styles.presetCard, isSelected && styles.presetCardActive]}
                  onPress={() => setSelectedUri(av.uri)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: av.uri }} style={styles.presetImage} />
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.accentGreen} />
                    </View>
                  )}
                  <Text style={styles.presetLabel} numberOfLines={1}>{av.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Footer Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-done" size={20} color="#111b21" style={{ marginRight: 6 }} />
            <Text style={styles.saveBtnText}>Save Avatar</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: '#111b21',
    borderBottomWidth: 1,
    borderBottomColor: '#202c33',
  },
  backBtn: {
    padding: 6,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e9edef',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  previewContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    backgroundColor: '#202c33',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.accentGreen,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#202c33',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 54,
    fontWeight: '700',
    color: COLORS.accentGreen,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userNameText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e9edef',
    marginTop: 14,
  },
  userSubtitleText: {
    fontSize: 13,
    color: '#8696a0',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginVertical: 18,
    paddingVertical: 12,
    backgroundColor: '#111b21',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#202c33',
  },
  actionBtn: {
    alignItems: 'center',
    minWidth: 70,
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e9edef',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accentGreen,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 12,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  presetCard: {
    width: '22%',
    aspectRatio: 0.85,
    backgroundColor: '#111b21',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#202c33',
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  presetCardActive: {
    borderColor: COLORS.accentGreen,
    backgroundColor: '#00a88415',
  },
  presetImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#202c33',
  },
  presetLabel: {
    fontSize: 10,
    color: '#8696a0',
    marginTop: 6,
    fontWeight: '500',
  },
  checkBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#111b21',
    borderRadius: 10,
  },
  footer: {
    padding: 16,
    backgroundColor: '#111b21',
    borderTopWidth: 1,
    borderTopColor: '#202c33',
  },
  saveBtn: {
    backgroundColor: COLORS.accentGreen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 25,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111b21',
  },
});

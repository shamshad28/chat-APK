import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { CURRENT_USER } from '../../data/mockData';

const PRESET_ABOUTS = [
  'Available',
  'Busy',
  'At work',
  'In a meeting',
  'At the movies',
  'Battery about to die',
  "Can't talk, PulseChat only",
  'Urgent calls only',
  'Hey there! I am using PulseChat.',
];

export default function ProfileModal({
  visible,
  onClose,
  user = CURRENT_USER,
  onUserUpdated,
}) {
  const [name, setName] = useState(user.name);
  const [about, setAbout] = useState(user.about);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);

  if (!visible) return null;

  const handleSaveName = () => {
    if (!name.trim()) return;
    setIsEditingName(false);
    onUserUpdated && onUserUpdated({ ...user, name: name.trim() });
    Alert.alert('Profile Updated', 'Name saved successfully.');
  };

  const handleSaveAbout = (val) => {
    const textToSave = val || about;
    if (!textToSave.trim()) return;
    setAbout(textToSave.trim());
    setIsEditingAbout(false);
    onUserUpdated && onUserUpdated({ ...user, about: textToSave.trim() });
    Alert.alert('Status Updated', 'Bio updated successfully.');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Ionicons name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            onPress={() => Alert.alert('QR Code', 'Share your contact QR code')}
            style={styles.headerBtn}
          >
            <Ionicons name="qr-code-outline" size={22} color={COLORS.accentGreen} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Avatar Hero */}
          <View style={styles.avatarCard}>
            <View style={styles.avatarWrapper}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>{name.charAt(0)}</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.cameraBtn}
                onPress={() => Alert.alert('Profile Photo', 'Options: Camera, Gallery, Remove photo')}
              >
                <Feather name="camera" size={18} color="#111b21" />
              </TouchableOpacity>
              <View style={styles.onlineBadge} />
            </View>

            <View style={styles.onlineStatusRow}>
              <View style={styles.greenDot} />
              <Text style={styles.onlineStatusText}>Online · Available</Text>
            </View>
          </View>

          {/* Name Section */}
          <View style={styles.infoSection}>
            <View style={styles.sectionIconCol}>
              <Ionicons name="person-outline" size={22} color={COLORS.iconDefault} />
            </View>
            <View style={styles.sectionBody}>
              <Text style={styles.sectionLabel}>Name</Text>
              {isEditingName ? (
                <View style={styles.editRow}>
                  <TextInput
                    style={styles.textInput}
                    value={name}
                    onChangeText={setName}
                    autoFocus
                  />
                  <TouchableOpacity onPress={handleSaveName} style={styles.checkBtn}>
                    <Ionicons name="checkmark" size={18} color="#111b21" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.valueRow}
                  onPress={() => setIsEditingName(true)}
                >
                  <Text style={styles.sectionValue}>{name}</Text>
                  <Feather name="edit-2" size={16} color={COLORS.iconDefault} />
                </TouchableOpacity>
              )}
              <Text style={styles.sectionHint}>
                This is not your username or pin. This name will be visible to your contacts.
              </Text>
            </View>
          </View>

          {/* About / Bio Section */}
          <View style={styles.infoSection}>
            <View style={styles.sectionIconCol}>
              <Ionicons name="information-circle-outline" size={22} color={COLORS.iconDefault} />
            </View>
            <View style={styles.sectionBody}>
              <Text style={styles.sectionLabel}>About</Text>
              {isEditingAbout ? (
                <View style={styles.editRow}>
                  <TextInput
                    style={styles.textInput}
                    value={about}
                    onChangeText={setAbout}
                    autoFocus
                  />
                  <TouchableOpacity onPress={() => handleSaveAbout()} style={styles.checkBtn}>
                    <Ionicons name="checkmark" size={18} color="#111b21" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.valueRow}
                  onPress={() => setIsEditingAbout(true)}
                >
                  <Text
                    style={[
                      styles.sectionValue,
                      !about && { color: COLORS.textMuted, fontStyle: 'italic' },
                    ]}
                  >
                    {about || 'No about description added'}
                  </Text>
                  <Feather name="edit-2" size={16} color={COLORS.iconDefault} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Username & Email */}
          <View style={styles.infoSection}>
            <View style={styles.sectionIconCol}>
              <Ionicons name="at" size={22} color={COLORS.iconDefault} />
            </View>
            <View style={styles.sectionBody}>
              <Text style={styles.sectionLabel}>Username</Text>
              <Text style={styles.sectionValue}>@{user.username || 'user'}</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.sectionIconCol}>
              <Ionicons name="call-outline" size={22} color={COLORS.iconDefault} />
            </View>
            <View style={styles.sectionBody}>
              <Text style={styles.sectionLabel}>Phone</Text>
              <Text style={styles.sectionValue}>{user.phone || '+91 98765 43210'}</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: COLORS.headerBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  avatarCard: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: COLORS.headerBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#202c33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 44,
    fontWeight: '700',
    color: COLORS.badgeGreen,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.badgeGreen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#111b21',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#25d366',
    borderWidth: 2,
    borderColor: '#111b21',
  },
  onlineStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#25d366',
    marginRight: 6,
  },
  onlineStatusText: {
    fontSize: 12.5,
    color: COLORS.accentGreen,
    fontWeight: '600',
  },
  infoSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.headerBackground,
    marginTop: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  sectionIconCol: {
    width: 36,
    paddingTop: 2,
  },
  sectionBody: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionValue: {
    fontSize: 15.5,
    color: COLORS.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  sectionHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 6,
    lineHeight: 16,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.badgeGreen,
    paddingVertical: 2,
  },
  checkBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.badgeGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  presetsCard: {
    backgroundColor: COLORS.headerBackground,
    marginTop: 10,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  presetsTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textSecondary,
    paddingHorizontal: 16,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(32, 44, 51, 0.4)',
  },
  presetText: {
    fontSize: 14.5,
    color: COLORS.textPrimary,
  },
  presetTextActive: {
    color: COLORS.badgeGreen,
    fontWeight: '600',
  },
});

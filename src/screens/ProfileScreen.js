import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { CURRENT_USER } from '../data/mockData';
import QRCodeModal from '../components/profile/QRCodeModal';
import cameraService from '../services/cameraService';
import { useTheme } from '../context/ThemeContext';

export default function ProfileScreen({
  user: propUser,
  onUpdateUser,
  onBack,
  onLogout,
  onOpenChat,
}) {
  const { colors, isLight } = useTheme();
  const [user, setUser] = useState(propUser || CURRENT_USER);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isQrModalVisible, setIsQrModalVisible] = useState(false);
  const [name, setName] = useState(propUser?.name || CURRENT_USER.name);
  const [about, setAbout] = useState(propUser?.about || '');

  useEffect(() => {
    if (propUser) {
      setUser(propUser);
      setName(propUser.name);
      setAbout(propUser.about || '');
    }
  }, [propUser]);

  const handleChangeAvatar = () => {
    Alert.alert('Change Profile Photo', 'Select an option to update your photo:', [
      {
        text: 'Take Photo 📸',
        onPress: async () => {
          const uri = await cameraService.capturePhoto();
          if (uri) {
            const updated = { ...user, avatar: uri };
            setUser(updated);
            if (onUpdateUser) onUpdateUser(updated);
          }
        },
      },
      {
        text: 'Choose from Gallery 🖼️',
        onPress: async () => {
          const uri = await cameraService.pickImageFromGallery();
          if (uri) {
            const updated = { ...user, avatar: uri };
            setUser(updated);
            if (onUpdateUser) onUpdateUser(updated);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSaveName = () => {
    if (!name.trim()) return;
    const updated = { ...user, name: name.trim() };
    setUser(updated);
    if (onUpdateUser) onUpdateUser(updated);
    setIsEditingName(false);
    Alert.alert('Profile Updated', 'Your name has been updated successfully.');
  };

  const handleSaveAbout = () => {
    const updated = { ...user, about: about.trim() };
    setUser(updated);
    if (onUpdateUser) onUpdateUser(updated);
    setIsEditingAbout(false);
    Alert.alert('Profile Updated', 'Your bio has been updated successfully.');
  };

  return (
    <SafeAreaView style={[styles.safeContainer, isLight && { backgroundColor: '#f0f2f5' }]}>
      {/* Top Header */}
      <View style={[styles.header, isLight && styles.headerLight]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={isLight ? '#ffffff' : COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isLight && { color: '#ffffff' }]}>Profile</Text>
        <TouchableOpacity
          onPress={() => setIsQrModalVisible(true)}
          style={styles.qrHeaderBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="qr-code-outline" size={24} color={isLight ? '#ffffff' : COLORS.accentGreen} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Avatar Card */}
        <View style={[styles.avatarCard, isLight && styles.avatarCardLight]}>
          <View style={styles.avatarWrapper}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{user.name.charAt(0)}</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.cameraIconBtn}
              onPress={handleChangeAvatar}
              activeOpacity={0.8}
            >
              <Feather name="camera" size={18} color="#ffffff" />
            </TouchableOpacity>
            <View style={styles.onlineDot} />
          </View>

          <Text style={[styles.displayName, isLight && { color: '#111b21' }]}>{user.name}</Text>
          <Text style={[styles.displayUsername, isLight && { color: '#667781' }]}>@{user.username}</Text>
        </View>

        {/* Profile Details Cards */}
        <View style={[styles.sectionCard, isLight && styles.sectionCardLight]}>
          {/* Full Name */}
          <View style={styles.detailRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="person" size={20} color={COLORS.accentGreen} />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>FULL NAME</Text>
              {isEditingName ? (
                <View style={styles.editRow}>
                  <TextInput
                    style={styles.editInput}
                    value={name}
                    onChangeText={setName}
                    autoFocus
                  />
                  <TouchableOpacity onPress={handleSaveName} style={styles.saveCheckBtn}>
                    <Ionicons name="checkmark" size={20} color={COLORS.accentGreen} />
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.detailValue}>{user.name}</Text>
              )}
            </View>
            {!isEditingName && (
              <TouchableOpacity onPress={() => setIsEditingName(true)} style={styles.editBtn}>
                <Feather name="edit-2" size={16} color={COLORS.iconDefault} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.divider} />

          {/* Username */}
          <View style={styles.detailRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="at" size={20} color={COLORS.accentGreen} />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>USERNAME</Text>
              <Text style={styles.detailValue}>@{user.username}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Email */}
          <View style={styles.detailRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="mail" size={20} color={COLORS.accentGreen} />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>EMAIL</Text>
              <Text style={styles.detailValue}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Phone */}
          <View style={styles.detailRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="call" size={20} color={COLORS.accentGreen} />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>PHONE</Text>
              <Text style={styles.detailValue}>{user.phone || '+91 98765 43210'}</Text>
            </View>
          </View>
        </View>

        {/* About / Bio Card */}
        <View style={styles.sectionCard}>
          <View style={styles.detailRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="information-circle" size={20} color={COLORS.accentGreen} />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>ABOUT</Text>
              {isEditingAbout ? (
                <View style={styles.editRow}>
                  <TextInput
                    style={styles.editInput}
                    value={about}
                    onChangeText={setAbout}
                    placeholder="Add about description..."
                    placeholderTextColor={COLORS.textMuted}
                    autoFocus
                    multiline
                  />
                  <TouchableOpacity onPress={handleSaveAbout} style={styles.saveCheckBtn}>
                    <Ionicons name="checkmark" size={20} color={COLORS.accentGreen} />
                  </TouchableOpacity>
                </View>
              ) : (
                <Text
                  style={[
                    styles.detailValue,
                    !user.about && { color: COLORS.textMuted, fontStyle: 'italic' },
                  ]}
                >
                  {user.about || 'No description added'}
                </Text>
              )}
            </View>
            {!isEditingAbout && (
              <TouchableOpacity onPress={() => setIsEditingAbout(true)} style={styles.editBtn}>
                <Feather name="edit-2" size={16} color={COLORS.iconDefault} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* QR Scanner & Code Card (Generates brand new scanner on click) */}
        <View style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.detailRow}
            onPress={() => setIsQrModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="qr-code" size={20} color={COLORS.accentGreen} />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>QR SCANNER & CODE</Text>
              <Text style={styles.detailValue}>Tap to generate brand new scanner & code</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.iconDefault} />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.openChatBtn}
            onPress={onOpenChat || onBack}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubbles" size={18} color="#111b21" style={{ marginRight: 8 }} />
            <Text style={styles.openChatText}>Open Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={onLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={18} color={COLORS.danger} style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* QR Code & Scanner Modal */}
      <QRCodeModal
        visible={isQrModalVisible}
        onClose={() => setIsQrModalVisible(false)}
        user={user}
        onJoinUser={onOpenChat}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 58,
    backgroundColor: COLORS.headerBackground,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLight: {
    backgroundColor: '#008069',
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  idBadge: {
    backgroundColor: '#182229',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a3942',
  },
  idText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'System',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  avatarCard: {
    backgroundColor: COLORS.headerBackground,
    alignItems: 'center',
    paddingVertical: 28,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarCardLight: {
    backgroundColor: '#ffffff',
    borderBottomColor: '#e9edef',
  },
  sectionCardLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e9edef',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  avatarImage: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    borderColor: '#00a88440',
  },
  avatarPlaceholder: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#005c4b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 38,
    color: COLORS.textWhite,
    fontWeight: 'bold',
  },
  cameraIconBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.badgeGreen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.headerBackground,
  },
  onlineDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.onlineDot,
    borderWidth: 2,
    borderColor: COLORS.headerBackground,
  },
  displayName: {
    fontSize: 21,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  displayUsername: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: COLORS.headerBackground,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#103629',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#00a88430',
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '500',
    marginTop: 2,
  },
  editBtn: {
    padding: 8,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  editInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.accentGreen,
    paddingVertical: 2,
  },
  saveCheckBtn: {
    padding: 6,
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  actionsContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    gap: 12,
  },
  openChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.badgeGreen,
    paddingVertical: 14,
    borderRadius: 16,
    elevation: 3,
  },
  openChatText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111b21',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#202c33',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ea433540',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.danger,
  },
});

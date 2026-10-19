import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function ContactInfoModal({
  visible,
  contact,
  onClose,
  onVideoCall,
  onVoiceCall,
}) {
  if (!contact) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeContainer}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contact Info</Text>
          <TouchableOpacity style={styles.headerAction}>
            <MaterialIcons name="more-vert" size={22} color={COLORS.iconDefault} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
          {/* Hero Profile Details */}
          <View style={styles.heroSection}>
            {contact.avatar ? (
              <Image source={{ uri: contact.avatar }} style={styles.heroAvatar} />
            ) : (
              <View style={styles.placeholderAvatar}>
                <Text style={styles.placeholderText}>
                  {contact.name ? contact.name.charAt(0) : 'U'}
                </Text>
              </View>
            )}
            <Text style={styles.heroName}>{contact.name}</Text>
            <Text style={styles.heroPhone}>{contact.phone || '+91 98765 43210'}</Text>
            <Text style={styles.heroStatus}>{contact.lastSeen || 'online'}</Text>

            {/* Quick action buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => {
                  onClose();
                  onVoiceCall && onVoiceCall();
                }}
              >
                <View style={styles.actionCircle}>
                  <Ionicons name="call" size={20} color={COLORS.accentGreen} />
                </View>
                <Text style={styles.actionLabel}>Audio</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => {
                  onClose();
                  onVideoCall && onVideoCall();
                }}
              >
                <View style={styles.actionCircle}>
                  <Ionicons name="videocam" size={20} color={COLORS.accentGreen} />
                </View>
                <Text style={styles.actionLabel}>Video</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn}>
                <View style={styles.actionCircle}>
                  <Ionicons name="search" size={20} color={COLORS.accentGreen} />
                </View>
                <Text style={styles.actionLabel}>Search</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* About / Bio Section */}
          <View style={styles.cardSection}>
            <Text style={styles.sectionHeader}>About</Text>
            <Text style={[styles.aboutText, !contact.about && { color: COLORS.textMuted, fontStyle: 'italic' }]}>
              {contact.about || 'No description added'}
            </Text>
          </View>

          {/* Media, links, and docs preview */}
          <View style={styles.cardSection}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionHeader}>Media, links, and docs</Text>
              <Text style={styles.linkCount}>24 &gt;</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaRow}>
              {[
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
                'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=150',
                'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150',
              ].map((uri, idx) => (
                <Image key={idx} source={{ uri }} style={styles.mediaThumb} />
              ))}
            </ScrollView>
          </View>

          {/* Privacy & Notification Settings */}
          <View style={styles.cardSection}>
            <View style={styles.settingRow}>
              <Ionicons name="notifications-outline" size={22} color={COLORS.iconDefault} style={styles.settingIcon} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Mute notifications</Text>
              </View>
              <Switch trackColor={{ false: '#374248', true: '#00a884' }} thumbColor="#e9edef" />
            </View>

            <View style={styles.settingRow}>
              <Ionicons name="musical-notes-outline" size={22} color={COLORS.iconDefault} style={styles.settingIcon} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Custom notifications</Text>
              </View>
            </View>

            <View style={styles.settingRow}>
              <Ionicons name="lock-closed-outline" size={22} color={COLORS.iconDefault} style={styles.settingIcon} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Encryption</Text>
                <Text style={styles.settingSubtitle}>Messages and calls are end-to-end encrypted. Tap to verify.</Text>
              </View>
            </View>
          </View>

          {/* Danger zone: Block & Report */}
          <View style={styles.cardSection}>
            <TouchableOpacity style={styles.dangerRow}>
              <Ionicons name="hand-left-outline" size={20} color={COLORS.danger} style={styles.settingIcon} />
              <Text style={styles.dangerText}>Block {contact.name}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dangerRow}>
              <Ionicons name="thumbs-down-outline" size={20} color={COLORS.danger} style={styles.settingIcon} />
              <Text style={styles.dangerText}>Report {contact.name}</Text>
            </TouchableOpacity>
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
    backgroundColor: COLORS.headerBackground,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  headerAction: {
    padding: 8,
  },
  scrollArea: {
    flex: 1,
  },
  heroSection: {
    backgroundColor: COLORS.headerBackground,
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  heroAvatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 12,
  },
  placeholderAvatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#005c4b',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
  heroName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  heroPhone: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  heroStatus: {
    fontSize: 12,
    color: COLORS.accentGreen,
    fontWeight: '500',
    marginBottom: 18,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginTop: 6,
  },
  actionBtn: {
    alignItems: 'center',
  },
  actionCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#103629',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#00a88440',
  },
  actionLabel: {
    color: COLORS.textPrimary,
    fontSize: 12,
  },
  cardSection: {
    backgroundColor: COLORS.headerBackground,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  aboutText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkCount: {
    color: COLORS.accentGreen,
    fontSize: 13,
  },
  mediaRow: {
    marginTop: 10,
    flexDirection: 'row',
  },
  mediaThumb: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: COLORS.cardBackground,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingIcon: {
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  settingSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dangerText: {
    color: COLORS.danger,
    fontSize: 15,
    fontWeight: '500',
  },
});

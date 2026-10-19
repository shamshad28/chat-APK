import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export default function ContactProfileModal({
  visible,
  contact,
  onClose,
  onStartCall,
  onOpenChat,
}) {
  const [isMuted, setIsMuted] = useState(false);

  if (!visible || !contact) return null;

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
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contact info</Text>
          <TouchableOpacity
            onPress={() => Alert.alert('Share Contact', `Share ${contact.name}'s contact card`)}
            style={styles.headerBtn}
          >
            <Ionicons name="share-outline" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Avatar Hero */}
          <View style={styles.heroCard}>
            <View style={styles.avatarWrapper}>
              {contact.avatar ? (
                <Image source={{ uri: contact.avatar }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>{contact.name?.charAt(0)}</Text>
                </View>
              )}
            </View>
            <Text style={styles.contactName}>{contact.name}</Text>
            <Text style={styles.contactPhone}>{contact.phone || '+91 98765 43210'}</Text>
          </View>

          {/* Quick Action Buttons */}
          <View style={styles.actionsBar}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                onClose();
                onOpenChat && onOpenChat(contact);
              }}
            >
              <View style={styles.actionCircle}>
                <Ionicons name="chatbubble" size={20} color={COLORS.badgeGreen} />
              </View>
              <Text style={styles.actionLabel}>Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                onClose();
                onStartCall && onStartCall(contact, 'voice');
              }}
            >
              <View style={styles.actionCircle}>
                <Ionicons name="call" size={20} color={COLORS.badgeGreen} />
              </View>
              <Text style={styles.actionLabel}>Audio</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                onClose();
                onStartCall && onStartCall(contact, 'video');
              }}
            >
              <View style={styles.actionCircle}>
                <Ionicons name="videocam" size={20} color={COLORS.badgeGreen} />
              </View>
              <Text style={styles.actionLabel}>Video</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => Alert.alert('Search', `Search messages with ${contact.name}`)}
            >
              <View style={styles.actionCircle}>
                <Ionicons name="search" size={20} color={COLORS.badgeGreen} />
              </View>
              <Text style={styles.actionLabel}>Search</Text>
            </TouchableOpacity>
          </View>

          {/* About / Bio */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>About</Text>
            <Text style={[styles.aboutText, !contact.about && { color: COLORS.textMuted, fontStyle: 'italic' }]}>
              {contact.about || 'No description added'}
            </Text>
          </View>

          {/* Media, links, docs */}
          <TouchableOpacity
            style={styles.mediaRow}
            onPress={() => Alert.alert('Media & Docs', 'View shared photos, videos, links, and documents')}
          >
            <View style={styles.mediaRowLeft}>
              <Text style={styles.mediaTitle}>Media, links, and docs</Text>
              <Text style={styles.mediaCount}>12 items</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.iconDefault} />
          </TouchableOpacity>

          {/* Settings Rows */}
          <View style={styles.settingsSection}>
            <View style={styles.switchRow}>
              <View style={styles.switchTextContainer}>
                <Text style={styles.settingTitle}>Mute notifications</Text>
              </View>
              <Switch
                value={isMuted}
                onValueChange={setIsMuted}
                trackColor={{ false: '#374151', true: COLORS.accentGreen }}
                thumbColor="#ffffff"
              />
            </View>

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => Alert.alert('Disappearing Messages', 'Off')}
            >
              <View>
                <Text style={styles.settingTitle}>Disappearing messages</Text>
                <Text style={styles.settingSubtitle}>Off</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.iconDefault} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => Alert.alert('Encryption', 'Messages and calls are end-to-end encrypted.')}
            >
              <View>
                <Text style={styles.settingTitle}>Encryption</Text>
                <Text style={styles.settingSubtitle}>Messages and calls are end-to-end encrypted.</Text>
              </View>
              <Ionicons name="lock-closed" size={16} color={COLORS.accentGreen} />
            </TouchableOpacity>
          </View>

          {/* Block & Report Contact */}
          <View style={styles.dangerSection}>
            <TouchableOpacity
              style={styles.dangerRow}
              onPress={() => Alert.alert('Block Contact', `Block ${contact.name}?`)}
            >
              <Ionicons name="ban-outline" size={20} color="#ef4444" style={{ marginRight: 12 }} />
              <Text style={styles.dangerText}>Block {contact.name}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dangerRow}
              onPress={() => Alert.alert('Report Contact', `Report ${contact.name}?`)}
            >
              <Ionicons name="thumbs-down-outline" size={20} color="#ef4444" style={{ marginRight: 12 }} />
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
  heroCard: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: COLORS.headerBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarWrapper: {
    marginBottom: 12,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#202c33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: '700',
    color: COLORS.badgeGreen,
  },
  contactName: {
    fontSize: 21,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  contactPhone: {
    fontSize: 13.5,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    backgroundColor: COLORS.headerBackground,
    marginTop: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  actionBtn: {
    alignItems: 'center',
  },
  actionCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#202c33',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 12,
    color: COLORS.accentGreen,
    fontWeight: '600',
  },
  sectionCard: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.headerBackground,
    marginTop: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  sectionLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  aboutText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  mediaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.headerBackground,
    marginTop: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  mediaRowLeft: {
    flex: 1,
  },
  mediaTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  mediaCount: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  settingsSection: {
    backgroundColor: COLORS.headerBackground,
    marginTop: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(32, 44, 51, 0.4)',
  },
  switchTextContainer: {
    flex: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(32, 44, 51, 0.4)',
  },
  settingTitle: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  settingSubtitle: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  dangerSection: {
    backgroundColor: COLORS.headerBackground,
    marginTop: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(32, 44, 51, 0.4)',
  },
  dangerText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ef4444',
  },
});

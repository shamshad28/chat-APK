import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import storageService from '../../services/storageService';

const TONES = ['Pulse Chime', 'WhatsApp Pop', 'Subtle Ding', 'Classic Bell'];
const VIBRATE_OPTIONS = ['Off', 'Default', 'Short', 'Long'];

export default function NotificationsSettingsModal({ visible, onClose }) {
  const [conversationTones, setConversationTones] = useState(true);
  const [highPriority, setHighPriority] = useState(true);
  const [reactionNotifications, setReactionNotifications] = useState(true);
  const [selectedTone, setSelectedTone] = useState('Pulse Chime');
  const [vibrateOption, setVibrateOption] = useState('Default');

  useEffect(() => {
    (async () => {
      const saved = await storageService.getSettings();
      if (saved?.notifications) {
        if (saved.notifications.conversationTones !== undefined) {
          setConversationTones(saved.notifications.conversationTones);
        }
        if (saved.notifications.highPriority !== undefined) {
          setHighPriority(saved.notifications.highPriority);
        }
        if (saved.notifications.reactionNotifications !== undefined) {
          setReactionNotifications(saved.notifications.reactionNotifications);
        }
        if (saved.notifications.selectedTone) {
          setSelectedTone(saved.notifications.selectedTone);
        }
        if (saved.notifications.vibrateOption) {
          setVibrateOption(saved.notifications.vibrateOption);
        }
      }
    })();
  }, [visible]);

  const handleSave = async () => {
    const existing = (await storageService.getSettings()) || {};
    const notifications = {
      conversationTones,
      highPriority,
      reactionNotifications,
      selectedTone,
      vibrateOption,
    };
    await storageService.saveSettings({ ...existing, notifications });
    Alert.alert('Notifications Saved', 'Your notification settings have been updated.');
    onClose();
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Notification Settings',
      'Reset all notification settings back to factory defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setConversationTones(true);
            setHighPriority(true);
            setReactionNotifications(true);
            setSelectedTone('Pulse Chime');
            setVibrateOption('Default');
            Alert.alert('Reset Complete', 'Notification defaults restored.');
          },
        },
      ]
    );
  };

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
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Conversation Tones */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Conversation tones</Text>
              <Text style={styles.settingSubtitle}>Play sounds for incoming and outgoing messages</Text>
            </View>
            <Switch
              value={conversationTones}
              onValueChange={setConversationTones}
              thumbColor={conversationTones ? COLORS.accentGreen : '#8696a0'}
              trackColor={{ false: '#374151', true: '#00a88440' }}
            />
          </View>

          {/* Messages Section */}
          <Text style={styles.sectionHeader}>Messages</Text>

          {/* Notification Tone Picker */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="musical-notes-outline" size={20} color={COLORS.accentGreen} />
              <Text style={styles.cardTitle}>Notification tone</Text>
            </View>
            <View style={styles.tonesGrid}>
              {TONES.map((tone) => {
                const isSelected = selectedTone === tone;
                return (
                  <TouchableOpacity
                    key={tone}
                    style={[styles.toneOption, isSelected && styles.toneOptionSelected]}
                    onPress={() => setSelectedTone(tone)}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={isSelected ? COLORS.accentGreen : '#8696a0'}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={[styles.toneText, isSelected && styles.toneTextSelected]}>
                      {tone}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Vibrate Selector */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="phone-portrait-outline" size={20} color={COLORS.accentGreen} />
              <Text style={styles.cardTitle}>Vibrate</Text>
            </View>
            <View style={styles.chipsRow}>
              {VIBRATE_OPTIONS.map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[styles.chip, vibrateOption === v && styles.chipActive]}
                  onPress={() => setVibrateOption(v)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.chipText, vibrateOption === v && styles.chipTextActive]}>
                    {v}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* High Priority Notifications */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>High priority notifications</Text>
              <Text style={styles.settingSubtitle}>Show previews of notifications at the top of the screen</Text>
            </View>
            <Switch
              value={highPriority}
              onValueChange={setHighPriority}
              thumbColor={highPriority ? COLORS.accentGreen : '#8696a0'}
              trackColor={{ false: '#374151', true: '#00a88440' }}
            />
          </View>

          {/* Reaction Notifications */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Reaction notifications</Text>
              <Text style={styles.settingSubtitle}>Show notifications for emoji reactions to messages you send</Text>
            </View>
            <Switch
              value={reactionNotifications}
              onValueChange={setReactionNotifications}
              thumbColor={reactionNotifications ? COLORS.accentGreen : '#8696a0'}
              trackColor={{ false: '#374151', true: '#00a88440' }}
            />
          </View>

          {/* Reset Notifications */}
          <TouchableOpacity
            style={styles.resetRow}
            onPress={handleResetSettings}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-outline" size={20} color="#ef4444" style={{ marginRight: 12 }} />
            <Text style={styles.resetText}>Reset notification settings</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-done" size={20} color="#111b21" style={{ marginRight: 6 }} />
            <Text style={styles.saveBtnText}>Save Notification Settings</Text>
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
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accentGreen,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 20,
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111b21',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#202c33',
  },
  settingInfo: {
    flex: 1,
    paddingRight: 16,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e9edef',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#8696a0',
    marginTop: 2,
    lineHeight: 16,
  },
  card: {
    backgroundColor: '#111b21',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#202c33',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e9edef',
    marginLeft: 10,
  },
  tonesGrid: {
    gap: 10,
  },
  toneOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#202c33',
  },
  toneOptionSelected: {
    backgroundColor: '#00a88418',
    borderColor: COLORS.accentGreen,
    borderWidth: 1,
  },
  toneText: {
    fontSize: 14,
    color: '#8696a0',
  },
  toneTextSelected: {
    color: '#e9edef',
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: '#202c33',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: '#00a88422',
    borderColor: COLORS.accentGreen,
  },
  chipText: {
    fontSize: 13,
    color: '#8696a0',
    fontWeight: '500',
  },
  chipTextActive: {
    color: COLORS.accentGreen,
    fontWeight: '700',
  },
  resetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111b21',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#202c33',
  },
  resetText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ef4444',
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

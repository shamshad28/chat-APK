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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

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

  if (!visible) return null;

  const handlePublish = () => {
    if (!text.trim()) {
      Alert.alert('Empty Status', 'Please enter some text for your status.');
      return;
    }

    const newStatus = {
      id: `st_${Date.now()}`,
      userName: 'My status',
      avatar: null,
      text: text.trim(),
      bgColor: selectedBg,
      time: 'Just now',
      createdAt: new Date().toISOString(),
      isMine: true,
      hasUnviewed: false,
    };

    onPublishStatus && onPublishStatus(newStatus);
    setText('');
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
      <SafeAreaView style={[styles.container, { backgroundColor: selectedBg }]}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Top Bar with Close, Color Cycle, Emoji, Font */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
              <Ionicons name="close" size={26} color="#ffffff" />
            </TouchableOpacity>

            <View style={styles.topRightIcons}>
              {/* Color Cycle Button */}
              <TouchableOpacity onPress={cycleBackground} style={styles.iconBtn}>
                <Ionicons name="color-palette-outline" size={24} color="#ffffff" />
              </TouchableOpacity>

              {/* Text format */}
              <TouchableOpacity
                onPress={() => Alert.alert('Font Style', 'Font style toggled')}
                style={styles.iconBtn}
              >
                <Ionicons name="text-outline" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Centered Large Text Input */}
          <View style={styles.inputArea}>
            <TextInput
              style={styles.statusInput}
              placeholder="Type a status..."
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              multiline
              value={text}
              onChangeText={setText}
              autoFocus
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
              style={[styles.sendFab, !text.trim() && { opacity: 0.5 }]}
              onPress={handlePublish}
              disabled={!text.trim()}
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
});

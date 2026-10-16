import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function ChatPreviewBody({
  activeTab = 'chats',
  headerMode = 'chat',
  onToggleHeaderMode,
}) {
  return (
    <View style={styles.container}>
      {/* Top Helper Banner to toggle header style */}
      <View style={styles.toggleBar}>
        <Text style={styles.toggleText}>
          Mode: <Text style={styles.highlightText}>{headerMode.toUpperCase()} NAVBAR</Text>
        </Text>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={onToggleHeaderMode}
          activeOpacity={0.7}
        >
          <Ionicons name="swap-horizontal" size={16} color={COLORS.accentGreen} />
          <Text style={styles.toggleButtonText}>Switch Navbar Style</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.chatScroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* End-to-end encryption notice pill */}
        <View style={styles.encryptionPill}>
          <Ionicons name="lock-closed" size={12} color="#ffd279" />
          <Text style={styles.encryptionText}>
            Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
          </Text>
        </View>

        {/* Date separator pill */}
        <View style={styles.datePillContainer}>
          <View style={styles.datePill}>
            <Text style={styles.dateText}>TODAY</Text>
          </View>
        </View>

        {/* Message 1: Received */}
        <View style={[styles.messageBubble, styles.receivedBubble]}>
          <Text style={styles.messageText}>
            Hey Shamshad! The new mobile app navigation bar looks super slick 🔥
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.timeText}>04:28 PM</Text>
          </View>
        </View>

        {/* Message 2: Sent */}
        <View style={[styles.messageBubble, styles.sentBubble]}>
          <Text style={styles.messageText}>
            Thanks! It uses authentic WhatsApp dark theme styling with responsive headers and bottom navigation tabs.
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.timeText}>04:29 PM</Text>
            <Ionicons name="checkmark-done" size={15} color={COLORS.blueTicks} style={styles.tickIcon} />
          </View>
        </View>

        {/* Message 3: Received with reaction */}
        <View style={[styles.messageBubble, styles.receivedBubble]}>
          <Text style={styles.messageText}>
            Is it ready to connect with the website backend and Socket.IO?
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.timeText}>04:30 PM</Text>
          </View>
          <View style={styles.reactionPill}>
            <Text style={styles.reactionEmoji}>🚀</Text>
          </View>
        </View>

        {/* Message 4: Sent */}
        <View style={[styles.messageBubble, styles.sentBubble]}>
          <Text style={styles.messageText}>
            Yes! Both top chat navbar and bottom tab dock are fully configured in the /app folder.
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.timeText}>04:31 PM</Text>
            <Ionicons name="checkmark-done" size={15} color={COLORS.blueTicks} style={styles.tickIcon} />
          </View>
        </View>
      </ScrollView>

      {/* WhatsApp Signature Floating Action Button */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
        <Ionicons name="chatbubble-ellipses" size={24} color="#111b21" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.chatBackground,
  },
  toggleBar: {
    backgroundColor: '#182229',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  toggleText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  highlightText: {
    color: COLORS.accentGreen,
    fontWeight: 'bold',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202c33',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2a3942',
    gap: 4,
  },
  toggleButtonText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  chatScroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 80,
  },
  encryptionPill: {
    backgroundColor: '#182229',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'center',
    maxWidth: '88%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#222e35',
  },
  encryptionText: {
    color: '#ffd279',
    fontSize: 11,
    textAlign: 'center',
    flex: 1,
    lineHeight: 15,
  },
  datePillContainer: {
    alignItems: 'center',
    marginBottom: 14,
  },
  datePill: {
    backgroundColor: '#182229',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222e35',
  },
  dateText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  messageBubble: {
    maxWidth: '82%',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    borderRadius: 10,
    marginVertical: 4,
    position: 'relative',
  },
  receivedBubble: {
    backgroundColor: COLORS.messageReceived,
    alignSelf: 'flex-start',
    borderTopLeftRadius: 2,
  },
  sentBubble: {
    backgroundColor: COLORS.messageSent,
    alignSelf: 'flex-end',
    borderTopRightRadius: 2,
  },
  messageText: {
    color: COLORS.textPrimary,
    fontSize: 14.5,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  timeText: {
    color: COLORS.textSecondary,
    fontSize: 10.5,
  },
  tickIcon: {
    marginLeft: 4,
  },
  reactionPill: {
    position: 'absolute',
    bottom: -8,
    right: 8,
    backgroundColor: '#202c33',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a3942',
  },
  reactionEmoji: {
    fontSize: 11,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 18,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.badgeGreen,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 6,
  },
});

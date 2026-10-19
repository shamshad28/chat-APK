import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

/**
 * Native-Looking WhatsApp Title Bar
 * Replaces web WhatsAppTitleBar.jsx with native cross-platform layout
 */
export default function WhatsAppTitleBar({
  onMinimize,
  onMaximize,
  onClose,
  isSocketConnected = true,
}) {
  const [isMaximized, setIsMaximized] = useState(false);

  return (
    <View style={styles.container}>
      {/* Left: Brand Icon & Title & Made By Shamshad Khan Badge */}
      <View style={styles.brandRow}>
        <Ionicons name="logo-whatsapp" size={17} color={COLORS.accentGreen} />
        <Text style={styles.titleText}>WhatsApp</Text>
        <View style={styles.creatorPill}>
          <Text style={styles.creatorPillText}>
            Made by <Text style={styles.creatorName}>Shamshad Khan</Text>
          </Text>
        </View>
      </View>

      {/* Right: Network Status & Desktop Window Controls */}
      <View style={styles.rightRow}>
        <View style={styles.networkStatus}>
          <View
            style={[
              styles.networkDot,
              { backgroundColor: isSocketConnected ? COLORS.accentGreen : '#ef4444' },
            ]}
          />
          <Text style={styles.networkText}>
            {isSocketConnected ? 'Online' : 'Offline'}
          </Text>
        </View>

        {/* Window action buttons (Desktop/Tablet/Web friendly) */}
        {Platform.OS === 'web' && (
          <View style={styles.windowControls}>
            <TouchableOpacity
              style={styles.controlBtn}
              onPress={onMinimize}
              activeOpacity={0.6}
            >
              <Feather name="minus" size={13} color="#aebac1" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => {
                setIsMaximized(!isMaximized);
                onMaximize && onMaximize(!isMaximized);
              }}
              activeOpacity={0.6}
            >
              <Feather name="square" size={11} color="#aebac1" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlBtn, styles.closeBtn]}
              onPress={onClose}
              activeOpacity={0.6}
            >
              <Feather name="x" size={14} color="#aebac1" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 34,
    backgroundColor: '#202c33',
    borderBottomWidth: 1,
    borderBottomColor: '#222e35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    zIndex: 100,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d1d7db',
    marginLeft: 6,
    letterSpacing: 0.3,
  },
  creatorPill: {
    backgroundColor: '#111b21',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a3942',
    marginLeft: 8,
  },
  creatorPillText: {
    fontSize: 9.5,
    color: '#8696a0',
  },
  creatorName: {
    color: COLORS.accentGreen,
    fontWeight: '700',
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
  },
  networkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  networkText: {
    fontSize: 10,
    color: '#8696a0',
  },
  windowControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  controlBtn: {
    width: 28,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  closeBtn: {
    marginLeft: 2,
  },
});

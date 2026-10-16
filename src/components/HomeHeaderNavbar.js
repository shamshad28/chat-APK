import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

/**
 * Mobile Main Home Header Navbar
 * Top header for the Chats / Conversations List screen
 */
export default function HomeHeaderNavbar({
  appName = 'WhatsApp',
  onCameraPress,
  onSearchPress,
  onMenuPress,
  onMetaAiPress,
}) {
  return (
    <View style={styles.container}>
      {/* App Branding Title */}
      <View style={styles.brandContainer}>
        <Text style={styles.brandTitle}>{appName}</Text>
      </View>

      {/* Right Action Icons: Camera, Search, More Menu */}
      <View style={styles.actionsContainer}>
        {onMetaAiPress && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onMetaAiPress}
            activeOpacity={0.7}
          >
            <View style={styles.metaAiCircle}>
              <Ionicons name="sparkles" size={14} color="#60a5fa" />
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.iconButton}
          onPress={onCameraPress}
          activeOpacity={0.7}
        >
          <Feather name="camera" size={20} color={COLORS.iconDefault} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={onSearchPress}
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={20} color={COLORS.iconDefault} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={onMenuPress}
          activeOpacity={0.7}
        >
          <MaterialIcons name="more-vert" size={22} color={COLORS.iconDefault} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: COLORS.headerBackground,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    letterSpacing: 0.3,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 20,
  },
  metaAiCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#38bdf8',
    backgroundColor: '#0c4a6e',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

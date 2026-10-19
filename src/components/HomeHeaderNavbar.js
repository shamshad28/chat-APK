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
 * Adapts seamlessly across bottom tabs
 */
export default function HomeHeaderNavbar({
  activeTab = 'chats',
  appName = 'WhatsApp',
  onCameraPress,
  onSearchPress,
  onMenuPress,
  onMetaAiPress,
}) {
  const getTitle = () => {
    switch (activeTab) {
      case 'updates':
        return 'Updates';
      case 'communities':
        return 'Communities';
      case 'calls':
        return 'Calls';
      case 'settings':
        return 'Settings';
      default:
        return appName;
    }
  };

  const isMainChats = activeTab === 'chats';

  return (
    <View style={styles.container}>
      {/* Brand or Tab Title */}
      <View style={styles.brandContainer}>
        <Text
          style={[
            styles.brandTitle,
            isMainChats ? styles.brandTitleLogo : styles.brandTitleNormal,
          ]}
        >
          {getTitle()}
        </Text>
      </View>

      {/* Right Action Icons */}
      <View style={styles.actionsContainer}>
        {isMainChats && onMetaAiPress && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onMetaAiPress}
            activeOpacity={0.7}
          >
            <View style={styles.metaAiCircle}>
              <Ionicons name="sparkles" size={13} color="#38bdf8" />
            </View>
          </TouchableOpacity>
        )}

        {(isMainChats || activeTab === 'communities' || activeTab === 'updates') && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onCameraPress}
            activeOpacity={0.7}
          >
            <Feather name="camera" size={20} color={COLORS.iconDefault} />
          </TouchableOpacity>
        )}

        {activeTab !== 'communities' && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onSearchPress}
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={20} color={COLORS.iconDefault} />
          </TouchableOpacity>
        )}

        {activeTab !== 'settings' && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onMenuPress}
            activeOpacity={0.7}
          >
            <MaterialIcons name="more-vert" size={22} color={COLORS.iconDefault} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 58,
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
    letterSpacing: 0.2,
  },
  brandTitleLogo: {
    fontSize: 21,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  brandTitleNormal: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 7,
    marginLeft: 3,
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

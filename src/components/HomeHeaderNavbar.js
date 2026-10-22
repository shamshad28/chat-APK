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
 * Adapts seamlessly across bottom tabs and supports Light/Dark theme with glassmorphism
 */
export default function HomeHeaderNavbar({
  activeTab = 'chats',
  appName = 'WhatsApp',
  isLight = false,
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
      case 'meta-ai':
        return 'Meta AI';
      default:
        return appName;
    }
  };

  const isMainChats = activeTab === 'chats';
  const iconColor = isLight ? '#ffffff' : '#aebac1';
  const titleColor = isLight ? '#ffffff' : '#e9edef';

  return (
    <View style={[styles.container, isLight && styles.containerLight]}>
      {/* Specular Top Rim */}
      <View style={[styles.glassTopRim, isLight && styles.glassTopRimLight]} />

      {/* Brand or Tab Title */}
      <View style={styles.brandContainer}>
        <Text
          numberOfLines={1}
          style={[
            styles.brandTitle,
            isMainChats ? styles.brandTitleLogo : styles.brandTitleNormal,
            { color: titleColor },
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
            <Feather name="camera" size={20} color={iconColor} />
          </TouchableOpacity>
        )}

        {activeTab !== 'communities' && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onSearchPress}
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={20} color={iconColor} />
          </TouchableOpacity>
        )}

        {activeTab !== 'settings' && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onMenuPress}
            activeOpacity={0.7}
          >
            <MaterialIcons name="more-vert" size={22} color={iconColor} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 58,
    backgroundColor: 'rgba(32, 44, 51, 0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    position: 'relative',
    ...(Platform.OS === 'web'
      ? { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }
      : {}),
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
  containerLight: {
    backgroundColor: '#008069',
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  glassTopRim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  glassTopRimLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  brandContainer: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    letterSpacing: 0.2,
  },
  brandTitleLogo: {
    fontSize: 21,
    fontWeight: 'bold',
  },
  brandTitleNormal: {
    fontSize: 20,
    fontWeight: '700',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
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

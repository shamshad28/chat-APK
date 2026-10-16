import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  Feather,
} from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export const TABS = [
  {
    id: 'chats',
    label: 'Chats',
    iconActive: 'chatbubbles',
    iconInactive: 'chatbubbles-outline',
    iconFamily: 'Ionicons',
    badge: 3,
  },
  {
    id: 'updates',
    label: 'Updates',
    iconActive: 'radio-button-on',
    iconInactive: 'radio-button-off',
    iconFamily: 'Ionicons',
    hasDot: true,
  },
  {
    id: 'communities',
    label: 'Communities',
    iconActive: 'people',
    iconInactive: 'people-outline',
    iconFamily: 'Ionicons',
  },
  {
    id: 'calls',
    label: 'Calls',
    iconActive: 'call',
    iconInactive: 'call-outline',
    iconFamily: 'Ionicons',
    badge: 1,
  },
  {
    id: 'settings',
    label: 'Settings',
    iconActive: 'settings',
    iconInactive: 'settings-outline',
    iconFamily: 'Ionicons',
  },
];

/**
 * Mobile Bottom Tab Navigation Bar
 * Authentic WhatsApp Mobile Bottom Dock
 */
export default function BottomTabBar({
  activeTab = 'chats',
  onSelectTab,
  unreadChats = 3,
  missedCalls = 1,
  hasStatusUpdate = true,
  bottomPadding = 0,
}) {
  return (
    <View style={[styles.bottomBarContainer, { paddingBottom: Math.max(bottomPadding, 6) }]}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const badgeCount =
          tab.id === 'chats'
            ? unreadChats
            : tab.id === 'calls'
            ? missedCalls
            : tab.badge;
        const showDot = tab.id === 'updates' && hasStatusUpdate;

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabButton}
            onPress={() => onSelectTab && onSelectTab(tab.id)}
            activeOpacity={0.7}
          >
            {/* Pill Container for Active State */}
            <View
              style={[
                styles.iconContainer,
                isActive && styles.activePillHighlight,
              ]}
            >
              <Ionicons
                name={isActive ? tab.iconActive : tab.iconInactive}
                size={23}
                color={isActive ? COLORS.accentGreen : COLORS.iconDefault}
              />

              {/* Number Badge (e.g. unread chats, missed calls) */}
              {badgeCount > 0 && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </Text>
                </View>
              )}

              {/* Status Dot */}
              {showDot && !badgeCount && <View style={styles.dotBadge} />}
            </View>

            {/* Tab Label */}
            <Text
              style={[
                styles.tabLabel,
                isActive ? styles.tabLabelActive : styles.tabLabelInactive,
              ]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBarContainer: {
    backgroundColor: COLORS.bottomBarBackground,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 3,
    borderRadius: 16,
    marginBottom: 3,
  },
  activePillHighlight: {
    backgroundColor: '#103629', // subtle dark green capsule
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  tabLabelInactive: {
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  badgeContainer: {
    position: 'absolute',
    top: -3,
    right: 8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.badgeGreen,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.bottomBarBackground,
  },
  badgeText: {
    color: COLORS.badgeText,
    fontSize: 10,
    fontWeight: 'bold',
  },
  dotBadge: {
    position: 'absolute',
    top: 0,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.badgeGreen,
    borderWidth: 1.5,
    borderColor: COLORS.bottomBarBackground,
  },
});

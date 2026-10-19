import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Platform,
} from 'react-native';
import {
  Ionicons,
  MaterialCommunityIcons,
  Feather,
} from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { getInitials } from './NotificationBanner';

export const DOCK_TABS = [
  {
    id: 'chats',
    label: 'Chats',
    iconActive: 'chatbubbles',
    iconInactive: 'chatbubbles-outline',
    badge: 3,
  },
  {
    id: 'updates',
    label: 'Updates',
    iconActive: 'radio-button-on',
    iconInactive: 'radio-button-off',
    hasDot: true,
  },
  {
    id: 'communities',
    label: 'Communities',
    iconActive: 'people',
    iconInactive: 'people-outline',
  },
  {
    id: 'calls',
    label: 'Calls',
    iconActive: 'call',
    iconInactive: 'call-outline',
    badge: 1,
  },
  {
    id: 'meta-ai',
    label: 'Meta AI',
    isMetaAI: true,
  },
  {
    id: 'settings',
    label: 'Settings',
    iconActive: 'settings',
    iconInactive: 'settings-outline',
  },
];

/**
 * WhatsApp Sidebar Dock (Responsive Mobile Bottom Dock + Desktop/Tablet Vertical Dock)
 * Directly matches screenshot navigation & client WhatsAppSidebarDock.jsx
 */
export default function WhatsAppSidebarDock({
  activeTab = 'chats',
  onSelectTab,
  onOpenProfile,
  currentUser,
  unreadChats = 3,
  missedCalls = 1,
  hasStatusUpdate = true,
  bottomPadding = 0,
}) {
  const { width } = useWindowDimensions();
  const isTabletOrDesktop = width >= 768;

  // 1. Tablet / Desktop Vertical Sidebar Dock
  if (isTabletOrDesktop) {
    return (
      <View style={styles.verticalDock}>
        {/* Top Group: Main Navigation Icons */}
        <View style={styles.verticalTopGroup}>
          {DOCK_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const badgeCount =
              tab.id === 'chats'
                ? unreadChats
                : tab.id === 'calls'
                ? missedCalls
                : 0;
            const showDot = tab.id === 'updates' && hasStatusUpdate;

            if (tab.isMetaAI) {
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.verticalDockBtn, isActive && styles.verticalDockBtnActive]}
                  onPress={() => onSelectTab && onSelectTab(tab.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.metaAiRing}>
                    <View style={styles.metaAiInnerDot} />
                  </View>
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.verticalDockBtn, isActive && styles.verticalDockBtnActive]}
                onPress={() => onSelectTab && onSelectTab(tab.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isActive ? tab.iconActive : tab.iconInactive}
                  size={22}
                  color={isActive ? COLORS.accentGreen : COLORS.iconDefault}
                />
                {badgeCount > 0 && (
                  <View style={styles.verticalBadge}>
                    <Text style={styles.badgeText}>{badgeCount}</Text>
                  </View>
                )}
                {showDot && <View style={styles.verticalGreenDot} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bottom Group: User Avatar & Profile */}
        <TouchableOpacity
          style={styles.verticalAvatarBtn}
          onPress={onOpenProfile}
          activeOpacity={0.8}
        >
          {currentUser?.avatar ? (
            <Image source={{ uri: currentUser.avatar }} style={styles.dockAvatar} />
          ) : (
            <View style={styles.dockAvatarPlaceholder}>
              <Text style={styles.dockAvatarInitial}>
                {getInitials(currentUser?.name || 'User')}
              </Text>
            </View>
          )}
          <View style={styles.avatarOnlineDot} />
        </TouchableOpacity>
      </View>
    );
  }

  // 2. Mobile Responsive Bottom Dock (Strictly matching screenshot)
  return (
    <View style={[styles.bottomBarContainer, { paddingBottom: Math.max(bottomPadding, 6) }]}>
      {DOCK_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const badgeCount =
          tab.id === 'chats'
            ? unreadChats
            : tab.id === 'calls'
            ? missedCalls
            : 0;
        const showDot = tab.id === 'updates' && hasStatusUpdate;

        // Meta AI Special Ring Icon
        if (tab.isMetaAI) {
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabButton}
              onPress={() => onSelectTab && onSelectTab(tab.id)}
              activeOpacity={0.75}
            >
              <View style={[styles.iconWrapper, isActive && styles.activePillHighlight]}>
                <View style={[styles.metaAiRing, isActive && styles.metaAiRingActive]}>
                  <View style={styles.metaAiInnerDot} />
                </View>
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabButton}
            onPress={() => onSelectTab && onSelectTab(tab.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, isActive && styles.activePillHighlight]}>
              <Ionicons
                name={isActive ? tab.iconActive : tab.iconInactive}
                size={23}
                color={isActive ? COLORS.accentGreen : COLORS.iconDefault}
              />

              {/* Unread Counter Badge */}
              {badgeCount > 0 && (
                <View style={styles.counterBadge}>
                  <Text style={styles.counterBadgeText}>
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </Text>
                </View>
              )}

              {/* Status Update Dot */}
              {showDot && <View style={styles.statusDot} />}
            </View>

            <Text
              style={[
                styles.tabLabel,
                isActive ? styles.tabLabelActive : styles.tabLabelInactive,
              ]}
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
  // Mobile Bottom Bar
  bottomBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#202c33',
    borderTopWidth: 1,
    borderTopColor: '#222e35',
    paddingTop: 8,
    zIndex: 50,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 3,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activePillHighlight: {
    backgroundColor: '#103629',
  },
  tabLabel: {
    fontSize: 10.5,
    marginTop: 3,
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: COLORS.accentGreen,
    fontWeight: '700',
  },
  tabLabelInactive: {
    color: '#8696a0',
    fontWeight: '500',
  },
  counterBadge: {
    position: 'absolute',
    top: -2,
    right: 8,
    backgroundColor: COLORS.badgeGreen,
    borderRadius: 9,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBadgeText: {
    color: '#111b21',
    fontSize: 10,
    fontWeight: '800',
  },
  statusDot: {
    position: 'absolute',
    top: 2,
    right: 14,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.badgeGreen,
  },

  // Meta AI Glowing Ring (Purple Ring from Screenshot)
  metaAiRing: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2.5,
    borderColor: '#a855f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaAiRingActive: {
    borderColor: '#c084fc',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  metaAiInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#a855f7',
  },

  // Tablet / Desktop Vertical Sidebar
  verticalDock: {
    width: 58,
    height: '100%',
    backgroundColor: '#202c33',
    borderRightWidth: 1,
    borderRightColor: '#222e35',
    flexDirection: 'col',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    zIndex: 40,
  },
  verticalTopGroup: {
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  verticalDockBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  verticalDockBtnActive: {
    backgroundColor: '#374248',
  },
  verticalBadge: {
    position: 'absolute',
    top: 3,
    right: 4,
    backgroundColor: COLORS.badgeGreen,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalGreenDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.badgeGreen,
  },
  verticalAvatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    position: 'relative',
  },
  dockAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  dockAvatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#374248',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockAvatarInitial: {
    color: '#e9edef',
    fontWeight: '700',
    fontSize: 14,
  },
  avatarOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: COLORS.badgeGreen,
    borderWidth: 1.5,
    borderColor: '#202c33',
  },
});

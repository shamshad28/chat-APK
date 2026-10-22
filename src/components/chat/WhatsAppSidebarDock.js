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
import { BlurView } from 'expo-blur';
import { COLORS } from '../../constants/theme';
import { getInitials } from './NotificationBanner';
import { useTheme } from '../../context/ThemeContext';

export const DOCK_TABS = [
  {
    id: 'updates',
    label: 'Updates',
    iconActive: 'radio-button-on',
    iconInactive: 'radio-button-off',
    hasDot: true,
  },
  {
    id: 'calls',
    label: 'Calls',
    iconActive: 'call',
    iconInactive: 'call-outline',
  },
  {
    id: 'communities',
    label: 'Communities',
    iconActive: 'people',
    iconInactive: 'people-outline',
  },
  {
    id: 'chats',
    label: 'Chats',
    iconActive: 'chatbubble-ellipses',
    iconInactive: 'chatbubble-ellipses-outline',
  },
  {
    id: 'settings',
    label: 'You',
    iconActive: 'person-circle',
    iconInactive: 'person-circle-outline',
    isYou: true,
  },
];

/**
 * WhatsApp Sidebar Dock (Responsive Mobile Bottom Dock + Desktop/Tablet Vertical Dock)
 * Matches authentic WhatsApp bottom navigation with frosted glassmorphism
 */
export default function WhatsAppSidebarDock({
  activeTab = 'chats',
  onSelectTab,
  onOpenProfile,
  currentUser,
  unreadChats = 3,
  missedCalls = 0,
  hasStatusUpdate = true,
  bottomPadding = 0,
  theme: propTheme,
}) {
  const { width } = useWindowDimensions();
  const isTabletOrDesktop = width >= 768;
  const themeContext = useTheme();
  const activeTheme = propTheme || themeContext?.themeMode || 'Dark';
  const isLight = propTheme ? propTheme === 'light' : themeContext?.isLight;

  // 1. Tablet / Desktop Vertical Sidebar Dock (Frosted Glass)
  if (isTabletOrDesktop) {
    return (
      <View style={[styles.verticalDock, isLight && styles.verticalDockLight]}>
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
                  style={[
                    styles.verticalDockBtn,
                    isActive && styles.verticalDockBtnActiveMetaAi,
                  ]}
                  onPress={() => onSelectTab && onSelectTab(tab.id)}
                  activeOpacity={0.7}
                >
                  {isActive && <View style={[styles.verticalNeonBeam, styles.verticalNeonBeamMetaAi]} />}
                  {isActive && <View style={styles.verticalGlassSheen} />}
                  <View style={[styles.metaAiRing, isActive && styles.metaAiRingActive]}>
                    <View style={styles.metaAiInnerDot} />
                  </View>
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.verticalDockBtn,
                  isActive && (isLight ? styles.verticalDockBtnActiveLight : styles.verticalDockBtnActive),
                ]}
                onPress={() => onSelectTab && onSelectTab(tab.id)}
                activeOpacity={0.7}
              >
                {isActive && <View style={styles.verticalNeonBeam} />}
                {isActive && <View style={styles.verticalGlassSheen} />}
                <Ionicons
                  name={isActive ? tab.iconActive : tab.iconInactive}
                  size={22}
                  color={isActive ? COLORS.accentGreen : isLight ? '#54656f' : COLORS.iconDefault}
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

  // 2. Mobile Responsive Bottom Dock (Rich Frosted Glassmorphism - As in video)
  return (
    <View
      style={[
        styles.bottomBarContainer,
        isLight && styles.bottomBarContainerLight,
        { paddingBottom: Math.max(bottomPadding, 6) },
      ]}
    >
      {/* Real Native & Web Frosted Glass Blur Backdrop */}
      <BlurView
        intensity={Platform.OS === 'ios' ? 80 : 95}
        tint={isLight ? 'light' : 'dark'}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Frosted Glass Tint Overlay (WhatsApp calibrated opacity) */}
      <View
        style={[
          styles.glassTintOverlay,
          isLight ? styles.glassTintOverlayLight : styles.glassTintOverlayDark,
        ]}
      />

      {/* Specular Light Rim Along Top Edge */}
      <View style={[styles.glassTopRimGlow, isLight && styles.glassTopRimGlowLight]} />

      {DOCK_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const badgeCount =
          tab.id === 'chats'
            ? unreadChats
            : tab.id === 'calls'
            ? missedCalls
            : 0;
        const showDot = tab.id === 'updates' && hasStatusUpdate;

        // Meta AI Tab Special Glowing Glass Treatment
        if (tab.isMetaAI) {
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabButton}
              onPress={() => onSelectTab && onSelectTab(tab.id)}
              activeOpacity={0.65}
            >
              {/* Diffuse Backlight Glow */}
              {isActive && <View style={styles.activeMetaAiAmbientGlow} />}

              {/* Top Neon Laser Glow Beam */}
              {isActive && <View style={[styles.activeTabGlowBeam, styles.activeMetaAiGlowBeam]} />}

              {/* Glass Capsule Highlight Pill */}
              <View
                style={[
                  styles.iconWrapper,
                  isActive && styles.activePillHighlightMetaAi,
                ]}
              >
                {/* Frosted Specular Sheen Line */}
                {isActive && <View style={styles.glassHighlightSheen} />}

                {/* Animated / Glowing Meta AI Ring */}
                <View style={[styles.metaAiRing, isActive && styles.metaAiRingActive]}>
                  <View style={styles.metaAiInnerDot} />
                </View>
              </View>

              {/* Tab Title Label */}
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
                style={[
                  styles.tabLabel,
                  isActive
                    ? [styles.tabLabelActive, { color: '#c084fc', textShadowColor: 'rgba(192, 132, 252, 0.6)' }]
                    : isLight
                    ? styles.tabLabelInactiveLight
                    : styles.tabLabelInactive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        }

        // Standard Navigation Tabs: Updates, Calls, Communities, Chats, You
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabButton}
            onPress={() => onSelectTab && onSelectTab(tab.id)}
            activeOpacity={0.7}
          >
            {/* Frosted Glass Highlight Capsule Pill */}
            <View
              style={[
                styles.iconWrapper,
                isActive && (isLight ? styles.activePillHighlightLight : styles.activePillHighlight),
              ]}
            >
              {tab.isYou && currentUser?.avatar ? (
                <Image
                  source={{ uri: currentUser.avatar }}
                  style={[
                    styles.dockAvatarSmall,
                    isActive && (isLight ? styles.dockAvatarActiveLight : styles.dockAvatarActive),
                  ]}
                />
              ) : (
                <Ionicons
                  name={isActive ? tab.iconActive : tab.iconInactive}
                  size={24}
                  color={
                    isActive
                      ? isLight
                        ? '#111b21'
                        : '#ffffff'
                      : isLight
                      ? '#54656f'
                      : '#8696a0'
                  }
                />
              )}

              {/* Unread Counter Badge (Only shown when count > 0) */}
              {badgeCount > 0 && (
                <View style={styles.counterBadge}>
                  <Text style={styles.counterBadgeText}>
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </Text>
                </View>
              )}

              {/* Status Update Indicator Dot */}
              {showDot && <View style={styles.statusDot} />}
            </View>

            {/* Tab Label */}
            <Text
              numberOfLines={1}
              style={[
                styles.tabLabel,
                isActive
                  ? (isLight ? styles.tabLabelActiveLight : styles.tabLabelActive)
                  : (isLight ? styles.tabLabelInactiveLight : styles.tabLabelInactive),
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
  // Mobile Bottom Bar (Authentic WhatsApp Frosted Glassmorphism - As in video)
  bottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    paddingTop: 8,
    paddingBottom: 8,
    zIndex: 999,
    elevation: 25,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(30px) saturate(210%)',
          WebkitBackdropFilter: 'blur(30px) saturate(210%)',
        }
      : {}),
  },
  bottomBarContainerLight: {
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  glassTintOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  glassTintOverlayDark: {
    backgroundColor: 'rgba(15, 23, 29, 0.65)',
  },
  glassTintOverlayLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
  },
  glassTopRimGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  glassTopRimGlowLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },

  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    minWidth: 0,
    position: 'relative',
  },

  // Diffuse Ambient Backlighting Behind Active Tab
  activeTabAmbientGlow: {
    position: 'absolute',
    top: 0,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 168, 132, 0.18)',
    ...(Platform.OS === 'web' ? { filter: 'blur(16px)' } : {}),
  },
  activeMetaAiAmbientGlow: {
    position: 'absolute',
    top: 0,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(168, 85, 247, 0.25)',
    ...(Platform.OS === 'web' ? { filter: 'blur(18px)' } : {}),
  },

  // Top Neon Laser Glow Beams
  activeTabGlowBeam: {
    position: 'absolute',
    top: -8,
    width: 34,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.accentGreen,
    shadowColor: COLORS.accentGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.95,
    shadowRadius: 8,
    elevation: 4,
  },
  activeMetaAiGlowBeam: {
    backgroundColor: '#c084fc',
    shadowColor: '#a855f7',
    shadowOpacity: 0.95,
    shadowRadius: 10,
  },

  // Icon Wrapper & Glass Capsules (As shown in video)
  iconWrapper: {
    width: 60,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activePillHighlight: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  activePillHighlightLight: {
    backgroundColor: '#d7e1e8',
  },
  activePillHighlightMetaAi: {
    backgroundColor: 'rgba(168, 85, 247, 0.28)',
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.7)',
  },

  // Glass Specular Highlight Sheen
  glassHighlightSheen: {
    position: 'absolute',
    top: 2,
    left: '18%',
    right: '18%',
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.48)',
    borderRadius: 1,
    alignSelf: 'center',
  },

  // Tab Labels (Clean, SF Pro font aesthetic)
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  tabLabelActiveLight: {
    color: '#111b21',
    fontWeight: '700',
  },
  tabLabelInactive: {
    color: '#8696a0',
    fontWeight: '500',
  },
  tabLabelInactiveLight: {
    color: '#54656f',
    fontWeight: '500',
  },

  // Badges (Bright WhatsApp Green)
  counterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#25d366',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  counterBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  dockAvatarSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  dockAvatarActive: {
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  dockAvatarActiveLight: {
    borderWidth: 1.5,
    borderColor: '#111b21',
  },
  statusDot: {
    position: 'absolute',
    top: 2,
    right: 12,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.badgeGreen,
    shadowColor: COLORS.badgeGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },

  // Meta AI Glowing Cosmic Ring
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
    shadowOpacity: 0.95,
    shadowRadius: 8,
  },
  metaAiInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38bdf8',
  },

  // Tablet / Desktop Vertical Sidebar (Glassmorphic)
  verticalDock: {
    width: 62,
    height: '100%',
    backgroundColor: 'rgba(32, 44, 51, 0.88)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    zIndex: 40,
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }
      : {}),
  },
  verticalDockLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRightColor: 'rgba(0, 0, 0, 0.08)',
  },
  verticalTopGroup: {
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  verticalDockBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  verticalDockBtnActive: {
    backgroundColor: 'rgba(0, 168, 132, 0.22)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 168, 132, 0.55)',
    shadowColor: '#00a884',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  verticalDockBtnActiveLight: {
    backgroundColor: 'rgba(0, 168, 132, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 168, 132, 0.4)',
  },
  verticalDockBtnActiveMetaAi: {
    backgroundColor: 'rgba(168, 85, 247, 0.26)',
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.65)',
    shadowColor: '#c084fc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 5,
  },
  verticalNeonBeam: {
    position: 'absolute',
    left: 0,
    top: 10,
    bottom: 10,
    width: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.accentGreen,
    shadowColor: COLORS.accentGreen,
    shadowOffset: { width: 1, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
  verticalNeonBeamMetaAi: {
    backgroundColor: '#c084fc',
    shadowColor: '#c084fc',
  },
  verticalGlassSheen: {
    position: 'absolute',
    top: 3,
    left: '20%',
    right: '20%',
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 1,
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
  badgeText: {
    color: '#111b21',
    fontSize: 9,
    fontWeight: '800',
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

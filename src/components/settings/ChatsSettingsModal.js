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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import storageService from '../../services/storageService';
import { useTheme } from '../../context/ThemeContext';

const WALLPAPERS = [
  { id: 'classic_dark', color: '#0b141a', name: 'Classic Dark' },
  { id: 'emerald', color: '#0b2219', name: 'Deep Emerald' },
  { id: 'navy', color: '#0f172a', name: 'Navy Slate' },
  { id: 'charcoal', color: '#18181b', name: 'Charcoal' },
  { id: 'midnight', color: '#0a192f', name: 'Midnight' },
  { id: 'light_doodle', color: '#efeae2', name: 'WhatsApp Light' },
  { id: 'soft_blue', color: '#e8f0fe', name: 'Soft Sky' },
];

const THEMES = ['Dark', 'Light', 'System'];
const FONT_SIZES = ['Small', 'Medium', 'Large'];

export default function ChatsSettingsModal({
  visible,
  onClose,
  onClearAllChats,
  currentTheme,
  onThemeChange,
  currentWallpaper,
  onWallpaperChange,
}) {
  const themeContext = useTheme();
  const [theme, setTheme] = useState(currentTheme || themeContext?.themeMode || 'Dark');
  const [wallpaper, setWallpaper] = useState(currentWallpaper || themeContext?.chatWallpaper || '#0b141a');
  const [enterIsSend, setEnterIsSend] = useState(false);
  const [mediaVisibility, setMediaVisibility] = useState(true);
  const [keepArchived, setKeepArchived] = useState(true);
  const [fontSize, setFontSize] = useState('Medium');

  const activeIsLight = themeContext?.isLight || (theme === 'Light');

  useEffect(() => {
    (async () => {
      const saved = await storageService.getSettings();
      if (saved?.chats) {
        if (saved.chats.theme) setTheme(saved.chats.theme);
        if (saved.chats.wallpaper) setWallpaper(saved.chats.wallpaper);
        if (saved.chats.enterIsSend !== undefined) setEnterIsSend(saved.chats.enterIsSend);
        if (saved.chats.mediaVisibility !== undefined) setMediaVisibility(saved.chats.mediaVisibility);
        if (saved.chats.keepArchived !== undefined) setKeepArchived(saved.chats.keepArchived);
        if (saved.chats.fontSize) setFontSize(saved.chats.fontSize);
      } else {
        if (currentTheme || themeContext?.themeMode) setTheme(currentTheme || themeContext?.themeMode);
        if (currentWallpaper || themeContext?.chatWallpaper) setWallpaper(currentWallpaper || themeContext?.chatWallpaper);
      }
    })();
  }, [visible, currentTheme, currentWallpaper, themeContext?.themeMode, themeContext?.chatWallpaper]);

  const handleSelectTheme = (t) => {
    setTheme(t);
    if (onThemeChange) {
      onThemeChange(t);
    }
    if (themeContext?.setTheme) {
      themeContext.setTheme(t);
    }
  };

  const handleSelectWallpaper = (wpColor) => {
    setWallpaper(wpColor);
    if (onWallpaperChange) {
      onWallpaperChange(wpColor);
    }
    if (themeContext?.setWallpaper) {
      themeContext.setWallpaper(wpColor);
    }
  };

  const handleSave = async () => {
    const existing = (await storageService.getSettings()) || {};
    const chats = {
      theme,
      wallpaper,
      enterIsSend,
      mediaVisibility,
      keepArchived,
      fontSize,
    };
    await storageService.saveSettings({ ...existing, chats });
    if (onThemeChange) onThemeChange(theme);
    if (onWallpaperChange) onWallpaperChange(wallpaper);
    Alert.alert('Chats Settings Saved', `Applied ${theme} theme and chat wallpaper.`);
    onClose();
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear All Chats History',
      'Are you sure you want to delete all messages and conversations? This will erase local messages on this device and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Chats',
          style: 'destructive',
          onPress: async () => {
            if (onClearAllChats) {
              await onClearAllChats();
            }
            Alert.alert('Chats Cleared', 'All conversation history has been cleared.');
            onClose();
          },
        },
      ]
    );
  };

  const handleArchiveAll = () => {
    Alert.alert(
      'Archive All Chats',
      'Are you sure you want to archive all active conversations?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          onPress: () => {
            Alert.alert('Done', 'All chats have been moved to archived.');
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
      <View style={[styles.container, activeIsLight && styles.containerLight]}>
        {/* Ambient Glow */}
        <View style={styles.ambientGlowTop} pointerEvents="none" />

        {/* Header */}
        <View style={[styles.glassHeader, activeIsLight && styles.glassHeaderLight]}>
          <TouchableOpacity onPress={onClose} style={[styles.glassBackBtn, activeIsLight && styles.glassBackBtnLight]} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={activeIsLight ? "#ffffff" : "#e9edef"} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerTitle, activeIsLight && { color: '#ffffff' }]}>Chats</Text>
            <Text style={[styles.headerSubtitle, activeIsLight && { color: '#e7fed8' }]}>Theme, wallpaper & history</Text>
          </View>
          <View style={[styles.chatBadge, activeIsLight && { backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.4)' }]}>
            <Ionicons name="chatbox-ellipses-outline" size={18} color={activeIsLight ? "#ffffff" : COLORS.accentGreen} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Display Section */}
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="color-palette-outline" size={15} color={COLORS.accentGreen} />
            <Text style={styles.sectionHeader}>Display & Appearance</Text>
          </View>

          {/* Theme Selector */}
          <View style={[styles.glassCard, activeIsLight && styles.glassCardLight]}>
            <Text style={[styles.cardTitle, activeIsLight && { color: '#111b21' }]}>App Theme</Text>
            <Text style={[styles.cardSubtitle, activeIsLight && { color: '#54656f' }]}>
              Active: {theme} {theme === 'System' ? '(Follows device dark/light setting)' : ''}
            </Text>
            <View style={styles.chipsRow}>
              {THEMES.map((t) => {
                const isSelected = theme === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[styles.glassChip, activeIsLight && styles.glassChipLight, isSelected && styles.glassChipActive]}
                    onPress={() => handleSelectTheme(t)}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name={t === 'Dark' ? 'moon' : t === 'Light' ? 'sunny' : 'phone-portrait-outline'}
                      size={15}
                      color={isSelected ? COLORS.accentGreen : (activeIsLight ? '#54656f' : '#8696a0')}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.chipText, activeIsLight && { color: '#54656f' }, isSelected && styles.chipTextActive]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Wallpaper Selection */}
          <View style={[styles.glassCard, activeIsLight && styles.glassCardLight]}>
            <Text style={[styles.cardTitle, activeIsLight && { color: '#111b21' }]}>Chat Wallpaper</Text>
            <Text style={[styles.cardSubtitle, activeIsLight && { color: '#54656f' }]}>Choose your default chat background tint</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.wallpaperScroll}>
              {WALLPAPERS.map((wp) => {
                const isSelected = wallpaper === wp.color;
                return (
                  <TouchableOpacity
                    key={wp.id}
                    style={[
                      styles.wallpaperSwatch,
                      { backgroundColor: wp.color },
                      isSelected && styles.wallpaperSwatchSelected,
                    ]}
                    onPress={() => handleSelectWallpaper(wp.color)}
                    activeOpacity={0.8}
                  >
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={wp.color === '#efeae2' || wp.color === '#e8f0fe' ? '#008069' : '#25D366'}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={[styles.wallpaperNote, activeIsLight && { color: '#54656f' }]}>
              Active tint: <Text style={{ color: COLORS.accentGreen, fontWeight: '700' }}>
                {WALLPAPERS.find((w) => w.color === wallpaper)?.name || 'Custom'}
              </Text>
            </Text>
          </View>

          {/* Chat Settings Section */}
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="chatbubbles-outline" size={15} color={COLORS.accentGreen} />
            <Text style={styles.sectionHeader}>Chat Settings</Text>
          </View>

          {/* Enter is Send */}
          <View style={[styles.glassRowCard, activeIsLight && styles.glassCardLight]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.rowTitle, activeIsLight && { color: '#111b21' }]}>Enter is send</Text>
              <Text style={[styles.rowSubtitle, activeIsLight && { color: '#54656f' }]}>Enter key will immediately send your message</Text>
            </View>
            <Switch
              value={enterIsSend}
              onValueChange={setEnterIsSend}
              thumbColor={enterIsSend ? COLORS.accentGreen : (activeIsLight ? '#8696a0' : '#8696a0')}
              trackColor={{ false: activeIsLight ? '#e9edef' : '#2a3942', true: 'rgba(0, 168, 132, 0.45)' }}
            />
          </View>

          {/* Media Visibility */}
          <View style={[styles.glassRowCard, activeIsLight && styles.glassCardLight]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.rowTitle, activeIsLight && { color: '#111b21' }]}>Media visibility</Text>
              <Text style={[styles.rowSubtitle, activeIsLight && { color: '#54656f' }]}>Show newly downloaded media in your gallery</Text>
            </View>
            <Switch
              value={mediaVisibility}
              onValueChange={setMediaVisibility}
              thumbColor={mediaVisibility ? COLORS.accentGreen : (activeIsLight ? '#8696a0' : '#8696a0')}
              trackColor={{ false: activeIsLight ? '#e9edef' : '#2a3942', true: 'rgba(0, 168, 132, 0.45)' }}
            />
          </View>

          {/* Keep Chats Archived */}
          <View style={[styles.glassRowCard, activeIsLight && styles.glassCardLight]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.rowTitle, activeIsLight && { color: '#111b21' }]}>Keep chats archived</Text>
              <Text style={[styles.rowSubtitle, activeIsLight && { color: '#54656f' }]}>Archived chats stay hidden when new messages arrive</Text>
            </View>
            <Switch
              value={keepArchived}
              onValueChange={setKeepArchived}
              thumbColor={keepArchived ? COLORS.accentGreen : (activeIsLight ? '#8696a0' : '#8696a0')}
              trackColor={{ false: activeIsLight ? '#e9edef' : '#2a3942', true: 'rgba(0, 168, 132, 0.45)' }}
            />
          </View>

          {/* Font Size Selector */}
          <View style={[styles.glassCard, activeIsLight && styles.glassCardLight]}>
            <Text style={[styles.cardTitle, activeIsLight && { color: '#111b21' }]}>Font Size</Text>
            <View style={styles.chipsRow}>
              {FONT_SIZES.map((fs) => {
                const isSelected = fontSize === fs;
                return (
                  <TouchableOpacity
                    key={fs}
                    style={[styles.glassChip, activeIsLight && styles.glassChipLight, isSelected && styles.glassChipActive]}
                    onPress={() => setFontSize(fs)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.chipText, activeIsLight && { color: '#54656f' }, isSelected && styles.chipTextActive]}>
                      {fs}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Chat History Section */}
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="archive-outline" size={15} color={COLORS.accentGreen} />
            <Text style={styles.sectionHeader}>Chat History & Storage</Text>
          </View>

          {/* Archive All Chats */}
          <TouchableOpacity
            style={[styles.glassActionCard, activeIsLight && styles.glassCardLight]}
            onPress={handleArchiveAll}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.iconPill, { backgroundColor: activeIsLight ? 'rgba(0,0,0,0.05)' : 'rgba(255, 255, 255, 0.05)' }]}>
                <Ionicons name="archive-outline" size={18} color={activeIsLight ? '#54656f' : '#8696a0'} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.rowTitle, activeIsLight && { color: '#111b21' }]}>Archive all chats</Text>
                <Text style={[styles.rowSubtitle, activeIsLight && { color: '#54656f' }]}>Hide all active conversations</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={activeIsLight ? '#54656f' : '#8696a0'} />
          </TouchableOpacity>

          {/* Clear All Chats */}
          <TouchableOpacity
            style={[styles.glassActionCard, activeIsLight && styles.glassCardLight, { borderColor: 'rgba(239, 68, 68, 0.25)', marginTop: 8 }]}
            onPress={handleClearHistory}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.iconPill, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.rowTitle, { color: '#ef4444' }]}>Clear all chats</Text>
                <Text style={[styles.rowSubtitle, activeIsLight && { color: '#54656f' }]}>Permanently delete all conversation messages</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#ef4444" />
          </TouchableOpacity>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.glassFooter, activeIsLight && styles.glassFooterLight]}>
          <TouchableOpacity
            style={styles.saveGlassBtn}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-done" size={20} color="#0b141a" style={{ marginRight: 8 }} />
            <Text style={styles.saveBtnText}>Apply Theme & Wallpaper</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070d10',
    position: 'relative',
  },
  containerLight: {
    backgroundColor: '#f0f2f5',
  },
  glassHeaderLight: {
    backgroundColor: '#008069',
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  glassBackBtnLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  glassCardLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e9edef',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  glassChipLight: {
    backgroundColor: '#f0f2f5',
    borderColor: '#e9edef',
  },
  glassFooterLight: {
    backgroundColor: '#ffffff',
    borderTopColor: '#e9edef',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  ambientGlowTop: {
    position: 'absolute',
    top: -60,
    left: -40,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(0, 168, 132, 0.1)',
    ...(Platform.OS === 'web' ? { filter: 'blur(70px)' } : {}),
  },
  glassHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 14,
    backgroundColor: 'rgba(17, 27, 33, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(16px)' } : {}),
  },
  glassBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e9edef',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#8696a0',
    marginTop: 1,
  },
  chatBadge: {
    marginLeft: 'auto',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 168, 132, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 168, 132, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 10,
    gap: 6,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accentGreen,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  glassCard: {
    backgroundColor: 'rgba(20, 31, 38, 0.72)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(12px)' } : {}),
  },
  glassRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(20, 31, 38, 0.72)',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(12px)' } : {}),
  },
  glassActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(20, 31, 38, 0.72)',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(12px)' } : {}),
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconPill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e9edef',
  },
  cardSubtitle: {
    fontSize: 11.5,
    color: '#8696a0',
    marginTop: 2,
    marginBottom: 12,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e9edef',
  },
  rowSubtitle: {
    fontSize: 11.5,
    color: '#8696a0',
    marginTop: 2,
    lineHeight: 16,
  },
  settingInfo: {
    flex: 1,
    paddingRight: 14,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  glassChip: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  glassChipActive: {
    backgroundColor: 'rgba(0, 168, 132, 0.18)',
    borderColor: COLORS.accentGreen,
  },
  chipText: {
    fontSize: 12,
    color: '#8696a0',
    fontWeight: '500',
  },
  chipTextActive: {
    color: COLORS.accentGreen,
    fontWeight: '700',
  },
  wallpaperScroll: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 6,
  },
  wallpaperSwatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wallpaperSwatchSelected: {
    borderColor: COLORS.accentGreen,
    borderWidth: 3,
    transform: [{ scale: 1.08 }],
  },
  wallpaperNote: {
    fontSize: 12,
    color: '#8696a0',
    marginTop: 10,
  },
  glassFooter: {
    padding: 16,
    backgroundColor: 'rgba(17, 27, 33, 0.85)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(16px)' } : {}),
  },
  saveGlassBtn: {
    backgroundColor: COLORS.accentGreen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: COLORS.accentGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#070d10',
    letterSpacing: 0.3,
  },
});

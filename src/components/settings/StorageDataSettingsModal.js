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
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import storageService from '../../services/storageService';

export default function StorageDataSettingsModal({ visible, onClose }) {
  const [lessDataForCalls, setLessDataForCalls] = useState(false);
  const [mobileDataPhotos, setMobileDataPhotos] = useState(true);
  const [wifiAllMedia, setWifiAllMedia] = useState(true);
  const [roamingMedia, setRoamingMedia] = useState(false);
  const [useProxy, setUseProxy] = useState(false);
  const [proxyAddress, setProxyAddress] = useState('proxy.pulsechat.net:8080');
  const [cachedSize, setCachedSize] = useState('14.8 MB');

  useEffect(() => {
    (async () => {
      const saved = await storageService.getSettings();
      if (saved?.storage) {
        if (saved.storage.lessDataForCalls !== undefined) setLessDataForCalls(saved.storage.lessDataForCalls);
        if (saved.storage.mobileDataPhotos !== undefined) setMobileDataPhotos(saved.storage.mobileDataPhotos);
        if (saved.storage.wifiAllMedia !== undefined) setWifiAllMedia(saved.storage.wifiAllMedia);
        if (saved.storage.roamingMedia !== undefined) setRoamingMedia(saved.storage.roamingMedia);
        if (saved.storage.useProxy !== undefined) setUseProxy(saved.storage.useProxy);
        if (saved.storage.proxyAddress) setProxyAddress(saved.storage.proxyAddress);
      }
    })();
  }, [visible]);

  const handleSave = async () => {
    const existing = (await storageService.getSettings()) || {};
    const storage = {
      lessDataForCalls,
      mobileDataPhotos,
      wifiAllMedia,
      roamingMedia,
      useProxy,
      proxyAddress,
    };
    await storageService.saveSettings({ ...existing, storage });
    Alert.alert('Settings Saved', 'Storage and network usage preferences updated.');
    onClose();
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cached Files',
      'This will remove temporary photo and voice message caches to free up device space. Your conversations and saved messages will not be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          style: 'destructive',
          onPress: () => {
            setCachedSize('0 KB');
            Alert.alert('Cache Cleared', 'Freed up 14.8 MB of temporary storage.');
          },
        },
      ]
    );
  };

  const handleResetNetworkStats = () => {
    Alert.alert(
      'Reset Network Statistics',
      'Are you sure you want to reset all network usage statistics back to zero?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: () => {
            Alert.alert('Stats Reset', 'Network statistics have been reset.');
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
      <View style={styles.container}>
        {/* Ambient Glow */}
        <View style={styles.ambientGlowTop} pointerEvents="none" />

        {/* Header */}
        <View style={styles.glassHeader}>
          <TouchableOpacity onPress={onClose} style={styles.glassBackBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color="#e9edef" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Storage and Data</Text>
            <Text style={styles.headerSubtitle}>Network usage & auto-download</Text>
          </View>
          <View style={styles.pieBadge}>
            <Ionicons name="pie-chart-outline" size={18} color={COLORS.accentGreen} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Section: Storage Overview */}
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="folder-outline" size={15} color={COLORS.accentGreen} />
            <Text style={styles.sectionHeader}>Storage Overview</Text>
          </View>

          {/* Visual Storage Bar Card */}
          <View style={styles.glassCard}>
            <View style={styles.storageStatsRow}>
              <View>
                <Text style={styles.storageMainValue}>{cachedSize}</Text>
                <Text style={styles.storageSubLabel}>PulseChat Media</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.storageFreeValue}>48.2 GB</Text>
                <Text style={styles.storageSubLabel}>Free device storage</Text>
              </View>
            </View>

            {/* Segmented Bar */}
            <View style={styles.storageBarTrack}>
              <View style={[styles.barSegment, { flex: 2, backgroundColor: COLORS.accentGreen }]} />
              <View style={[styles.barSegment, { flex: 3, backgroundColor: '#38bdf8' }]} />
              <View style={[styles.barSegment, { flex: 1, backgroundColor: '#c084fc' }]} />
              <View style={[styles.barSegment, { flex: 18, backgroundColor: '#2a3942' }]} />
            </View>

            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.accentGreen }]} />
                <Text style={styles.legendText}>Photos (8 MB)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#38bdf8' }]} />
                <Text style={styles.legendText}>Audio (4.8 MB)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#c084fc' }]} />
                <Text style={styles.legendText}>Cache (2 MB)</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.clearCacheBtn} onPress={handleClearCache} activeOpacity={0.75}>
              <Ionicons name="trash-outline" size={15} color="#ef4444" style={{ marginRight: 6 }} />
              <Text style={styles.clearCacheBtnText}>Clear temporary cache</Text>
            </TouchableOpacity>
          </View>

          {/* Section: Network Usage */}
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="wifi-outline" size={15} color={COLORS.accentGreen} />
            <Text style={styles.sectionHeader}>Network Usage</Text>
          </View>

          <View style={styles.glassCard}>
            <View style={styles.netStatsGrid}>
              <View style={styles.netStatCol}>
                <Text style={styles.netStatNum}>184.2 MB</Text>
                <Text style={styles.netStatLabel}>Sent</Text>
              </View>
              <View style={styles.netStatDivider} />
              <View style={styles.netStatCol}>
                <Text style={styles.netStatNum}>512.6 MB</Text>
                <Text style={styles.netStatLabel}>Received</Text>
              </View>
            </View>

            <View style={styles.netDetailList}>
              <View style={styles.netDetailRow}>
                <Text style={styles.netDetailName}>Messages & Calls</Text>
                <Text style={styles.netDetailValue}>86.4 MB</Text>
              </View>
              <View style={styles.netDetailRow}>
                <Text style={styles.netDetailName}>Media (Photos & Audio)</Text>
                <Text style={styles.netDetailValue}>410.4 MB</Text>
              </View>
              <View style={styles.netDetailRow}>
                <Text style={styles.netDetailName}>Socket Signaling</Text>
                <Text style={styles.netDetailValue}>200 KB</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.resetStatsBtn} onPress={handleResetNetworkStats} activeOpacity={0.75}>
              <Text style={styles.resetStatsText}>Reset Statistics</Text>
            </TouchableOpacity>
          </View>

          {/* Section: Media Auto-Download */}
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="download-outline" size={15} color={COLORS.accentGreen} />
            <Text style={styles.sectionHeader}>Media Auto-Download</Text>
          </View>

          {/* When using mobile data */}
          <View style={styles.glassRowCard}>
            <View style={styles.settingInfo}>
              <Text style={styles.rowTitle}>When using mobile data</Text>
              <Text style={styles.rowSubtitle}>{mobileDataPhotos ? 'Photos only' : 'No media'}</Text>
            </View>
            <Switch
              value={mobileDataPhotos}
              onValueChange={setMobileDataPhotos}
              thumbColor={mobileDataPhotos ? COLORS.accentGreen : '#8696a0'}
              trackColor={{ false: '#2a3942', true: 'rgba(0, 168, 132, 0.45)' }}
            />
          </View>

          {/* When connected on Wi-Fi */}
          <View style={styles.glassRowCard}>
            <View style={styles.settingInfo}>
              <Text style={styles.rowTitle}>When connected on Wi-Fi</Text>
              <Text style={styles.rowSubtitle}>{wifiAllMedia ? 'All media (Photos, audio, documents)' : 'Disabled'}</Text>
            </View>
            <Switch
              value={wifiAllMedia}
              onValueChange={setWifiAllMedia}
              thumbColor={wifiAllMedia ? COLORS.accentGreen : '#8696a0'}
              trackColor={{ false: '#2a3942', true: 'rgba(0, 168, 132, 0.45)' }}
            />
          </View>

          {/* When roaming */}
          <View style={styles.glassRowCard}>
            <View style={styles.settingInfo}>
              <Text style={styles.rowTitle}>When roaming</Text>
              <Text style={styles.rowSubtitle}>{roamingMedia ? 'Enabled' : 'No media (Prevents extra charges)'}</Text>
            </View>
            <Switch
              value={roamingMedia}
              onValueChange={setRoamingMedia}
              thumbColor={roamingMedia ? COLORS.accentGreen : '#8696a0'}
              trackColor={{ false: '#2a3942', true: 'rgba(0, 168, 132, 0.45)' }}
            />
          </View>

          {/* Section: Call Settings */}
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="call-outline" size={15} color={COLORS.accentGreen} />
            <Text style={styles.sectionHeader}>Call Settings</Text>
          </View>

          <View style={styles.glassRowCard}>
            <View style={styles.settingInfo}>
              <Text style={styles.rowTitle}>Use less data for calls</Text>
              <Text style={styles.rowSubtitle}>Lowers audio and video bitrates on poor network connections</Text>
            </View>
            <Switch
              value={lessDataForCalls}
              onValueChange={setLessDataForCalls}
              thumbColor={lessDataForCalls ? COLORS.accentGreen : '#8696a0'}
              trackColor={{ false: '#2a3942', true: 'rgba(0, 168, 132, 0.45)' }}
            />
          </View>

          {/* Proxy Configuration */}
          <View style={styles.glassCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={styles.rowTitle}>Proxy settings</Text>
                <Text style={styles.rowSubtitle}>Connect through an encrypted SOCKS5 / HTTPS proxy</Text>
              </View>
              <Switch
                value={useProxy}
                onValueChange={setUseProxy}
                thumbColor={useProxy ? COLORS.accentGreen : '#8696a0'}
                trackColor={{ false: '#2a3942', true: 'rgba(0, 168, 132, 0.45)' }}
              />
            </View>
            {useProxy && (
              <TextInput
                style={styles.proxyInput}
                value={proxyAddress}
                onChangeText={setProxyAddress}
                placeholder="e.g. proxy.domain.com:8080"
                placeholderTextColor="#8696a0"
                autoCapitalize="none"
              />
            )}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.glassFooter}>
          <TouchableOpacity style={styles.saveGlassBtn} onPress={handleSave} activeOpacity={0.85}>
            <Ionicons name="checkmark-done" size={20} color="#0b141a" style={{ marginRight: 8 }} />
            <Text style={styles.saveBtnText}>Save Storage Preferences</Text>
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
  pieBadge: {
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
  settingInfo: {
    flex: 1,
    paddingRight: 14,
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
  storageStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  storageMainValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.accentGreen,
  },
  storageFreeValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e9edef',
  },
  storageSubLabel: {
    fontSize: 11,
    color: '#8696a0',
    marginTop: 2,
  },
  storageBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 12,
  },
  barSegment: {
    height: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 10.5,
    color: '#8696a0',
  },
  clearCacheBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  clearCacheBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  netStatsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  netStatCol: {
    alignItems: 'center',
  },
  netStatNum: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e9edef',
  },
  netStatLabel: {
    fontSize: 11,
    color: '#8696a0',
    marginTop: 2,
  },
  netStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  netDetailList: {
    marginVertical: 10,
    gap: 6,
  },
  netDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  netDetailName: {
    fontSize: 12,
    color: '#8696a0',
  },
  netDetailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e9edef',
  },
  resetStatsBtn: {
    alignItems: 'center',
    paddingTop: 8,
  },
  resetStatsText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accentGreen,
  },
  proxyInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#e9edef',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 4,
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

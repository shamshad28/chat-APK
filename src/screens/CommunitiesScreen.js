import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

export default function CommunitiesScreen({ theme }) {
  const themeContext = useTheme();
  const isLight = theme ? theme === 'Light' : themeContext.isLight;

  return (
    <View style={[styles.container, isLight && styles.containerLight]}>
      {/* Ambient Glass Glow Orbs */}
      <View style={styles.ambientOrbEmerald} pointerEvents="none" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* New Community Row (Frosted Glass Card) */}
        <TouchableOpacity
          style={[styles.newCommunityRow, isLight && styles.newCommunityRowLight]}
          onPress={() => Alert.alert('New Community', 'Bring members together in topic-based groups')}
          activeOpacity={0.75}
        >
          <View style={styles.communityIconWrapper}>
            <View style={[styles.communityIconBg, isLight && styles.communityIconBgLight]}>
              <Ionicons name="people" size={26} color="#ffffff" />
            </View>
            <View style={[styles.plusBadge, isLight && styles.plusBadgeLight]}>
              <Ionicons name="add" size={14} color="#ffffff" />
            </View>
          </View>
          <View style={styles.communityInfo}>
            <Text style={[styles.communityTitle, isLight && styles.communityTitleLight]}>New community</Text>
            <Text style={styles.communitySubtext}>Organize your related groups</Text>
          </View>
        </TouchableOpacity>

        {/* Example Community 1 */}
        <View style={[styles.communityCard, isLight && styles.communityCardLight]}>
          <View style={styles.communityHeader}>
            <View style={styles.communityAvatar}>
              <Ionicons name="code-slash" size={24} color="#00a884" />
            </View>
            <View style={styles.communityHeaderInfo}>
              <Text style={[styles.communityName, isLight && styles.communityNameLight]}>
                PulseChat Developers
              </Text>
              <Text style={styles.communityMembers}>1,420 members • Public</Text>
            </View>
          </View>

          {/* Sub-groups */}
          <TouchableOpacity
            style={styles.subGroupRow}
            onPress={() => Alert.alert('Announcements', 'Open community announcement room')}
            activeOpacity={0.7}
          >
            <View style={styles.announcementIconBg}>
              <Ionicons name="megaphone" size={18} color="#00a884" />
            </View>
            <View style={styles.subGroupInfo}>
              <Text style={[styles.subGroupName, isLight && styles.subGroupNameLight]}>
                Announcements
              </Text>
              <Text style={styles.subGroupLastMsg} numberOfLines={1}>
                PulseChat v2.5 update is now rolling out!
              </Text>
            </View>
            <Text style={styles.subGroupTime}>Yesterday</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.subGroupRow}
            onPress={() => Alert.alert('General Discussion', 'Open general chat room')}
            activeOpacity={0.7}
          >
            <View style={styles.subGroupAvatarPlaceholder}>
              <Ionicons name="chatbubbles-outline" size={18} color={isLight ? '#54656f' : '#8696a0'} />
            </View>
            <View style={styles.subGroupInfo}>
              <Text style={[styles.subGroupName, isLight && styles.subGroupNameLight]}>
                General Discussion
              </Text>
              <Text style={styles.subGroupLastMsg} numberOfLines={1}>
                Alex: Has anyone tested WebRTC video feeds?
              </Text>
            </View>
            <Text style={styles.subGroupTime}>11:20 AM</Text>
          </TouchableOpacity>
        </View>

        {/* Example Community 2 */}
        <View style={[styles.communityCard, isLight && styles.communityCardLight]}>
          <View style={styles.communityHeader}>
            <View style={[styles.communityAvatar, { backgroundColor: 'rgba(56, 189, 248, 0.15)', borderColor: '#38bdf8' }]}>
              <Ionicons name="rocket-outline" size={24} color="#38bdf8" />
            </View>
            <View style={styles.communityHeaderInfo}>
              <Text style={[styles.communityName, isLight && styles.communityNameLight]}>
                Design & Innovation Hub
              </Text>
              <Text style={styles.communityMembers}>850 members</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.subGroupRow}
            onPress={() => Alert.alert('Glassmorphism UI', 'Open design feedback channel')}
            activeOpacity={0.7}
          >
            <View style={styles.subGroupAvatarPlaceholder}>
              <Ionicons name="color-palette-outline" size={18} color={isLight ? '#54656f' : '#8696a0'} />
            </View>
            <View style={styles.subGroupInfo}>
              <Text style={[styles.subGroupName, isLight && styles.subGroupNameLight]}>
                UI/UX Prototypes
              </Text>
              <Text style={styles.subGroupLastMsg} numberOfLines={1}>
                Sarah: New glass frosted cards look stunning!
              </Text>
            </View>
            <Text style={styles.subGroupTime}>8:45 AM</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
  ambientOrbEmerald: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(0, 168, 132, 0.1)',
    ...(Platform.OS === 'web' ? { filter: 'blur(60px)' } : {}),
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  newCommunityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(20, 31, 38, 0.72)',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(12px)' } : {}),
  },
  newCommunityRowLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  communityIconWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  communityIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#202c33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  communityIconBgLight: {
    backgroundColor: '#008069',
  },
  plusBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.badgeGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusBadgeLight: {
    backgroundColor: '#00a884',
  },
  communityInfo: {
    flex: 1,
  },
  communityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e9edef',
  },
  communityTitleLight: {
    color: '#111b21',
  },
  communitySubtext: {
    fontSize: 12,
    color: '#8696a0',
    marginTop: 2,
  },
  communityCard: {
    backgroundColor: 'rgba(20, 31, 38, 0.72)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(12px)' } : {}),
  },
  communityCardLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 10,
  },
  communityAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 168, 132, 0.15)',
    borderWidth: 1.5,
    borderColor: '#00a884',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  communityHeaderInfo: {
    flex: 1,
  },
  communityName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e9edef',
  },
  communityNameLight: {
    color: '#111b21',
  },
  communityMembers: {
    fontSize: 12,
    color: '#8696a0',
    marginTop: 2,
  },
  subGroupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
  },
  announcementIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 168, 132, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  subGroupAvatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  subGroupInfo: {
    flex: 1,
  },
  subGroupName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e9edef',
  },
  subGroupNameLight: {
    color: '#111b21',
  },
  subGroupLastMsg: {
    fontSize: 12,
    color: '#8696a0',
    marginTop: 1,
  },
  subGroupTime: {
    fontSize: 11,
    color: '#8696a0',
    marginLeft: 8,
  },
});

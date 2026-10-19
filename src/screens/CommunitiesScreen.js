import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function CommunitiesScreen() {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* New Community Row */}
        <TouchableOpacity
          style={styles.newCommunityRow}
          onPress={() => Alert.alert('New Community', 'Bring members together in topic-based groups')}
          activeOpacity={0.7}
        >
          <View style={styles.communityIconWrapper}>
            <View style={styles.communityIconBg}>
              <Ionicons name="people" size={26} color="#ffffff" />
            </View>
            <View style={styles.plusBadge}>
              <Ionicons name="add" size={14} color="#111b21" />
            </View>
          </View>
          <View style={styles.communityInfo}>
            <Text style={styles.communityTitle}>New community</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Example Community 1 */}
        <View style={styles.communityCard}>
          <View style={styles.communityHeader}>
            <View style={styles.communityAvatar}>
              <Ionicons name="code-slash" size={24} color="#00a884" />
            </View>
            <View style={styles.communityHeaderInfo}>
              <Text style={styles.communityName}>PulseChat Developers</Text>
              <Text style={styles.communityMembers}>1,420 members</Text>
            </View>
          </View>

          {/* Sub-groups */}
          <TouchableOpacity
            style={styles.subGroupRow}
            onPress={() => Alert.alert('Announcements', 'Opening PulseChat announcements group')}
            activeOpacity={0.7}
          >
            <View style={styles.announcementIconBg}>
              <Ionicons name="megaphone" size={18} color="#00a884" />
            </View>
            <View style={styles.subGroupInfo}>
              <Text style={styles.subGroupName}>Announcements</Text>
              <Text style={styles.subGroupLastMsg} numberOfLines={1}>
                PulseChat 2.0 mobile beta is now live for all developers!
              </Text>
            </View>
            <Text style={styles.subGroupTime}>11:30 AM</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.subGroupRow}
            onPress={() => Alert.alert('General Dev', 'Opening general development discussion')}
            activeOpacity={0.7}
          >
            <View style={styles.generalIconBg}>
              <Ionicons name="chatbubbles" size={18} color="#8696a0" />
            </View>
            <View style={styles.subGroupInfo}>
              <Text style={styles.subGroupName}>General Discussion</Text>
              <Text style={styles.subGroupLastMsg} numberOfLines={1}>
                Shamshad: Socket.IO events now synced with Expo mobile app
              </Text>
            </View>
            <Text style={styles.subGroupTime}>Yesterday</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  newCommunityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  communityIconWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  communityIconBg: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#374248',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.badgeGreen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  communityInfo: {
    flex: 1,
  },
  communityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  divider: {
    height: 8,
    backgroundColor: '#0b141a',
  },
  communityCard: {
    backgroundColor: COLORS.headerBackground,
    paddingTop: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  communityAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#103629',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#00a88440',
  },
  communityHeaderInfo: {
    flex: 1,
  },
  communityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  communityMembers: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  subGroupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a3942',
  },
  announcementIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#103629',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  generalIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a3942',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  subGroupInfo: {
    flex: 1,
    marginRight: 8,
  },
  subGroupName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  subGroupLastMsg: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  subGroupTime: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});

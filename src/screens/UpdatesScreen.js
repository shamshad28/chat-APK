import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { CURRENT_USER, MOCK_STATUSES, MOCK_CHANNELS } from '../data/mockData';
import StatusViewerModal from '../components/status/StatusViewerModal';
import CreateStatusModal from '../components/status/CreateStatusModal';
import cameraService from '../services/cameraService';
import { useTheme } from '../context/ThemeContext';

export default function UpdatesScreen({ onSendStoryReply, onPublishStatus, theme }) {
  const themeContext = useTheme();
  const isLight = theme ? theme === 'Light' : themeContext.isLight;

  const [channels, setChannels] = useState(MOCK_CHANNELS || []);
  const [statuses, setStatuses] = useState(MOCK_STATUSES || []);
  const [myStatus, setMyStatus] = useState(null);

  // Status Player Modal State
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);

  // Status Creator Modal State
  const [isCreatorVisible, setIsCreatorVisible] = useState(false);

  const handleCameraStatus = async () => {
    const photoUri = await cameraService.capturePhoto();
    if (photoUri) {
      const newStatus = {
        id: `status_cam_${Date.now()}`,
        userName: CURRENT_USER.name,
        avatar: CURRENT_USER.avatar,
        mediaUrl: photoUri,
        caption: 'Captured with Camera 📸',
        time: 'Just now',
        unviewedCount: 1,
      };
      setMyStatus(newStatus);
      onPublishStatus && onPublishStatus(newStatus);
    }
  };

  const handlePublishMyStatus = (createdStatus) => {
    setMyStatus(createdStatus);
    onPublishStatus && onPublishStatus(createdStatus);
    setIsCreatorVisible(false);
  };

  const allStatusesToView = myStatus ? [myStatus, ...statuses] : statuses;

  const handleOpenStatus = (index) => {
    setSelectedStoryIndex(index);
    setIsViewerVisible(true);
  };

  const toggleFollow = (channelId) => {
    setChannels((prev) =>
      prev.map((c) =>
        c.id === channelId ? { ...c, isFollowing: !c.isFollowing } : c
      )
    );
  };

  return (
    <View style={[styles.container, isLight && styles.containerLight]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Status Section Title */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, isLight && styles.sectionTitleLight]}>Status</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <MaterialIcons name="more-vert" size={22} color={isLight ? '#54656f' : COLORS.iconDefault} />
          </TouchableOpacity>
        </View>

        {/* My Status Row */}
        <TouchableOpacity
          style={[styles.statusRow, isLight && styles.statusRowLight]}
          onPress={() => {
            if (myStatus) {
              handleOpenStatus(0);
            } else {
              setIsCreatorVisible(true);
            }
          }}
          activeOpacity={0.7}
        >
          <View style={styles.myAvatarWrapper}>
            {CURRENT_USER.avatar ? (
              <Image source={{ uri: CURRENT_USER.avatar }} style={styles.statusAvatar} />
            ) : (
              <View style={[styles.statusAvatarPlaceholder, isLight && styles.statusAvatarPlaceholderLight]}>
                <Ionicons name="person" size={28} color={isLight ? '#54656f' : '#8696a0'} />
              </View>
            )}
            <View style={[styles.plusBadge, isLight && styles.plusBadgeLight]}>
              <Ionicons name="add" size={16} color={isLight ? '#ffffff' : '#111b21'} />
            </View>
          </View>
          <View style={styles.statusInfo}>
            <Text style={[styles.statusName, isLight && styles.statusNameLight]}>My status</Text>
            <Text style={[styles.statusSubtext, isLight && styles.statusSubtextLight]}>
              {myStatus ? 'Tap to view status update' : 'Tap to add status update'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Recent Updates */}
        <Text style={[styles.subHeader, isLight && styles.subHeaderLight]}>RECENT UPDATES</Text>
        {statuses.map((item, idx) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.statusRow, isLight && styles.statusRowLight]}
            onPress={() => handleOpenStatus(myStatus ? idx + 1 : idx)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.ringWrapper,
                item.hasUnviewed ? styles.unviewedRing : styles.viewedRing,
              ]}
            >
              {item.avatar ? (
                <Image source={{ uri: item.avatar }} style={styles.statusAvatarInner} />
              ) : (
                <View style={[styles.statusAvatarInner, { backgroundColor: '#065f46', alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>{item.userName?.charAt(0)}</Text>
                </View>
              )}
            </View>
            <View style={styles.statusInfo}>
              <Text style={[styles.statusName, isLight && styles.statusNameLight]}>{item.userName}</Text>
              <Text style={[styles.statusSubtext, isLight && styles.statusSubtextLight]}>{item.time}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Channels Section */}
        <View style={styles.channelsHeaderRow}>
          <View>
            <Text style={[styles.sectionTitle, isLight && styles.sectionTitleLight]}>Channels</Text>
            <Text style={[styles.channelsSubtitle, isLight && styles.channelsSubtitleLight]}>
              Stay updated on topics you care about
            </Text>
          </View>
        </View>

        {channels.map((ch) => (
          <View key={ch.id} style={[styles.channelRow, isLight && styles.channelRowLight]}>
            <Image source={{ uri: ch.avatar }} style={styles.channelAvatar} />
            <View style={styles.channelInfo}>
              <View style={styles.channelNameRow}>
                <Text style={[styles.channelName, isLight && styles.channelNameLight]}>{ch.name}</Text>
                {ch.verified && (
                  <Ionicons name="checkmark-circle" size={15} color="#00a884" style={{ marginLeft: 4 }} />
                )}
              </View>
              <Text style={[styles.channelUpdate, isLight && styles.channelUpdateLight]} numberOfLines={1}>
                {ch.lastUpdate}
              </Text>
              <Text style={styles.channelFollowers}>{ch.followers}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.followBtn,
                isLight && styles.followBtnLight,
                ch.isFollowing && (isLight ? styles.followingBtnLight : styles.followingBtn),
              ]}
              onPress={() => toggleFollow(ch.id)}
            >
              <Text
                style={[
                  styles.followBtnText,
                  isLight && styles.followBtnTextLight,
                  ch.isFollowing && styles.followingBtnText,
                ]}
              >
                {ch.isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Floating Buttons: Edit Status (pen) & Camera */}
      <View style={styles.fabsContainer}>
        <TouchableOpacity
          style={[styles.pencilFab, isLight && styles.pencilFabLight]}
          onPress={() => setIsCreatorVisible(true)}
          activeOpacity={0.85}
        >
          <Feather name="edit-2" size={18} color={isLight ? '#111b21' : COLORS.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cameraFab, isLight && styles.cameraFabLight]}
          onPress={handleCameraStatus}
          activeOpacity={0.85}
        >
          <Feather name="camera" size={24} color={isLight ? '#ffffff' : '#111b21'} />
        </TouchableOpacity>
      </View>

      {/* Full Screen Story Viewer */}
      <StatusViewerModal
        visible={isViewerVisible}
        statusList={allStatusesToView}
        initialIndex={selectedStoryIndex}
        onClose={() => setIsViewerVisible(false)}
        onSendReply={onSendStoryReply}
      />

      {/* Create Status Modal */}
      <CreateStatusModal
        visible={isCreatorVisible}
        onClose={() => setIsCreatorVisible(false)}
        onPublishStatus={handlePublishMyStatus}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111b21',
  },
  containerLight: {
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e9edef',
  },
  sectionTitleLight: {
    color: '#111b21',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  statusRowLight: {},
  myAvatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  statusAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  statusAvatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#202c33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusAvatarPlaceholderLight: {
    backgroundColor: '#e9edef',
  },
  plusBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.badgeGreen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#111b21',
  },
  plusBadgeLight: {
    backgroundColor: '#008069',
    borderColor: '#ffffff',
  },
  statusInfo: {
    flex: 1,
  },
  statusName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e9edef',
  },
  statusNameLight: {
    color: '#111b21',
  },
  statusSubtext: {
    fontSize: 13,
    color: '#8696a0',
    marginTop: 2,
  },
  statusSubtextLight: {
    color: '#54656f',
  },
  subHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8696a0',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
    letterSpacing: 0.5,
  },
  subHeaderLight: {
    color: '#667781',
  },
  ringWrapper: {
    width: 54,
    height: 54,
    borderRadius: 27,
    padding: 2,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unviewedRing: {
    borderWidth: 2.5,
    borderColor: COLORS.accentGreen,
  },
  viewedRing: {
    borderWidth: 2,
    borderColor: '#8696a0',
  },
  statusAvatarInner: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  channelsHeaderRow: {
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 10,
  },
  channelsSubtitle: {
    fontSize: 13,
    color: '#8696a0',
    marginTop: 2,
  },
  channelsSubtitleLight: {
    color: '#54656f',
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  channelRowLight: {
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  channelAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
  },
  channelInfo: {
    flex: 1,
  },
  channelNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  channelName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e9edef',
  },
  channelNameLight: {
    color: '#111b21',
  },
  channelUpdate: {
    fontSize: 12.5,
    color: '#8696a0',
    marginTop: 1,
  },
  channelUpdateLight: {
    color: '#54656f',
  },
  channelFollowers: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  followBtn: {
    backgroundColor: '#103629',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#00a88440',
  },
  followBtnLight: {
    backgroundColor: '#e7f7ef',
    borderColor: '#00806940',
  },
  followingBtn: {
    backgroundColor: '#202c33',
    borderColor: '#2a3942',
  },
  followingBtnLight: {
    backgroundColor: '#f0f2f5',
    borderColor: '#e9edef',
  },
  followBtnText: {
    color: COLORS.accentGreen,
    fontSize: 13,
    fontWeight: '600',
  },
  followBtnTextLight: {
    color: '#008069',
  },
  followingBtnText: {
    color: COLORS.textSecondary,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  fabsContainer: {
    position: 'absolute',
    bottom: 96,
    right: 18,
    alignItems: 'center',
    gap: 14,
  },
  pencilFab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#202c33',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    borderWidth: 1,
    borderColor: '#2a3942',
  },
  pencilFabLight: {
    backgroundColor: '#f0f2f5',
    borderColor: '#e9edef',
  },
  cameraFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.badgeGreen,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  cameraFabLight: {
    backgroundColor: '#008069',
  },
});

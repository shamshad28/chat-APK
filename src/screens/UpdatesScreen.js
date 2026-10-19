import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { CURRENT_USER, MOCK_STATUSES, MOCK_CHANNELS } from '../data/mockData';
import StatusViewerModal from '../components/status/StatusViewerModal';
import CreateStatusModal from '../components/status/CreateStatusModal';
import cameraService from '../services/cameraService';

export default function UpdatesScreen({ onSendStoryReply, onPublishStatus }) {
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
        hasUnviewed: true,
      };
      setMyStatus(newStatus);
      if (onPublishStatus) {
        onPublishStatus(newStatus);
      }
      Alert.alert('Status Updated', 'Your camera photo has been published to Status.');
    }
  };

  const toggleFollow = (channelId) => {
    setChannels((prev) =>
      prev.map((c) =>
        c.id === channelId ? { ...c, isFollowing: !c.isFollowing } : c
      )
    );
  };

  const handleOpenStatus = (index) => {
    setSelectedStoryIndex(index);
    setIsViewerVisible(true);
  };

  const handlePublishMyStatus = (newStatus) => {
    setMyStatus(newStatus);
    setStatuses((prev) => [newStatus, ...prev]);
  };

  const allStatusesToView = myStatus ? [myStatus, ...statuses] : statuses;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Status Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Status</Text>
          <TouchableOpacity
            onPress={() => Alert.alert('Status Privacy', 'Options: My contacts, My contacts except..., Only share with...')}
          >
            <MaterialIcons name="more-vert" size={22} color={COLORS.iconDefault} />
          </TouchableOpacity>
        </View>

        {/* My Status Card */}
        <TouchableOpacity
          style={styles.statusRow}
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
            <Image source={{ uri: CURRENT_USER.avatar }} style={styles.statusAvatar} />
            <View style={styles.plusBadge}>
              <Ionicons name={myStatus ? "eye" : "add"} size={15} color="#111b21" />
            </View>
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusName}>My status</Text>
            <Text style={styles.statusSubtext}>
              {myStatus ? 'Tap to view status update' : 'Tap to add status update'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Recent Updates */}
        <Text style={styles.subHeader}>RECENT UPDATES</Text>
        {statuses.map((item, idx) => (
          <TouchableOpacity
            key={item.id}
            style={styles.statusRow}
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
              <Text style={styles.statusName}>{item.userName}</Text>
              <Text style={styles.statusSubtext}>{item.time}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Channels Section */}
        <View style={styles.channelsHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Channels</Text>
            <Text style={styles.channelsSubtitle}>
              Stay updated on topics you care about
            </Text>
          </View>
        </View>

        {channels.map((ch) => (
          <View key={ch.id} style={styles.channelRow}>
            <Image source={{ uri: ch.avatar }} style={styles.channelAvatar} />
            <View style={styles.channelInfo}>
              <View style={styles.channelNameRow}>
                <Text style={styles.channelName}>{ch.name}</Text>
                {ch.verified && (
                  <Ionicons name="checkmark-circle" size={15} color="#00a884" style={{ marginLeft: 4 }} />
                )}
              </View>
              <Text style={styles.channelUpdate} numberOfLines={1}>
                {ch.lastUpdate}
              </Text>
              <Text style={styles.channelFollowers}>{ch.followers}</Text>
            </View>
            <TouchableOpacity
              style={[styles.followBtn, ch.isFollowing && styles.followingBtn]}
              onPress={() => toggleFollow(ch.id)}
            >
              <Text style={[styles.followBtnText, ch.isFollowing && styles.followingBtnText]}>
                {ch.isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Floating Buttons: Edit Status (pen) & Camera */}
      <View style={styles.fabsContainer}>
        <TouchableOpacity
          style={styles.pencilFab}
          onPress={() => setIsCreatorVisible(true)}
          activeOpacity={0.85}
        >
          <Feather name="edit-2" size={18} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cameraFab}
          onPress={handleCameraStatus}
          activeOpacity={0.85}
        >
          <Feather name="camera" size={24} color="#111b21" />
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
    backgroundColor: COLORS.background,
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
    color: COLORS.textPrimary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  myAvatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  statusAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
    borderColor: COLORS.background,
  },
  statusInfo: {
    flex: 1,
  },
  statusName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  statusSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  subHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
  },
  ringWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  unviewedRing: {
    borderColor: COLORS.accentGreen,
  },
  viewedRing: {
    borderColor: '#374248',
  },
  statusAvatarInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  channelsHeaderRow: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 12,
  },
  channelsSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  channelAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  channelInfo: {
    flex: 1,
    marginRight: 10,
  },
  channelNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  channelName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  channelUpdate: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 1,
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
  followingBtn: {
    backgroundColor: '#202c33',
    borderColor: '#2a3942',
  },
  followBtnText: {
    color: COLORS.accentGreen,
    fontSize: 13,
    fontWeight: '600',
  },
  followingBtnText: {
    color: COLORS.textSecondary,
  },
  fabsContainer: {
    position: 'absolute',
    bottom: 20,
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
  cameraFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.badgeGreen,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
});

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { MOCK_CALLS } from '../../data/mockData';

export default function CallsList({ onStartCall, onSimulateIncomingCall, isLight = false }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'missed'

  const filteredCalls = MOCK_CALLS.filter((call) => {
    if (filter === 'missed') return call.direction === 'missed';
    return true;
  });

  return (
    <View style={[styles.container, isLight && styles.containerLight]}>
      {/* Top Filter & Test Buttons */}
      <View style={[styles.topBar, isLight && styles.topBarLight]}>
        <View style={styles.filterPills}>
          <TouchableOpacity
            style={[
              styles.pill,
              filter === 'all'
                ? (isLight ? styles.pillActiveLight : styles.pillActive)
                : (isLight ? styles.pillInactiveLight : styles.pillInactive),
            ]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[
                styles.pillText,
                filter === 'all'
                  ? (isLight ? styles.pillTextActiveLight : styles.pillTextActive)
                  : (isLight ? styles.pillTextInactiveLight : styles.pillTextInactive),
              ]}
            >
              All ({MOCK_CALLS.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.pill,
              filter === 'missed'
                ? (isLight ? styles.pillActiveLight : styles.pillActive)
                : (isLight ? styles.pillInactiveLight : styles.pillInactive),
            ]}
            onPress={() => setFilter('missed')}
          >
            <Text
              style={[
                styles.pillText,
                filter === 'missed'
                  ? (isLight ? styles.pillTextActiveLight : styles.pillTextActive)
                  : (isLight ? styles.pillTextInactiveLight : styles.pillTextInactive),
              ]}
            >
              Missed ({MOCK_CALLS.filter((c) => c.direction === 'missed').length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Simulate Incoming Call Demo Button */}
        {onSimulateIncomingCall && (
          <TouchableOpacity
            style={[styles.incomingSimBtn, isLight && styles.incomingSimBtnLight]}
            onPress={onSimulateIncomingCall}
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={13} color={isLight ? '#ffffff' : '#111b21'} style={{ marginRight: 4 }} />
            <Text style={[styles.incomingSimText, isLight && styles.incomingSimTextLight]}>Test Incoming</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Calls List */}
      <FlatList
        data={filteredCalls}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <TouchableOpacity
            style={[styles.callLinkRow, isLight && styles.callLinkRowLight]}
            onPress={() => Alert.alert('Call Link', 'Share link: https://pulsechat.app/call/link-9941')}
            activeOpacity={0.7}
          >
            <View style={[styles.linkCircle, isLight && styles.linkCircleLight]}>
              <Ionicons name="link" size={22} color={isLight ? '#ffffff' : '#111b21'} />
            </View>
            <View style={styles.linkInfo}>
              <Text style={[styles.linkTitle, isLight && styles.linkTitleLight]}>Create call link</Text>
              <Text style={[styles.linkSubtext, isLight && styles.linkSubtextLight]}>
                Share a link for your PulseChat call
              </Text>
            </View>
          </TouchableOpacity>
        }
        renderItem={({ item }) => {
          const isMissed = item.direction === 'missed';
          const isIncoming = item.direction === 'incoming';

          return (
            <View style={[styles.callRow, isLight && styles.callRowLight]}>
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              <View style={styles.infoArea}>
                <Text
                  style={[
                    styles.contactName,
                    isLight && styles.contactNameLight,
                    isMissed && styles.contactNameMissed,
                  ]}
                >
                  {item.name}
                </Text>
                <View style={styles.directionRow}>
                  <Feather
                    name={
                      isMissed
                        ? 'arrow-down-left'
                        : isIncoming
                        ? 'arrow-down-left'
                        : 'arrow-up-right'
                    }
                    size={14}
                    color={isMissed ? '#ef4444' : isLight ? '#008069' : COLORS.accentGreen}
                  />
                  <Text style={[styles.dateText, isLight && styles.dateTextLight]}>{item.date}</Text>
                </View>
              </View>

              {/* Call Action Button */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onStartCall && onStartCall(item, item.type || 'voice')}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={item.type === 'video' ? 'videocam' : 'call'}
                  size={20}
                  color={isLight ? '#008069' : COLORS.accentGreen}
                />
              </TouchableOpacity>
            </View>
          );
        }}
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#111b21',
  },
  topBarLight: {
    backgroundColor: '#ffffff',
  },
  filterPills: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pillActive: {
    backgroundColor: 'rgba(0, 168, 132, 0.22)',
    borderWidth: 1,
    borderColor: '#00a884',
  },
  pillActiveLight: {
    backgroundColor: '#e7f7ef',
    borderWidth: 1,
    borderColor: '#008069',
  },
  pillInactive: {
    backgroundColor: 'rgba(32, 44, 51, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pillInactiveLight: {
    backgroundColor: '#f0f2f5',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  pillText: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  pillTextActive: {
    color: COLORS.accentGreen,
    fontWeight: '700',
  },
  pillTextActiveLight: {
    color: '#008069',
    fontWeight: '700',
  },
  pillTextInactive: {
    color: '#8696a0',
  },
  pillTextInactiveLight: {
    color: '#54656f',
  },
  incomingSimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.badgeGreen,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  incomingSimBtnLight: {
    backgroundColor: '#008069',
  },
  incomingSimText: {
    color: '#111b21',
    fontSize: 11,
    fontWeight: '700',
  },
  incomingSimTextLight: {
    color: '#ffffff',
  },
  listContent: {
    paddingBottom: 90,
  },
  callLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  callLinkRowLight: {
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  linkCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.badgeGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  linkCircleLight: {
    backgroundColor: '#008069',
  },
  linkInfo: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e9edef',
  },
  linkTitleLight: {
    color: '#111b21',
  },
  linkSubtext: {
    fontSize: 12.5,
    color: '#8696a0',
    marginTop: 2,
  },
  linkSubtextLight: {
    color: '#54656f',
  },
  callRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  callRowLight: {
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 14,
  },
  infoArea: {
    flex: 1,
  },
  contactName: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#e9edef',
  },
  contactNameLight: {
    color: '#111b21',
  },
  contactNameMissed: {
    color: '#ef4444',
  },
  directionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#8696a0',
  },
  dateTextLight: {
    color: '#54656f',
  },
  actionButton: {
    padding: 8,
  },
  listContent: {
    paddingBottom: 90,
  },
});

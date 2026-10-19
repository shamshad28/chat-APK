import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { MOCK_CALLS } from '../../data/mockData';

export default function CallsList({ onStartCall, onSimulateIncomingCall }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'missed'

  const filteredCalls = MOCK_CALLS.filter((call) => {
    if (filter === 'missed') return call.direction === 'missed';
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Top Filter & Test Buttons */}
      <View style={styles.topBar}>
        <View style={styles.filterPills}>
          <TouchableOpacity
            style={[styles.pill, filter === 'all' && styles.pillActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.pillText, filter === 'all' && styles.pillTextActive]}>
              All ({MOCK_CALLS.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pill, filter === 'missed' && styles.pillActive]}
            onPress={() => setFilter('missed')}
          >
            <Text style={[styles.pillText, filter === 'missed' && styles.pillTextActive]}>
              Missed ({MOCK_CALLS.filter((c) => c.direction === 'missed').length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Simulate Incoming Call Demo Button */}
        {onSimulateIncomingCall && (
          <TouchableOpacity
            style={styles.incomingSimBtn}
            onPress={onSimulateIncomingCall}
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={13} color="#111b21" style={{ marginRight: 4 }} />
            <Text style={styles.incomingSimText}>Test Incoming</Text>
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
            style={styles.callLinkRow}
            onPress={() => Alert.alert('Call Link', 'Share link: https://pulsechat.app/call/link-9941')}
            activeOpacity={0.7}
          >
            <View style={styles.linkCircle}>
              <Ionicons name="link" size={22} color="#111b21" />
            </View>
            <View style={styles.linkInfo}>
              <Text style={styles.linkTitle}>Create call link</Text>
              <Text style={styles.linkSubtext}>Share a link for your PulseChat call</Text>
            </View>
          </TouchableOpacity>
        }
        renderItem={({ item }) => {
          const isMissed = item.direction === 'missed';
          const isIncoming = item.direction === 'incoming';

          return (
            <View style={styles.callRow}>
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              <View style={styles.infoArea}>
                <Text style={[styles.contactName, isMissed && styles.contactNameMissed]}>
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
                    color={isMissed ? '#ef4444' : COLORS.accentGreen}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
              </View>

              {/* Call Action Button */}
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => onStartCall && onStartCall(item, item.type)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={item.type === 'video' ? 'videocam' : 'call'}
                  size={22}
                  color={COLORS.accentGreen}
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
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterPills: {
    flexDirection: 'row',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#202c33',
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: 'rgba(0, 168, 132, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.accentGreen,
  },
  pillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  pillTextActive: {
    color: COLORS.accentGreen,
  },
  incomingSimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.badgeGreen,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  incomingSimText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#111b21',
  },
  listContent: {
    paddingBottom: 40,
  },
  callLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  linkInfo: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  linkSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  callRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(32, 44, 51, 0.4)',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
  },
  infoArea: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  contactNameMissed: {
    color: '#ef4444',
  },
  directionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  timeText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  actionBtn: {
    padding: 8,
  },
});

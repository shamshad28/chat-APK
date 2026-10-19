import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function FilterPillBar({
  activeFilter = 'all',
  onSelectFilter,
  unreadCount = 0,
}) {
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread', badge: unreadCount },
    { id: 'favourites', label: 'Favourites' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((f) => {
          const isActive = activeFilter === f.id;
          return (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.pill,
                isActive ? styles.pillActive : styles.pillInactive,
              ]}
              onPress={() => onSelectFilter(f.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
                  isActive ? styles.pillTextActive : styles.pillTextInactive,
                ]}
              >
                {f.label}
              </Text>
              {Boolean(f.badge) && f.badge > 0 && (
                <View style={styles.pillBadge}>
                  <Text style={styles.pillBadgeText}>{f.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Dropdown Action Button (as in screenshot) */}
        <TouchableOpacity style={styles.dropdownBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-down" size={16} color={COLORS.iconDefault} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111b21',
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: '#103629',
    borderWidth: 1,
    borderColor: '#00a884',
  },
  pillInactive: {
    backgroundColor: '#202c33',
    borderWidth: 1,
    borderColor: '#2a3942',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
  },
  pillTextActive: {
    color: COLORS.accentGreen,
    fontWeight: '700',
  },
  pillTextInactive: {
    color: '#8696a0',
  },
  pillBadge: {
    marginLeft: 6,
    backgroundColor: COLORS.badgeGreen,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 9,
    minWidth: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#111b21',
  },
  dropdownBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#202c33',
    borderWidth: 1,
    borderColor: '#2a3942',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
});

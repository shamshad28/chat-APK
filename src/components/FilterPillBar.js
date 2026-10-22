import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Platform, Alert, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

function FilterPillBar({
  activeFilter = 'all',
  onSelectFilter,
  unreadCount = 0,
  isLight = false,
}) {
  const [showDropdownModal, setShowDropdownModal] = useState(false);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread', badge: unreadCount },
    { id: 'favourites', label: 'Favourites' },
  ];

  const handleDropdownPress = () => {
    setShowDropdownModal(true);
  };

  return (
    <View style={[styles.container, isLight && styles.containerLight]}>
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
                isActive
                  ? (isLight ? styles.pillActiveLight : styles.pillActive)
                  : (isLight ? styles.pillInactiveLight : styles.pillInactive),
              ]}
              onPress={() => onSelectFilter(f.id)}
              activeOpacity={0.7}
            >
              {isActive && <View style={styles.pillGlassSheen} />}
              <Text
                style={[
                  styles.pillText,
                  isActive
                    ? (isLight ? styles.pillTextActiveLight : styles.pillTextActive)
                    : (isLight ? styles.pillTextInactiveLight : styles.pillTextInactive),
                ]}
              >
                {f.label}
              </Text>
              {Boolean(f.badge) && f.badge > 0 && (
                <View style={[styles.pillBadge, isLight && styles.pillBadgeLight]}>
                  <Text style={[styles.pillBadgeText, isLight && styles.pillBadgeTextLight]}>
                    {f.badge}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Dropdown Action Button (Configured Arrow next to Favourites) */}
        <TouchableOpacity
          style={[
            styles.dropdownBtn,
            isLight && styles.dropdownBtnLight,
            (activeFilter === 'groups') && (isLight ? styles.dropdownBtnActiveLight : styles.dropdownBtnActive),
          ]}
          onPress={handleDropdownPress}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-down"
            size={16}
            color={
              activeFilter === 'groups'
                ? COLORS.accentGreen
                : isLight
                ? '#54656f'
                : COLORS.iconDefault
            }
          />
        </TouchableOpacity>
      </ScrollView>

      {/* Interactive Dropdown Menu Modal */}
      <Modal
        visible={showDropdownModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDropdownModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowDropdownModal(false)}
        >
          <View
            style={[
              styles.dropdownCard,
              isLight && styles.dropdownCardLight,
            ]}
          >
            <View style={styles.dropdownHeader}>
              <Text style={[styles.dropdownTitle, isLight && styles.dropdownTitleLight]}>
                Custom Chat Filters
              </Text>
              <TouchableOpacity
                onPress={() => setShowDropdownModal(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={20} color={isLight ? '#54656f' : '#8696a0'} />
              </TouchableOpacity>
            </View>

            {[
              { id: 'favourites', label: '⭐ Favourites', desc: 'Starred & priority contacts' },
              { id: 'groups', label: '👥 Groups', desc: 'Group chats only' },
              { id: 'unread', label: '💬 Unread', desc: 'Conversations with unread messages' },
              { id: 'all', label: '📋 All Chats', desc: 'All conversations and contacts' },
            ].map((item) => {
              const isSelected = activeFilter === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.dropdownItem,
                    isSelected && (isLight ? styles.dropdownItemActiveLight : styles.dropdownItemActive),
                  ]}
                  onPress={() => {
                    onSelectFilter && onSelectFilter(item.id);
                    setShowDropdownModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.dropdownItemText,
                        isSelected && styles.dropdownItemTextSelected,
                        isLight && styles.dropdownItemTextLight,
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text style={styles.dropdownItemDesc}>{item.desc}</Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={18} color={COLORS.accentGreen} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111b21',
    paddingVertical: 8,
  },
  containerLight: {
    backgroundColor: '#ffffff',
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
    position: 'relative',
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(10px)' } : {}),
  },
  pillGlassSheen: {
    position: 'absolute',
    top: 1,
    left: '20%',
    right: '20%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 1,
  },
  pillActive: {
    backgroundColor: 'rgba(0, 168, 132, 0.22)',
    borderWidth: 1,
    borderColor: '#00a884',
    shadowColor: '#00a884',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
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
    fontSize: 13,
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
  pillBadgeLight: {
    backgroundColor: '#00a884',
  },
  pillBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#111b21',
  },
  pillBadgeTextLight: {
    color: '#ffffff',
  },
  dropdownBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(32, 44, 51, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  dropdownBtnLight: {
    backgroundColor: '#f0f2f5',
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  dropdownBtnActive: {
    backgroundColor: 'rgba(0, 168, 132, 0.22)',
    borderColor: '#00a884',
  },
  dropdownBtnActiveLight: {
    backgroundColor: '#e7f7ef',
    borderColor: '#008069',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(8px)' } : {}),
  },
  dropdownCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#1f2c34',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 20,
  },
  dropdownCardLight: {
    backgroundColor: '#ffffff',
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowOpacity: 0.15,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 0.8,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e9edef',
  },
  dropdownTitleLight: {
    color: '#111b21',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(0, 168, 132, 0.14)',
  },
  dropdownItemActiveLight: {
    backgroundColor: '#e7f7ef',
  },
  dropdownItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e9edef',
  },
  dropdownItemTextSelected: {
    color: COLORS.accentGreen,
  },
  dropdownItemTextLight: {
    color: '#111b21',
  },
  dropdownItemDesc: {
    fontSize: 12,
    color: '#8696a0',
    marginTop: 2,
  },
});

export default React.memo(FilterPillBar);

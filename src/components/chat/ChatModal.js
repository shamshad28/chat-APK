import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { CONTACTS_LIST } from '../../data/mockData';
import { getInitials } from './NotificationBanner';

/**
 * ChatModal (New Chat & Contact Selection Modal)
 * Designed referring to the user's screenshot with filter pills & search
 */
export default function ChatModal({
  visible,
  onClose,
  onSelectContact,
  onOpenNewGroup,
  onJoinWithCode,
  onOpenLLM,
}) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread' | 'favourites'

  const filteredContacts = CONTACTS_LIST.filter((c) => {
    if (!c.name.toLowerCase().includes(query.toLowerCase())) return false;
    if (activeFilter === 'favourites') return c.isPinned;
    if (activeFilter === 'unread') return c.unreadCount > 0;
    return true;
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Select contact</Text>
            <Text style={styles.headerSubtitle}>{CONTACTS_LIST.length} contacts</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={COLORS.iconDefault} />
          </TouchableOpacity>
        </View>

        {/* Search Bar (Matching screenshot: "Search or start a new chat") */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.iconDefault} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search or start a new chat"
            placeholderTextColor={COLORS.textMuted}
            value={query}
            onChangeText={setQuery}
          />
          {Boolean(query) && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.iconDefault} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills (Matching screenshot: All, Unread 2, Favourites) */}
        <View style={styles.filterPillsRow}>
          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'all' && styles.filterPillActive]}
            onPress={() => setActiveFilter('all')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'all' && styles.filterPillTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'unread' && styles.filterPillActive]}
            onPress={() => setActiveFilter('unread')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'unread' && styles.filterPillTextActive,
              ]}
            >
              Unread
            </Text>
            <View style={styles.pillBadge}>
              <Text style={styles.pillBadgeText}>2</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'favourites' && styles.filterPillActive]}
            onPress={() => setActiveFilter('favourites')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'favourites' && styles.filterPillTextActive,
              ]}
            >
              Favourites
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contacts List with Actions Header */}
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={styles.actionsGroup}>
              {/* 1. New Group */}
              <TouchableOpacity
                style={styles.actionRow}
                activeOpacity={0.7}
                onPress={() => {
                  onClose();
                  onOpenNewGroup && onOpenNewGroup();
                }}
              >
                <View style={styles.actionCircle}>
                  <Ionicons name="people" size={22} color="#111b21" />
                </View>
                <Text style={styles.actionText}>New group</Text>
              </TouchableOpacity>

              {/* 2. Join via Invite Code / Link */}
              <TouchableOpacity
                style={styles.actionRow}
                activeOpacity={0.7}
                onPress={() => {
                  onClose();
                  onJoinWithCode && onJoinWithCode();
                }}
              >
                <View style={[styles.actionCircle, { backgroundColor: '#38bdf8' }]}>
                  <Ionicons name="link" size={20} color="#111b21" />
                </View>
                <View>
                  <Text style={styles.actionText}>Join via Invite Code / Link</Text>
                  <Text style={styles.actionSubText}>Connect with people or enter rooms</Text>
                </View>
              </TouchableOpacity>

              {/* 3. Add Pulse LLM Assistant */}
              <TouchableOpacity
                style={styles.actionRow}
                activeOpacity={0.7}
                onPress={() => {
                  onClose();
                  onOpenLLM && onOpenLLM();
                }}
              >
                <View style={[styles.actionCircle, { backgroundColor: '#a855f7' }]}>
                  <Ionicons name="sparkles" size={20} color="#ffffff" />
                </View>
                <View>
                  <Text style={styles.actionText}>Add Pulse LLM Assistant</Text>
                  <Text style={styles.actionSubText}>AI coding, writing & smart answers</Text>
                </View>
              </TouchableOpacity>

              <Text style={styles.contactsSectionHeader}>CONTACTS ON WHATSAPP</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => {
                onClose();
                onSelectContact && onSelectContact(item);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.contactAvatarWrap}>
                {item.avatar ? (
                  <Image source={{ uri: item.avatar }} style={styles.contactAvatar} />
                ) : (
                  <View style={styles.initialsAvatar}>
                    <Text style={styles.initialsAvatarText}>{getInitials(item.name)}</Text>
                  </View>
                )}
                {item.isOnline && <View style={styles.onlineDot} />}
              </View>

              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{item.name}</Text>
                <Text style={styles.contactAbout} numberOfLines={1}>
                  {item.about || item.status || 'Available'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111b21',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#202c33',
    borderBottomWidth: 1,
    borderBottomColor: '#222e35',
  },
  backBtn: {
    padding: 6,
    marginRight: 10,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e9edef',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8696a0',
  },
  closeBtn: {
    padding: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202c33',
    borderRadius: 12,
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#2a3942',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#e9edef',
    fontSize: 14,
  },
  filterPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#202c33',
    borderWidth: 1,
    borderColor: '#2a3942',
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterPillActive: {
    backgroundColor: '#103629',
    borderColor: COLORS.accentGreen,
  },
  filterPillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#8696a0',
  },
  filterPillTextActive: {
    color: COLORS.accentGreen,
    fontWeight: '700',
  },
  pillBadge: {
    marginLeft: 6,
    backgroundColor: COLORS.badgeGreen,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 9,
  },
  pillBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#111b21',
  },
  listContent: {
    paddingBottom: 40,
  },
  actionsGroup: {
    paddingTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.badgeGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e9edef',
  },
  actionSubText: {
    fontSize: 12,
    color: '#8696a0',
    marginTop: 2,
  },
  contactsSectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8696a0',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  contactAvatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
    position: 'relative',
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  initialsAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#374248',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsAvatarText: {
    color: '#e9edef',
    fontWeight: '700',
    fontSize: 16,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: COLORS.badgeGreen,
    borderWidth: 2,
    borderColor: '#111b21',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e9edef',
  },
  contactAbout: {
    fontSize: 13,
    color: '#8696a0',
    marginTop: 2,
  },
});

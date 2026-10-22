import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { CONTACTS_LIST } from '../../data/mockData';
import { getInitials } from './NotificationBanner';
import socketService from '../../services/socketService';
import storageService from '../../services/storageService';

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
  registeredUsers = [],
  currentUser = null,
}) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread' | 'favourites'
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  // Combine registered users (excluding the logged-in user)
  const allContacts = useMemo(() => {
    const map = new Map();

    (registeredUsers || []).forEach((u) => {
      if (u.id === 'user_priya' || u.id === 'user_shamshad_mock') return;

      const isSelf = currentUser && (
        u.id === currentUser.id ||
        (u.email && u.email.toLowerCase() === currentUser.email?.toLowerCase()) ||
        (u.username && u.username.toLowerCase() === currentUser.username?.toLowerCase()) ||
        u.name.toLowerCase() === currentUser.name?.toLowerCase()
      );
      if (isSelf) return;

      const key = (u.username || u.name).toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          id: u.id || `u_${key}`,
          name: u.name,
          username: u.username,
          avatar: u.avatar || null,
          about: u.about || 'Available on PulseChat',
          phone: u.phone || '+91 98000 12345',
          isOnline: u.isOnline !== undefined ? u.isOnline : true,
          status: u.about || 'Available',
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [registeredUsers, currentUser]);

  const filteredContacts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allContacts.filter((c) => {
      if (q) {
        const nameMatch = c.name && c.name.toLowerCase().includes(q);
        const usernameMatch = c.username && c.username.toLowerCase().includes(q);
        const phoneMatch = c.phone && c.phone.includes(q);
        if (!nameMatch && !usernameMatch && !phoneMatch) return false;
      }
      if (activeFilter === 'favourites') return c.isPinned;
      if (activeFilter === 'unread') return c.unreadCount > 0;
      return true;
    });
  }, [allContacts, query, activeFilter]);

  const handleCreateAndSelectContact = async (name, usernameOrPhone) => {
    if (!name || !name.trim()) return;
    const trimmedName = name.trim();
    const contactObj = {
      id: `u_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: trimmedName,
      username: (usernameOrPhone || trimmedName.toLowerCase().replace(/\s+/g, '_')).trim(),
      avatar: null,
      about: 'Available on PulseChat',
      phone: usernameOrPhone || '+91 98000 12345',
      isOnline: true,
      status: 'Available',
    };

    // Persist to storage & announce via socket across all devices worldwide
    await storageService.addRegisteredUser(contactObj);
    socketService.announceUser(contactObj);

    setIsAddContactModalOpen(false);
    setNewContactName('');
    setNewContactPhone('');
    onClose();
    if (onSelectContact) {
      onSelectContact(contactObj);
    }
  };

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
            <Text style={styles.headerSubtitle}>{filteredContacts.length} contacts</Text>
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
              {/* 0. New Contact */}
              <TouchableOpacity
                style={styles.actionRow}
                activeOpacity={0.7}
                onPress={() => setIsAddContactModalOpen(true)}
              >
                <View style={[styles.actionCircle, { backgroundColor: COLORS.badgeGreen }]}>
                  <Ionicons name="person-add" size={20} color="#111b21" />
                </View>
                <View>
                  <Text style={styles.actionText}>New contact</Text>
                  <Text style={styles.actionSubText}>Add by name, username or phone</Text>
                </View>
              </TouchableOpacity>

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

              {/* Direct Fast Chat Card for search query */}
              {query.trim().length > 0 && (
                <TouchableOpacity
                  style={styles.directChatCard}
                  activeOpacity={0.7}
                  onPress={() => handleCreateAndSelectContact(query.trim())}
                >
                  <View style={styles.directChatIcon}>
                    <Ionicons name="chatbubbles" size={20} color="#111b21" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.directChatTitle}>Start Chat with "{query.trim()}"</Text>
                    <Text style={styles.directChatSubtitle}>🔒 End-to-end encrypted direct chat</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.badgeGreen} />
                </TouchableOpacity>
              )}

              <Text style={styles.contactsSectionHeader}>CONTACTS ON WHATSAPP</Text>
            </View>
          }
          ListEmptyComponent={
            query.trim() ? (
              <View style={styles.emptySearchContainer}>
                <View style={styles.emptySearchIconWrap}>
                  <Ionicons name="person-add-outline" size={30} color={COLORS.accentGreen} />
                </View>
                <Text style={styles.emptySearchTitle}>No contact named "{query.trim()}"</Text>
                <Text style={styles.emptySearchSubtitle}>
                  Start a new end-to-end encrypted chat with {query.trim()} right now:
                </Text>
                <TouchableOpacity
                  style={styles.startNewChatBtn}
                  onPress={() => handleCreateAndSelectContact(query.trim())}
                  activeOpacity={0.8}
                >
                  <Ionicons name="chatbubble" size={17} color="#111b21" style={{ marginRight: 6 }} />
                  <Text style={styles.startNewChatBtnText}>Chat with "{query.trim()}"</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptySearchContainer}>
                <Ionicons name="people-outline" size={38} color={COLORS.textSecondary} />
                <Text style={styles.emptySearchTitle}>No contacts available</Text>
              </View>
            )
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

        {/* Embedded Add New Contact Dialog Modal (100% reliable on Android, iOS & Web) */}
        <Modal
          visible={isAddContactModalOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsAddContactModalOpen(false)}
        >
          <View style={styles.dialogBackdrop}>
            <View style={styles.dialogCard}>
              <View style={styles.dialogHeader}>
                <View style={[styles.actionCircle, { backgroundColor: COLORS.badgeGreen, width: 38, height: 38, marginRight: 10 }]}>
                  <Ionicons name="person-add" size={20} color="#111b21" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dialogTitle}>Add New Contact</Text>
                  <Text style={styles.dialogSubtitle}>Connect and chat with anyone worldwide</Text>
                </View>
              </View>

              <View style={styles.dialogInputWrapper}>
                <Text style={styles.dialogInputLabel}>NAME</Text>
                <TextInput
                  style={styles.dialogInput}
                  placeholder="Full Name (e.g. Rahul Sharma)"
                  placeholderTextColor={COLORS.textMuted}
                  value={newContactName}
                  onChangeText={setNewContactName}
                  autoFocus={true}
                />
              </View>

              <View style={styles.dialogInputWrapper}>
                <Text style={styles.dialogInputLabel}>USERNAME OR PHONE (OPTIONAL)</Text>
                <TextInput
                  style={styles.dialogInput}
                  placeholder="e.g. @rahul or +91 98000..."
                  placeholderTextColor={COLORS.textMuted}
                  value={newContactPhone}
                  onChangeText={setNewContactPhone}
                />
              </View>

              <View style={styles.dialogButtonsRow}>
                <TouchableOpacity
                  style={styles.dialogCancelBtn}
                  onPress={() => {
                    setIsAddContactModalOpen(false);
                    setNewContactName('');
                    setNewContactPhone('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dialogCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.dialogConfirmBtn,
                    !newContactName.trim() && { opacity: 0.5 },
                  ]}
                  disabled={!newContactName.trim()}
                  onPress={() => handleCreateAndSelectContact(newContactName, newContactPhone)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="chatbubbles" size={16} color="#111b21" style={{ marginRight: 6 }} />
                  <Text style={styles.dialogConfirmText}>Add & Chat</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  emptySearchContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  emptySearchIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 168, 132, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptySearchTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e9edef',
    textAlign: 'center',
    marginBottom: 4,
  },
  emptySearchSubtitle: {
    fontSize: 13,
    color: '#8696a0',
    textAlign: 'center',
    marginBottom: 16,
  },
  startNewChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.badgeGreen,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 3,
  },
  startNewChatBtnText: {
    color: '#111b21',
    fontWeight: 'bold',
    fontSize: 14,
  },
  directChatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202c33',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 168, 132, 0.3)',
  },
  directChatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.badgeGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  directChatTitle: {
    color: '#e9edef',
    fontSize: 15,
    fontWeight: '700',
  },
  directChatSubtitle: {
    color: COLORS.accentGreen,
    fontSize: 12,
    marginTop: 2,
  },
  dialogBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1f2c34',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a3942',
    elevation: 8,
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e9edef',
  },
  dialogSubtitle: {
    fontSize: 12,
    color: '#8696a0',
    marginTop: 2,
  },
  dialogInputWrapper: {
    marginBottom: 14,
  },
  dialogInputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8696a0',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  dialogInput: {
    backgroundColor: '#111b21',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#e9edef',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2a3942',
  },
  dialogButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 10,
  },
  dialogCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogCancelText: {
    color: '#8696a0',
    fontWeight: '600',
    fontSize: 14,
  },
  dialogConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.badgeGreen,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  dialogConfirmText: {
    color: '#111b21',
    fontWeight: 'bold',
    fontSize: 14,
  },
});


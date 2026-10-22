import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import FilterPillBar from '../components/FilterPillBar';
import ConversationItem from '../components/ConversationItem';
import { useTheme } from '../context/ThemeContext';

export default function ChatsScreen({
  conversations = [],
  currentUser,
  onSelectConversation,
  onDeleteConversation,
  onOpenNewChat,
  onOpenMetaAI,
  onMenuPress,
  onCameraPress,
  onOpenProfile,
  theme,
}) {
  const themeContext = useTheme();
  const isLight = theme ? theme === 'Light' : themeContext.isLight;

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Real unread count calculation (only counts conversations with actual unread messages)
  const totalUnreadCount = useMemo(() => {
    return conversations.filter((c) => (c.unreadCount || 0) > 0).length;
  }, [conversations]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    let list = [...conversations];

    if (activeFilter === 'unread') {
      list = list.filter((c) => (c.unreadCount || 0) > 0);
    } else if (activeFilter === 'favourites') {
      list = list.filter((c) => c.isPinned);
    } else if (activeFilter === 'groups') {
      list = list.filter((c) => c.type === 'group');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.lastMessage?.text?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [conversations, activeFilter, searchQuery]);

  const handleConversationLongPress = useCallback(
    (conv) => {
      Alert.alert(
        conv.name,
        'Select an action for this chat:',
        [
          {
            text: 'Delete Chat 🗑️',
            style: 'destructive',
            onPress: () => {
              Alert.alert(
                'Delete Chat?',
                `Are you sure you want to delete the chat with "${conv.name}" and all of its messages?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                      onDeleteConversation && onDeleteConversation(conv.id);
                    },
                  },
                ]
              );
            },
          },
          {
            text: conv.isPinned ? 'Unpin Chat 📌' : 'Pin Chat 📌',
            onPress: () => {
              conv.isPinned = !conv.isPinned;
            },
          },
          {
            text: conv.isMuted ? 'Unmute Notifications 🔔' : 'Mute Notifications 🔇',
            onPress: () => {
              conv.isMuted = !conv.isMuted;
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    },
    [onDeleteConversation]
  );

  const renderConversationItem = useCallback(
    ({ item }) => (
      <ConversationItem
        conversation={item}
        onPress={onSelectConversation}
        onLongPress={handleConversationLongPress}
        isLight={isLight}
      />
    ),
    [onSelectConversation, handleConversationLongPress, isLight]
  );

  const conversationKeyExtractor = useCallback((item) => item.id, []);

  const getConversationItemLayout = useCallback(
    (data, index) => ({
      length: 76,
      offset: 76 * index,
      index,
    }),
    []
  );

  const headerIconColor = isLight ? '#111b21' : '#e9edef';

  return (
    <View style={[styles.container, isLight && styles.containerLight]}>
      {/* WhatsApp Chats Top Header Bar */}
      <View style={[styles.chatsTopHeader, isLight && styles.chatsTopHeaderLight]}>
        <View style={styles.chatsHeaderLeft}>
          <TouchableOpacity
            style={styles.headerProfileBtn}
            onPress={onOpenProfile}
            activeOpacity={0.8}
          >
            {currentUser?.avatar ? (
              <Image source={{ uri: currentUser.avatar }} style={styles.headerUserAvatar} />
            ) : (
              <View style={[styles.headerUserAvatarPlaceholder, isLight && styles.headerUserAvatarPlaceholderLight]}>
                <Text style={[styles.headerUserAvatarText, isLight && styles.headerUserAvatarTextLight]}>
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.chatsTitleContainer}>
            <Text style={[styles.chatsTitle, isLight && styles.chatsTitleLight]}>Chats</Text>
            {Boolean(currentUser?.name) && (
              <Text style={styles.chatsUserGreeting} numberOfLines={1}>
                {currentUser.name}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.headerRightActions}>
          <TouchableOpacity
            onPress={onCameraPress}
            style={styles.headerIconBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="camera-outline" size={24} color={headerIconColor} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onMenuPress}
            style={styles.headerIconBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-vertical" size={20} color={headerIconColor} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onOpenNewChat}
            style={[styles.headerPlusCircle, isLight && styles.headerPlusCircleLight]}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={24} color={isLight ? '#ffffff' : '#111b21'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input Bar (Frosted Glassmorphism) */}
      <View style={[styles.searchBarContainer, isLight && styles.searchBarContainerLight]}>
        <View style={styles.searchGlassSheen} />
        <Ionicons name="search" size={18} color={isLight ? '#54656f' : '#8696a0'} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, isLight && styles.searchInputLight]}
          placeholder="Search or start a new chat"
          placeholderTextColor={isLight ? '#54656f' : '#8696a0'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {Boolean(searchQuery) && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={isLight ? '#54656f' : '#8696a0'} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Pills */}
      <FilterPillBar
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
        unreadCount={totalUnreadCount}
        isLight={isLight}
      />

      {/* Conversations List with High-Performance FlatList */}
      <FlatList
        data={filteredConversations}
        keyExtractor={conversationKeyExtractor}
        renderItem={renderConversationItem}
        getItemLayout={getConversationItemLayout}
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        windowSize={9}
        removeClippedSubviews={Platform.OS !== 'web'}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="chatbubbles" size={42} color={COLORS.accentGreen} />
            </View>
            <Text style={[styles.emptyTitle, isLight && styles.emptyTitleLight]}>
              No conversations yet
            </Text>
            <Text style={styles.emptySubtitle}>
              Registered accounts and new chats will appear here. Start a conversation with any contact or registered user.
            </Text>
            <TouchableOpacity
              style={[styles.emptyStartBtn, isLight && styles.emptyStartBtnLight]}
              onPress={onOpenNewChat}
              activeOpacity={0.8}
            >
              <Ionicons name="person-add" size={16} color={isLight ? '#ffffff' : '#0b141a'} style={{ marginRight: 6 }} />
              <Text style={[styles.emptyStartBtnText, isLight && styles.emptyStartBtnTextLight]}>
                Start New Chat
              </Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.listContent}
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
  chatsTopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#111b21',
    minWidth: 0,
  },
  chatsTopHeaderLight: {
    backgroundColor: '#ffffff',
  },
  chatsHeaderLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chatsTitleContainer: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  headerProfileBtn: {
    position: 'relative',
  },
  headerUserAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  headerUserAvatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#202c33',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#00a884',
  },
  headerUserAvatarPlaceholderLight: {
    backgroundColor: '#e9edef',
    borderColor: '#008069',
  },
  headerUserAvatarText: {
    color: '#e9edef',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerUserAvatarTextLight: {
    color: '#111b21',
  },
  chatsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e9edef',
    letterSpacing: 0.2,
  },
  chatsTitleLight: {
    color: '#111b21',
  },
  chatsUserGreeting: {
    fontSize: 12,
    color: COLORS.accentGreen,
    fontWeight: '600',
    marginTop: -2,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBtn: {
    padding: 6,
  },
  headerPlusCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.badgeGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerPlusCircleLight: {
    backgroundColor: '#008069',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(32, 44, 51, 0.85)',
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 22,
    height: 42,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    position: 'relative',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(12px)' } : {}),
  },
  searchBarContainerLight: {
    backgroundColor: 'rgba(240, 242, 245, 0.95)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  searchGlassSheen: {
    position: 'absolute',
    top: 2,
    left: '20%',
    right: '20%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#e9edef',
    fontSize: 14,
  },
  searchInputLight: {
    color: '#111b21',
  },
  listContent: {
    paddingBottom: 90,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e9edef',
    marginTop: 12,
  },
  emptyTitleLight: {
    color: '#111b21',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#8696a0',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 168, 132, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accentGreen,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStartBtnLight: {
    backgroundColor: '#008069',
  },
  emptyStartBtnText: {
    color: '#0b141a',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyStartBtnTextLight: {
    color: '#ffffff',
  },
});

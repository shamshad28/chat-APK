import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import FilterPillBar from '../components/FilterPillBar';
import ConversationItem from '../components/ConversationItem';

export default function ChatsScreen({
  conversations = [],
  onSelectConversation,
  onOpenNewChat,
  onOpenMetaAI,
  onMenuPress,
  onCameraPress,
}) {
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

  return (
    <View style={styles.container}>
      {/* WhatsApp Chats Top Header Bar (Strictly matching screenshot) */}
      <View style={styles.chatsTopHeader}>
        <Text style={styles.chatsTitle}>Chats</Text>
        <View style={styles.headerRightActions}>
          <TouchableOpacity
            onPress={onCameraPress}
            style={styles.headerIconBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="camera-outline" size={24} color="#e9edef" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onMenuPress}
            style={styles.headerIconBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#e9edef" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onOpenNewChat}
            style={styles.headerPlusCircle}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={24} color="#111b21" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input Bar (Matching screenshot: "Search or start a new chat") */}
      <View style={styles.searchBarContainer}>
        <Ionicons name="search" size={18} color="#8696a0" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search or start a new chat"
          placeholderTextColor="#8696a0"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {Boolean(searchQuery) && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#8696a0" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Pills (All, Unread 2, Favourites, dropdown) */}
      <FilterPillBar
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
        unreadCount={totalUnreadCount}
      />

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConversationItem
            conversation={item}
            onPress={onSelectConversation}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No chats found</Text>
            <Text style={styles.emptySubtitle}>
              Try searching for something else or start a new chat.
            </Text>
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
  chatsTopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#111b21',
  },
  chatsTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#e9edef',
    letterSpacing: 0.3,
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
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202c33',
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 22,
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
  listContent: {
    paddingBottom: 30,
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
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
});

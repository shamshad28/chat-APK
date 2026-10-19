import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { CONTACTS_LIST } from '../data/mockData';

export default function CreateGroupScreen({ onBack, onGroupCreated }) {
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContactIds, setSelectedContactIds] = useState([]);

  const toggleContact = (id) => {
    setSelectedContactIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreate = () => {
    if (!groupName.trim()) {
      Alert.alert('Group Name Required', 'Please enter a name for your new group.');
      return;
    }

    if (selectedContactIds.length === 0) {
      Alert.alert('Select Participants', 'Please select at least 1 contact for the group.');
      return;
    }

    const newGroup = {
      id: `group_${Date.now()}`,
      name: groupName.trim(),
      type: 'group',
      avatar: null,
      isOnline: false,
      lastSeen: `${selectedContactIds.length + 1} participants`,
      lastMessage: {
        text: 'Group created',
        time: 'Just now',
        isSentByMe: true,
        status: 'read',
      },
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      membersCount: selectedContactIds.length + 1,
      about: 'PulseChat Group',
    };

    onGroupCreated && onGroupCreated(newGroup);
  };

  const filteredContacts = CONTACTS_LIST.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedContacts = CONTACTS_LIST.filter((c) =>
    selectedContactIds.includes(c.id)
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>New group</Text>
          <Text style={styles.headerSubtitle}>
            {selectedContactIds.length > 0
              ? `${selectedContactIds.length} of ${CONTACTS_LIST.length} selected`
              : 'Add participants'}
          </Text>
        </View>
      </View>

      {/* Group Info Input Card */}
      <View style={styles.groupInfoCard}>
        <TouchableOpacity
          style={styles.avatarPicker}
          onPress={() => Alert.alert('Group Icon', 'Select a group photo or icon')}
        >
          <Feather name="camera" size={20} color={COLORS.iconDefault} />
        </TouchableOpacity>
        <TextInput
          style={styles.groupNameInput}
          placeholder="Type group subject here..."
          placeholderTextColor={COLORS.textMuted}
          value={groupName}
          onChangeText={setGroupName}
          maxLength={50}
        />
        <Ionicons name="happy-outline" size={22} color={COLORS.iconDefault} />
      </View>

      {/* Selected Participants Chips Bar */}
      {selectedContacts.length > 0 && (
        <View style={styles.selectedChipsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            {selectedContacts.map((c) => (
              <View key={c.id} style={styles.chip}>
                <View style={styles.chipAvatar}>
                  <Text style={styles.chipAvatarText}>{c.name.charAt(0)}</Text>
                </View>
                <Text style={styles.chipName} numberOfLines={1}>{c.name.split(' ')[0]}</Text>
                <TouchableOpacity onPress={() => toggleContact(c.id)} style={styles.chipClose}>
                  <Ionicons name="close-circle" size={16} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={COLORS.iconDefault} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Contacts List */}
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isSelected = selectedContactIds.includes(item.id);
          return (
            <TouchableOpacity
              style={styles.contactRow}
              onPress={() => toggleContact(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.contactAvatar}>
                <Text style={styles.contactAvatarText}>{item.name.charAt(0)}</Text>
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={12} color="#111b21" />
                  </View>
                )}
              </View>
              <View style={styles.contactDetails}>
                <Text style={styles.contactName}>{item.name}</Text>
                <Text style={styles.contactStatus} numberOfLines={1}>{item.status}</Text>
              </View>
              <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                {isSelected && <Ionicons name="checkmark" size={14} color="#111b21" />}
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContent}
      />

      {/* Floating Create Checkmark Button */}
      <TouchableOpacity
        style={[
          styles.createFab,
          (!groupName.trim() || selectedContactIds.length === 0) && styles.createFabDisabled,
        ]}
        onPress={handleCreate}
        activeOpacity={0.85}
      >
        <Ionicons name="checkmark" size={28} color="#111b21" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 58,
    backgroundColor: COLORS.headerBackground,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: 8,
    marginRight: 6,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  groupInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.headerBackground,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarPicker: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#374248',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  groupNameInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginRight: 10,
  },
  selectedChipsContainer: {
    backgroundColor: '#182229',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chipsScroll: {
    paddingHorizontal: 14,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202c33',
    paddingLeft: 4,
    paddingRight: 8,
    paddingVertical: 4,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2a3942',
  },
  chipAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.badgeGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  chipAvatarText: {
    color: '#111b21',
    fontWeight: 'bold',
    fontSize: 12,
  },
  chipName: {
    color: COLORS.textPrimary,
    fontSize: 13,
    marginRight: 4,
  },
  chipClose: {
    padding: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202c33',
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    height: 40,
    borderWidth: 1,
    borderColor: '#2a3942',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 90,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#005c4b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    position: 'relative',
  },
  contactAvatarText: {
    color: COLORS.textWhite,
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.badgeGreen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.background,
  },
  contactDetails: {
    flex: 1,
    marginRight: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  contactStatus: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.badgeGreen,
    borderColor: COLORS.badgeGreen,
  },
  createFab: {
    position: 'absolute',
    bottom: 22,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.badgeGreen,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
  },
  createFabDisabled: {
    opacity: 0.4,
  },
});

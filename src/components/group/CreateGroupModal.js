import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { CONTACTS_LIST } from '../../data/mockData';

export default function CreateGroupModal({ visible, onClose, onGroupCreated }) {
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContactIds, setSelectedContactIds] = useState([]);

  if (!visible) return null;

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
      Alert.alert('Select Participants', 'Please select at least 1 contact.');
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
    onClose && onClose();
  };

  const selectedContacts = CONTACTS_LIST.filter((c) =>
    selectedContactIds.includes(c.id)
  );

  const filteredContacts = CONTACTS_LIST.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Ionicons name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>New group</Text>
            <Text style={styles.subtitle}>
              {selectedContactIds.length > 0
                ? `${selectedContactIds.length} of ${CONTACTS_LIST.length} selected`
                : 'Add participants'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleCreate}
            style={[styles.headerBtn, (!groupName.trim() || selectedContactIds.length === 0) && { opacity: 0.4 }]}
            disabled={!groupName.trim() || selectedContactIds.length === 0}
          >
            <Ionicons name="checkmark" size={26} color={COLORS.badgeGreen} />
          </TouchableOpacity>
        </View>

        {/* Group Name input */}
        <View style={styles.groupInputCard}>
          <View style={styles.avatarCameraBtn}>
            <Feather name="camera" size={20} color={COLORS.badgeGreen} />
          </View>
          <TextInput
            style={styles.nameInput}
            placeholder="Type group subject here..."
            placeholderTextColor={COLORS.textMuted}
            value={groupName}
            onChangeText={setGroupName}
            maxLength={25}
          />
          <Text style={styles.charCount}>{25 - groupName.length}</Text>
        </View>

        {/* Selected participants horizontal row */}
        {selectedContacts.length > 0 && (
          <View style={styles.selectedRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {selectedContacts.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.chip}
                  onPress={() => toggleContact(c.id)}
                >
                  <Image source={{ uri: c.avatar }} style={styles.chipAvatar} />
                  <Text style={styles.chipName} numberOfLines={1}>
                    {c.name.split(' ')[0]}
                  </Text>
                  <Ionicons name="close-circle" size={16} color="#8696a0" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.iconDefault} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Contact Checklist */}
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isSelected = selectedContactIds.includes(item.id);
            return (
              <TouchableOpacity
                style={styles.contactRow}
                onPress={() => toggleContact(item.id)}
              >
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{item.name}</Text>
                  <Text style={styles.contactStatus}>{item.status}</Text>
                </View>
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Ionicons name="checkmark" size={16} color="#111b21" />}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: COLORS.headerBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerBtn: {
    padding: 6,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  groupInputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.headerBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarCameraBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#202c33',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  nameInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  selectedRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.headerBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202c33',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
  },
  chipAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 6,
  },
  chipName: {
    fontSize: 12,
    color: COLORS.textPrimary,
    marginRight: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202c33',
    margin: 12,
    paddingHorizontal: 12,
    borderRadius: 18,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 14,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  contactStatus: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#8696a0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.badgeGreen,
    borderColor: COLORS.badgeGreen,
  },
});

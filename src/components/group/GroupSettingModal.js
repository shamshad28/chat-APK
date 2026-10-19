import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { CONTACTS_LIST, CURRENT_USER } from '../../data/mockData';

export default function GroupSettingModal({
  visible,
  group,
  onClose,
  onGroupUpdated,
  onLeaveGroup,
}) {
  const [groupName, setGroupName] = useState(group?.name || 'PulseChat Group');
  const [isEditingName, setIsEditingName] = useState(false);
  const [members, setMembers] = useState([
    {
      id: CURRENT_USER.id,
      name: `${CURRENT_USER.name} (You)`,
      username: CURRENT_USER.username,
      avatar: CURRENT_USER.avatar,
      isAdmin: true,
      isOnline: true,
    },
    {
      id: 'c1',
      name: 'Priya Sharma',
      username: 'priya_s',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      isAdmin: true,
      isOnline: true,
    },
    {
      id: 'c2',
      name: 'Rahul Verma',
      username: 'rahul_v',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      isAdmin: false,
      isOnline: false,
    },
    {
      id: 'c3',
      name: 'Ananya Patel',
      username: 'ananya_p',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      isAdmin: false,
      isOnline: true,
    },
  ]);

  const [isAddMemberVisible, setIsAddMemberVisible] = useState(false);
  const [searchContact, setSearchContact] = useState('');
  const [selectedToAdd, setSelectedToAdd] = useState([]);

  if (!visible || !group) return null;

  const handleSaveName = () => {
    if (!groupName.trim()) return;
    setIsEditingName(false);
    onGroupUpdated && onGroupUpdated({ ...group, name: groupName.trim() });
    Alert.alert('Group Updated', 'Group subject has been updated.');
  };

  const handleToggleAdmin = (memberId) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId ? { ...m, isAdmin: !m.isAdmin } : m
      )
    );
  };

  const handleRemoveMember = (member) => {
    Alert.alert(
      'Remove Member',
      `Remove ${member.name} from "${groupName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setMembers((prev) => prev.filter((m) => m.id !== member.id));
          },
        },
      ]
    );
  };

  const handleAddSelectedMembers = () => {
    const toAdd = CONTACTS_LIST.filter((c) => selectedToAdd.includes(c.id)).map(
      (c) => ({
        id: c.id,
        name: c.name,
        username: c.name.toLowerCase().replace(/\s+/g, '_'),
        avatar: c.avatar,
        isAdmin: false,
        isOnline: c.isOnline,
      })
    );
    setMembers((prev) => [...prev, ...toAdd]);
    setSelectedToAdd([]);
    setIsAddMemberVisible(false);
    Alert.alert('Members Added', `${toAdd.length} participants added to the group.`);
  };

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
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Group Info</Text>
          <TouchableOpacity
            onPress={() => Alert.alert('Group Options', 'Share group invite link')}
            style={styles.headerBtn}
          >
            <Ionicons name="share-outline" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Group Icon & Subject */}
          <View style={styles.groupHeroCard}>
            <View style={styles.avatarWrapper}>
              {group.avatar ? (
                <Image source={{ uri: group.avatar }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="people" size={42} color={COLORS.badgeGreen} />
                </View>
              )}
              <TouchableOpacity
                style={styles.cameraBadge}
                onPress={() => Alert.alert('Change Icon', 'Select group photo from gallery')}
              >
                <Feather name="camera" size={16} color="#111b21" />
              </TouchableOpacity>
            </View>

            {/* Editable Group Name */}
            {isEditingName ? (
              <View style={styles.editRow}>
                <TextInput
                  style={styles.nameInput}
                  value={groupName}
                  onChangeText={setGroupName}
                  autoFocus
                />
                <TouchableOpacity onPress={handleSaveName} style={styles.saveBtn}>
                  <Ionicons name="checkmark" size={20} color="#111b21" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.nameDisplayRow}
                onPress={() => setIsEditingName(true)}
              >
                <Text style={styles.groupSubject}>{groupName}</Text>
                <Feather name="edit-2" size={16} color={COLORS.iconDefault} style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            )}

            <Text style={styles.groupSubtitle}>
              Group · {members.length} participants
            </Text>
          </View>

          {/* Quick Actions (Add member, Search) */}
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => setIsAddMemberVisible(true)}
            >
              <View style={styles.quickIconCircle}>
                <Ionicons name="person-add" size={20} color={COLORS.badgeGreen} />
              </View>
              <Text style={styles.quickActionText}>Add</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => Alert.alert('Search', 'Search messages in this group')}
            >
              <View style={styles.quickIconCircle}>
                <Ionicons name="search" size={20} color={COLORS.badgeGreen} />
              </View>
              <Text style={styles.quickActionText}>Search</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => Alert.alert('Mute', 'Mute notifications for 8 hours, 1 week, or Always')}
            >
              <View style={styles.quickIconCircle}>
                <Ionicons name="notifications-off-outline" size={20} color={COLORS.badgeGreen} />
              </View>
              <Text style={styles.quickActionText}>Mute</Text>
            </TouchableOpacity>
          </View>

          {/* Participants Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{members.length} participants</Text>
              <TouchableOpacity onPress={() => setIsAddMemberVisible(true)}>
                <Text style={styles.addText}>+ Add participant</Text>
              </TouchableOpacity>
            </View>

            {members.map((member) => (
              <View key={member.id} style={styles.memberRow}>
                {member.avatar ? (
                  <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
                ) : (
                  <View style={styles.memberPlaceholder}>
                    <Text style={styles.memberInitial}>{member.name.charAt(0)}</Text>
                  </View>
                )}

                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberStatus}>
                    {member.isOnline ? 'Online' : 'Offline'}
                  </Text>
                </View>

                {member.isAdmin && (
                  <View style={styles.adminBadge}>
                    <Text style={styles.adminBadgeText}>Group Admin</Text>
                  </View>
                )}

                {member.id !== CURRENT_USER.id && (
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        member.name,
                        'Select action:',
                        [
                          {
                            text: member.isAdmin ? 'Dismiss as Admin' : 'Make Group Admin',
                            onPress: () => handleToggleAdmin(member.id),
                          },
                          {
                            text: 'Remove from group',
                            style: 'destructive',
                            onPress: () => handleRemoveMember(member),
                          },
                          { text: 'Cancel', style: 'cancel' },
                        ]
                      );
                    }}
                    style={styles.moreMemberBtn}
                  >
                    <MaterialIcons name="more-vert" size={20} color={COLORS.iconDefault} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* Exit Group Button */}
          <TouchableOpacity
            style={styles.exitGroupBtn}
            onPress={() => {
              Alert.alert(
                'Exit Group',
                `Are you sure you want to exit "${groupName}"?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Exit Group',
                    style: 'destructive',
                    onPress: () => {
                      onClose();
                      onLeaveGroup && onLeaveGroup(group.id);
                    },
                  },
                ]
              );
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={22} color="#ef4444" style={{ marginRight: 10 }} />
            <Text style={styles.exitGroupText}>Exit group</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Sub-Modal: Add Participants Checklist */}
        <Modal
          visible={isAddMemberVisible}
          animationType="slide"
          presentationStyle="formSheet"
          onRequestClose={() => setIsAddMemberVisible(false)}
        >
          <SafeAreaView style={styles.safeContainer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setIsAddMemberVisible(false)} style={styles.headerBtn}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Add participants</Text>
              <TouchableOpacity
                onPress={handleAddSelectedMembers}
                style={[styles.headerBtn, selectedToAdd.length === 0 && { opacity: 0.4 }]}
                disabled={selectedToAdd.length === 0}
              >
                <Ionicons name="checkmark" size={26} color={COLORS.badgeGreen} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color={COLORS.iconDefault} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search contacts..."
                placeholderTextColor={COLORS.textMuted}
                value={searchContact}
                onChangeText={setSearchContact}
              />
            </View>

            <FlatList
              data={CONTACTS_LIST.filter(
                (c) =>
                  !members.some((m) => m.id === c.id) &&
                  c.name.toLowerCase().includes(searchContact.toLowerCase())
              )}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isSelected = selectedToAdd.includes(item.id);
                return (
                  <TouchableOpacity
                    style={styles.selectRow}
                    onPress={() => {
                      setSelectedToAdd((prev) =>
                        prev.includes(item.id)
                          ? prev.filter((id) => id !== item.id)
                          : [...prev, item.id]
                      );
                    }}
                  >
                    <Image source={{ uri: item.avatar }} style={styles.memberAvatar} />
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{item.name}</Text>
                      <Text style={styles.memberStatus}>{item.status}</Text>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  groupHeroCard: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: COLORS.headerBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#202c33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.badgeGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupSubject: {
    fontSize: 21,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  nameInput: {
    flex: 1,
    fontSize: 18,
    color: COLORS.textPrimary,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.badgeGreen,
    paddingVertical: 4,
  },
  saveBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.badgeGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  groupSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    backgroundColor: COLORS.headerBackground,
    marginTop: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  quickActionBtn: {
    alignItems: 'center',
  },
  quickIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#202c33',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: 12,
    color: COLORS.accentGreen,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: COLORS.headerBackground,
    marginTop: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  addText: {
    fontSize: 13,
    color: COLORS.badgeGreen,
    fontWeight: '600',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  memberPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#202c33',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.badgeGreen,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  memberStatus: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  adminBadge: {
    backgroundColor: 'rgba(0, 168, 132, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 168, 132, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 6,
  },
  adminBadgeText: {
    fontSize: 11,
    color: COLORS.badgeGreen,
    fontWeight: '600',
  },
  moreMemberBtn: {
    padding: 6,
  },
  exitGroupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.headerBackground,
    marginTop: 14,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  exitGroupText: {
    fontSize: 15.5,
    color: '#ef4444',
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202c33',
    margin: 14,
    paddingHorizontal: 12,
    borderRadius: 18,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
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

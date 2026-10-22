import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function AttachmentSheet({ visible, onClose, onSelectOption }) {
  const options = [
    { id: 'document', label: 'Document', icon: 'document-text', color: '#7f66ff' },
    { id: 'camera', label: 'Camera', icon: 'camera', color: '#d3396d' },
    { id: 'gallery', label: 'Gallery', icon: 'images', color: '#ac44cf' },
    { id: 'llm', label: 'Ask LLM', icon: 'sparkles', color: '#0284c7' },
    { id: 'audio', label: 'Audio', icon: 'headset', color: '#e95950' },
    { id: 'location', label: 'Location', icon: 'location', color: '#1fa855' },
    { id: 'contact', label: 'Contact', icon: 'person', color: '#009de2' },
    { id: 'poll', label: 'Poll', icon: 'stats-chart', color: '#00a884' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.sheetContainer}>
          <View style={styles.handleBar} />
          <View style={styles.grid}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={styles.gridItem}
                onPress={() => {
                  onSelectOption && onSelectOption(opt.id);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.iconCircle, { backgroundColor: opt.color }]}>
                  <Ionicons name={opt.icon} size={24} color="#ffffff" />
                </View>
                <Text style={styles.itemLabel}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: 'rgba(23, 34, 42, 0.88)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 20,
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(30px) saturate(210%)',
          WebkitBackdropFilter: 'blur(30px) saturate(210%)',
        }
      : {}),
  },
  handleBar: {
    width: 36,
    height: 4,
    backgroundColor: '#8696a0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
    opacity: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 20,
  },
  gridItem: {
    width: '30%',
    alignItems: 'center',
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    elevation: 3,
  },
  itemLabel: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
});

import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export const POPULAR_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

/**
 * Floating WhatsApp Reaction Bar
 * Replaces web ReactionPicker.jsx with native spring pop animations
 */
export default function ReactionPicker({
  visible = true,
  onSelect,
  onOpenCustom,
  onClose,
  position = 'top',
}) {
  const scaleAnim = useRef(new Animated.Value(0.4)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        position === 'top' ? styles.positionTop : styles.positionBottom,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.bubbleBar}>
        {POPULAR_REACTIONS.map((emoji, index) => (
          <TouchableOpacity
            key={index}
            style={styles.emojiButton}
            onPress={() => onSelect && onSelect(emoji)}
            activeOpacity={0.65}
          >
            <Text style={styles.emojiText}>{emoji}</Text>
          </TouchableOpacity>
        ))}

        {/* Plus Icon to open full emoji sheet */}
        <TouchableOpacity
          style={styles.plusButton}
          onPress={onOpenCustom}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={20} color={COLORS.iconDefault} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 999,
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
  },
  positionTop: {
    top: -46,
    alignSelf: 'center',
  },
  positionBottom: {
    bottom: -46,
    alignSelf: 'center',
  },
  bubbleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202c33',
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#2a3942',
  },
  emojiButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  emojiText: {
    fontSize: 22,
  },
  plusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2a3942',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});

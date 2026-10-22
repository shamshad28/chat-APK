import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { COLORS } from '../constants/theme';

const EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
  '🥲', '🥹', '☺️', '😊', '😇', '🙂', '🙃', '😉',
  '😍', '🥰', '😘', '😋', '😛', '😜', '🤪', '😎',
  '🤓', '🧐', '🥳', '😏', '😒', '😞', '😔', '😟',
  '😕', '🙁', '😣', '😖', '😫', '😩', '🥺', '😢',
  '😭', '😮‍💨', '😤', '😠', '😡', '🤬', '🤯', '😳',
  '🥵', '🥶', '😱', '😨', '😰', '🤔', '🫣', '🤫',
  '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌',
  '👐', '🤲', '🤝', '🙏', '❤️', '🧡', '💛', '💚',
  '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '✨',
  '🔥', '💯', '🎉', '🚀', '⭐', '🌟', '⚡', '💡'
];

export default function EmojiPickerSheet({ visible, onSelectEmoji }) {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.emojiGrid}
        showsVerticalScrollIndicator={false}
      >
        {EMOJIS.map((emoji, index) => (
          <TouchableOpacity
            key={index}
            style={styles.emojiTouch}
            onPress={() => onSelectEmoji && onSelectEmoji(emoji)}
            activeOpacity={0.6}
          >
            <Text style={styles.emojiText}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    backgroundColor: 'rgba(23, 34, 42, 0.88)',
    borderTopWidth: 0.8,
    borderTopColor: 'rgba(255, 255, 255, 0.16)',
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(28px) saturate(200%)',
          WebkitBackdropFilter: 'blur(28px) saturate(200%)',
        }
      : {}),
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    justifyContent: 'space-between',
  },
  emojiTouch: {
    width: '12.5%',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 26,
  },
});

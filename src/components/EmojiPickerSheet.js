import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
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
    backgroundColor: '#1f2c34',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
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

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import { COLORS } from '../../constants/theme';

/**
 * Animated WhatsApp Bouncing Dots Typing Indicator
 * Replaces web TypingIndicator.jsx with smooth React Native Animated loops
 */
export default function TypingIndicator({
  typers = [],
  userName,
  compact = false,
}) {
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createBounceAnimation = (animValue, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: -5,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.delay(500 - delay),
        ])
      );
    };

    const anim1 = createBounceAnimation(dot1Anim, 0);
    const anim2 = createBounceAnimation(dot2Anim, 160);
    const anim3 = createBounceAnimation(dot3Anim, 320);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

  let displayText = 'Typing...';
  if (userName) {
    displayText = `${userName} is typing...`;
  } else if (typers && typers.length > 0) {
    const names = typers.map((t) => t.name || t.username || 'Someone').join(', ');
    displayText = typers.length > 1 ? `${names} are typing...` : `${names} is typing...`;
  }

  if (compact) {
    return (
      <View style={styles.compactRow}>
        <View style={styles.dotsRow}>
          <Animated.View
            style={[styles.compactDot, { transform: [{ translateY: dot1Anim }] }]}
          />
          <Animated.View
            style={[styles.compactDot, { transform: [{ translateY: dot2Anim }] }]}
          />
          <Animated.View
            style={[styles.compactDot, { transform: [{ translateY: dot3Anim }] }]}
          />
        </View>
        <Text style={styles.compactText}>{displayText}</Text>
      </View>
    );
  }

  return (
    <View style={styles.bubbleContainer}>
      <View style={styles.bubble}>
        <View style={styles.dotsRow}>
          <Animated.View
            style={[styles.dot, { transform: [{ translateY: dot1Anim }] }]}
          />
          <Animated.View
            style={[styles.dot, { transform: [{ translateY: dot2Anim }] }]}
          />
          <Animated.View
            style={[styles.dot, { transform: [{ translateY: dot3Anim }] }]}
          />
        </View>
        <Text style={styles.bubbleText}>{displayText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubbleContainer: {
    marginVertical: 4,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202c33',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderTopLeftRadius: 3,
    borderWidth: 1,
    borderColor: '#2a3942',
    maxWidth: '80%',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accentGreen,
    marginHorizontal: 1.5,
  },
  bubbleText: {
    color: '#8696a0',
    fontSize: 12.5,
    fontStyle: 'italic',
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accentGreen,
    marginHorizontal: 1,
  },
  compactText: {
    color: COLORS.accentGreen,
    fontSize: 13,
    fontWeight: '500',
    fontStyle: 'italic',
    marginLeft: 4,
  },
});

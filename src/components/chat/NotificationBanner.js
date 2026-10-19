import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const { width } = Dimensions.get('window');

/**
 * Extracts 2-letter uppercase initials from name
 */
export const getInitials = (name = '') => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * In-App Notification Toast Banner
 * Replaces web NotificationBanner.jsx with smooth React Native native animations
 */
export default function NotificationBanner({
  notification,
  onPress,
  onDismiss,
  topOffset = 50,
}) {
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (notification) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: topOffset,
          useNativeDriver: true,
          tension: 65,
          friction: 9,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 4.5 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 4500);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (!notification) return null;

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -120,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss && onDismiss(notification.id);
    });
  };

  const title = notification.title || notification.senderName || 'New Message';
  const body = notification.body || notification.text || '';
  const avatar = notification.avatar;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => {
          handleDismiss();
          onPress && onPress(notification);
        }}
      >
        {/* Left Green Accent Bar */}
        <View style={styles.accentBar} />

        {/* Avatar or 2-letter Initials */}
        <View style={styles.avatarWrapper}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.initialsAvatar}>
              <Text style={styles.initialsText}>{getInitials(title)}</Text>
            </View>
          )}
          <View style={styles.onlineDot} />
        </View>

        {/* Content Info */}
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.titleText} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.timeTag}>Just now</Text>
          </View>
          <Text style={styles.bodyText} numberOfLines={1}>
            {body}
          </Text>
        </View>

        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={handleDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={18} color={COLORS.iconDefault} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 14,
    right: 14,
    zIndex: 9999,
    elevation: 20,
  },
  card: {
    backgroundColor: '#202c33',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a3942',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 4,
    backgroundColor: COLORS.accentGreen,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  avatarWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
    marginLeft: 4,
    position: 'relative',
  },
  avatarImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  initialsAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#374248',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: '#e9edef',
    fontWeight: '700',
    fontSize: 15,
  },
  onlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.badgeGreen,
    borderWidth: 1.5,
    borderColor: '#202c33',
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  titleText: {
    color: '#e9edef',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  timeTag: {
    color: COLORS.accentGreen,
    fontSize: 11,
    fontWeight: '600',
  },
  bodyText: {
    color: '#8696a0',
    fontSize: 12.5,
  },
  closeBtn: {
    padding: 6,
    marginLeft: 6,
  },
});

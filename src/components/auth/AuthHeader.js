import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export default function AuthHeader({ title, subtitle, icon = 'chatbubble-ellipses' }) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.logoCircle}>
        <Ionicons name={icon} size={36} color="#111b21" />
      </View>
      <Text style={styles.brandTitle}>PulseChat</Text>
      <Text style={styles.screenTitle}>{title}</Text>
      {Boolean(subtitle) && <Text style={styles.screenSubtitle}>{subtitle}</Text>}

      {/* End-to-End Encryption Banner */}
      <View style={styles.securityBadge}>
        <Ionicons name="lock-closed" size={12} color={COLORS.accentGreen} />
        <Text style={styles.securityText}>End-to-end encrypted messaging</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.badgeGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: COLORS.badgeGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.badgeGreen,
    letterSpacing: 0.6,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 6,
  },
  screenSubtitle: {
    fontSize: 13.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 168, 132, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 168, 132, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 12,
  },
  securityText: {
    fontSize: 11,
    color: COLORS.accentGreen,
    fontWeight: '500',
    marginLeft: 6,
  },
});

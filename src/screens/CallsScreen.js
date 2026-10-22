import React from 'react';
import { StyleSheet, View } from 'react-native';
import CallsList from '../components/call/CallsList';
import { COLORS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

export default function CallsScreen({ onStartCall, onSimulateIncomingCall }) {
  const { colors, isLight } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CallsList
        onStartCall={onStartCall}
        onSimulateIncomingCall={onSimulateIncomingCall}
        isLight={isLight}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  callLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  linkCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.badgeGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  linkInfo: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  linkSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  callRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  callAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 14,
  },
  callInfo: {
    flex: 1,
  },
  callerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  callerNameMissed: {
    color: COLORS.danger,
  },
  callDirectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callTimeText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  callActionBtn: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 18,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.badgeGreen,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
});

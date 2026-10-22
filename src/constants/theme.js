// Design tokens and color system for PulseChat mobile app
// Supports Dark, Light, and System themes aligned with WhatsApp Mobile UX

export const DARK_COLORS = {
  // Backgrounds
  background: '#111b21',
  chatBackground: '#0b141a',
  headerBackground: '#202c33',
  bottomBarBackground: '#202c33',
  cardBackground: '#182229',
  surfaceGlass: 'rgba(24, 34, 41, 0.75)',
  activeTabBackground: '#103629',

  // Borders & Dividers
  border: '#222e35',
  borderLight: '#2a3942',
  glassBorder: 'rgba(255, 255, 255, 0.08)',

  // Brand Greens
  primaryGreen: '#00a884',
  accentGreen: '#25d366',
  messageSent: '#005c4b',
  messageReceived: '#202c33',

  // Typography
  textPrimary: '#e9edef',
  textSecondary: '#8696a0',
  textMuted: '#667781',
  textWhite: '#ffffff',

  // Icons & Badges
  iconDefault: '#aebac1',
  iconActive: '#00a884',
  badgeGreen: '#25d366',
  badgeText: '#111b21',
  onlineDot: '#25d366',
  blueTicks: '#53bdeb',
  danger: '#ea4335',

  // Meta AI Glow gradient / accent
  metaAiBlue: '#007aff',
  metaAiPurple: '#af52de',
};

export const LIGHT_COLORS = {
  // Backgrounds
  background: '#ffffff',
  chatBackground: '#efeae2',
  headerBackground: '#008069',
  bottomBarBackground: '#ffffff',
  cardBackground: '#f0f2f5',
  surfaceGlass: 'rgba(255, 255, 255, 0.85)',
  activeTabBackground: '#e7f7ef',

  // Borders & Dividers
  border: '#e9edef',
  borderLight: '#d1d7db',
  glassBorder: 'rgba(0, 0, 0, 0.06)',

  // Brand Greens
  primaryGreen: '#008069',
  accentGreen: '#00a884',
  messageSent: '#d9fdd3',
  messageReceived: '#ffffff',

  // Typography
  textPrimary: '#111b21',
  textSecondary: '#54656f',
  textMuted: '#8696a0',
  textWhite: '#ffffff',

  // Icons & Badges
  iconDefault: '#54656f',
  iconActive: '#008069',
  badgeGreen: '#25d366',
  badgeText: '#ffffff',
  onlineDot: '#25d366',
  blueTicks: '#53bdeb',
  danger: '#ea4335',

  // Meta AI Glow gradient / accent
  metaAiBlue: '#007aff',
  metaAiPurple: '#af52de',
};

// Default export matches current dark palette
export const COLORS = DARK_COLORS;

/**
 * Resolve active colors palette based on user theme choice & OS color scheme
 */
export function resolveTheme(themeMode = 'Dark', systemColorScheme = 'dark') {
  if (themeMode === 'System') {
    return systemColorScheme === 'light' ? LIGHT_COLORS : DARK_COLORS;
  }
  if (themeMode === 'Light') {
    return LIGHT_COLORS;
  }
  return DARK_COLORS;
}

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

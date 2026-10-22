import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { DARK_COLORS, LIGHT_COLORS, resolveTheme } from '../constants/theme';
import storageService from '../services/storageService';

const ThemeContext = createContext({
  theme: 'Dark',
  colors: DARK_COLORS,
  isLight: false,
  chatWallpaper: '#0b141a',
  setTheme: () => {},
  setWallpaper: () => {},
});

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme() || 'dark';
  const [themeMode, setThemeMode] = useState('Dark'); // 'Dark' | 'Light' | 'System'
  const [chatWallpaper, setChatWallpaper] = useState('#0b141a');

  // Load saved preferences from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const savedSettings = await storageService.getSettings();
        if (savedSettings?.chats?.theme) {
          setThemeMode(savedSettings.chats.theme);
        }
        if (savedSettings?.chats?.wallpaper) {
          setChatWallpaper(savedSettings.chats.wallpaper);
        }
      } catch (e) {
        console.warn('Error loading theme settings:', e);
      }
    })();
  }, []);

  // Compute active colors and isLight boolean
  const colors = useMemo(() => {
    return resolveTheme(themeMode, systemScheme);
  }, [themeMode, systemScheme]);

  const isLight = useMemo(() => {
    return colors === LIGHT_COLORS;
  }, [colors]);

  // Adjust default wallpaper when switching themes if user hasn't chosen custom wallpaper
  const activeWallpaper = useMemo(() => {
    if (!chatWallpaper || chatWallpaper === '#0b141a' || chatWallpaper === '#efeae2') {
      return isLight ? '#efeae2' : '#0b141a';
    }
    return chatWallpaper;
  }, [chatWallpaper, isLight]);

  // Persistent setters
  const setTheme = useCallback(async (newTheme) => {
    setThemeMode(newTheme);
    try {
      const existing = (await storageService.getSettings()) || {};
      await storageService.saveSettings({
        ...existing,
        chats: { ...(existing.chats || {}), theme: newTheme },
      });
    } catch (e) {
      console.warn('Error saving theme setting:', e);
    }
  }, []);

  const setWallpaper = useCallback(async (newWallpaper) => {
    setChatWallpaper(newWallpaper);
    try {
      const existing = (await storageService.getSettings()) || {};
      await storageService.saveSettings({
        ...existing,
        chats: { ...(existing.chats || {}), wallpaper: newWallpaper },
      });
    } catch (e) {
      console.warn('Error saving wallpaper setting:', e);
    }
  }, []);

  const contextValue = useMemo(() => ({
    theme: themeMode,
    colors,
    isLight,
    chatWallpaper: activeWallpaper,
    rawWallpaper: chatWallpaper,
    setTheme,
    setWallpaper,
  }), [themeMode, colors, isLight, activeWallpaper, chatWallpaper, setTheme, setWallpaper]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'Dark',
      colors: DARK_COLORS,
      isLight: false,
      chatWallpaper: '#0b141a',
      setTheme: () => {},
      setWallpaper: () => {},
    };
  }
  return context;
}

export default ThemeContext;

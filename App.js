import React, { useState } from 'react';
import { StyleSheet, View, Alert, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { COLORS } from './src/constants/theme';
import ChatHeaderNavbar from './src/components/ChatHeaderNavbar';
import HomeHeaderNavbar from './src/components/HomeHeaderNavbar';
import BottomTabBar from './src/components/BottomTabBar';
import ChatPreviewBody from './src/components/ChatPreviewBody';

function MainScreen() {
  const insets = useSafeAreaInsets();
  const [headerMode, setHeaderMode] = useState('chat'); // 'chat' | 'home'
  const [activeTab, setActiveTab] = useState('chats');
  const [isTyping, setIsTyping] = useState(false);

  const handleToggleHeader = () => {
    setHeaderMode((prev) => (prev === 'chat' ? 'home' : 'chat'));
  };

  const handleBack = () => {
    Alert.alert('Navigation', 'Navigated back to conversations list.');
    setHeaderMode('home');
  };

  const handleProfilePress = () => {
    Alert.alert('Contact Profile', 'Viewing Shamshad Khan (Shamshad28)');
  };

  const handleVideoCall = () => {
    Alert.alert('Video Call', 'Starting encrypted WebRTC video call...');
  };

  const handleVoiceCall = () => {
    Alert.alert('Voice Call', 'Starting voice call...');
  };

  const handleMenuPress = () => {
    Alert.alert('Menu', 'Options: View Contact, Media & Docs, Search, Mute, Wallpaper, More');
  };

  const handleCameraPress = () => {
    Alert.alert('Camera', 'Opening camera for photo/video sharing...');
  };

  const handleSearchPress = () => {
    Alert.alert('Search', 'Search chats, contacts, or messages...');
  };

  const handleMetaAiPress = () => {
    Alert.alert('Meta AI', 'Opening AI assistant...');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" backgroundColor={COLORS.headerBackground} />

      {/* Top Navbar Area */}
      {headerMode === 'chat' ? (
        <ChatHeaderNavbar
          title="Shamshad Khan"
          subtitle={isTyping ? 'typing...' : 'online'}
          isOnline={true}
          isTyping={isTyping}
          onBack={handleBack}
          onProfilePress={handleProfilePress}
          onVideoCall={handleVideoCall}
          onVoiceCall={handleVoiceCall}
          onMenuPress={handleMenuPress}
        />
      ) : (
        <HomeHeaderNavbar
          appName="WhatsApp"
          onCameraPress={handleCameraPress}
          onSearchPress={handleSearchPress}
          onMenuPress={handleMenuPress}
          onMetaAiPress={handleMetaAiPress}
        />
      )}

      {/* Main Content Area */}
      <ChatPreviewBody
        activeTab={activeTab}
        headerMode={headerMode}
        onToggleHeaderMode={handleToggleHeader}
      />

      {/* Bottom Navigation Dock */}
      <BottomTabBar
        activeTab={activeTab}
        onSelectTab={(tabId) => setActiveTab(tabId)}
        unreadChats={3}
        missedCalls={1}
        hasStatusUpdate={true}
        bottomPadding={insets.bottom}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MainScreen />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.headerBackground,
  },
});

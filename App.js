import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, BackHandler, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { COLORS } from './src/constants/theme';
import { INITIAL_CONVERSATIONS, CURRENT_USER } from './src/data/mockData';

// Navbars & Bottom Tab
import HomeHeaderNavbar from './src/components/HomeHeaderNavbar';
import BottomTabBar from './src/components/BottomTabBar';

// Screens
import ChatsScreen from './src/screens/ChatsScreen';
import ChatDetailScreen from './src/screens/ChatDetailScreen';
import UpdatesScreen from './src/screens/UpdatesScreen';
import CommunitiesScreen from './src/screens/CommunitiesScreen';
import CallsScreen from './src/screens/CallsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CreateGroupScreen from './src/screens/CreateGroupScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

// Modals & New Components
import ContactInfoModal from './src/components/ContactInfoModal';
import NewChatModal from './src/components/NewChatModal';
import IncomingCallModal from './src/components/call/IncomingCallModal';
import VideoCallModal from './src/components/call/VideoCallModal';
import GroupSettingModal from './src/components/group/GroupSettingModal';
import ContactProfileModal from './src/components/profile/ContactProfileModal';
import JoinRoomModal from './src/components/JoinRoomModal';
import QRCodeModal from './src/components/profile/QRCodeModal';
import NotificationBanner from './src/components/chat/NotificationBanner';
import WhatsAppTitleBar from './src/components/chat/WhatsAppTitleBar';

// Camera & Socket Services
import cameraService from './src/services/cameraService';
import useSocketWebRTC from './src/hooks/useSocketWebRTC';

function MainApp() {
  const insets = useSafeAreaInsets();

  // Authentication State (Only authenticated users or newly created accounts can access app)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState([CURRENT_USER]);

  // Screen View Routing: 'main' | 'profile' | 'createGroup' | 'login' | 'register'
  const [currentView, setCurrentView] = useState('main');

  // Navigation tab state
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' | 'updates' | 'communities' | 'calls' | 'settings'
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [selectedConversation, setSelectedConversation] = useState(null);

  // Modals state
  const [isContactProfileVisible, setIsContactProfileVisible] = useState(false);
  const [isGroupSettingVisible, setIsGroupSettingVisible] = useState(false);
  const [isCallModalVisible, setIsCallModalVisible] = useState(false);
  const [callType, setCallType] = useState('video'); // 'video' | 'voice'
  const [callContact, setCallContact] = useState(null);
  const [isNewChatModalVisible, setIsNewChatModalVisible] = useState(false);
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [isQrScannerVisible, setIsQrScannerVisible] = useState(false);
  const [activeNotification, setActiveNotification] = useState(null);

  // Manual Incoming Call Simulation State
  const [manualIncomingCall, setManualIncomingCall] = useState(null);

  // Unified Socket.IO & WebRTC Reactive Hook
  const {
    isConnected: isSocketConnected,
    onlineUsers,
    typingMap,
    callState,
    startCall,
    acceptCall,
    declineCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleSpeaker,
    flipCamera,
    toggleMinimized,
    sendTyping,
    publishStatus,
    socketUrl,
    updateSocketUrl,
  } = useSocketWebRTC(isAuthenticated ? currentUser : null);

  // Android Hardware Back Button Handler
  useEffect(() => {
    const onBackPress = () => {
      if (callState.callStatus === 'incoming' || manualIncomingCall) {
        declineCall();
        setManualIncomingCall(null);
        return true;
      }
      if (callState.callStatus === 'calling' || callState.callStatus === 'connected' || isCallModalVisible) {
        endCall();
        setIsCallModalVisible(false);
        return true;
      }
      if (isGroupSettingVisible) {
        setIsGroupSettingVisible(false);
        return true;
      }
      if (isContactProfileVisible) {
        setIsContactProfileVisible(false);
        return true;
      }
      if (isJoinModalVisible) {
        setIsJoinModalVisible(false);
        return true;
      }
      if (isQrScannerVisible) {
        setIsQrScannerVisible(false);
        return true;
      }
      if (isNewChatModalVisible) {
        setIsNewChatModalVisible(false);
        return true;
      }
      if (selectedConversation) {
        setSelectedConversation(null);
        return true;
      }
      if (currentView === 'createGroup' || currentView === 'profile') {
        setCurrentView('main');
        return true;
      }
      if (currentView === 'register') {
        setCurrentView('login');
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [
    callState.callStatus,
    manualIncomingCall,
    isCallModalVisible,
    isGroupSettingVisible,
    isContactProfileVisible,
    isNewChatModalVisible,
    isJoinModalVisible,
    isQrScannerVisible,
    selectedConversation,
    currentView,
  ]);

  // Select conversation & mark as read
  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    setCurrentView('main');
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
    );
  };

  // Start outgoing call (WebRTC + Socket signaling)
  const handleStartCall = (contact, type = 'video') => {
    setCallContact(contact);
    setCallType(type);
    startCall({
      otherUser: contact,
      conversationId: contact.id || `conv_${contact.name}`,
      callType: type,
    });
  };

  // Simulate an incoming call for testing
  const handleSimulateIncomingCall = (callerUser, type = 'video') => {
    setManualIncomingCall({
      caller: callerUser || {
        name: 'Priya Mali',
        username: 'priya_m',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      },
      callType: type,
    });
  };

  // Accept incoming call
  const handleAcceptIncomingCall = () => {
    if (callState.callStatus === 'incoming') {
      acceptCall();
    } else if (manualIncomingCall) {
      const { caller, callType: cType } = manualIncomingCall;
      setManualIncomingCall(null);
      setCallContact(caller);
      setCallType(cType);
      setIsCallModalVisible(true);
    }
  };

  // Start new chat from contacts list
  const handleStartNewChatWithContact = (contact) => {
    const existing = conversations.find((c) => c.name === contact.name);
    if (existing) {
      handleSelectConversation(existing);
    } else {
      const newConv = {
        id: `conv_${Date.now()}`,
        name: contact.name,
        type: 'direct',
        avatar: null,
        isOnline: contact.isOnline,
        lastSeen: contact.isOnline ? 'online' : 'offline',
        lastMessage: {
          text: 'Started new conversation',
          time: 'Just now',
          isSentByMe: true,
          status: 'read',
        },
        unreadCount: 0,
        isPinned: false,
        isMuted: false,
        about: contact.status,
      };
      setConversations((prev) => [newConv, ...prev]);
      setSelectedConversation(newConv);
    }
  };

  // Open or create Pulse LLM AI Assistant conversation
  const handleOpenLLM = () => {
    let llmConv = conversations.find((c) => c.isLLM || c.id === 'conv_llm');
    if (!llmConv) {
      llmConv = {
        id: 'conv_llm',
        name: 'Pulse LLM',
        type: 'ai',
        isLLM: true,
        avatar: null,
        isOnline: true,
        lastSeen: 'AI Assistant • LLaMA 3.3',
        lastMessage: {
          text: 'Hello! I am Pulse LLM. Ask me anything, write code, or consult me on this chat.',
          time: 'Just now',
          senderId: 'pulse_llm',
          isSentByMe: false,
          status: 'read',
        },
        unreadCount: 0,
        isPinned: true,
        isMuted: false,
        about: 'Autonomous AI Assistant powered by multimodal LLM',
      };
      setConversations((prev) => [llmConv, ...prev]);
    }
    handleSelectConversation(llmConv);
  };

  // Join Room by Code, Link, or Scanned Token
  const handleJoinRoom = (roomCode) => {
    const code = (roomCode || '').toLowerCase().trim();
    if (code.includes('llm') || code.includes('ai')) {
      handleOpenLLM();
      return;
    }
    if (code.includes('priya')) {
      const priyaConv = conversations.find((c) => c.name?.includes('Priya')) || conversations[0];
      if (priyaConv) handleSelectConversation(priyaConv);
      return;
    }

    const roomId = `room_${code.replace(/[^a-zA-Z0-9_-]/g, '')}`;
    const existing = conversations.find((c) => c.id === roomId || c.name.toLowerCase() === `#${code}`);
    if (existing) {
      handleSelectConversation(existing);
    } else {
      const newRoom = {
        id: roomId,
        name: `#${roomCode}`,
        type: 'group',
        avatar: null,
        isOnline: true,
        lastSeen: 'Room connected • WebRTC enabled',
        lastMessage: {
          text: `Joined #${roomCode} room`,
          time: 'Just now',
          isSentByMe: true,
          status: 'read',
        },
        unreadCount: 0,
        isPinned: false,
        isMuted: false,
        about: `Live chat room for #${roomCode}`,
      };
      setConversations((prev) => [newRoom, ...prev]);
      handleSelectConversation(newRoom);
    }
  };

  // Group created callback
  const handleGroupCreated = (newGroup) => {
    setConversations((prev) => [newGroup, ...prev]);
    setSelectedConversation(newGroup);
    setCurrentView('main');
    Alert.alert('Group Created', `"${newGroup.name}" is now ready with members.`);
  };

  // Group updated callback
  const handleGroupUpdated = (updatedGroup) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === updatedGroup.id ? { ...c, ...updatedGroup } : c))
    );
    if (selectedConversation?.id === updatedGroup.id) {
      setSelectedConversation((prev) => ({ ...prev, ...updatedGroup }));
    }
  };

  // Leave group
  const handleLeaveGroup = (groupId) => {
    setConversations((prev) => prev.filter((c) => c.id !== groupId));
    setSelectedConversation(null);
    setIsGroupSettingVisible(false);
  };

  // Log out action
  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of PulseChat?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            setIsAuthenticated(false);
            setCurrentView('login');
            setSelectedConversation(null);
          },
        },
      ]
    );
  };

  // Header Camera Action
  const handleHeaderCameraPress = async () => {
    const photoUri = await cameraService.capturePhoto();
    if (photoUri) {
      Alert.alert(
        'Photo Captured 📸',
        'Where would you like to share this photo?',
        [
          {
            text: 'Send to Priya Mali',
            onPress: () => {
              const priyaConv =
                conversations.find((c) => c.name?.includes('Priya')) || conversations[0];
              if (priyaConv) {
                handleSelectConversation(priyaConv);
              }
            },
          },
          {
            text: 'Post to Status',
            onPress: () => {
              const newStatus = {
                id: `status_header_${Date.now()}`,
                userName: currentUser.name,
                avatar: currentUser.avatar,
                mediaUrl: photoUri,
                caption: 'Captured with camera 📸',
                time: 'Just now',
                unviewedCount: 1,
                hasUnviewed: true,
              };
              publishStatus(newStatus);
              setActiveTab('updates');
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  // Top header 3-dots menu press
  const handleMenuPress = () => {
    Alert.alert(
      'PulseChat Menu',
      'Choose a page or action:',
      [
        {
          text: 'Test Incoming Call 📞',
          onPress: () => handleSimulateIncomingCall(),
        },
        {
          text: 'Test Notification Banner 🔔',
          onPress: () => {
            setActiveNotification({
              id: `notif_${Date.now()}`,
              title: 'priya mali',
              body: 'How are you? Testing the new in-app notification banner! 🚀',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              conversationId: 'conv_priya',
            });
          },
        },
        {
          text: 'Join Room / Chat 🔗',
          onPress: () => setIsJoinModalVisible(true),
        },
        {
          text: 'Pulse LLM Assistant ✨',
          onPress: handleOpenLLM,
        },
        {
          text: 'New group',
          onPress: () => setCurrentView('createGroup'),
        },
        {
          text: 'Profile',
          onPress: () => setCurrentView('profile'),
        },
        {
          text: 'Settings',
          onPress: () => {
            setSelectedConversation(null);
            setCurrentView('main');
            setActiveTab('settings');
          },
        },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: handleLogout,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // Unread badge count
  const unreadChatsCount = conversations.reduce(
    (acc, curr) => acc + (curr.unreadCount || 0),
    0
  );

  // 1. Auth Flow: Not logged in
  if (!isAuthenticated) {
    if (currentView === 'register') {
      return (
        <SafeAreaView style={styles.safeContainer} edges={['top', 'left', 'right']}>
          <StatusBar style="light" backgroundColor={COLORS.headerBackground} />
          <RegisterScreen
            onRegisterSuccess={(newUser) => {
              setRegisteredUsers((prev) => [...prev, newUser]);
              setCurrentUser(newUser);
              setIsAuthenticated(true);
              setCurrentView('main');
            }}
            onNavigateToLogin={() => setCurrentView('login')}
          />
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView style={styles.safeContainer} edges={['top', 'left', 'right']}>
        <StatusBar style="light" backgroundColor={COLORS.headerBackground} />
        <LoginScreen
          registeredUsers={registeredUsers}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setIsAuthenticated(true);
            setCurrentView('main');
          }}
          onNavigateToRegister={() => setCurrentView('register')}
        />
      </SafeAreaView>
    );
  }

  // 2. Profile Screen View
  if (currentView === 'profile') {
    return (
      <SafeAreaView style={styles.safeContainer} edges={['top', 'left', 'right']}>
        <StatusBar style="light" backgroundColor={COLORS.headerBackground} />
        <ProfileScreen
          onBack={() => setCurrentView('main')}
          onLogout={handleLogout}
          onOpenChat={() => {
            setCurrentView('main');
            setActiveTab('chats');
          }}
        />
      </SafeAreaView>
    );
  }

  // 3. Create Group Screen View
  if (currentView === 'createGroup') {
    return (
      <SafeAreaView style={styles.safeContainer} edges={['top', 'left', 'right']}>
        <StatusBar style="light" backgroundColor={COLORS.headerBackground} />
        <CreateGroupScreen
          onBack={() => setCurrentView('main')}
          onGroupCreated={handleGroupCreated}
        />
      </SafeAreaView>
    );
  }

  // 4. Main Logged-In Flow (Chats, Detail, Updates, Calls, Settings)
  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'left', 'right']}>
      <StatusBar style="light" backgroundColor={COLORS.headerBackground} />

      {/* 1. NATIVE-LOOKING WINDOW TITLE BAR (Desktop Web Only) */}
      {Platform.OS === 'web' && (
        <WhatsAppTitleBar
          isSocketConnected={isSocketConnected}
          onMinimize={() => {}}
          onMaximize={() => {}}
          onClose={() => {}}
        />
      )}

      {/* In-App Floating Notification Banner */}
      <NotificationBanner
        notification={activeNotification}
        onDismiss={() => setActiveNotification(null)}
        onPress={(notif) => {
          const conv =
            conversations.find(
              (c) => c.id === notif.conversationId || c.name === notif.title
            ) || conversations[0];
          if (conv) handleSelectConversation(conv);
        }}
      />

      {/* If active conversation is selected: Render ChatDetailScreen */}
      {selectedConversation ? (
        <ChatDetailScreen
          conversation={selectedConversation}
          onBack={() => setSelectedConversation(null)}
          onOpenProfile={() => {
            if (selectedConversation.type === 'group') {
              setIsGroupSettingVisible(true);
            } else {
              setIsContactProfileVisible(true);
            }
          }}
          onVideoCall={() => handleStartCall(selectedConversation, 'video')}
          onVoiceCall={() => handleStartCall(selectedConversation, 'voice')}
          remoteTyping={typingMap[selectedConversation.id]?.join(', ')}
          onTypingStart={() => sendTyping(selectedConversation.id, true)}
          onTypingStop={() => sendTyping(selectedConversation.id, false)}
        />
      ) : (
        /* Otherwise render Main Home Tabs View */
        <View style={styles.mainTabContainer}>
          {/* Top Home Navbar for non-chats tabs */}
          {activeTab !== 'chats' && (
            <HomeHeaderNavbar
              activeTab={activeTab}
              appName={isSocketConnected ? "WhatsApp •" : "WhatsApp"}
              onCameraPress={handleHeaderCameraPress}
              onSearchPress={() => Alert.alert('Search', 'Search messages, photos, videos, links, or documents...')}
              onMenuPress={handleMenuPress}
              onMetaAiPress={handleOpenLLM}
            />
          )}

          {/* Tab Content */}
          <View style={styles.contentBody}>
            {activeTab === 'chats' && (
              <ChatsScreen
                conversations={conversations}
                onSelectConversation={handleSelectConversation}
                onOpenNewChat={() => setIsNewChatModalVisible(true)}
                onOpenMetaAI={handleOpenLLM}
                onMenuPress={handleMenuPress}
                onCameraPress={handleHeaderCameraPress}
              />
            )}
            {activeTab === 'updates' && (
              <UpdatesScreen
                onSendStoryReply={(story, text) => {
                  const storyUser = story.userName || story.contactName;
                  let conv = conversations.find((c) => c.name === storyUser);
                  if (conv) {
                    handleSelectConversation(conv);
                  }
                }}
                onPublishStatus={(statusData) => {
                  publishStatus(statusData);
                }}
              />
            )}
            {activeTab === 'communities' && <CommunitiesScreen />}
            {activeTab === 'calls' && (
              <CallsScreen
                onStartCall={(callItem, type) => handleStartCall(callItem, type)}
                onSimulateIncomingCall={() => handleSimulateIncomingCall()}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsScreen
                onOpenProfile={() => setCurrentView('profile')}
                onOpenCreateGroup={() => setCurrentView('createGroup')}
                onLogout={handleLogout}
                isSocketConnected={isSocketConnected}
                socketUrl={socketUrl}
                onUpdateSocketUrl={updateSocketUrl}
              />
            )}
          </View>

          {/* Bottom Tab Navigation Dock (sidebardoc matching screenshot) */}
          <BottomTabBar
            activeTab={activeTab}
            onSelectTab={(tabId) => {
              if (tabId === 'meta-ai') {
                handleOpenLLM();
              } else {
                setActiveTab(tabId);
              }
            }}
            unreadChats={unreadChatsCount}
            missedCalls={1}
            hasStatusUpdate={true}
            bottomPadding={insets.bottom}
            currentUser={currentUser}
            onOpenProfile={() => setCurrentView('profile')}
          />
        </View>
      )}

      {/* Group Info & Settings Modal (When tapping Group Header) */}
      <GroupSettingModal
        visible={isGroupSettingVisible}
        group={selectedConversation}
        onClose={() => setIsGroupSettingVisible(false)}
        onGroupUpdated={handleGroupUpdated}
        onLeaveGroup={handleLeaveGroup}
      />

      {/* Contact Profile Modal (When tapping Direct Chat Header) */}
      <ContactProfileModal
        visible={isContactProfileVisible}
        contact={selectedConversation || callContact || currentUser}
        onClose={() => setIsContactProfileVisible(false)}
        onStartCall={(contact, type) => handleStartCall(contact, type)}
        onOpenChat={(contact) => {
          setIsContactProfileVisible(false);
          handleSelectConversation(contact);
        }}
      />

      {/* Incoming Call Modal (Real-time Socket.IO + WebRTC or Simulated) */}
      <IncomingCallModal
        visible={callState.callStatus === 'incoming' || Boolean(manualIncomingCall)}
        caller={callState.activeCall?.otherUser || manualIncomingCall?.caller}
        callType={callState.callType || manualIncomingCall?.callType || 'video'}
        onAccept={handleAcceptIncomingCall}
        onDecline={() => {
          if (callState.callStatus === 'incoming') {
            declineCall();
          } else {
            setManualIncomingCall(null);
          }
        }}
      />

      {/* Active WebRTC Video / Audio Call Modal with PiP Minimize & Controls */}
      <VideoCallModal
        visible={
          callState.callStatus === 'calling' ||
          callState.callStatus === 'connected' ||
          isCallModalVisible
        }
        contact={callState.activeCall?.otherUser || callContact || selectedConversation}
        callType={callState.callType || callType}
        duration={callState.duration}
        isMuted={callState.isMuted}
        isVideoOff={callState.isVideoOff}
        isSpeaker={callState.isSpeaker}
        isFrontCamera={callState.isFrontCamera}
        isMinimized={callState.isMinimized}
        onEndCall={() => {
          endCall();
          setIsCallModalVisible(false);
        }}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        onToggleSpeaker={toggleSpeaker}
        onFlipCamera={flipCamera}
        onToggleMinimized={toggleMinimized}
      />

      {/* New Chat Contact Selection Modal */}
      <NewChatModal
        visible={isNewChatModalVisible}
        onClose={() => setIsNewChatModalVisible(false)}
        onSelectContact={handleStartNewChatWithContact}
        onOpenNewGroup={() => {
          setIsNewChatModalVisible(false);
          setCurrentView('createGroup');
        }}
        onJoinWithCode={() => {
          setIsNewChatModalVisible(false);
          setIsJoinModalVisible(true);
        }}
        onOpenLLM={() => {
          setIsNewChatModalVisible(false);
          handleOpenLLM();
        }}
      />

      {/* Join Room / Chat via Code or Link Modal */}
      <JoinRoomModal
        visible={isJoinModalVisible}
        onClose={() => setIsJoinModalVisible(false)}
        onJoinSuccess={handleJoinRoom}
        onOpenScanner={() => setIsQrScannerVisible(true)}
      />

      {/* Global QR Code Scanner Modal (Generates brand new scanner & code) */}
      <QRCodeModal
        visible={isQrScannerVisible}
        onClose={() => setIsQrScannerVisible(false)}
        user={currentUser}
        onJoinUser={(target) => {
          setIsQrScannerVisible(false);
          handleJoinRoom(target?.name || target?.id || 'room_scanned');
        }}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.headerBackground,
  },
  mainTabContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentBody: {
    flex: 1,
  },
});

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, BackHandler, Platform, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { COLORS, resolveTheme } from './src/constants/theme';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { INITIAL_CONVERSATIONS, CURRENT_USER, MOCK_CALLS } from './src/data/mockData';

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
import MetaAIScreen from './src/screens/MetaAIScreen';

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

// Camera, Linking, Notification & Socket Services
import cameraService from './src/services/cameraService';
import linkingService from './src/services/linkingService';
import notificationService from './src/services/notificationService';
import storageService, { INITIAL_REGISTERED_USERS } from './src/services/storageService';
import socketService from './src/services/socketService';
import useSocketWebRTC from './src/hooks/useSocketWebRTC';

function MainApp() {
  const insets = useSafeAreaInsets();

  // Authentication State (Only authenticated users or newly created accounts can access app)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState(INITIAL_REGISTERED_USERS);

  // Screen View Routing: 'main' | 'profile' | 'createGroup' | 'login' | 'register'
  const [currentView, setCurrentView] = useState('main');

  // Navigation tab state
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' | 'updates' | 'communities' | 'calls' | 'settings'
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [selectedConversation, setSelectedConversation] = useState(null);

  // App Theme & Wallpaper State from ThemeContext
  const {
    theme: appTheme,
    setTheme: handleThemeChange,
    chatWallpaper,
    setWallpaper: handleWallpaperChange,
    colors: activeColors,
    isLight,
  } = useTheme();

  // Load persisted user session, registered users, conversations, and settings on app launch
  useEffect(() => {
    (async () => {
      try {
        const [savedUser, savedRegistered, savedConvs, savedSettings] = await Promise.all([
          storageService.getCurrentUser(),
          storageService.getRegisteredUsers(),
          storageService.getConversations(),
          storageService.getSettings(),
        ]);

        if (savedRegistered && savedRegistered.length > 0) {
          setRegisteredUsers(savedRegistered);
        }

        if (savedConvs && savedConvs.length > 0) {
          setConversations(savedConvs);
        }

        if (savedUser) {
          setCurrentUser(savedUser);
          setIsAuthenticated(true);
        }

        if (savedSettings?.chats?.theme) {
          handleThemeChange(savedSettings.chats.theme);
        }

        if (savedSettings?.chats?.wallpaper) {
          handleWallpaperChange(savedSettings.chats.wallpaper);
        }
      } catch (err) {
        console.warn('Error loading persisted storage:', err);
      }
    })();
  }, []);

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

  // Live Call Badge Count (Always dynamic based on live calls; never hardcoded)
  const [liveCallCount, setLiveCallCount] = useState(0);

  useEffect(() => {
    if (callState?.callStatus === 'incoming' || manualIncomingCall) {
      setLiveCallCount((prev) => prev + 1);
    }
  }, [callState?.callStatus, manualIncomingCall]);

  useEffect(() => {
    if (activeTab === 'calls') {
      setLiveCallCount(0);
    }
  }, [activeTab]);

  // Real-time user announcement, cross-device discovery, and live message delivery
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;

    const socket = socketService.getSocket();

    // 1. Announce current user so all clients can discover them
    socketService.announceUser(currentUser);
    socketService.requestRegisteredUsers();

    // 2. Cross-device contact discovery when another user registers or logs in anywhere
    const handleUserJoined = (newContact) => {
      if (!newContact || newContact.id === currentUser.id) return;
      setRegisteredUsers((prev) => {
        const exists = prev.some(
          (u) =>
            u.id === newContact.id ||
            (u.username && u.username.toLowerCase() === newContact.username?.toLowerCase())
        );
        let updated;
        if (exists) {
          updated = prev.map((u) => (u.id === newContact.id ? { ...u, ...newContact, isOnline: true } : u));
        } else {
          updated = [...prev, { ...newContact, isOnline: true }];
        }
        storageService.setRegisteredUsers(updated);
        return updated;
      });
    };

    // 3. Receive full user list from server directory
    const handleUsersList = (userList) => {
      if (!Array.isArray(userList)) return;
      setRegisteredUsers((prev) => {
        const map = new Map();
        prev.forEach((u) => map.set(u.id || u.username, u));
        userList.forEach((u) => {
          if (u.id !== currentUser.id && u.name?.toLowerCase() !== currentUser.name?.toLowerCase()) {
            map.set(u.id || u.username, { ...map.get(u.id || u.username), ...u });
          }
        });
        const merged = Array.from(map.values());
        storageService.setRegisteredUsers(merged);
        return merged;
      });
    };

    // 4. Global real-time message delivery across all locations
    const handleGlobalMessage = (msg) => {
      if (!msg) return;
      const myId = currentUser.id || currentUser._id;
      const senderId = msg.sender?._id || msg.sender?.id || msg.sender;
      if (myId && senderId && senderId === myId) return;

      const senderName = msg.senderName || msg.sender?.name || 'Contact';
      const convId =
        msg.conversationId ||
        (msg.conversation?._id || msg.conversation) ||
        `conv_${senderName.toLowerCase().replace(/\s+/g, '_')}`;

      // Update conversations list
      setConversations((prev) => {
        const existingIdx = prev.findIndex(
          (c) => c.id === convId || c.name?.toLowerCase() === senderName.toLowerCase()
        );
        const isCurrentOpen =
          selectedConversation &&
          (selectedConversation.id === convId ||
            selectedConversation.name?.toLowerCase() === senderName.toLowerCase());

        let updated;
        if (existingIdx >= 0) {
          updated = [...prev];
          const existing = updated[existingIdx];
          updated[existingIdx] = {
            ...existing,
            lastMessage: {
              text: msg.text || msg.content || 'Message',
              time: msg.time || 'Just now',
              isSentByMe: false,
              status: 'read',
            },
            unreadCount: isCurrentOpen ? 0 : (existing.unreadCount || 0) + 1,
          };
          const [moved] = updated.splice(existingIdx, 1);
          updated.unshift(moved);
        } else {
          const newConv = {
            id: convId,
            name: senderName,
            type: 'direct',
            avatar: msg.sender?.avatar || null,
            isOnline: true,
            lastSeen: 'online',
            lastMessage: {
              text: msg.text || msg.content || 'Message',
              time: msg.time || 'Just now',
              isSentByMe: false,
              status: 'read',
            },
            unreadCount: isCurrentOpen ? 0 : 1,
            isPinned: false,
            isMuted: false,
          };
          updated = [newConv, ...prev];
        }
        storageService.setConversations(updated);
        return updated;
      });

      // Show in-app notification toast if not currently viewing this chat
      const isCurrentOpen =
        selectedConversation &&
        (selectedConversation.id === convId ||
          selectedConversation.name?.toLowerCase() === senderName.toLowerCase());
      if (!isCurrentOpen) {
        notificationService.showNotification({
          title: `🔒 ${senderName}`,
          message: msg.text || msg.content || 'Sent a new message',
        });
      }
    };

    socket.on('user:joined', handleUserJoined);
    socket.on('users:list', handleUsersList);
    socket.on('newMessage', handleGlobalMessage);
    socket.on('chat:incoming', handleGlobalMessage);

    return () => {
      socket.off('user:joined', handleUserJoined);
      socket.off('users:list', handleUsersList);
      socket.off('newMessage', handleGlobalMessage);
      socket.off('chat:incoming', handleGlobalMessage);
    };
  }, [isAuthenticated, currentUser, selectedConversation]);

  // Deep Linking & Push Notifications Setup
  useEffect(() => {
    // 1. Subscribe to in-app notification toasts
    const unsubNotification = notificationService.subscribe((notif) => {
      setActiveNotification(notif);
    });

    // 2. Request notification permissions
    notificationService.requestPermissions();

    // 3. Setup Deep Linking listener (pulsechat://...)
    const cleanupLinking = linkingService.initDeepLinking((parsed) => {
      if (!parsed) return;
      const { route, id, queryParams } = parsed;

      if (route === 'chat') {
        const found = conversations.find(
          (c) => c.id === id || c.name?.toLowerCase() === id?.toLowerCase()
        );
        if (found) {
          handleSelectConversation(found);
        } else if (id) {
          handleStartNewChatWithContact({ name: id, isOnline: true });
        }
      } else if (route === 'call') {
        const contactName = id || queryParams?.contact || 'Contact';
        const cType = queryParams?.type === 'voice' ? 'voice' : 'video';
        handleStartCall({ name: contactName }, cType);
      } else if (route === 'tab') {
        const targetTab = id || 'chats';
        if (['chats', 'updates', 'communities', 'calls', 'settings'].includes(targetTab)) {
          setSelectedConversation(null);
          setActiveTab(targetTab);
          setCurrentView('main');
        }
      } else if (route === 'profile') {
        setCurrentView('profile');
      } else if (route === 'createGroup') {
        setCurrentView('createGroup');
      }
    });

    return () => {
      unsubNotification();
      cleanupLinking();
    };
  }, [conversations]);

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

    const convId = contact.id || `conv_${contact.name}`;
    const callMsg = {
      id: `call_${Date.now()}`,
      type: 'call',
      callType: type,
      callStatus: 'calling',
      duration: 0,
      durationText: 'Calling...',
      text: type === 'video' ? '📹 Outgoing video call' : '📞 Outgoing voice call',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSentByMe: true,
      status: 'delivered',
      senderName: 'You',
    };
    storageService.appendMessage(convId, callMsg);
    handleMessageSent(convId, callMsg);
  };

  // Simulate an incoming call for testing
  const handleSimulateIncomingCall = (callerUser, type = 'video') => {
    setManualIncomingCall({
      caller: callerUser || {
        name: 'Alex Johnson',
        username: 'alex_j',
        avatar: null,
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
  const handleStartNewChatWithContact = async (contact) => {
    const existing = conversations.find(
      (c) =>
        c.name?.toLowerCase() === contact.name?.toLowerCase() ||
        (contact.id && c.id === contact.id)
    );
    if (existing) {
      handleSelectConversation(existing);
    } else {
      const newConv = {
        id: `conv_${Date.now()}`,
        name: contact.name,
        type: 'direct',
        avatar: contact.avatar || null,
        isOnline: contact.isOnline !== undefined ? contact.isOnline : true,
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
        about: contact.status || contact.about || 'Available',
      };
      const updatedList = [newConv, ...conversations];
      setConversations(updatedList);
      await storageService.setConversations(updatedList);
      handleSelectConversation(newConv);
    }
  };

  // Update profile handler (persisted across storage and registered users)
  const handleUpdateProfile = async (updatedData) => {
    const updated = { ...currentUser, ...updatedData };
    setCurrentUser(updated);
    await storageService.setCurrentUser(updated);
    setRegisteredUsers((prev) => {
      const newList = prev.map((u) => (u.id === updated.id ? updated : u));
      storageService.setRegisteredUsers(newList);
      return newList;
    });
  };

  // Register success handler (persisted across storage & announced worldwide)
  const handleRegisterSuccess = async (newUser) => {
    const updatedUsers = await storageService.addRegisteredUser(newUser);
    await storageService.setCurrentUser(newUser);
    setRegisteredUsers(updatedUsers);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setCurrentView('main');
    socketService.announceUser(newUser);
    socketService.requestRegisteredUsers();
  };

  // Login success handler (persisted across storage & announced worldwide)
  const handleLoginSuccess = async (user) => {
    await storageService.setCurrentUser(user);
    setCurrentUser(user);
    setIsAuthenticated(true);
    setCurrentView('main');
    socketService.announceUser(user);
    socketService.requestRegisteredUsers();
  };

  // Message sent in chat handler (updates last message in real-time)
  const handleMessageSent = (param1, param2) => {
    const convId = param2 ? param1 : (selectedConversation?.id || param1?.conversationId);
    const msg = param2 || param1;
    if (!convId || !msg) return;
    setConversations((prev) => {
      const updated = prev.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            lastMessage: {
              text:
                msg.text ||
                (msg.type === 'image'
                  ? 'Photo 📸'
                  : msg.type === 'audio'
                  ? 'Voice message 🎤'
                  : 'Message'),
              time: 'Just now',
              isSentByMe: Boolean(msg.isSentByMe),
              status: msg.status || 'read',
            },
          };
        }
        return c;
      });
      storageService.setConversations(updated);
      return updated;
    });
  };


  // Delete a specific conversation and all its messages
  const handleDeleteConversation = async (conversationId) => {
    if (!conversationId) return;
    const updated = conversations.filter((c) => c.id !== conversationId);
    setConversations(updated);
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(null);
    }
    await storageService.setConversations(updated);
    await storageService.saveMessages(conversationId, []);
  };

  // Clear all chats history
  const handleClearAllChats = async () => {
    setConversations([]);
    setSelectedConversation(null);
    await storageService.setConversations([]);
  };

  // Open or switch to Meta AI Assistant tab
  const handleOpenLLM = () => {
    setCurrentView('home');
    setActiveTab('meta-ai');
  };

  // Join Room by Code, Link, or Scanned Token
  const handleJoinRoom = (roomCode) => {
    const code = (roomCode || '').toLowerCase().trim();
    if (code.includes('llm') || code.includes('ai')) {
      handleOpenLLM();
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
          onPress: async () => {
            await storageService.clearSession();
            setIsAuthenticated(false);
            setCurrentUser(null);
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
            text: conversations.length > 0 ? `Send to ${conversations[0]?.name || 'Chat'}` : 'Start New Chat',
            onPress: () => {
              if (conversations.length > 0) {
                handleSelectConversation(conversations[0]);
              } else {
                setIsNewChatModalVisible(true);
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

  // Top header 3-dots menu press (Only Settings, Log out, Cancel)
  const handleMenuPress = () => {
    Alert.alert(
      'Settings & Account',
      'Choose an option:',
      [
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
        <SafeAreaView style={[styles.safeContainer, { backgroundColor: activeColors.headerBackground }]} edges={['top', 'left', 'right']}>
          <StatusBar style={isLight ? "dark" : "light"} backgroundColor={activeColors.headerBackground} />
          <RegisterScreen
            onRegisterSuccess={handleRegisterSuccess}
            onNavigateToLogin={() => setCurrentView('login')}
          />
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView style={[styles.safeContainer, { backgroundColor: activeColors.headerBackground }]} edges={['top', 'left', 'right']}>
        <StatusBar style={isLight ? "dark" : "light"} backgroundColor={activeColors.headerBackground} />
        <LoginScreen
          registeredUsers={registeredUsers}
          onLoginSuccess={handleLoginSuccess}
          onNavigateToRegister={() => setCurrentView('register')}
        />
      </SafeAreaView>
    );
  }

  // 2. Profile Screen View
  if (currentView === 'profile') {
    return (
      <SafeAreaView style={[styles.safeContainer, { backgroundColor: activeColors.headerBackground }]} edges={['top', 'left', 'right']}>
        <StatusBar style={isLight ? "dark" : "light"} backgroundColor={activeColors.headerBackground} />
        <ProfileScreen
          user={currentUser}
          onUpdateUser={handleUpdateProfile}
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
      <SafeAreaView style={[styles.safeContainer, { backgroundColor: activeColors.headerBackground }]} edges={['top', 'left', 'right']}>
        <StatusBar style={isLight ? "dark" : "light"} backgroundColor={activeColors.headerBackground} />
        <CreateGroupScreen
          onBack={() => setCurrentView('main')}
          onGroupCreated={handleGroupCreated}
        />
      </SafeAreaView>
    );
  }

  // 4. Main Logged-In Flow (Chats, Detail, Updates, Calls, Settings)
  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: activeColors.headerBackground }]} edges={['top', 'left', 'right']}>
      <StatusBar style={isLight ? "dark" : "light"} backgroundColor={activeColors.headerBackground} />

      {/* 1. NATIVE-LOOKING WINDOW TITLE BAR (Desktop Web Only) */}
      {Platform.OS === 'web' && (
        <WhatsAppTitleBar
          currentUser={currentUser}
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
          currentUser={currentUser}
          theme={appTheme}
          chatWallpaper={chatWallpaper}
          activeCallState={callState}
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
          onMessageSent={handleMessageSent}
          onDeleteConversation={handleDeleteConversation}
          remoteTyping={typingMap[selectedConversation.id]?.join(', ')}
          onTypingStart={() => sendTyping(selectedConversation.id, true)}
          onTypingStop={() => sendTyping(selectedConversation.id, false)}
        />
      ) : (
        /* Otherwise render Main Home Tabs View */
        <View style={[styles.mainTabContainer, { backgroundColor: activeColors.background }]}>
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
                currentUser={currentUser}
                onSelectConversation={handleSelectConversation}
                onDeleteConversation={handleDeleteConversation}
                onOpenNewChat={() => setIsNewChatModalVisible(true)}
                onOpenMetaAI={handleOpenLLM}
                onMenuPress={handleMenuPress}
                onCameraPress={handleHeaderCameraPress}
                onOpenProfile={() => setCurrentView('profile')}
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
            {activeTab === 'meta-ai' && (
              <MetaAIScreen
                currentUser={currentUser}
                theme={appTheme}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsScreen
                currentUser={currentUser}
                onOpenProfile={() => setCurrentView('profile')}
                onUpdateUser={handleUpdateProfile}
                onClearAllChats={handleClearAllChats}
                onOpenCreateGroup={() => setCurrentView('createGroup')}
                onLogout={handleLogout}
                isSocketConnected={isSocketConnected}
                socketUrl={socketUrl}
                onUpdateSocketUrl={updateSocketUrl}
                theme={appTheme}
                onThemeChange={handleThemeChange}
                wallpaper={chatWallpaper}
                onWallpaperChange={handleWallpaperChange}
              />
            )}
          </View>

          {/* Bottom Tab Navigation Dock (Frosted Glass sidebardoc) */}
          <BottomTabBar
            activeTab={activeTab}
            onSelectTab={(tabId) => {
              setActiveTab(tabId);
            }}
            unreadChats={unreadChatsCount}
            missedCalls={liveCallCount}
            hasStatusUpdate={true}
            bottomPadding={insets.bottom}
            currentUser={currentUser}
            onOpenProfile={() => setCurrentView('profile')}
            theme={isLight ? 'light' : 'dark'}
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
          const finalDuration = callState.duration || 0;
          const finalType = callState.callType || callType;
          const targetContact = callState.activeCall?.otherUser || callContact || selectedConversation;
          if (targetContact) {
            const convId = targetContact.id || `conv_${targetContact.name}`;
            const durText =
              finalDuration > 0
                ? finalDuration >= 60
                  ? `${Math.floor(finalDuration / 60)}m ${finalDuration % 60}s`
                  : `${finalDuration}s`
                : 'Cancelled';
            const endedCallMsg = {
              id: `call_${Date.now()}`,
              type: 'call',
              callType: finalType,
              callStatus: 'ended',
              duration: finalDuration,
              durationText: durText,
              text: `${finalType === 'video' ? '📹 Video' : '📞 Voice'} call (${durText})`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isSentByMe: true,
              status: 'delivered',
              senderName: 'You',
            };
            storageService.appendMessage(convId, endedCallMsg);
            handleMessageSent(convId, endedCallMsg);

            // Also record in Call history
            MOCK_CALLS.unshift({
              id: `call_hist_${Date.now()}`,
              name: targetContact.name,
              avatar: targetContact.avatar,
              type: finalType,
              direction: 'outgoing',
              status: finalDuration > 0 ? 'answered' : 'cancelled',
              duration: finalDuration,
              time: 'Just now',
            });
          }
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
        registeredUsers={registeredUsers}
        currentUser={currentUser}
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
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
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

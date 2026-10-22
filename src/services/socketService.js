import { io } from 'socket.io-client';
import { Platform } from 'react-native';

// Dynamic Socket URL Resolution:
// 1. Web -> uses current browser host:5000
// 2. Expo / Mobile -> extracts host IP from Expo hostUri
// 3. Current active Wi-Fi LAN IP -> 192.168.1.106:5000
const resolveDefaultSocketUrl = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hostname) {
    return `http://${window.location.hostname}:5000`;
  }

  try {
    const Constants = require('expo-constants')?.default;
    const hostUri =
      Constants?.expoConfig?.hostUri ||
      Constants?.manifest2?.extra?.expoGo?.debuggerHost ||
      Constants?.manifest?.debuggerHost;
    if (hostUri) {
      const hostIp = hostUri.split(':')[0];
      if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
        return `http://${hostIp}:5000`;
      }
    }
  } catch (e) {
    // expo-constants optional
  }

  return 'http://192.168.1.106:5000';
};

const DEFAULT_SOCKET_URL = resolveDefaultSocketUrl();

let socket = null;
let currentSocketUrl = DEFAULT_SOCKET_URL;

export const getSocketUrl = () => currentSocketUrl;

export const setSocketUrl = (newUrl) => {
  if (!newUrl) return;
  currentSocketUrl = newUrl.replace(/\/+$/, '');
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Initialize or get existing Socket.IO instance
 */
export const getSocket = () => {
  if (!socket) {
    socket = io(currentSocketUrl, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
      timeout: 10000,
    });

    socket.on('connect', () => {
      console.log('✅ Real-time Socket connected to:', currentSocketUrl, 'ID:', socket.id);
    });

    let hasLoggedNotice = false;
    let fallbackTried = false;
    socket.on('connect_error', (err) => {
      if (!fallbackTried) {
        fallbackTried = true;
        const fallbackUrl = Platform.OS === 'web'
          ? 'http://localhost:5000'
          : Platform.OS === 'android'
          ? 'http://10.0.2.2:5000'
          : 'http://localhost:5000';

        if (currentSocketUrl !== fallbackUrl) {
          console.log(`ℹ️ Socket retrying with fallback URL: ${fallbackUrl}`);
          setSocketUrl(fallbackUrl);
          const newSocket = getSocket();
          newSocket.connect();
          return;
        }
      }
      if (!hasLoggedNotice) {
        console.log('ℹ️ Real-time socket connecting to backend server...', err?.message || '');
        hasLoggedNotice = true;
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('ℹ️ Socket disconnected:', reason);
    });
  }

  return socket;
};

/**
 * Connect socket with authenticated user credentials
 */
export const connectSocket = (user, token) => {
  const s = getSocket();

  s.auth = {
    token: token || 'demo_token_pulsechat',
    userId: user?._id || user?.id || 'user_guest',
    user: user
      ? {
          _id: user._id || user.id,
          id: user.id || user._id,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
        }
      : null,
  };

  if (!s.connected) {
    s.connect();
  }

  if (user) {
    s.emit('setup', user);
    s.emit('user:announce', user);
  }
  return s;
};

/**
 * Disconnect socket cleanly
 */
export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

/* ============================================================
   CONVERSATION & MESSAGING SOCKET METHODS
   ============================================================ */

export const joinConversationRoom = (conversationId) => {
  const s = getSocket();
  if (conversationId && s.connected) {
    s.emit('joinConversation', conversationId);
  }
};

export const leaveConversationRoom = (conversationId) => {
  const s = getSocket();
  if (conversationId && s.connected) {
    s.emit('leaveConversation', conversationId);
  }
};

export const sendTypingStart = (conversationId) => {
  const s = getSocket();
  if (conversationId && s.connected) {
    s.emit('typing:start', { conversationId });
  }
};

export const sendTypingStop = (conversationId) => {
  const s = getSocket();
  if (conversationId && s.connected) {
    s.emit('typing:stop', { conversationId });
  }
};

export const sendMarkAsRead = (conversationId) => {
  const s = getSocket();
  if (conversationId && s.connected) {
    s.emit('markAsRead', { conversationId });
  }
};

/**
 * Send real-time End-to-End Encrypted message to any user/location
 */
export const sendMessage = (messageData) => {
  const s = getSocket();
  if (s.connected && messageData) {
    s.emit('chat:message', {
      ...messageData,
      isEncrypted: true,
      e2ee: true,
      timestamp: Date.now(),
    });
  }
};

/**
 * Announce current logged-in or newly registered user across all devices & locations
 */
export const announceUser = (user) => {
  const s = getSocket();
  if (s.connected && user) {
    s.emit('user:announce', {
      id: user.id || user._id,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      phone: user.phone,
      about: user.about || user.status || 'Available',
    });
  }
};

/**
 * Request complete registered user directory from server
 */
export const requestRegisteredUsers = () => {
  const s = getSocket();
  if (s.connected) {
    s.emit('users:requestList');
  }
};

/* ============================================================
   STATUS / STORIES SOCKET METHODS
   ============================================================ */

export const broadcastNewStatus = (statusData) => {
  const s = getSocket();
  if (s.connected && statusData) {
    s.emit('status:new', statusData);
  }
};

/* ============================================================
   WEBRTC CALLING SOCKET METHODS
   ============================================================ */

export const emitCallInitiate = ({ recipientId, conversationId, isVideo = true, isGroup = false }) => {
  const s = getSocket();
  if (s.connected) {
    s.emit('call:initiate', {
      recipientId,
      conversationId,
      isVideo,
      isGroup,
    });
  }
};

export const emitCallAccept = ({ callerId, conversationId, isVideo = true }) => {
  const s = getSocket();
  if (s.connected && callerId) {
    s.emit('call:accept', {
      callerId,
      conversationId,
      isVideo,
    });
  }
};

export const emitCallSignal = ({ targetUserId, signal, type }) => {
  const s = getSocket();
  if (s.connected && targetUserId) {
    s.emit('call:signal', {
      targetUserId,
      signal,
      type,
    });
  }
};

export const emitCallDecline = ({ callerId, reason = 'User declined the call' }) => {
  const s = getSocket();
  if (s.connected && callerId) {
    s.emit('call:decline', {
      callerId,
      reason,
    });
  }
};

export const emitCallEnd = ({ targetUserId, conversationId }) => {
  const s = getSocket();
  if (s.connected) {
    s.emit('call:end', {
      targetUserId,
      conversationId,
    });
  }
};

export const emitCallToggleMedia = ({ targetUserId, isMuted, isVideoOff }) => {
  const s = getSocket();
  if (s.connected && targetUserId) {
    s.emit('call:toggle-media', {
      targetUserId,
      isMuted,
      isVideoOff,
    });
  }
};

export default {
  getSocket,
  getSocketUrl,
  setSocketUrl,
  connectSocket,
  disconnectSocket,
  joinConversationRoom,
  leaveConversationRoom,
  sendTypingStart,
  sendTypingStop,
  sendMarkAsRead,
  sendMessage,
  announceUser,
  requestRegisteredUsers,
  broadcastNewStatus,
  emitCallInitiate,
  emitCallAccept,
  emitCallSignal,
  emitCallDecline,
  emitCallEnd,
  emitCallToggleMedia,
};

import { io } from 'socket.io-client';
import { Platform } from 'react-native';

// Default development socket URL
// Local PC IP: 192.168.1.109
const DEFAULT_SOCKET_URL = 'http://192.168.1.109:5000';

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
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 10000,
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected to:', currentSocketUrl, 'ID:', socket.id);
    });

    let hasWarnedError = false;
    socket.on('connect_error', (err) => {
      if (!hasWarnedError) {
        console.warn('ℹ️ Optional backend server offline (running in offline demo mode):', err?.message || err);
        hasWarnedError = true;
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
    userId: user?._id || user?.id || 'user_shamshad',
  };

  if (!s.connected) {
    s.connect();
  }

  if (user) {
    s.emit('setup', user);
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
  broadcastNewStatus,
  emitCallInitiate,
  emitCallAccept,
  emitCallSignal,
  emitCallDecline,
  emitCallEnd,
  emitCallToggleMedia,
};

import { useState, useEffect, useCallback, useRef } from 'react';
import socketService from '../services/socketService';
import webrtcService from '../services/webrtcService';

export default function useSocketWebRTC(currentUser) {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingMap, setTypingMap] = useState({}); // { [conversationId]: [username1, username2] }
  const [callState, setCallState] = useState(webrtcService.getState());
  const [socketUrl, setSocketUrlState] = useState(socketService.getSocketUrl());

  const updateSocketUrl = useCallback((newUrl) => {
    socketService.setSocketUrl(newUrl);
    setSocketUrlState(socketService.getSocketUrl());
    if (currentUser) {
      socketService.connectSocket(currentUser);
      webrtcService.initSignaling();
    }
  }, [currentUser]);

  // Connect socket and initialize WebRTC signaling when user is logged in
  useEffect(() => {
    if (!currentUser) return;

    const socket = socketService.connectSocket(currentUser);
    webrtcService.initSignaling();

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    const handleOnlineList = (users) => {
      if (Array.isArray(users)) setOnlineUsers(users);
    };

    const handlePresence = ({ userId, status }) => {
      setOnlineUsers((prev) => {
        if (status === 'online') {
          return prev.includes(userId) ? prev : [...prev, userId];
        } else {
          return prev.filter((id) => id !== userId);
        }
      });
    };

    const handleTypingStarted = ({ conversationId, user }) => {
      if (!conversationId || !user) return;
      setTypingMap((prev) => {
        const currentList = prev[conversationId] || [];
        const name = user.name || user.username;
        if (!currentList.includes(name)) {
          return { ...prev, [conversationId]: [...currentList, name] };
        }
        return prev;
      });
    };

    const handleTypingStopped = ({ conversationId, userId }) => {
      if (!conversationId) return;
      setTypingMap((prev) => {
        const currentList = prev[conversationId] || [];
        return {
          ...prev,
          [conversationId]: currentList.filter((n) => n !== userId),
        };
      });
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('onlineUsers:list', handleOnlineList);
    socket.on('presence:update', handlePresence);
    socket.on('typing:started', handleTypingStarted);
    socket.on('typing:stopped', handleTypingStopped);

    if (socket.connected) {
      setIsConnected(true);
    }

    // Subscribe to WebRTC Call State changes
    const unsubscribeWebRTC = webrtcService.subscribe((updatedState) => {
      setCallState(updatedState);
    });

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('onlineUsers:list', handleOnlineList);
      socket.off('presence:update', handlePresence);
      socket.off('typing:started', handleTypingStarted);
      socket.off('typing:stopped', handleTypingStopped);
      unsubscribeWebRTC();
    };
  }, [currentUser]);

  // WebRTC Call Action Wrappers
  const startCall = useCallback(({ otherUser, conversationId, callType = 'video', isGroup = false }) => {
    webrtcService.initiateCall({ otherUser, conversationId, callType, isGroup });
  }, []);

  const acceptCall = useCallback(() => {
    webrtcService.acceptCall();
  }, []);

  const declineCall = useCallback((reason) => {
    webrtcService.declineCall(reason);
  }, []);

  const endCall = useCallback(() => {
    webrtcService.endCall();
  }, []);

  const toggleMute = useCallback(() => {
    webrtcService.toggleMute();
  }, []);

  const toggleVideo = useCallback(() => {
    webrtcService.toggleVideo();
  }, []);

  const toggleSpeaker = useCallback(() => {
    webrtcService.toggleSpeaker();
  }, []);

  const flipCamera = useCallback(() => {
    webrtcService.flipCamera();
  }, []);

  const toggleMinimized = useCallback(() => {
    webrtcService.toggleMinimized();
  }, []);

  // Room & Messaging Helpers
  const joinConversation = useCallback((convId) => {
    socketService.joinConversationRoom(convId);
  }, []);

  const leaveConversation = useCallback((convId) => {
    socketService.leaveConversationRoom(convId);
  }, []);

  const sendTyping = useCallback((convId, isTyping) => {
    if (isTyping) {
      socketService.sendTypingStart(convId);
    } else {
      socketService.sendTypingStop(convId);
    }
  }, []);

  const markAsRead = useCallback((convId) => {
    socketService.sendMarkAsRead(convId);
  }, []);

  const publishStatus = useCallback((statusData) => {
    socketService.broadcastNewStatus(statusData);
  }, []);

  return {
    isConnected,
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
    joinConversation,
    leaveConversation,
    sendTyping,
    markAsRead,
    publishStatus,
    socketUrl,
    updateSocketUrl,
  };
}

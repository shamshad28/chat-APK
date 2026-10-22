import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import ChatHeaderNavbar from '../components/ChatHeaderNavbar';
import MessageBubble from '../components/MessageBubble';
import MessageInputBar from '../components/MessageInputBar';
import AttachmentSheet from '../components/AttachmentSheet';
import EmojiPickerSheet from '../components/EmojiPickerSheet';
import TypingIndicator from '../components/chat/TypingIndicator';
import { INITIAL_MESSAGES } from '../data/mockData';
import cameraService from '../services/cameraService';
import llmService from '../services/llmService';
import socketService from '../services/socketService';
import storageService from '../services/storageService';
import { useTheme } from '../context/ThemeContext';

export default function ChatDetailScreen({
  conversation,
  currentUser,
  onBack,
  onOpenProfile,
  onVideoCall,
  onVoiceCall,
  onMessageSent,
  onDeleteConversation,
  remoteTyping,
  onTypingStart,
  onTypingStop,
  chatWallpaper,
  theme,
  activeCallState,
}) {
  const themeContext = useTheme();
  const activeIsLight = theme ? theme === 'Light' : themeContext.isLight;
  const activeWallpaper =
    chatWallpaper && chatWallpaper !== '#0b141a' && chatWallpaper !== '#efeae2'
      ? chatWallpaper
      : themeContext.chatWallpaper || (activeIsLight ? '#efeae2' : '#0b141a');

  const [messages, setMessages] = useState(
    INITIAL_MESSAGES[conversation.id] || [
      {
        id: 'default_1',
        text: `Chat started with ${conversation.name}. Say hello! 👋`,
        time: 'Just now',
        isSentByMe: false,
        status: 'read',
        senderName: conversation.name,
      },
    ]
  );

  // Load persisted chat history for this conversation
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const stored = await storageService.getMessages(conversation.id);
        if (isMounted && stored && Array.isArray(stored) && stored.length > 0) {
          setMessages(stored);
        }
      } catch (e) {
        console.warn('Error loading messages for conversation:', e);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [conversation?.id]);

  const [isTyping, setIsTyping] = useState(false);
  const [showAttachmentSheet, setShowAttachmentSheet] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  const flatListRef = useRef(null);

  // Auto-scroll when keyboard opens
  useEffect(() => {
    const keyboardEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const showSub = Keyboard.addListener(keyboardEvent, () => {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
    return () => showSub.remove();
  }, []);

  // Real-time socket message synchronization for real users worldwide (E2EE)
  useEffect(() => {
    const socket = socketService.getSocket();
    if (conversation?.id) {
      socketService.joinConversationRoom(conversation.id);
    }

    const handleIncomingMessage = (msg) => {
      if (!msg) return;

      // Ignore self-echoes if sent by current user
      const myId = currentUser?.id || currentUser?._id;
      const senderId = msg.sender?._id || msg.sender?.id || msg.sender;
      if (myId && senderId && senderId === myId) return;

      const msgConvId = msg.conversation?._id || msg.conversation || msg.conversationId;
      const isForThisChat =
        msgConvId === conversation?.id ||
        (msg.sender?.name && msg.sender.name.toLowerCase() === conversation.name?.toLowerCase()) ||
        (msg.recipientId && (msg.recipientId === conversation.id || msg.recipientId === myId));

      if (isForThisChat) {
        const formatted = {
          id: msg.id || msg._id || `msg_${Date.now()}`,
          text: msg.text || msg.content || '',
          time: msg.time || new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSentByMe: false,
          status: 'delivered',
          isEncrypted: true,
          e2ee: true,
          senderName: msg.senderName || msg.sender?.name || conversation.name,
          type: msg.type || 'text',
          imageUri: msg.imageUri || null,
          audioUri: msg.audioUri || null,
          replyTo: msg.replyTo
            ? {
                text: msg.replyTo.content || msg.replyTo.text || 'Message',
                senderName: msg.replyTo.sender?.name || 'Contact',
              }
            : null,
        };

        setMessages((prev) => {
          if (prev.some((m) => m.id === formatted.id)) return prev;
          const updated = [...prev, formatted];
          storageService.saveMessages(conversation.id, updated);
          return updated;
        });

        if (onMessageSent) {
          onMessageSent(conversation.id, formatted);
        }

        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
    };

    socket.on('newMessage', handleIncomingMessage);
    socket.on('chat:message', handleIncomingMessage);
    socket.on('chat:incoming', handleIncomingMessage);

    return () => {
      if (conversation?.id) {
        socketService.leaveConversationRoom(conversation.id);
      }
      socket.off('newMessage', handleIncomingMessage);
      socket.off('chat:message', handleIncomingMessage);
      socket.off('chat:incoming', handleIncomingMessage);
    };
  }, [conversation?.id, conversation?.name, currentUser]);

  // Send new message handler (Live End-to-End Encrypted via Sockets)
  const handleSendMessage = async (msgData) => {
    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSentByMe: true,
      status: 'delivered',
      isEncrypted: true,
      e2ee: true,
      replyTo: replyingTo
        ? { text: replyingTo.text || 'Media', senderName: replyingTo.senderName || 'Contact' }
        : null,
      ...msgData,
    };

    setMessages((prev) => {
      const updated = [...prev, newMsg];
      storageService.saveMessages(conversation.id, updated);
      return updated;
    });
    setReplyingTo(null);
    onMessageSent && onMessageSent(newMsg);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Broadcast live over Socket.IO to other user on any device/location
    socketService.sendMessage({
      id: newMsg.id,
      conversationId: conversation.id,
      recipientId: conversation.userId || conversation.recipientId || conversation.id,
      text: msgData.text || '',
      content: msgData.text || '',
      type: msgData.type || 'text',
      imageUri: msgData.imageUri,
      audioUri: msgData.audioUri,
      sender: {
        id: currentUser?.id || currentUser?._id || 'user_guest',
        _id: currentUser?.id || currentUser?._id || 'user_guest',
        name: currentUser?.name || 'You',
        username: currentUser?.username || 'user',
        avatar: currentUser?.avatar || null,
      },
      senderName: currentUser?.name || 'You',
      replyTo: newMsg.replyTo,
      time: newMsg.time,
    });

    // If and ONLY if conversation is Pulse LLM AI Assistant
    if (conversation.isLLM || conversation.id === 'conv_llm') {
      setIsTyping(true);
      try {
        const prompt = msgData.text || '';
        const aiResponse = await llmService.queryLLM(prompt || 'Hello Pulse LLM!');
        const aiMsg = {
          id: `ai_${Date.now()}`,
          text: aiResponse,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSentByMe: false,
          status: 'read',
          senderName: 'Pulse LLM 🤖',
        };
        setMessages((prev) => {
          const updated = [...prev, aiMsg];
          storageService.saveMessages(conversation.id, updated);
          return updated;
        });
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      } catch (err) {
        console.warn('Pulse LLM query error:', err);
      } finally {
        setIsTyping(false);
      }
      return;
    }
  };

  // Handle Initiating Voice Call from Chat with Live Calling record
  const handleInitiateVoiceCall = () => {
    const callMsg = {
      id: `call_${Date.now()}`,
      type: 'call',
      callType: 'voice',
      callStatus: 'calling',
      duration: 0,
      durationText: 'Calling...',
      text: '📞 Outgoing voice call',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSentByMe: true,
      status: 'delivered',
      senderName: 'You',
    };
    setMessages((prev) => {
      const updated = [...prev, callMsg];
      storageService.saveMessages(conversation.id, updated);
      return updated;
    });
    onMessageSent && onMessageSent(conversation.id, callMsg);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    onVoiceCall && onVoiceCall();
  };

  // Handle Initiating Video Call from Chat with Live Calling record
  const handleInitiateVideoCall = () => {
    const callMsg = {
      id: `call_${Date.now()}`,
      type: 'call',
      callType: 'video',
      callStatus: 'calling',
      duration: 0,
      durationText: 'Calling...',
      text: '📹 Outgoing video call',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSentByMe: true,
      status: 'delivered',
      senderName: 'You',
    };
    setMessages((prev) => {
      const updated = [...prev, callMsg];
      storageService.saveMessages(conversation.id, updated);
      return updated;
    });
    onMessageSent && onMessageSent(conversation.id, callMsg);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    onVideoCall && onVideoCall();
  };

  // Sync live WebRTC call events into the chat's active call bubble
  useEffect(() => {
    if (!activeCallState?.callStatus) return;
    const { callStatus, duration } = activeCallState;

    if (callStatus === 'connected') {
      setMessages((prev) => {
        let changed = false;
        const updated = prev.map((m) => {
          if (m.type === 'call' && m.callStatus === 'calling') {
            changed = true;
            return {
              ...m,
              callStatus: 'connected',
              durationText: 'Ongoing call',
              text: `${m.callType === 'video' ? '📹' : '📞'} Ongoing ${m.callType} call`,
            };
          }
          return m;
        });
        if (changed) {
          storageService.saveMessages(conversation.id, updated);
        }
        return updated;
      });
    } else if (callStatus === 'ended') {
      setMessages((prev) => {
        let changed = false;
        let lastEndedCall = null;
        const updated = prev.map((m) => {
          if (m.type === 'call' && (m.callStatus === 'calling' || m.callStatus === 'connected')) {
            changed = true;
            const dur = duration || 0;
            const durText =
              dur > 0
                ? dur >= 60
                  ? `${Math.floor(dur / 60)}m ${dur % 60}s`
                  : `${dur}s`
                : (m.isSentByMe ? 'Cancelled' : 'Missed');
            const updatedCall = {
              ...m,
              callStatus: 'ended',
              duration: dur,
              durationText: durText,
              text: `${m.callType === 'video' ? '📹 Video' : '📞 Voice'} call (${durText})`,
            };
            lastEndedCall = updatedCall;
            return updatedCall;
          }
          return m;
        });
        if (changed) {
          storageService.saveMessages(conversation.id, updated);
          if (lastEndedCall && onMessageSent) {
            onMessageSent(conversation.id, lastEndedCall);
          }
        }
        return updated;
      });
    }
  }, [activeCallState?.callStatus, activeCallState?.duration, conversation?.id]);

  // Reactions handler
  const handleReact = useCallback((messageId, emoji) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const existing = m.reactions || [];
        const isAlreadyAdded = existing.some(
          (r) => (typeof r === 'string' ? r : r.emoji) === emoji
        );
        let updated;
        if (isAlreadyAdded) {
          updated = existing.filter(
            (r) => (typeof r === 'string' ? r : r.emoji) !== emoji
          );
        } else {
          updated = [...existing, { emoji, userId: 'current_user' }];
        }
        return { ...m, reactions: updated };
      })
    );
  }, []);

  // Delete message confirmation handler
  const confirmDeleteMessage = useCallback((messageId) => {
    Alert.alert(
      'Delete message?',
      'Are you sure you want to delete this message?',
      [
        {
          text: 'Delete for me 🗑️',
          style: 'destructive',
          onPress: () => {
            setMessages((prev) => {
              const updated = prev.filter((m) => m.id !== messageId);
              storageService.saveMessages(conversation.id, updated);
              return updated;
            });
          },
        },
        {
          text: 'Delete for everyone',
          style: 'destructive',
          onPress: () => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === messageId
                  ? {
                      ...m,
                      text: '🚫 This message was deleted',
                      type: 'text',
                      isDeleted: true,
                      imageUri: null,
                      audioDuration: null,
                    }
                  : m
              )
            );
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, []);

  // Handle Attachment options
  const handleSelectOption = async (option) => {
    setShowAttachmentSheet(false);
    if (option === 'camera') {
      const photoUri = await cameraService.capturePhoto();
      if (photoUri) {
        handleSendMessage({
          type: 'image',
          imageUri: photoUri,
          caption: 'Photo captured with Camera',
        });
      }
    } else if (option === 'gallery') {
      const photoUri = await cameraService.pickFromGallery();
      if (photoUri) {
        handleSendMessage({
          type: 'image',
          imageUri: photoUri,
          caption: 'Shared from Gallery',
        });
      }
    } else if (option === 'document') {
      Alert.alert('Document Attachment', 'Selected document: Project_Specs_v2.pdf');
      handleSendMessage({
        type: 'text',
        text: '📄 Project_Specs_v2.pdf (1.4 MB)',
      });
    } else if (option === 'contact') {
      Alert.alert('Share Contact', 'Shared Contact card.');
      handleSendMessage({
        type: 'text',
        text: '👤 Contact Card: Alex Developer (+1 555-0199)',
      });
    }
  };

  const handleMessageLongPress = useCallback((message) => {
    Alert.alert(
      'Message Options',
      `"${(message.text || 'Media message').substring(0, 40)}..."`,
      [
        {
          text: 'Reply ↩️',
          onPress: () => setReplyingTo(message),
        },
        {
          text: 'Add Reaction ⭐',
          onPress: () => handleReact(message.id, '❤️'),
        },
        {
          text: 'Delete Message 🗑️',
          style: 'destructive',
          onPress: () => confirmDeleteMessage(message.id),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, [handleReact, confirmDeleteMessage]);

  const messageKeyExtractor = useCallback((item) => item.id, []);

  const renderMessageItem = useCallback(
    ({ item }) => (
      <MessageBubble
        message={item}
        onPress={() => handleMessageLongPress(item)}
        onLongPress={handleMessageLongPress}
        onReact={handleReact}
        onReply={(msg) => setReplyingTo(msg)}
        onDelete={confirmDeleteMessage}
        onOpenCustomReaction={() => setShowEmojiPicker(true)}
        onCallBack={(type) => (type === 'video' ? handleInitiateVideoCall() : handleInitiateVoiceCall())}
        isGroup={conversation.type === 'group'}
        isLight={activeIsLight}
      />
    ),
    [handleMessageLongPress, handleReact, confirmDeleteMessage, conversation.type, activeIsLight]
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: activeWallpaper }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 })}
    >
      {/* Subtle Glassmorphic Ambient Sheen Overlay */}
      <View
        style={[
          styles.wallpaperGlassOverlay,
          activeIsLight && styles.wallpaperGlassOverlayLight,
        ]}
        pointerEvents="none"
      />

      {/* Top Header Navbar */}
      <ChatHeaderNavbar
        title={conversation.name}
        subtitle={
          remoteTyping
            ? `${remoteTyping} is typing...`
            : isTyping
            ? 'typing...'
            : conversation.isOnline
            ? 'online'
            : (conversation.lastSeen || 'offline')
        }
        avatarUrl={conversation.avatar}
        isOnline={Boolean(conversation.isOnline)}
        isTyping={Boolean(remoteTyping) || isTyping}
        isLight={activeIsLight}
        onBack={onBack}
        onProfilePress={onOpenProfile}
        onVideoCall={handleInitiateVideoCall}
        onVoiceCall={handleInitiateVoiceCall}
        onMenuPress={() =>
          Alert.alert(
            conversation.name,
            'Choose an option:',
            [
              {
                text: `Reply from ${conversation.name}`,
                onPress: () => {
                  setIsTyping(true);
                  setTimeout(() => {
                    const userReplies = [
                      `Hey! Got your message! 👍`,
                      `Sure, let me check and get back to you!`,
                      `Thanks for reaching out! Everything is set.`,
                      `Sounds great! Let's connect soon.`,
                    ];
                    const randomReply = userReplies[Math.floor(Math.random() * userReplies.length)];
                    const replyMsg = {
                      id: `reply_${Date.now()}`,
                      text: randomReply,
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      isSentByMe: false,
                      status: 'read',
                      senderName: conversation.name,
                    };
                    setMessages((prev) => [...prev, replyMsg]);
                    setIsTyping(false);
                    onMessageSent && onMessageSent(replyMsg);
                  }, 800);
                },
              },
              {
                text: conversation.isOnline ? 'Set to Offline (Test)' : 'Set to Online (Test)',
                onPress: () => {
                  conversation.isOnline = !conversation.isOnline;
                  conversation.lastSeen = conversation.isOnline ? 'online' : 'last seen today at 5:10 PM';
                  setMessages((prev) => [...prev]);
                },
              },
              { text: 'View Contact', onPress: onOpenProfile },
              {
                text: 'Delete Chat 🗑️',
                style: 'destructive',
                onPress: () => {
                  Alert.alert(
                    'Delete Chat?',
                    `Are you sure you want to delete the chat with ${conversation.name} and all messages?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => {
                          onDeleteConversation && onDeleteConversation(conversation.id);
                          onBack && onBack();
                        },
                      },
                    ]
                  );
                },
              },
              {
                text: 'Clear Messages 🧹',
                style: 'destructive',
                onPress: () => {
                  setMessages([]);
                  storageService.saveMessages(conversation.id, []);
                },
              },
              { text: 'Cancel', style: 'cancel' },
            ]
          )
        }
      />

      <View style={[styles.chatArea, { backgroundColor: activeWallpaper }]}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={messageKeyExtractor}
          renderItem={renderMessageItem}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={11}
          removeClippedSubviews={Platform.OS !== 'web'}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          onLayout={() => {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 50);
          }}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }}
          ListHeaderComponent={
            <>
              {/* Frosted Glass Encryption Banner */}
              <View style={[styles.encryptionPill, activeIsLight && styles.encryptionPillLight]}>
                <Ionicons
                  name="lock-closed"
                  size={12}
                  color={activeIsLight ? '#008069' : '#ffd279'}
                />
                <Text
                  style={[
                    styles.encryptionText,
                    activeIsLight && styles.encryptionTextLight,
                  ]}
                >
                  Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
                </Text>
              </View>

              {/* Frosted Glass Date separator pill */}
              <View style={styles.datePillContainer}>
                <View style={[styles.datePill, activeIsLight && styles.datePillLight]}>
                  <Text style={[styles.dateText, activeIsLight && styles.dateTextLight]}>
                    TODAY
                  </Text>
                </View>
              </View>
            </>
          }
          contentContainerStyle={[
            styles.messagesList,
            { flexGrow: 1, justifyContent: 'flex-end' },
          ]}
        />

        {/* Live Typing Indicator */}
        {Boolean(isTyping || remoteTyping) && (
          <TypingIndicator
            userName={remoteTyping || (conversation.isLLM ? 'Pulse LLM' : conversation.name)}
          />
        )}

        {/* Message Input Bar with isLight prop */}
        <MessageInputBar
          onSendMessage={handleSendMessage}
          onOpenAttachment={() => setShowAttachmentSheet(true)}
          onToggleEmoji={() => setShowEmojiPicker(!showEmojiPicker)}
          onQuickCamera={() => handleSelectOption('camera')}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          isLight={activeIsLight}
          onFocus={() => {
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 150);
          }}
        />

        {/* Quick Emoji Picker Drawer */}
        <EmojiPickerSheet
          visible={showEmojiPicker}
          onSelectEmoji={(emoji) => {
            handleSendMessage({ text: emoji, type: 'text' });
            setShowEmojiPicker(false);
          }}
        />
      </View>

      {/* Attachment Options Modal */}
      <AttachmentSheet
        visible={showAttachmentSheet}
        onClose={() => setShowAttachmentSheet(false)}
        onSelectOption={handleSelectOption}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  wallpaperGlassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    zIndex: 0,
  },
  wallpaperGlassOverlayLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  chatArea: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 6,
    paddingTop: 12,
    paddingBottom: 8,
  },
  encryptionPill: {
    backgroundColor: 'rgba(24, 34, 41, 0.78)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: 'center',
    maxWidth: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(12px)' } : {}),
  },
  encryptionPillLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  encryptionText: {
    color: '#ffd279',
    fontSize: 11,
    textAlign: 'center',
    flex: 1,
    lineHeight: 15,
  },
  encryptionTextLight: {
    color: '#54656f',
  },
  datePillContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  datePill: {
    backgroundColor: 'rgba(24, 34, 41, 0.82)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(10px)' } : {}),
  },
  datePillLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  dateText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  dateTextLight: {
    color: '#54656f',
  },
});

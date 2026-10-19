import React, { useState, useRef, useEffect } from 'react';
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

export default function ChatDetailScreen({
  conversation,
  onBack,
  onOpenProfile,
  onVideoCall,
  onVoiceCall,
  remoteTyping,
  onTypingStart,
  onTypingStop,
}) {
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
    return () => {
      showSub.remove();
    };
  }, []);

  // Send message handler
  const handleSendMessage = (msgData) => {
    const newMsg = {
      id: `msg_${Date.now()}`,
      time: 'Just now',
      isSentByMe: true,
      status: 'delivered',
      senderName: 'Me',
      ...msgData,
    };

    setMessages((prev) => [...prev, newMsg]);
    setReplyingTo(null);

    const isLLMCall =
      conversation.isLLM ||
      conversation.isMetaAI ||
      (msgData.text && msgData.text.toLowerCase().includes('@llm'));

    if (isLLMCall) {
      setIsTyping(true);
      (async () => {
        const prompt = msgData.text ? msgData.text.replace(/@llm/gi, '').trim() : '';
        const aiResponse = await llmService.queryLLM(prompt || 'Hello Pulse LLM!');
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `reply_${Date.now()}`,
            text: aiResponse,
            time: 'Just now',
            isSentByMe: false,
            status: 'read',
            senderName: 'Pulse LLM 🤖',
          },
        ]);
      })();
      return;
    }

    // Friend responding after 1.5 seconds!
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `reply_${Date.now()}`,
          text: `Got it! Sounds great 👍`,
          time: 'Just now',
          isSentByMe: false,
          status: 'read',
          senderName: conversation.name,
        },
      ]);
    }, 1500);
  };

  const handleSelectOption = async (optionId) => {
    if (optionId === 'llm') {
      setIsTyping(true);
      const aiResponse = await llmService.queryLLM('Summarize and provide assistance');
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `reply_${Date.now()}`,
          text: aiResponse,
          time: 'Just now',
          isSentByMe: false,
          status: 'read',
          senderName: 'Pulse LLM 🤖',
        },
      ]);
      return;
    }

    if (optionId === 'camera') {
      const photoUri = await cameraService.capturePhoto();
      if (photoUri) {
        handleSendMessage({
          type: 'image',
          imageUri: photoUri,
          caption: 'Photo captured from camera 📸',
        });
      }
    } else if (optionId === 'gallery') {
      const photoUri = await cameraService.pickImageFromGallery();
      if (photoUri) {
        handleSendMessage({
          type: 'image',
          imageUri: photoUri,
          caption: 'Photo from gallery 🖼️',
        });
      }
    } else if (optionId === 'audio') {
      handleSendMessage({
        type: 'audio',
        audioDuration: '0:35',
      });
    } else {
      handleSendMessage({
        text: `Shared a ${optionId} with the chat.`,
        type: 'text',
      });
    }
  };

  const handleMessageLongPress = (message) => {
    Alert.alert(
      'Message Options',
      'Choose an action:',
      [
        { text: 'React with ❤️', onPress: () => handleReact(message.id, '❤️') },
        { text: 'React with 👍', onPress: () => handleReact(message.id, '👍') },
        { text: 'Reply', onPress: () => setReplyingTo(message) },
        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteMessage(message.id) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleReact = (msgId, emoji) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, reaction: emoji } : m))
    );
  };

  const handleDeleteMessage = (msgId) => {
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 })}
    >
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
        onBack={onBack}
        onProfilePress={onOpenProfile}
        onVideoCall={onVideoCall}
        onVoiceCall={onVoiceCall}
        onMenuPress={() =>
          Alert.alert(
            conversation.name,
            'Choose an option:',
            [
              {
                text: conversation.isOnline ? 'Set to Offline (Test)' : 'Set to Online (Test)',
                onPress: () => {
                  conversation.isOnline = !conversation.isOnline;
                  conversation.lastSeen = conversation.isOnline ? 'online' : 'last seen today at 5:10 PM';
                  setMessages((prev) => [...prev]);
                },
              },
              { text: 'View Contact', onPress: onOpenProfile },
              { text: 'Clear Chat', style: 'destructive', onPress: () => setMessages([]) },
              { text: 'Cancel', style: 'cancel' },
            ]
          )
        }
      />

      <View style={styles.chatArea}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
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
              {/* Encryption Banner */}
              <View style={styles.encryptionPill}>
                <Ionicons name="lock-closed" size={12} color="#ffd279" />
                <Text style={styles.encryptionText}>
                  Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
                </Text>
              </View>

              {/* Date separator pill */}
              <View style={styles.datePillContainer}>
                <View style={styles.datePill}>
                  <Text style={styles.dateText}>TODAY</Text>
                </View>
              </View>
            </>
          }
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              onLongPress={handleMessageLongPress}
              onReact={handleReact}
              onReply={(msg) => setReplyingTo(msg)}
              onDelete={handleDeleteMessage}
              onOpenCustomReaction={() => setShowEmojiPicker(true)}
              isGroup={conversation.type === 'group'}
            />
          )}
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

        {/* Message Input Bar */}
        <MessageInputBar
          onSendMessage={handleSendMessage}
          onOpenAttachment={() => setShowAttachmentSheet(true)}
          onToggleEmoji={() => setShowEmojiPicker(!showEmojiPicker)}
          onQuickCamera={() => handleSelectOption('camera')}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
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
    backgroundColor: COLORS.chatBackground,
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
    backgroundColor: '#182229',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: 'center',
    maxWidth: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#222e35',
  },
  encryptionText: {
    color: '#ffd279',
    fontSize: 11,
    textAlign: 'center',
    flex: 1,
    lineHeight: 15,
  },
  datePillContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  datePill: {
    backgroundColor: '#182229',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222e35',
  },
  dateText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
});

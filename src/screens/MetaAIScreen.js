import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import llmService from '../services/llmService';

const SUGGESTIONS = [
  { id: '1', icon: 'sparkles', label: 'Ask anything', prompt: 'Tell me something fascinating about space and time.' },
  { id: '2', icon: 'code-slash', label: 'Write Code', prompt: 'Write a React Native frosted glassmorphic card component.' },
  { id: '3', icon: 'chatbox-ellipses', label: 'Draft Message', prompt: 'Draft a polite follow-up message for a project update.' },
  { id: '4', icon: 'language', label: 'Translate', prompt: 'Translate "Welcome to PulseChat, enjoy seamless messaging" into French, Spanish, and Japanese.' },
];

export default function MetaAIScreen({ currentUser, theme = 'dark' }) {
  const isLight = theme === 'light';
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I am **Meta AI** powered by LLaMA 3.3. How can I assist you today? You can ask questions, brainstorm ideas, write code, or draft messages.",
      time: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef(null);

  const handleSend = async (textToSend) => {
    const prompt = (textToSend || inputText).trim();
    if (!prompt || isTyping) return;

    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: prompt,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await llmService.queryLLM(prompt);
      const aiMsg = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        id: `err_${Date.now()}`,
        sender: 'ai',
        text: 'Sorry, I encountered an issue processing your request. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, isLight && styles.containerLight]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Ambient Glass Glow Orbs */}
      <View style={styles.ambientOrbPurple} />
      <View style={styles.ambientOrbCyan} />

      {/* Header Banner */}
      <View style={[styles.headerBanner, isLight && styles.headerBannerLight]}>
        <View style={styles.headerLeft}>
          <View style={styles.metaAiAura}>
            <View style={styles.metaAiRing}>
              <View style={styles.metaAiCenterDot} />
            </View>
          </View>
          <View style={styles.headerMeta}>
            <View style={styles.headerTitleRow}>
              <Text style={[styles.headerTitle, isLight && styles.headerTitleLight]}>Meta AI</Text>
              <View style={styles.betaBadge}>
                <Text style={styles.betaBadgeText}>LLaMA 3.3</Text>
              </View>
            </View>
            <Text style={styles.headerSubtitle}>Ready to assist • Autonomous & Private</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.clearBtn}
          onPress={() =>
            setMessages([
              {
                id: `welcome_${Date.now()}`,
                sender: 'ai',
                text: "Chat cleared! What's on your mind now?",
                time: 'Just now',
              },
            ])
          }
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={17} color={isLight ? '#54656f' : '#8696a0'} />
        </TouchableOpacity>
      </View>

      {/* Messages Scroll Area */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Suggestion Starter Pills */}
        {messages.length <= 2 && (
          <View style={styles.suggestionsContainer}>
            <Text style={[styles.suggestionsLabel, isLight && styles.suggestionsLabelLight]}>
              Suggested prompts to try:
            </Text>
            <View style={styles.suggestionGrid}>
              {SUGGESTIONS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.suggestionCard, isLight && styles.suggestionCardLight]}
                  onPress={() => handleSend(item.prompt)}
                  activeOpacity={0.75}
                >
                  <View style={styles.suggestionIconWrapper}>
                    <Ionicons name={item.icon} size={16} color="#c084fc" />
                  </View>
                  <Text style={[styles.suggestionCardTitle, isLight && styles.suggestionCardTitleLight]}>
                    {item.label}
                  </Text>
                  <Text style={styles.suggestionCardPrompt} numberOfLines={2}>
                    {item.prompt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Chat Feed */}
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                isUser ? styles.messageRowUser : styles.messageRowAi,
              ]}
            >
              {!isUser && (
                <View style={styles.aiAvatarSmall}>
                  <View style={styles.aiAvatarDot} />
                </View>
              )}
              <View
                style={[
                  styles.bubble,
                  isUser
                    ? [styles.userBubble, isLight && styles.userBubbleLight]
                    : [styles.aiBubble, isLight && styles.aiBubbleLight],
                ]}
              >
                {!isUser && (
                  <View style={styles.bubbleGlassSheen} />
                )}
                <Text
                  style={[
                    styles.bubbleText,
                    isUser
                      ? styles.userBubbleText
                      : [styles.aiBubbleText, isLight && styles.aiBubbleTextLight],
                  ]}
                  selectable
                >
                  {msg.text}
                </Text>
                <Text
                  style={[
                    styles.bubbleTime,
                    isUser ? styles.userBubbleTime : styles.aiBubbleTime,
                  ]}
                >
                  {msg.time}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Typing Pulse */}
        {isTyping && (
          <View style={[styles.messageRow, styles.messageRowAi]}>
            <View style={styles.aiAvatarSmall}>
              <View style={styles.aiAvatarDot} />
            </View>
            <View style={[styles.bubble, styles.aiBubble, isLight && styles.aiBubbleLight, styles.typingBubble]}>
              <ActivityIndicator size="small" color="#c084fc" />
              <Text style={styles.typingText}>Meta AI is thinking...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating Glass Input Bar */}
      <View style={[styles.inputBarWrapper, isLight && styles.inputBarWrapperLight]}>
        <View style={[styles.glassInputContainer, isLight && styles.glassInputContainerLight]}>
          <View style={styles.inputSheen} />
          <Ionicons name="sparkles" size={18} color="#c084fc" style={styles.inputLeadingIcon} />
          <TextInput
            style={[styles.textInput, isLight && styles.textInputLight]}
            placeholder="Ask Meta AI anything..."
            placeholderTextColor={isLight ? '#8696a0' : '#8696a0'}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
            multiline={false}
          />
          {inputText.trim().length > 0 ? (
            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => handleSend()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-up" size={18} color="#ffffff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.micButton}
              onPress={() => handleSend('Tell me an inspiring thought for today!')}
              activeOpacity={0.7}
            >
              <Feather name="mic" size={18} color={isLight ? '#54656f' : '#8696a0'} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b141a',
    position: 'relative',
    overflow: 'hidden',
  },
  containerLight: {
    backgroundColor: '#f0f2f5',
  },

  // Ambient Glow Orbs
  ambientOrbPurple: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    ...(Platform.OS === 'web' ? { filter: 'blur(60px)' } : {}),
  },
  ambientOrbCyan: {
    position: 'absolute',
    top: 120,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    ...(Platform.OS === 'web' ? { filter: 'blur(50px)' } : {}),
  },

  // Header Banner
  headerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(17, 27, 33, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(16px)' } : {}),
  },
  headerBannerLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaAiAura: {
    padding: 2,
    borderRadius: 18,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)',
  },
  metaAiRing: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2.5,
    borderColor: '#c084fc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaAiCenterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38bdf8',
  },
  headerMeta: {
    justifyContent: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#e9edef',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerTitleLight: {
    color: '#111b21',
  },
  betaBadge: {
    backgroundColor: 'rgba(168, 85, 247, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.4)',
  },
  betaBadgeText: {
    color: '#c084fc',
    fontSize: 10,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#8696a0',
    fontSize: 11,
    marginTop: 2,
  },
  clearBtn: {
    padding: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },

  // Scroll Area
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },

  // Suggestions
  suggestionsContainer: {
    marginBottom: 20,
  },
  suggestionsLabel: {
    color: '#8696a0',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestionsLabelLight: {
    color: '#667781',
  },
  suggestionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  suggestionCard: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: 'rgba(20, 31, 38, 0.72)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    padding: 12,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(12px)' } : {}),
  },
  suggestionCardLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  suggestionIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  suggestionCardTitle: {
    color: '#e9edef',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  suggestionCardTitleLight: {
    color: '#111b21',
  },
  suggestionCardPrompt: {
    color: '#8696a0',
    fontSize: 11,
    lineHeight: 15,
  },

  // Message Rows
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 14,
    gap: 8,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAi: {
    justifyContent: 'flex-start',
  },
  aiAvatarSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#c084fc',
    backgroundColor: '#1f2c34',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  aiAvatarDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#38bdf8',
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    position: 'relative',
    overflow: 'hidden',
  },
  bubbleGlassSheen: {
    position: 'absolute',
    top: 1,
    left: '10%',
    right: '10%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  userBubble: {
    backgroundColor: '#005c4b',
    borderBottomRightRadius: 4,
  },
  userBubbleLight: {
    backgroundColor: '#d9fdd3',
  },
  userBubbleText: {
    color: '#e9edef',
    fontSize: 14,
    lineHeight: 20,
  },
  userBubbleTime: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  aiBubble: {
    backgroundColor: 'rgba(20, 31, 38, 0.78)',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.35)',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(14px)' } : {}),
  },
  aiBubbleLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: 'rgba(168, 85, 247, 0.25)',
  },
  aiBubbleText: {
    color: '#e9edef',
    fontSize: 14,
    lineHeight: 21,
  },
  aiBubbleTextLight: {
    color: '#111b21',
  },
  aiBubbleTime: {
    color: '#8696a0',
    fontSize: 10,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  typingText: {
    color: '#c084fc',
    fontSize: 13,
    fontStyle: 'italic',
  },

  // Floating Input Bar
  inputBarWrapper: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  inputBarWrapperLight: {},
  glassInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 31, 38, 0.85)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(18px)' } : {}),
  },
  glassInputContainerLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  inputSheen: {
    position: 'absolute',
    top: 2,
    left: '20%',
    right: '20%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  inputLeadingIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    color: '#e9edef',
    fontSize: 14,
    paddingVertical: 8,
  },
  textInputLight: {
    color: '#111b21',
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#a855f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  micButton: {
    padding: 6,
    marginLeft: 4,
  },
});

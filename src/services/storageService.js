import AsyncStorage from '@react-native-async-storage/async-storage';
import { CURRENT_USER, INITIAL_CONVERSATIONS, CONTACTS_LIST } from '../data/mockData';

const KEYS = {
  CURRENT_USER: '@pulsechat_current_user',
  REGISTERED_USERS: '@pulsechat_registered_users',
  CONVERSATIONS: '@pulsechat_conversations',
  CONTACTS: '@pulsechat_contacts',
  MESSAGES: '@pulsechat_messages',
};

export const INITIAL_REGISTERED_USERS = [];


class StorageService {
  /**
   * Save logged in user session
   */
  async setCurrentUser(user) {
    try {
      if (!user) {
        await AsyncStorage.removeItem(KEYS.CURRENT_USER);
      } else {
        await AsyncStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
      }
    } catch (e) {
      console.warn('StorageService setCurrentUser error:', e);
    }
  }

  /**
   * Retrieve active user session
   */
  async getCurrentUser() {
    try {
      const data = await AsyncStorage.getItem(KEYS.CURRENT_USER);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && (parsed.id === 'user_priya' || parsed.id === 'user_shamshad_mock')) {
          await this.setCurrentUser(null);
          return null;
        }
        return parsed;
      }
      return null;
    } catch (e) {
      console.warn('StorageService getCurrentUser error:', e);
      return null;
    }
  }

  /**
   * Save registered users list
   */
  async setRegisteredUsers(users) {
    try {
      await AsyncStorage.setItem(KEYS.REGISTERED_USERS, JSON.stringify(users));
    } catch (e) {
      console.warn('StorageService setRegisteredUsers error:', e);
    }
  }

  /**
   * Retrieve registered users list
   */
  async getRegisteredUsers() {
    try {
      const data = await AsyncStorage.getItem(KEYS.REGISTERED_USERS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          // Clean out any hardcoded legacy mock users
          const cleaned = parsed.filter(
            (u) => u && u.id !== 'user_priya' && u.id !== 'user_shamshad_mock'
          );
          if (cleaned.length !== parsed.length) {
            await this.setRegisteredUsers(cleaned);
          }
          return cleaned;
        }
      }
      return [];
    } catch (e) {
      console.warn('StorageService getRegisteredUsers error:', e);
      return [];
    }
  }

  /**
   * Add a newly registered user
   */
  async addRegisteredUser(newUser) {
    try {
      const users = await this.getRegisteredUsers();
      const existingIdx = users.findIndex(
        (u) =>
          u.id === newUser.id ||
          (u.email && u.email.toLowerCase() === newUser.email?.toLowerCase()) ||
          (u.username && u.username.toLowerCase() === newUser.username?.toLowerCase())
      );
      let updated;
      if (existingIdx >= 0) {
        updated = [...users];
        updated[existingIdx] = { ...updated[existingIdx], ...newUser };
      } else {
        updated = [...users, newUser];
      }
      await this.setRegisteredUsers(updated);
      return updated;
    } catch (e) {
      console.warn('StorageService addRegisteredUser error:', e);
      return [newUser];
    }
  }

  /**
   * Save user conversations
   */
  async setConversations(conversations) {
    try {
      await AsyncStorage.setItem(KEYS.CONVERSATIONS, JSON.stringify(conversations));
    } catch (e) {
      console.warn('StorageService setConversations error:', e);
    }
  }

  /**
   * Retrieve user conversations
   */
  async getConversations() {
    try {
      const data = await AsyncStorage.getItem(KEYS.CONVERSATIONS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          // Clean out any hardcoded legacy chats like priya mali or shamshad khan
          const cleaned = parsed.filter(
            (c) =>
              c &&
              c.id !== 'conv_priya' &&
              !c.name?.toLowerCase().includes('priya mali') &&
              !c.name?.toLowerCase().includes('shamshad')
          );
          if (cleaned.length !== parsed.length) {
            await this.setConversations(cleaned);
          }
          return cleaned;
        }
      }
      return [];
    } catch (e) {
      console.warn('StorageService getConversations error:', e);
      return [];
    }
  }

  /**
   * Save messages for a specific conversation
   */
  async saveMessages(conversationId, messages) {
    try {
      if (!conversationId) return;
      const key = `${KEYS.MESSAGES}_${conversationId}`;
      await AsyncStorage.setItem(key, JSON.stringify(messages));
    } catch (e) {
      console.warn('StorageService saveMessages error:', e);
    }
  }

  /**
   * Retrieve messages for a specific conversation
   */
  async getMessages(conversationId) {
    try {
      if (!conversationId) return null;
      const key = `${KEYS.MESSAGES}_${conversationId}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('StorageService getMessages error:', e);
      return null;
    }
  }

  /**
   * Append a single message to a conversation
   */
  async appendMessage(conversationId, message) {
    try {
      if (!conversationId || !message) return;
      const existing = (await this.getMessages(conversationId)) || [];
      const updated = [...existing, message];
      await this.saveMessages(conversationId, updated);
      return updated;
    } catch (e) {
      console.warn('StorageService appendMessage error:', e);
    }
  }

  /**
   * Save user configuration settings (Privacy, Chats, Notifications)
   */
  async saveSettings(settings) {
    try {
      await AsyncStorage.setItem('@pulsechat_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('StorageService saveSettings error:', e);
    }
  }

  /**
   * Retrieve user configuration settings
   */
  async getSettings() {
    try {
      const data = await AsyncStorage.getItem('@pulsechat_settings');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('StorageService getSettings error:', e);
      return null;
    }
  }

  /**
   * Clear storage on logout (keeps registered users so they can log back in)
   */
  async clearSession() {
    try {
      await AsyncStorage.removeItem(KEYS.CURRENT_USER);
    } catch (e) {
      console.warn('StorageService clearSession error:', e);
    }
  }
}

const storageService = new StorageService();
export default storageService;

import { Platform } from 'react-native';

/**
 * Push Notification and In-App Toast Notification Service
 */

class NotificationService {
  constructor() {
    this.listeners = new Set();
    this.hasPermission = false;
  }

  /**
   * Subscribe component to in-app notification toasts
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(notification) {
    this.listeners.forEach((listener) => {
      try {
        listener(notification);
      } catch (e) {
        console.warn('Notification listener error:', e);
      }
    });
  }

  /**
   * Request Notification Permissions (Graceful for Expo Go & native)
   */
  async requestPermissions() {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          this.hasPermission = true;
          return true;
        }
        if (Notification.permission !== 'denied') {
          const res = await Notification.requestPermission();
          this.hasPermission = res === 'granted';
          return this.hasPermission;
        }
      }
      return false;
    }

    // On Native (Expo Go / Dev Build)
    this.hasPermission = true;
    return true;
  }

  /**
   * Trigger an in-app banner notification for incoming chat messages
   */
  notifyMessage({ senderName, text, avatar, conversationId }) {
    const notif = {
      id: `notif_${Date.now()}`,
      title: senderName || 'New Message',
      body: text || 'Sent a media attachment',
      avatar: avatar || null,
      conversationId: conversationId || null,
      type: 'message',
      timestamp: Date.now(),
    };

    this.notify(notif);
    this.showWebNotification(notif.title, notif.body);
    return notif;
  }

  /**
   * Trigger a call notification
   */
  notifyCall({ callerName, callType = 'video', conversationId, avatar }) {
    const notif = {
      id: `call_notif_${Date.now()}`,
      title: `Incoming ${callType === 'video' ? 'Video' : 'Voice'} Call`,
      body: `${callerName} is calling you...`,
      avatar: avatar || null,
      conversationId: conversationId || null,
      type: 'call',
      timestamp: Date.now(),
    };

    this.notify(notif);
    this.showWebNotification(notif.title, notif.body);
    return notif;
  }

  /**
   * Web desktop notification fallback
   */
  showWebNotification(title, body) {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          const n = new Notification(title, {
            body,
            icon: '/icon.png',
            silent: false,
          });
          setTimeout(() => n.close(), 4000);
        } catch (e) {
          // Ignore
        }
      }
    }
  }
}

const notificationService = new NotificationService();
export default notificationService;

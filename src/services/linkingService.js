import { Linking } from 'react-native';

/**
 * Deep Linking Service for PulseChat
 * Supports URLs formatted as pulsechat://<route>/<param>?<query>
 */

export const SCHEME = 'pulsechat';

/**
 * Parses incoming URL into route and parameters
 * Examples:
 *   pulsechat://chat/conv_123
 *   pulsechat://call/alex_morgan?type=video
 *   pulsechat://tab/updates
 *   pulsechat://profile
 */
export function parseDeepLink(url) {
  if (!url || typeof url !== 'string') return null;

  try {
    const cleanUrl = url.replace(/^[a-zA-Z0-9]+:\/\//, ''); // Strip scheme://
    const [pathPart, queryPart] = cleanUrl.split('?');
    const segments = pathPart.split('/').filter(Boolean);

    const queryParams = {};
    if (queryPart) {
      queryPart.split('&').forEach((pair) => {
        const [k, v] = pair.split('=');
        if (k) queryParams[decodeURIComponent(k)] = decodeURIComponent(v || '');
      });
    }

    const route = segments[0] || 'main';
    const id = segments[1] || queryParams.id || null;

    return {
      rawUrl: url,
      route, // 'chat' | 'call' | 'tab' | 'profile' | 'createGroup'
      id,
      queryParams,
    };
  } catch (error) {
    console.warn('Failed to parse deep link:', url, error);
    return null;
  }
}

/**
 * Helper generators for deep links
 */
export function createChatDeepLink(conversationId) {
  return `${SCHEME}://chat/${conversationId}`;
}

export function createCallDeepLink(contactName, callType = 'video') {
  return `${SCHEME}://call/${encodeURIComponent(contactName)}?type=${callType}`;
}

export function createTabDeepLink(tabName) {
  return `${SCHEME}://tab/${tabName}`;
}

/**
 * Listen for deep links during app lifetime and on initial launch
 */
export function initDeepLinking(onRoute) {
  // 1. Handle app launched from cold start via deep link
  Linking.getInitialURL()
    .then((url) => {
      if (url) {
        const parsed = parseDeepLink(url);
        if (parsed && onRoute) onRoute(parsed);
      }
    })
    .catch((err) => console.warn('Error reading initial deep link URL:', err));

  // 2. Handle deep links received while app is running in background or foreground
  const subscription = Linking.addEventListener('url', ({ url }) => {
    if (url) {
      const parsed = parseDeepLink(url);
      if (parsed && onRoute) onRoute(parsed);
    }
  });

  return () => {
    subscription.remove();
  };
}

export default {
  parseDeepLink,
  createChatDeepLink,
  createCallDeepLink,
  createTabDeepLink,
  initDeepLinking,
};

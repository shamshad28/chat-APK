// Realistic mock data reflecting WhatsApp chats and conversations
// Sole contact configured as Priya Mali as requested

export const CURRENT_USER = {
  id: 'user_shamshad',
  name: 'Khan Shamshad',
  username: 'shamshad',
  email: 'shamshad@pulsechat.com',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  about: '',
  phone: '+91 98765 43210',
};

export const INITIAL_CONVERSATIONS = [
  {
    id: 'conv_priya',
    name: 'priya mali',
    type: 'direct',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    isOnline: true,
    lastSeen: 'online',
    lastMessage: {
      text: 'How are you',
      time: '12 Oct',
      senderId: 'user_priya',
      isSentByMe: false,
      status: 'read',
    },
    unreadCount: 0,
    isPinned: true,
    isMuted: false,
    phone: '+91 99887 76655',
    about: '',
  },
];

export const INITIAL_MESSAGES = {
  conv_priya: [
    {
      id: 'm1',
      text: 'Hey Shamshad! How is the camera and call testing going?',
      time: '10:02 AM',
      isSentByMe: false,
      status: 'read',
      senderName: 'priya mali',
    },
    {
      id: 'm2',
      text: 'Camera is now fully integrated with front/rear switching and instant photo sending!',
      time: '10:05 AM',
      isSentByMe: true,
      status: 'read',
      senderName: 'Me',
    },
    {
      id: 'm3',
      text: 'Awesome! Did you test the WebRTC video and voice call controls too?',
      time: '10:08 AM',
      isSentByMe: false,
      status: 'read',
      senderName: 'priya mali',
      reaction: '👍',
    },
    {
      id: 'm4',
      type: 'audio',
      audioDuration: '0:24',
      time: '10:10 AM',
      isSentByMe: true,
      status: 'read',
      senderName: 'Me',
    },
    {
      id: 'm5',
      type: 'image',
      imageUri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
      caption: 'Live camera test photo preview 📸',
      time: '10:12 AM',
      isSentByMe: true,
      status: 'read',
      senderName: 'Me',
      reaction: '🔥',
    },
    {
      id: 'm6',
      text: 'How are you',
      time: '10:14 AM',
      isSentByMe: false,
      status: 'read',
      senderName: 'priya mali',
      reaction: '❤️',
    },
  ],
};

// Aliases so selectors never break
INITIAL_MESSAGES.conv_1 = INITIAL_MESSAGES.conv_priya;
INITIAL_MESSAGES.conv_2 = INITIAL_MESSAGES.conv_priya;
INITIAL_MESSAGES.conv_3 = INITIAL_MESSAGES.conv_priya;

export const MOCK_STATUSES = [
  {
    id: 'status_priya',
    userName: 'priya mali',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    mediaUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800',
    caption: 'Coffee & Code ☕💻 Live video & camera sprint!',
    time: '25 minutes ago',
    unviewedCount: 1,
    hasUnviewed: true,
  },
];

export const MOCK_CALLS = [
  {
    id: 'call_1',
    name: 'priya mali',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    type: 'video',
    direction: 'incoming',
    time: 'Today, 10:15 AM',
  },
  {
    id: 'call_2',
    name: 'priya mali',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    type: 'voice',
    direction: 'outgoing',
    time: 'Yesterday, 4:20 PM',
  },
  {
    id: 'call_3',
    name: 'priya mali',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    type: 'video',
    direction: 'missed',
    time: 'October 15, 6:05 PM',
  },
];

export const CONTACTS_LIST = [
  {
    id: 'u_priya',
    name: 'priya mali',
    status: '',
    isOnline: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    phone: '+91 99887 76655',
    about: '',
  },
];

export const MOCK_CHANNELS = [
  {
    id: 'ch_whatsapp',
    name: 'WhatsApp Updates',
    avatar: null,
    verified: true,
    followers: '150M followers',
    isFollowing: true,
  },
];


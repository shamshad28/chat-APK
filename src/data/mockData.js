// User-driven conversation and contact state: only registered accounts are stored

export const CURRENT_USER = {
  id: 'user_default',
  name: 'User',
  username: 'user',
  email: '',
  avatar: null,
  about: 'Available on PulseChat',
  phone: '',
};

export const INITIAL_CONVERSATIONS = [];

export const INITIAL_MESSAGES = {};

export const MOCK_STATUSES = [];

export const MOCK_CALLS = [];

export const CONTACTS_LIST = [];

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



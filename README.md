# PulseChat Mobile App (Expo & React Native)

This mobile app is the companion React Native application for the PulseChat real-time chat platform. It mirrors the WhatsApp dark-mode aesthetic and design tokens of the web client.

---

## 📱 Navigation Components

### 1. `ChatHeaderNavbar` (`src/components/ChatHeaderNavbar.js`)
Modeled after the WhatsApp mobile active conversation view:
- **Left Navigation**: Back button (`Ionicons: arrow-back`), user avatar with initials/image, green online badge dot.
- **Header Info**: Contact / Group title, live dynamic status (`online`, `typing...`, or last seen).
- **Action Icons**:
  - Video Call (`Ionicons: videocam`)
  - Voice Call (`Ionicons: call`)
  - Overflow Menu (`MaterialIcons: more-vert`)

### 2. `HomeHeaderNavbar` (`src/components/HomeHeaderNavbar.js`)
Top navigation bar for the main conversations list:
- **Brand Title**: WhatsApp / PulseChat branding
- **Action Icons**:
  - Meta AI Glowing Shortcut
  - Camera (`Feather: camera`)
  - Search (`Ionicons: search`)
  - Overflow Menu (`MaterialIcons: more-vert`)

### 3. `BottomTabBar` (`src/components/BottomTabBar.js`)
Authentic mobile bottom dock:
- **Tabs**:
  - **Chats**: Active pill capsule highlight (`#103629`), unread counter badge (`#25d366`)
  - **Updates**: Status ring / unread update dot
  - **Communities**: Group community icon
  - **Calls**: Phone icon with missed call badge
  - **Settings**: Configuration / profile gear icon
- Full `SafeAreaInsets` support for iOS notch & Android navigation gestures.

### 4. `ChatPreviewBody` (`src/components/ChatPreviewBody.js`)
- End-to-end encryption badge
- Date dividers ("TODAY")
- Sent & received message bubbles with authentic WhatsApp dark colors (`#005c4b`, `#202c33`), timestamps, double blue ticks (`#53bdeb`), and reactions
- Interactive switcher to toggle between **Chat Navbar** and **Home Navbar** on the fly
- Floating Action Button (`#25d366`) for starting new chats

---

## 🚀 Getting Started

From the project root:
```bash
# Run Expo dev server for the app
npm run dev:app
```

Or navigate to `app/`:
```bash
cd app

# Start the Expo development server
npm start

# Run on Android Emulator / Device
npm run android

# Run on iOS Simulator (macOS only)
npm run ios

# Run in Web Browser
npm run web
```

---

## 🎨 Design Tokens & Theme

The color tokens in `src/constants/theme.js` are matched with `client/app/globals.css`:
- Header & Bottom Bar: `#202c33`
- Background: `#111b21`
- Chat Background: `#0b141a`
- WhatsApp Green: `#00a884`
- Active Badge / Accent: `#25d366`
- Sent Bubble: `#005c4b`
- Received Bubble: `#202c33`
- Blue Ticks: `#53bdeb`
- Text Primary: `#e9edef`
- Text Secondary: `#8696a0`

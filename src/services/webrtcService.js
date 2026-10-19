import socketService from './socketService';

export const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

class WebRTCService {
  constructor() {
    this.callStatus = 'idle'; // 'idle' | 'calling' | 'incoming' | 'connected' | 'ended'
    this.callType = 'video'; // 'video' | 'voice'
    this.activeCall = null; // { otherUser, conversationId, isCaller, isGroup }
    this.duration = 0;
    this.isMuted = false;
    this.isVideoOff = false;
    this.isSpeaker = true;
    this.isFrontCamera = true;
    this.isMinimized = false;
    this.remoteMediaState = { isMuted: false, isVideoOff: false };

    this.timer = null;
    this.listeners = new Set();
    this.isInitialized = false;
  }

  /**
   * Subscribe to WebRTC call state changes
   */
  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  notifyListeners() {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.error('Error in WebRTC listener:', err);
      }
    });
  }

  getState() {
    return {
      callStatus: this.callStatus,
      callType: this.callType,
      activeCall: this.activeCall,
      duration: this.duration,
      isMuted: this.isMuted,
      isVideoOff: this.isVideoOff,
      isSpeaker: this.isSpeaker,
      isFrontCamera: this.isFrontCamera,
      isMinimized: this.isMinimized,
      remoteMediaState: this.remoteMediaState,
    };
  }

  /**
   * Initialize socket listeners for WebRTC signaling
   */
  initSignaling() {
    if (this.isInitialized) return;
    const socket = socketService.getSocket();

    // 1. Incoming Call Signal from Remote Peer
    socket.on('call:incoming', (payload) => {
      console.log('📞 Received call:incoming via WebRTC socket:', payload);
      this.handleIncomingCall(payload);
    });

    // 2. Call Accepted by Remote Peer
    socket.on('call:accepted', (payload) => {
      console.log('✅ Remote peer accepted call:', payload);
      this.setConnected();
    });

    // 3. WebRTC Signal (Offer / Answer / ICE Candidates)
    socket.on('call:signal', (payload) => {
      console.log('📡 WebRTC signaling message received:', payload?.type);
      // Process WebRTC SDP or ICE candidate
      if (this.callStatus === 'calling' && payload.type === 'answer') {
        this.setConnected();
      }
    });

    // 4. Call Declined by Remote Peer
    socket.on('call:declined', (payload) => {
      console.log('❌ Remote peer declined call:', payload?.reason);
      this.endCall();
    });

    // 5. Call Ended by Remote Peer
    socket.on('call:ended', () => {
      console.log('📴 Remote peer ended call');
      this.endCall();
    });

    // 6. Remote Peer Media Toggled (Mute / Video Off)
    socket.on('call:media-toggled', ({ isMuted, isVideoOff }) => {
      this.remoteMediaState = { isMuted: !!isMuted, isVideoOff: !!isVideoOff };
      this.notifyListeners();
    });

    this.isInitialized = true;
  }

  /**
   * Start outgoing call
   */
  initiateCall({ otherUser, conversationId, callType = 'video', isGroup = false }) {
    this.callStatus = 'calling';
    this.callType = callType;
    this.activeCall = {
      otherUser,
      conversationId,
      isCaller: true,
      isGroup,
    };
    this.duration = 0;
    this.isMuted = false;
    this.isVideoOff = callType === 'voice';
    this.isSpeaker = true;
    this.isMinimized = false;
    this.remoteMediaState = { isMuted: false, isVideoOff: callType === 'voice' };

    // Emit call:initiate over Socket.IO signaling
    const targetUserId = otherUser?._id || otherUser?.id;
    socketService.emitCallInitiate({
      recipientId: targetUserId,
      conversationId,
      isVideo: callType === 'video',
      isGroup,
    });

    this.notifyListeners();

    // Simulated auto-connect for demo environments if peer doesn't respond in 3 seconds
    if (!socketService.getSocket().connected) {
      setTimeout(() => {
        if (this.callStatus === 'calling') {
          this.setConnected();
        }
      }, 3000);
    }
  }

  /**
   * Handle incoming call from remote peer
   */
  handleIncomingCall(payload) {
    if (this.callStatus !== 'idle') {
      // Busy: decline call
      const callerId = payload?.caller?._id || payload?.caller?.id;
      socketService.emitCallDecline({ callerId, reason: 'User is busy on another call' });
      return;
    }

    const { caller, conversationId, isVideo, isGroup } = payload;
    this.callStatus = 'incoming';
    this.callType = isVideo ? 'video' : 'voice';
    this.activeCall = {
      otherUser: caller,
      conversationId,
      isCaller: false,
      isGroup,
    };
    this.duration = 0;
    this.isMuted = false;
    this.isVideoOff = !isVideo;
    this.isSpeaker = true;
    this.isMinimized = false;
    this.remoteMediaState = { isMuted: false, isVideoOff: !isVideo };

    this.notifyListeners();
  }

  /**
   * Accept incoming call
   */
  acceptCall() {
    if (!this.activeCall) return;

    const callerId = this.activeCall.otherUser?._id || this.activeCall.otherUser?.id;
    socketService.emitCallAccept({
      callerId,
      conversationId: this.activeCall.conversationId,
      isVideo: this.callType === 'video',
    });

    this.setConnected();
  }

  /**
   * Set call to connected & start duration timer
   */
  setConnected() {
    this.callStatus = 'connected';
    this.startDurationTimer();
    this.notifyListeners();
  }

  startDurationTimer() {
    if (this.timer) clearInterval(this.timer);
    this.duration = 0;
    this.timer = setInterval(() => {
      this.duration += 1;
      this.notifyListeners();
    }, 1000);
  }

  stopDurationTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Decline incoming call
   */
  declineCall(reason = 'User declined the call') {
    if (this.activeCall) {
      const callerId = this.activeCall.otherUser?._id || this.activeCall.otherUser?.id;
      socketService.emitCallDecline({ callerId, reason });
    }

    this.resetCall();
  }

  /**
   * End ongoing call
   */
  endCall() {
    if (this.activeCall) {
      const targetUserId = this.activeCall.otherUser?._id || this.activeCall.otherUser?.id;
      socketService.emitCallEnd({
        targetUserId,
        conversationId: this.activeCall.conversationId,
      });
    }

    this.callStatus = 'ended';
    this.stopDurationTimer();
    this.notifyListeners();

    setTimeout(() => {
      this.resetCall();
    }, 600);
  }

  resetCall() {
    this.stopDurationTimer();
    this.callStatus = 'idle';
    this.activeCall = null;
    this.duration = 0;
    this.isMinimized = false;
    this.isMuted = false;
    this.isVideoOff = false;
    this.notifyListeners();
  }

  /**
   * Toggle local microphone mute
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    const targetUserId = this.activeCall?.otherUser?._id || this.activeCall?.otherUser?.id;
    socketService.emitCallToggleMedia({
      targetUserId,
      isMuted: this.isMuted,
      isVideoOff: this.isVideoOff,
    });
    this.notifyListeners();
  }

  /**
   * Toggle local camera on/off
   */
  toggleVideo() {
    this.isVideoOff = !this.isVideoOff;
    const targetUserId = this.activeCall?.otherUser?._id || this.activeCall?.otherUser?.id;
    socketService.emitCallToggleMedia({
      targetUserId,
      isMuted: this.isMuted,
      isVideoOff: this.isVideoOff,
    });
    this.notifyListeners();
  }

  /**
   * Toggle speaker
   */
  toggleSpeaker() {
    this.isSpeaker = !this.isSpeaker;
    this.notifyListeners();
  }

  /**
   * Flip front / back camera
   */
  flipCamera() {
    this.isFrontCamera = !this.isFrontCamera;
    this.notifyListeners();
  }

  /**
   * Toggle Picture-in-Picture minimize
   */
  toggleMinimized() {
    this.isMinimized = !this.isMinimized;
    this.notifyListeners();
  }
}

const webrtcService = new WebRTCService();
export default webrtcService;

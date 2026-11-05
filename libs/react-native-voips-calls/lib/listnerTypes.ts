export type VoIPEventCallback = (data: any) => void; // Define a common callback type

export type VoIPListeners = {
  didReceiveStartCallAction: (handler: VoIPEventCallback) => void;
  answerCall: (handler: VoIPEventCallback) => void;
  endCall: (handler: VoIPEventCallback) => void;
  didActivateAudioSession: (handler: VoIPEventCallback) => void;
  didDeactivateAudioSession: (handler: VoIPEventCallback) => void;
  didDisplayIncomingCall: (handler: VoIPEventCallback) => void;
  didPerformSetMutedCallAction: (handler: VoIPEventCallback) => void;
  didToggleHoldCallAction: (handler: VoIPEventCallback) => void;
  didPerformDTMFAction: (handler: VoIPEventCallback) => void;
  didResetProvider: (handler: VoIPEventCallback) => void;
  checkReachability: (handler: VoIPEventCallback) => void;
  onMissedCallOpen: (handler: VoIPEventCallback) => void;
  onCallNotificationOpen: (handler: VoIPEventCallback) => void;
  onCallOpenAppEvent: (handler: VoIPEventCallback) => void;
};

  

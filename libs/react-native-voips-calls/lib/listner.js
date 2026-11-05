import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const RNVoipCallModule = NativeModules.RNVoipCall;
const eventEmitter = RNVoipCallModule ? new NativeEventEmitter(RNVoipCallModule) : null;

const RNVoipCallPerformAnswerCallAction = 'RNVoipCallPerformAnswerCallAction';
const RNVoipCallPerformEndCallAction = 'RNVoipCallPerformEndCallAction';
const RNVoipCallMissedCallTap = 'RNVoipCallMissedCallTap';

//Ios
const RNVoipCallDidReceiveStartCallAction = 'RNVoipCallDidReceiveStartCallAction';
const RNVoipCallDidActivateAudioSession = 'RNVoipCallDidActivateAudioSession';
const RNVoipCallDidDeactivateAudioSession = 'RNVoipCallDidDeactivateAudioSession';
const RNVoipCallDidDisplayIncomingCall = 'RNVoipCallDidDisplayIncomingCall';
const RNVoipCallDidPerformSetMutedCallAction = 'RNVoipCallDidPerformSetMutedCallAction';
const RNVoipCallDidToggleHoldAction = 'RNVoipCallDidToggleHoldAction';
const RNVoipCallDidPerformDTMFAction = 'RNVoipCallDidPerformDTMFAction';
const RNVoipCallProviderReset = 'RNVoipCallProviderReset';
const RNVoipCallCheckReachability = 'RNVoipCallCheckReachability';

//Android
const RNVoipCallFullScreenIntent = 'RNVoipCallFullScreenIntent';
const RNVoipCallNotificationTap = 'RNVoipCallNotificationTap';

const isIOS = Platform.OS === 'ios';

const didReceiveStartCallAction = handler => {
  if (!eventEmitter || !RNVoipCallModule) {
    return { remove() {} };
  }
  if (isIOS) {
    // Tell CallKeep that we are ready to receive `RNVoipCallDidReceiveStartCallAction` event and prevent delay
    RNVoipCallModule._startCallActionEventListenerAdded();
  }

  return eventEmitter.addListener(RNVoipCallDidReceiveStartCallAction, (data) => handler(data));
};

const answerCall = handler =>
  eventEmitter
    ? eventEmitter.addListener(RNVoipCallPerformAnswerCallAction, (data) => {
    let uuids = isIOS ? data.callUUID : data.callerId;
    handler({callerId : uuids})}
  )
    : { remove() {} };

const endCall = handler =>
  eventEmitter
    ? eventEmitter.addListener(RNVoipCallPerformEndCallAction, (data) =>{
    let uuids = isIOS ? data.callUUID : data.callerId;
    handler({callerId : uuids})}
  )
    : { remove() {} };

const didActivateAudioSession = handler =>
  eventEmitter ? eventEmitter.addListener(RNVoipCallDidActivateAudioSession, handler) : { remove() {} };

const didDeactivateAudioSession = handler =>
  eventEmitter ? eventEmitter.addListener(RNVoipCallDidDeactivateAudioSession, handler) : { remove() {} };

const didDisplayIncomingCall = handler =>
  eventEmitter ? eventEmitter.addListener(RNVoipCallDidDisplayIncomingCall, (data) => handler(data)) : { remove() {} };

const didPerformSetMutedCallAction = handler =>
  eventEmitter ? eventEmitter.addListener(RNVoipCallDidPerformSetMutedCallAction, (data) => handler(data)) : { remove() {} };

const didToggleHoldCallAction = handler =>
  eventEmitter ? eventEmitter.addListener(RNVoipCallDidToggleHoldAction, handler) : { remove() {} };

const didPerformDTMFAction = handler =>
  eventEmitter ? eventEmitter.addListener(RNVoipCallDidPerformDTMFAction, (data) => handler(data)) : { remove() {} };

const didResetProvider = handler =>
  eventEmitter ? eventEmitter.addListener(RNVoipCallProviderReset, handler) : { remove() {} };

const checkReachability = handler =>
  eventEmitter ? eventEmitter.addListener(RNVoipCallCheckReachability, handler) : { remove() {} };  
  
const onMissedCallOpen = handler =>
  eventEmitter ? eventEmitter.addListener(RNVoipCallMissedCallTap, handler) : { remove() {} };
  
//Android Only
const onCallOpenAppEvent = handler =>
  eventEmitter ? eventEmitter.addListener(RNVoipCallFullScreenIntent, handler) : { remove() {} };
  
const onCallNotificationOpen = handler =>
  eventEmitter ? eventEmitter.addListener(RNVoipCallNotificationTap, handler) : { remove() {} };  

export const listeners = {
  didReceiveStartCallAction,
  answerCall,
  endCall,
  didActivateAudioSession,
  didDeactivateAudioSession,
  didDisplayIncomingCall,
  didPerformSetMutedCallAction,
  didToggleHoldCallAction,
  didPerformDTMFAction,
  didResetProvider,
  checkReachability,
  onMissedCallOpen,
  onCallNotificationOpen,
  onCallOpenAppEvent
  
};

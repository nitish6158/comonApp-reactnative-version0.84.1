/**
 * Declaration for the 'react-native-voips-calls' module.
 */
declare module 'react-native-voips-calls' {
    import { NativeEventEmitter, NativeModules, DeviceEventEmitter, Platform } from 'react-native';

    /**
     * Options for initializing a VoIP call.
     */
    interface RNVoipCallOptions {
      appName: string;
      ios?: {
        phoneNumber: string;
        handleType: string;
        hasVideo: boolean;
        name: string;
      };
      android?: Record<string, any>;
      callerId: string;
    }
  
    /**
     * Native module for handling VoIP calls.
     */
    class RNVoipCallNativeModule {
      /**
       * Constructor for the RNVoipCallNativeModule class.
       */
      constructor();
  
      /**
       * Add an event listener for a specific type of VoIP call event.
       * @param type - The type of VoIP call event.
       * @param handler - The event handler function.
       */
      addEventListener(type: string, handler: (data: any) => void): void;
  
      /**
       * Remove an event listener for a specific type of VoIP call event.
       * @param type - The type of VoIP call event.
       */
      removeEventListener(type: string): void;
  
      /**
       * Initialize a VoIP call with the provided options.
       * @param options - Options for initializing the VoIP call.
       * @returns A Promise that resolves when the call is initialized.
       */
      initializeCall(options: RNVoipCallOptions): Promise<void>;
  
      /**
       * Display an incoming VoIP call with the provided options.
       * @param options - Options for displaying the incoming call.
       * @returns A Promise that resolves when the incoming call is displayed.
       */
      displayIncomingCall(options: RNVoipCallOptions): Promise<void>;
  
      /**
       * Get initial notification actions.
       * @returns A Promise that resolves with the initial notification actions.
       */
      getInitialNotificationActions(): Promise<any>;
  
      /**
       * Add an event listener for an incoming call answer event.
       * @param handler - The event handler function.
       */
      onCallAnswer(handler: (data: any) => void): void;
  
      /**
       * Add an event listener for an end call event.
       * @param handler - The event handler function.
       */
      onEndCall(handler: (data: any) => void): void;
  
      /**
       * Remove the end call event listener.
       */
      onRemoveEndCallListener(): void;
  
      /**
       * Add an event listener for an open app event on Android.
       * @param handler - The event handler function.
       */
      onCallOpenAppEvent(handler: (data: any) => void): void;
  
      /**
       * Add an event listener for a notification open event on Android.
       * @param handler - The event handler function.
       */
      onCallNotificationOpen(handler: (data: any) => void): void;
  
      /**
       * Add an event listener for a missed call open event on Android.
       * @param handler - The event handler function.
       */
      onMissedCallOpen(handler: (data: any) => void): void;
  
      /**
       * Reject an incoming call with the specified UUID (iOS only).
       * @param uuid - The UUID of the incoming call to reject.
       */
      rejectCall(uuid: string): void;
  
      /**
       * Check if a call with the specified UUID is active (iOS only).
       * @param uuid - The UUID of the call to check.
       * @returns A Promise that resolves with a boolean indicating call activity.
       */
      isCallActive(uuid: string): Promise<boolean | null>;
  
      /**
       * End a call with the specified UUID (iOS) or clear a notification by ID (Android).
       * @param uuid - The UUID of the call to end (iOS) or the notification ID to clear (Android).
       */
      endCall(uuid: string): void;
  
      /**
       * End all calls or clear all notifications.
       */
      endAllCalls(): void;
  
      /**
       * Play a ringtone with the specified name and looping option (Android only).
       * @param name - The name of the ringtone to play.
       * @param loop - A boolean indicating whether the ringtone should loop.
       */
      playRingtune(name: string, loop: boolean): void;
  
      /**
       * Stop the currently playing ringtone (Android only).
       */
      stopRingtune(): void;
  
      /**
       * Show a missed call notification with the specified title, body, and UUID.
       * @param title - The title of the missed call notification.
       * @param body - The body of the missed call notification.
       * @param uuid - The UUID associated with the missed call.
       */
      showMissedCallNotification(title: string, body: string, uuid: string): void;
    }
  
    /**
     * Interface for the registration information obtained from PushKit.
     */
    interface VoipRegistrationInfo {
      deviceToken: string;
      voipDeviceToken: string;
      platform: string;
    }
  
    /**
     * Native module for handling PushKit events.
     */
    class RNVoipPushKitNativeModule {
      /**
       * Get the PushKit device token and call the provided handler with the registration information.
       * @param handler - The handler function to receive the registration information.
       */
       getPushKitDeviceToken(handler: (info: VoipRegistrationInfo) => void): void;
  
      /**
       * Add an event listener for PushKit notifications.
       * @param handler - The event handler function.
       */
       RemotePushKitNotificationReceived(handler: (info: any) => void): void;
  
      /**
       * Remove an event listener for a specific type of PushKit event.
       * @param type - The type of PushKit event to remove the listener for.
       * @param handler - The event handler to remove.
       */
       removeEventListener(type: 'notification' | 'register', handler: any): void;
  
      /**
       * Request permissions for PushKit notifications with the specified options.
       * @param permissions - The permissions options.
       */
      static requestPermissions(permissions: {
        alert?: boolean;
        badge?: boolean;
        sound?: boolean;
      }): void;
    }
  
    /**
     * Export the RNVoipPushKit class and the RNVoipCallNativeModule class.
     */
    const RNVoipPushKit: RNVoipPushKitNativeModule;
    const RNVoipCall: RNVoipCallNativeModule;
  
    export default RNVoipCall;
    export { RNVoipPushKit };
  }
  
import { BaseSocketHandler, SocketCallback } from './BaseSocketHandler';

type ProfileCallback<T = any> = SocketCallback<T>;

/**
 * All available event types for profile socket events
 */
export enum ProfileEventType {
  PROFILE = 'profile',
  SET_BIO = 'setBio',
  SET_PROFILE_PICTURE = 'setProfilePicture',
  CHANGE_USER_STATUS = 'changeUserStatus',
  SEND_STATUS_TO_USER = 'sendStatusToAUser',
  FIND_USERS_BY_CONTACTS = 'findUsersByContacts',
  GET_BLOCKED_CONTACT = 'getBlockedContact',
  SEND_NOTIFY = 'sendNotify'
}

export class ProfileSocketHandler extends BaseSocketHandler {
  private profileCallbacks: Map<string, Set<ProfileCallback>> = new Map();

  protected handleMessage(type: string, data: any): void {
    const callbacks = this.profileCallbacks.get(type);
    if (callbacks) {
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      callbacks.forEach(callback => callback(parsedData));
    }
  }

  // Profile Management
  public onGetProfile(callback: ProfileCallback): () => void {
    return this.addSocketCallback(ProfileEventType.PROFILE, this.profileCallbacks, callback);
  }

  public onSetBio(callback: ProfileCallback<string>): () => void {
    return this.addSocketCallback(ProfileEventType.SET_BIO, this.profileCallbacks, callback);
  }

  public onSetProfilePicture(callback: ProfileCallback<string>): () => void {
    return this.addSocketCallback(ProfileEventType.SET_PROFILE_PICTURE, this.profileCallbacks, callback);
  }

  // User Status
  public onChangeUserStatus(callback: ProfileCallback<string>): () => void {
    return this.addSocketCallback(ProfileEventType.CHANGE_USER_STATUS, this.profileCallbacks, callback);
  }

  public onSendStatusToUser(callback: ProfileCallback<{
    userId: string;
    status: string;
  }>): () => void {
    return this.addSocketCallback(ProfileEventType.SEND_STATUS_TO_USER, this.profileCallbacks, callback);
  }

  // Contact Management
  public onFindUsersByContacts(callback: ProfileCallback<string[]>): () => void {
    return this.addSocketCallback(ProfileEventType.FIND_USERS_BY_CONTACTS, this.profileCallbacks, callback);
  }

  public onGetBlockedContact(callback: ProfileCallback): () => void {
    return this.addSocketCallback(ProfileEventType.GET_BLOCKED_CONTACT, this.profileCallbacks, callback);
  }

  // Notifications
  public onSendNotify(callback: ProfileCallback<{
    userId: string;
    message: string;
  }>): () => void {
    return this.addSocketCallback(ProfileEventType.SEND_NOTIFY, this.profileCallbacks, callback);
  }

  /**
   * Helper method specifically for React hooks integration
   * @param type Event type to subscribe to
   * @param callback Function to call when the event occurs
   * @example
   * // Usage in a React component:
   * useEffect(() => {
   *   const unsubscribe = socketManager.profile.useProfileEvent(
   *     ProfileEventType.PROFILE, 
   *     (data) => {
   *       console.log('Profile data:', data);
   *     }
   *   );
   *   
   *   return unsubscribe;
   * }, []);
   */
  public useProfileEvent<T>(type: ProfileEventType, callback: ProfileCallback<T>): () => void {
    return this.useSocketEvent(type, this.profileCallbacks, callback);
  }
}
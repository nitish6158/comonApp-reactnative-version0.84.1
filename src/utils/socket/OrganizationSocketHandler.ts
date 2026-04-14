import { BaseSocketHandler, SocketCallback } from './BaseSocketHandler';

type InviteCallback = SocketCallback<{ msg: any }>;

export class OrganizationSocketHandler extends BaseSocketHandler {
  private inviteCallbacks: Set<InviteCallback> = new Set();

  protected handleMessage(type: string, data: any): void {
    if (type === 'invited') {
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      this.inviteCallbacks.forEach(callback => callback(parsedData));
    }
  }

  public onInvite(callback: InviteCallback): () => void {
    // Add the callback
    this.inviteCallbacks.add(callback);

    // Track if unsubscription has already happened
    let unsubscribed = false;

    // Return cleanup function
    return () => {
      // Only perform the deletion if not already unsubscribed
      if (!unsubscribed) {
        this.inviteCallbacks.delete(callback);
        unsubscribed = true;
      }
    };
  }

  /**
   * Helper method specifically for React hooks integration
   * @param callback Function to call when an invite event occurs
   * @example
   * // Usage in a React component:
   * useEffect(() => {
   *   const unsubscribe = socketManager.organization.useInviteEvent((data) => {
   *     console.log('Invitation received:', data);
   *   });
   *   
   *   return unsubscribe;
   * }, []);
   */
  public useInviteEvent(callback: InviteCallback): () => void {
    return this.onInvite(callback);
  }
}
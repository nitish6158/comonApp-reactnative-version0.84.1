import { BaseSocketHandler, SocketCallback } from './BaseSocketHandler';

type VoipFailedCallback = SocketCallback<{ userId: string; msg: any }>;

export class VoipSocketHandler extends BaseSocketHandler {
  private voipFailedCallbacks: Set<VoipFailedCallback> = new Set();

  protected handleMessage(type: string, data: any): void {
    if (type === 'voipFailed') {
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      this.voipFailedCallbacks.forEach(callback => callback(parsedData));
    }
  }

  public onVoipFailed(callback: VoipFailedCallback): () => void {
    // Add the callback
    this.voipFailedCallbacks.add(callback);

    // Track if unsubscription has already happened
    let unsubscribed = false;

    // Return cleanup function
    return () => {
      // Only perform the deletion if not already unsubscribed
      if (!unsubscribed) {
        this.voipFailedCallbacks.delete(callback);
        unsubscribed = true;
      }
    };
  }

  /**
   * Helper method specifically for React hooks integration
   * @param callback Function to call when voip failed event occurs
   * @example
   * // Usage in a React component:
   * useEffect(() => {
   *   const unsubscribe = socketManager.voip.useVoipFailedEvent((data) => {
   *     console.log('Voip failed:', data);
   *   });
   *   
   *   return unsubscribe;
   * }, []);
   */
  public useVoipFailedEvent(callback: VoipFailedCallback): () => void {
    return this.onVoipFailed(callback);
  }
}
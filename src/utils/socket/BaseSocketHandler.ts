import { socketConnect } from '@/utils/socket/SocketConnection';

// Generic callback type for all socket handlers
export type SocketCallback<T = any> = (data: T) => void;

export abstract class BaseSocketHandler {
  protected socket = socketConnect;

  constructor() {
    // Register message handler when class is instantiated
    this.socket.addMessageHandler(this.handleMessage.bind(this));
  }

  protected abstract handleMessage(type: string, data: any): void;

  /**
   * Adds a callback for a specific event type with efficient cleanup
   * @param type Event type to listen for
   * @param callbacks Map of callbacks to add this callback to
   * @param callback Function to execute when event occurs
   * @returns Unsubscribe function to remove the callback
   */
  protected addSocketCallback<T>(
    type: string,
    callbacks: Map<string, Set<SocketCallback>>,
    callback: SocketCallback<T>
  ): () => void {
    // Create a Set for this event type if it doesn't exist
    if (!callbacks.has(type)) {
      callbacks.set(type, new Set());
    }

    // Get the callback set
    const callbackSet = callbacks.get(type)!;

    // Add the callback to the set
    callbackSet.add(callback as SocketCallback);

    // Track if callback has been unsubscribed to prevent multiple executions
    let unsubscribed = false;

    // Return cleanup function
    return () => {
      // Only execute if not already unsubscribed
      if (!unsubscribed) {
        callbackSet.delete(callback as SocketCallback);
        unsubscribed = true;

        // Clean up the map entry if the set is empty
        if (callbackSet.size === 0) {
          callbacks.delete(type);
        }
      }
    };
  }

  /**
   * Helper method for use in React components' useEffect
   * Creates a uniform interface for subscribing to socket events
   * 
   * @param type Event type to subscribe to
   * @param callbacks Map of callbacks to register with
   * @param callback Function to call when the event occurs  
   * @example
   * // In a derived class:
   * public useEvent<T>(type: string, callback: SocketCallback<T>): () => void {
   *   return this.useSocketEvent(type, this.myCallbacks, callback);
   * }
   */
  protected useSocketEvent<T>(
    type: string,
    callbacks: Map<string, Set<SocketCallback>>,
    callback: SocketCallback<T>
  ): () => void {
    return this.addSocketCallback(type, callbacks, callback);
  }
}
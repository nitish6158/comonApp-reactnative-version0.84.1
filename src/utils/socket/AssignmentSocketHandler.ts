import { BaseSocketHandler, SocketCallback } from './BaseSocketHandler';

type AssignmentEventType = 'addAssignmentMember' | 'removeAssignmentMember' | 'taskUpdated' | 'updateScenario';
type AssignmentCallback<T = any> = SocketCallback<T>;

export class AssignmentSocketHandler extends BaseSocketHandler {
  private assignmentCallbacks: Map<string, Set<AssignmentCallback>> = new Map();

  protected handleMessage(type: string, data: any): void {
    const callbacks = this.assignmentCallbacks.get(type);
    if (callbacks) {
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      callbacks.forEach(callback => callback(parsedData));
    }
  }

  public onAssignmentEvent(type: AssignmentEventType, callback: AssignmentCallback): () => void {
    return this.addSocketCallback(type, this.assignmentCallbacks, callback);
  }

  /**
   * Helper method specifically for React hooks integration
   * @param type Assignment event type to subscribe to
   * @param callback Function to call when the event occurs
   * @example
   * // Usage in a React component:
   * useEffect(() => {
   *   const unsubscribe = socketManager.assignment.useAssignmentEvent('taskUpdated', (data) => {
   *     console.log('Task was updated:', data);
   *   });
   *   
   *   return unsubscribe;
   * }, []);
   */
  public useAssignmentEvent(type: AssignmentEventType, callback: AssignmentCallback): () => void {
    return this.onAssignmentEvent(type, callback);
  }
}
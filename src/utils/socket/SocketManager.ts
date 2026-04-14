import { VoipSocketHandler } from './VoipSocketHandler';
import { OrganizationSocketHandler } from './OrganizationSocketHandler';
import { AssignmentSocketHandler } from './AssignmentSocketHandler';
import { ChatRoomSocketHandler } from './ChatRoomSocketHandler';
import { ProfileSocketHandler } from './ProfileSocketHandler';
import { ConversationSocketHandler } from './ConversationSocketHandler';

export class SocketManager {
  private static instance: SocketManager;

  public readonly voip: VoipSocketHandler;
  public readonly organization: OrganizationSocketHandler;
  public readonly assignment: AssignmentSocketHandler;
  public readonly chatRoom: ChatRoomSocketHandler;
  public readonly profile: ProfileSocketHandler;
  public readonly conversation: ConversationSocketHandler

  private constructor() {
    this.voip = new VoipSocketHandler();
    this.organization = new OrganizationSocketHandler();
    this.assignment = new AssignmentSocketHandler();
    this.chatRoom = new ChatRoomSocketHandler();
    this.profile = new ProfileSocketHandler();
    this.conversation = new ConversationSocketHandler();
  }

  public static getInstance(): SocketManager {
    try {
      if (!SocketManager.instance) {
        SocketManager.instance = new SocketManager();
      }
      return SocketManager.instance;
    } catch (error) {
      console.error('Error in SocketManager.getInstance:', error);
      throw error;
    }
  }
}

export const socketManager = SocketManager.getInstance(); 
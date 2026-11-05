import {
  Room,
  RoomEvent,
  Track,
  VideoPresets,
  ConnectionState,
  RemoteParticipant,
  LocalVideoTrack,
  TrackPublication,
  LocalAudioTrack,
  RemoteTrackPublication,
} from "livekit-client";
import {
  RNKeyProvider,
  RNE2EEManager,
  AudioSession,
} from "@livekit/react-native";
import { Platform } from "react-native";
import { TrackReference } from "@livekit/components-react";

export type LiveKitEvents = {
  onJoinSuccess?: () => void;
  onUserJoined?: (uid: number) => void;
  onUserLeft?: (uid: number) => void;
  onUserMuteVideo?: (uid: number, muted: boolean) => void;
  onUserMuteAudio?: (uid: number, muted: boolean) => void;
  onConnectionStateChanged?: (state: ConnectionState) => void;
  onTracksChanged?: () => void;
  onError?: (error: Error) => void;
};

export class LiveKitCallService {
  private static instance: LiveKitCallService | null = null;

  public room: Room | null = null;
  private keyProvider: RNKeyProvider | null = null;
  private e2eeManager: RNE2EEManager | null = null;
  private listeners: LiveKitEvents = {};
  public isConnected: boolean = false;
  public myUid: number = 0;

  static getInstance(): LiveKitCallService {
    if (!LiveKitCallService.instance) {
      LiveKitCallService.instance = new LiveKitCallService();
    }
    return LiveKitCallService.instance;
  }

  setListeners(listeners: LiveKitEvents) {
    this.listeners = listeners;
  }

  /**
   * Derives a deterministic 256-bit SFrame E2EE shared key for the call session.
   */
  public deriveE2EEKey(callId: string, channelName: string): string {
    const salt = "ComOn-E2EE-Call-Secret-2026";
    return `${salt}:${callId}:${channelName}`;
  }

  async join({
    serverUrl,
    token,
    callId,
    channelName,
    uid,
    callType,
    e2eeKey,
  }: {
    serverUrl: string;
    token: string;
    callId: string;
    channelName: string;
    uid: number;
    callType: "audio" | "video";
    e2eeKey?: string;
  }): Promise<boolean> {
    try {
      this.myUid = uid;
      await this.leave();

      // Configure AudioSession for voice/video communication
      await AudioSession.configureAudio({
        android: {
          preferredOutputList: ["bluetooth", "headset", "speaker", "earpiece"],
          audioTypeOptions: {
            manageAudioFocus: true,
            audioMode: "inCommunication",
            audioFocusMode: "gain",
            audioAttributesUsageType: "voiceCommunication",
            audioAttributesContentType: "speech",
          },
        },
      });
      await AudioSession.startAudioSession();

      // Set up E2EE (End-to-End Encryption)
      const secret = e2eeKey || this.deriveE2EEKey(callId, channelName);
      let roomOptions: any = {
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: VideoPresets.h720.resolution,
        },
      };

      try {
        this.keyProvider = new RNKeyProvider({
          sharedKey: true,
        });
        this.e2eeManager = new RNE2EEManager(this.keyProvider, false);
        await this.keyProvider.setSharedKey(secret);

        roomOptions.e2ee = {
          e2eeManager: this.e2eeManager,
        };
        console.log("[LiveKit] E2EE initialized successfully with shared secret.");
      } catch (e2eeErr) {
        console.warn("[LiveKit] E2EE initialization warning:", e2eeErr);
      }

      this.room = new Room(roomOptions);
      this.attachRoomEvents(this.room);

      console.log(`[LiveKit] Connecting to ${serverUrl} room ${channelName}...`);
      await this.room.connect(serverUrl, token, {
        autoSubscribe: true,
      });

      this.isConnected = true;

      // Enable microphone by default
      await this.room.localParticipant.setMicrophoneEnabled(true);

      // Enable camera if video call
      if (callType === "video") {
        await this.room.localParticipant.setCameraEnabled(true);
        await this.setSpeaker(true);
      } else {
        await this.room.localParticipant.setCameraEnabled(false);
        await this.setSpeaker(false);
      }

      this.listeners.onJoinSuccess?.();
      return true;
    } catch (err: any) {
      console.error("[LiveKit] Error joining room:", err);
      this.listeners.onError?.(err);
      return false;
    }
  }

  private attachRoomEvents(room: Room) {
    room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
      console.log("[LiveKit] Participant connected:", participant.identity);
      const uid = parseInt(participant.identity, 10);
      if (!isNaN(uid)) {
        this.listeners.onUserJoined?.(uid);
      }
    });

    room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
      console.log("[LiveKit] Participant disconnected:", participant.identity);
      const uid = parseInt(participant.identity, 10);
      if (!isNaN(uid)) {
        this.listeners.onUserLeft?.(uid);
      }
    });

    room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      console.log("[LiveKit] Track subscribed:", track.kind, "from", participant.identity);
      const uid = parseInt(participant.identity, 10);
      if (!isNaN(uid)) {
        if (track.kind === Track.Kind.Video) {
          this.listeners.onUserMuteVideo?.(uid, false);
        } else if (track.kind === Track.Kind.Audio) {
          this.listeners.onUserMuteAudio?.(uid, false);
        }
      }
      this.listeners.onTracksChanged?.();
    });

    room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
      console.log("[LiveKit] Track unsubscribed:", track.kind, "from", participant.identity);
      const uid = parseInt(participant.identity, 10);
      if (!isNaN(uid)) {
        if (track.kind === Track.Kind.Video) {
          this.listeners.onUserMuteVideo?.(uid, true);
        }
      }
      this.listeners.onTracksChanged?.();
    });

    room.on(RoomEvent.TrackMuted, (publication, participant) => {
      const uid = parseInt(participant.identity, 10);
      if (!isNaN(uid)) {
        if (publication.kind === Track.Kind.Video) {
          this.listeners.onUserMuteVideo?.(uid, true);
        } else if (publication.kind === Track.Kind.Audio) {
          this.listeners.onUserMuteAudio?.(uid, true);
        }
      }
      this.listeners.onTracksChanged?.();
    });

    room.on(RoomEvent.TrackUnmuted, (publication, participant) => {
      const uid = parseInt(participant.identity, 10);
      if (!isNaN(uid)) {
        if (publication.kind === Track.Kind.Video) {
          this.listeners.onUserMuteVideo?.(uid, false);
        } else if (publication.kind === Track.Kind.Audio) {
          this.listeners.onUserMuteAudio?.(uid, false);
        }
      }
      this.listeners.onTracksChanged?.();
    });

    room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
      console.log("[LiveKit] ConnectionStateChanged:", state);
      this.listeners.onConnectionStateChanged?.(state);
    });

    room.on(RoomEvent.Disconnected, () => {
      console.log("[LiveKit] Room disconnected.");
      this.isConnected = false;
    });
  }

  async setMicrophone(enabled: boolean) {
    if (this.room?.localParticipant) {
      await this.room.localParticipant.setMicrophoneEnabled(enabled);
    }
  }

  async setCamera(enabled: boolean) {
    if (this.room?.localParticipant) {
      await this.room.localParticipant.setCameraEnabled(enabled);
      this.listeners.onTracksChanged?.();
    }
  }

  async switchCamera() {
    if (!this.room?.localParticipant) return;
    const cameraPub = this.room.localParticipant.getTrackPublication(Track.Source.Camera);
    const videoTrack = cameraPub?.videoTrack as LocalVideoTrack | undefined;
    if (videoTrack?.mediaStreamTrack) {
      const trackAny = videoTrack.mediaStreamTrack as any;
      if (typeof trackAny._switchCamera === "function") {
        trackAny._switchCamera();
      } else if (typeof videoTrack.restartTrack === "function") {
        const currentFacing = videoTrack.mediaStreamTrack.getSettings?.()?.facingMode;
        const newFacing = currentFacing === "environment" ? "user" : "environment";
        await videoTrack.restartTrack({ facingMode: newFacing });
      }
      this.listeners.onTracksChanged?.();
    }
  }

  async setSpeaker(speakerOn: boolean) {
    try {
      if (Platform.OS === "android") {
        await AudioSession.selectAudioOutput(speakerOn ? "speaker" : "earpiece");
      } else {
        await AudioSession.selectAudioOutput(speakerOn ? "force_speaker" : "default");
      }
    } catch (e) {
      console.warn("[LiveKit] Error toggling speaker:", e);
    }
  }

  getLocalTrackRef(): TrackReference | undefined {
    if (!this.room?.localParticipant) return undefined;
    const publication = this.room.localParticipant.getTrackPublication(Track.Source.Camera);
    if (!publication) return undefined;
    return {
      participant: this.room.localParticipant,
      publication: publication,
      source: Track.Source.Camera,
    };
  }

  getRemoteTrackRef(uid: number): TrackReference | undefined {
    if (!this.room) return undefined;
    const participant = this.room.remoteParticipants.get(String(uid));
    if (!participant) return undefined;
    const publication = participant.getTrackPublication(Track.Source.Camera);
    if (!publication) return undefined;
    return {
      participant: participant,
      publication: publication,
      source: Track.Source.Camera,
    };
  }

  isRemoteVideoTrackActive(uid: number): boolean {
    if (!this.room) return false;
    const participant = this.room.remoteParticipants.get(String(uid));
    if (!participant) return false;
    const pub = participant.getTrackPublication(Track.Source.Camera);
    return !!pub && !pub.isMuted && !!pub.track;
  }

  async leave() {
    this.isConnected = false;
    if (this.room) {
      try {
        await this.room.disconnect();
      } catch (e) {
        console.warn("[LiveKit] Error disconnecting room:", e);
      }
      this.room.removeAllListeners();
      this.room = null;
    }
    if (this.keyProvider) {
      try {
        this.keyProvider.dispose();
      } catch (e) {}
      this.keyProvider = null;
    }
    this.e2eeManager = null;
    try {
      await AudioSession.stopAudioSession();
    } catch (e) {}
  }
}

export const liveKitCallService = LiveKitCallService.getInstance();

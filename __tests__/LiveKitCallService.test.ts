const mockRoomHandlers: Record<string, (...args: any[]) => void> = {};
const mockConnect = jest.fn(async () => {});
const mockDisconnect = jest.fn(async () => {});
const mockRemoveAllListeners = jest.fn();
const mockSetMic = jest.fn(async () => {});
const mockSetCam = jest.fn(async () => {});
const mockSwitchCam = jest.fn();
const mockGetPub = jest.fn(() => ({
  isMuted: false,
  track: { kind: "video" },
  mediaStreamTrack: { _switchCamera: mockSwitchCam },
}));
const mockRemoteGetPub = jest.fn(() => ({
  isMuted: false,
  track: { kind: "video" },
}));

const mockRemoteParticipant = {
  identity: "102",
  trackPublications: new Map([
    ["t1", { kind: "video", isMuted: false, track: {} }],
    ["t2", { kind: "audio", isMuted: true, track: {} }],
  ]),
  getTrackPublication: mockRemoteGetPub,
};

jest.mock("livekit-client", () => {
  return {
    Room: jest.fn().mockImplementation(() => ({
      connect: mockConnect,
      disconnect: mockDisconnect,
      removeAllListeners: mockRemoveAllListeners,
      on: jest.fn((event: string, cb: (...args: any[]) => void) => {
        mockRoomHandlers[event] = cb;
      }),
      localParticipant: {
        setMicrophoneEnabled: mockSetMic,
        setCameraEnabled: mockSetCam,
        getTrackPublication: () => ({
          track: { mediaStreamTrack: { _switchCamera: mockSwitchCam } },
          videoTrack: { mediaStreamTrack: { _switchCamera: mockSwitchCam } },
        }),
      },
      remoteParticipants: new Map([["102", mockRemoteParticipant]]),
    })),
    RoomEvent: {
      ParticipantConnected: "participantConnected",
      ParticipantDisconnected: "participantDisconnected",
      TrackSubscribed: "trackSubscribed",
      TrackUnsubscribed: "trackUnsubscribed",
      TrackMuted: "trackMuted",
      TrackUnmuted: "trackUnmuted",
      ConnectionStateChanged: "connectionStateChanged",
      Disconnected: "disconnected",
    },
    Track: {
      Kind: { Video: "video", Audio: "audio" },
      Source: { Camera: "camera" },
    },
    VideoPresets: { h720: { resolution: { width: 1280, height: 720 } } },
  };
});

jest.mock("@livekit/react-native", () => ({
  RNKeyProvider: jest.fn().mockImplementation(() => ({
    setSharedKey: jest.fn(async () => {}),
    dispose: jest.fn(),
  })),
  RNE2EEManager: jest.fn(),
  AudioSession: {
    configureAudio: jest.fn(async () => {}),
    startAudioSession: jest.fn(async () => {}),
    selectAudioOutput: jest.fn(async () => {}),
    stopAudioSession: jest.fn(async () => {}),
  },
}));

import { LiveKitCallService } from "../src/services/livekit/LiveKitCallService";

describe("LiveKitCallService", () => {
  let service: LiveKitCallService;
  const listeners = {
    onJoinSuccess: jest.fn(),
    onUserJoined: jest.fn(),
    onUserLeft: jest.fn(),
    onUserMuteVideo: jest.fn(),
    onUserMuteAudio: jest.fn(),
    onConnectionStateChanged: jest.fn(),
    onTracksChanged: jest.fn(),
    onError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockRoomHandlers).forEach((k) => delete mockRoomHandlers[k]);
    service = LiveKitCallService.getInstance();
    service.setListeners(listeners);
  });

  it("joins a video room, processes existing participants, emits events, and leaves", async () => {
    const ok = await service.join({
      serverUrl: "wss://meetus-ypdlhodh.livekit.cloud",
      token: "jwt-token",
      callId: "c1",
      channelName: "chan1",
      uid: 101,
      callType: "video",
    });

    expect(ok).toBe(true);
    expect(service.isConnected).toBe(true);
    expect(listeners.onJoinSuccess).toHaveBeenCalled();
    expect(listeners.onUserJoined).toHaveBeenCalledWith(102);
    expect(listeners.onUserMuteVideo).toHaveBeenCalledWith(102, false);
    expect(listeners.onUserMuteAudio).toHaveBeenCalledWith(102, true);

    mockRoomHandlers.participantConnected?.({ identity: "205" });
    expect(listeners.onUserJoined).toHaveBeenCalledWith(205);

    mockRoomHandlers.trackSubscribed?.({ kind: "video" }, {}, { identity: "205" });
    mockRoomHandlers.trackUnsubscribed?.({ kind: "video" }, {}, { identity: "205" });
    mockRoomHandlers.trackMuted?.({ kind: "audio" }, { identity: "205" });
    mockRoomHandlers.trackUnmuted?.({ kind: "audio" }, { identity: "205" });
    mockRoomHandlers.participantDisconnected?.({ identity: "205" });
    expect(listeners.onUserLeft).toHaveBeenCalledWith(205);

    await service.setMicrophone(false);
    await service.setCamera(false);
    await service.switchCamera();
    expect(mockSwitchCam).toHaveBeenCalled();
    await service.setSpeaker(true);
    await service.setSpeaker(false);
    expect(service.getLocalTrackRef()).toBeDefined();
    expect(service.getRemoteTrackRef(102)).toBeDefined();
    expect(service.isRemoteVideoTrackActive(102)).toBe(true);

    mockRoomHandlers.connectionStateChanged?.("connected");
    mockRoomHandlers.disconnected?.();
    expect(service.isConnected).toBe(false);

    await service.leave();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it("handles join errors safely and notifies onError", async () => {
    mockConnect.mockRejectedValueOnce(new Error("signal failed"));
    const ok = await service.join({
      serverUrl: "wss://meetus-ypdlhodh.livekit.cloud",
      token: "jwt-token",
      callId: "c2",
      channelName: "chan2",
      uid: 101,
      callType: "audio",
    });

    expect(ok).toBe(false);
    expect(listeners.onError).toHaveBeenCalled();
    expect(mockGetPub).not.toThrow();
  });
});


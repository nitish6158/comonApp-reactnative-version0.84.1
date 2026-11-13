import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";
import { Alert, TouchableOpacity } from "react-native";
import { createStore, Provider } from "jotai";

const mockCheckCallPermissions = jest.fn(async (..._args: any[]) => true);
const mockToast = jest.fn();

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
jest.mock("@Images/Call.svg", () => "CallIcon");
jest.mock("@Images/VideoCallChat.svg", () => "VideoCallIcon");
jest.mock("@Util/ToastMesage", () => (...args: any[]) => mockToast(...args));
jest.mock("@Util/permission", () => ({
  checkCallPermissions: (...args: any[]) => mockCheckCallPermissions(...args),
}));

import AudioVideoContainer from "../src/Containers/HomeContainer/MainContainer/ChatContainer/ChatMessages/Header/AudioVideoContainer";
import { singleRoom } from "../src/Atoms/singleRoom";
import { callAtom } from "../src/Atoms/callAtom";
import { InternetAtom } from "../src/Atoms/InternetAtom";

describe("AudioVideoContainer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  it("hides buttons for self room, blocked individual room, and 1-member group room", () => {
    const store = createStore();
    let tree!: ReactTestRenderer.ReactTestRenderer;

    store.set(singleRoom, {
      roomType: "self",
      isCurrentRoomBlocked: false,
      participantsNotLeft: [],
    } as any);
    act(() => {
      tree = ReactTestRenderer.create(
        <Provider store={store}><AudioVideoContainer /></Provider>
      );
    });
    expect(tree.toJSON()).toBeNull();
    act(() => tree.unmount());

    store.set(singleRoom, {
      roomType: "individual",
      isCurrentRoomBlocked: true,
      participantsNotLeft: [],
    } as any);
    act(() => {
      tree = ReactTestRenderer.create(
        <Provider store={store}><AudioVideoContainer /></Provider>
      );
    });
    expect(tree.toJSON()).toBeNull();
    act(() => tree.unmount());

    store.set(singleRoom, {
      roomType: "group",
      isCurrentRoomBlocked: false,
      participantsNotLeft: [{}],
    } as any);
    act(() => {
      tree = ReactTestRenderer.create(
        <Provider store={store}><AudioVideoContainer /></Provider>
      );
    });
    expect(tree.toJSON()).toBeNull();
    act(() => tree.unmount());
  });

  it("starts video & audio calls and handles offline and already-in-call guards", async () => {
    const store = createStore();
    store.set(singleRoom, {
      roomId: "r1",
      roomType: "individual",
      roomImage: "img.jpg",
      roomName: "Alice",
      isCurrentRoomBlocked: false,
      participantsNotLeft: [{}, {}],
    } as any);
    store.set(InternetAtom, true);
    store.set(callAtom, null);

    let tree!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = ReactTestRenderer.create(
        <Provider store={store}><AudioVideoContainer /></Provider>
      );
    });
    const buttons = tree.root.findAllByType(TouchableOpacity);
    expect(buttons.length).toBe(2);

    // 1. Start video call
    await act(async () => {
      await buttons[0].props.onPress();
    });
    expect(store.get(callAtom)?.callType).toBe("video");

    // 2. Already in call toast
    await act(async () => {
      await buttons[1].props.onPress();
    });
    expect(mockToast).toHaveBeenCalled();

    // 3. Offline alert
    await act(async () => {
      store.set(callAtom, null);
      store.set(InternetAtom, false);
    });
    await act(async () => {
      await buttons[1].props.onPress();
    });
    expect(Alert.alert).toHaveBeenCalled();

    // 4. Permission denied early return
    mockCheckCallPermissions.mockResolvedValueOnce(false as any);
    await act(async () => {
      await buttons[0].props.onPress();
    });
    expect(store.get(callAtom)).toBeNull();
    act(() => tree.unmount());
  });
});


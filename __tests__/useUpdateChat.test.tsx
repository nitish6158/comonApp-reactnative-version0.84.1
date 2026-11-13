import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";

const mockUpdateChat = jest.fn();
const mockSendBroadcast = jest.fn();
const mockSendChat = jest.fn();

jest.mock("@/graphql/generated/room.generated", () => ({
  useUpdateChatMutation: () => [mockUpdateChat],
  useSendBroadcastChatMutation: () => [mockSendBroadcast],
  useSendChatMutation: () => [mockSendChat],
}));

import useUpdateChat from "../src/hooks/useUpdateChat";

describe("useUpdateChat", () => {
  let api: ReturnType<typeof useUpdateChat>;

  function Harness() {
    api = useUpdateChat();
    return null;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    act(() => {
      ReactTestRenderer.create(<Harness />);
    });
  });

  it("returns data on successful mutations", async () => {
    mockUpdateChat.mockResolvedValueOnce({ data: { updateChat: { _id: "1" } } });
    mockSendBroadcast.mockResolvedValueOnce({ data: { sendBroadcastChat: { _id: "2" } } });
    mockSendChat.mockResolvedValueOnce({ data: { sendChat: { _id: "3" } } });

    await expect(api.updateChatMessage({} as any)).resolves.toEqual({ _id: "1" });
    await expect(api.sendBroadcastChat({} as any)).resolves.toEqual({ _id: "2" });
    await expect(api.sendChatToRooms({} as any)).resolves.toEqual({ _id: "3" });
  });

  it("throws Error when GraphQL returns errors", async () => {
    mockUpdateChat.mockResolvedValueOnce({ errors: [{ message: "Update failed" }] });
    mockSendBroadcast.mockResolvedValueOnce({ errors: [{ message: "Broadcast failed" }] });
    mockSendChat.mockResolvedValueOnce({ errors: [{ message: "Send failed" }] });

    await expect(api.updateChatMessage({} as any)).rejects.toThrow("Update failed");
    await expect(api.sendBroadcastChat({} as any)).rejects.toThrow("Broadcast failed");
    await expect(api.sendChatToRooms({} as any)).rejects.toThrow("Send failed");
  });
});


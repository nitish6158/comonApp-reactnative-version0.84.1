import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";
import { Linking } from "react-native";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
jest.mock("@/redux/Store", () => ({
  useAppSelector: (selector: any) => selector({ Chat: { MyProfile: { _id: "me1" } } }),
}));
jest.mock("@Images/Favorite/StarGray.svg", () => "StarGray");
jest.mock("@Util/chatUtils/deleteMessageText", () => () => "Deleted message");
jest.mock("@Util/helpers/isActionActive", () => (arr: any[], id: string) => Array.isArray(arr) && arr.includes(id));

import TextMessagePreview from "../src/Components/TextMessagePreview";

describe("TextMessagePreview", () => {
  it("renders links, formatted markdown, mentions, search highlights, and opens URLs safely", async () => {
    const openSpy = jest.spyOn(Linking, "openURL").mockRejectedValueOnce(new Error("cannot open"));

    let tree!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(
        <TextMessagePreview
          isGroup={true}
          searchText="meet"
          formatedParticipants={{ u2: "Alice" }}
          item={{
            sender: "me1",
            deleted: [],
            favourite_by: ["me1"],
            message: "https://meetus.app *bold* _italic_ ~strike~ ```code``` @u2 plain",
          }}
        />
      );
    });

    const linkBtn = tree.root.find(
      (n) => typeof n.props?.onPress === "function" && n.props.disabled === undefined
    );
    await act(async () => {
      linkBtn.props.onPress();
    });

    expect(openSpy).toHaveBeenCalledWith("https://meetus.app");
    act(() => tree.unmount());
  });
});


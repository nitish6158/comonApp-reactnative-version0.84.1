import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";

const mockCapturedProps: any[] = [];
const mockState = {
  Chat: { MyProfile: { _id: "me1" } },
  Contact: {
    comonContact: [
      { userId: { _id: "u2" }, firstName: "Alice", lastName: "Smith" },
    ],
  },
};

jest.mock("react-redux", () => ({
  useSelector: (selector: any) => selector(mockState),
}));
jest.mock("@Service/provider/endpoints", () => ({
  GroupUrl: "group.png",
  ImageUrl: "default.png",
}));
jest.mock("@Util/CallHistoryIcon", () => ({
  incoming: { missed: "in-missed", accepted: "in-accepted", "": "in-default" },
  outgoing: { initiator: "out-init", missed: "out-missed", accepted: "out-accepted", "": "out-default" },
}));
jest.mock("../src/Containers/HomeContainer/MainContainer/CallContainer/components/CallParticipant", () => {
  const React = require("react");
  return (props: any) => {
    mockCapturedProps.push(props);
    return React.createElement("View", { testID: "call-participant" });
  };
});

import SingleCallItem from "../src/Containers/HomeContainer/MainContainer/CallContainer/components/SingleCallItem";

describe("SingleCallItem", () => {
  beforeEach(() => {
    mockCapturedProps.length = 0;
  });

  const makeParticipants = () => [
    { userId: { _id: "me1", firstName: "Me", lastName: "User", phone: "+911", profile_img: "m.png", lastSeen: "1" }, callStatus: "missed" },
    { userId: { _id: "u2", firstName: "Remote", lastName: "Two", phone: "+912", profile_img: "u2.png", lastSeen: "2" }, callStatus: "accepted" },
    { userId: { _id: "u3", firstName: "Remote", lastName: "Three", phone: "+913", profile_img: "u3.png", lastSeen: "3" }, callStatus: "missed" },
  ];

  it("maps group, contact_group, contact, individual, and default room types", () => {
    const baseCall = { type: "video", origin: "me1", callStartedAt: 123456, callParticipants: makeParticipants() };
    const renderItem = (props: any) => {
      let t!: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        t = ReactTestRenderer.create(<SingleCallItem {...props} />);
      });
      act(() => t.unmount());
    };

    renderItem({ item: { call: { ...baseCall, roomType: "group", roomId: { _id: "r1", name: "Team", profile_img: "g.png" } }, count: 2, categoryId: "cat1" }, isAllCalls: true });
    expect(mockCapturedProps[0].name).toBe("Team");
    expect(mockCapturedProps[0].type).toBe("out-init");

    renderItem({ item: { call: { ...baseCall, roomType: "contact_group" } } });
    expect(mockCapturedProps[1].name).toContain("Alice");

    renderItem({ item: { call: { ...baseCall, roomType: "contact", origin: "u2" } } });
    expect(mockCapturedProps[2].name).toContain("Alice Smith(+1)");
    expect(mockCapturedProps[2].type).toBe("in-missed");

    renderItem({ item: { call: { ...baseCall, roomType: "individual", roomId: { _id: "r9" } } } });
    expect(mockCapturedProps[3].name).toContain("Alice Smith(+1)");

    renderItem({ item: { call: { ...baseCall, roomType: "unknown" } } });
    expect(mockCapturedProps[4].name).toBe("");
  });
});


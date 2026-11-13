import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";
import { PermissionsAndroid, Platform, Text } from "react-native";

const mockCheckPermission = jest.fn();
const mockRequestPermission = jest.fn();
const mockGetAll = jest.fn();
const mockPermissionHandler = jest.fn();

jest.mock("react-native-contacts", () => ({
  checkPermission: () => mockCheckPermission(),
  requestPermission: () => mockRequestPermission(),
  getAll: () => mockGetAll(),
}));

jest.mock("@Components/PermissionHandler", () => (opts: any) => mockPermissionHandler(opts));

jest.mock("@Util/permission", () => ({
  askCameraPermission: jest.fn(async () => true),
  askMediaPermission: jest.fn(async () => true),
  checkCameraPermission: jest.fn(async () => false),
  checkMediaPermission: jest.fn(async () => false),
  checkMicrophonePermission: jest.fn(async () => true),
}));

jest.mock("@/Containers/HomeContainer/MainContainer/ProfileContainer/contacts/countrycodes", () => ({
  countryCodes: ["+91", "+1"],
}));

import useSyncContactCommon, {
  removeDuplicateNumber,
  hasContactsPermission,
  loadContactsIfPermitted,
  addContact,
} from "../src/hooks/useSyncContactHook";

describe("useSyncContactHook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("removes duplicate phone numbers ignoring formatting characters", () => {
    const deduped = removeDuplicateNumber([
      { number: "+91 98765-43210", label: "mobile" },
      { number: "+919876543210", label: "home" },
      { number: "(555) 123-4567", label: "work" },
    ]);
    expect(deduped).toHaveLength(2);
  });

  it("checks permission and loads formatted contacts on Android and iOS", async () => {
    (Platform as any).OS = "android";
    jest.spyOn(PermissionsAndroid, "check").mockResolvedValueOnce(false);
    expect(await hasContactsPermission()).toBe(false);

    jest.spyOn(PermissionsAndroid, "check").mockResolvedValueOnce(true);
    mockGetAll.mockResolvedValueOnce([
      {
        recordID: "1",
        displayName: "Dr. Alice Smith, Jr",
        prefix: "Dr.",
        suffix: "Jr",
        phoneNumbers: [{ number: "+91 98765 43210", label: "mobile" }],
      },
      {
        recordID: "2",
        displayName: "Bob Builder",
        prefix: null,
        suffix: null,
        phoneNumbers: [{ number: "9876543210", label: "work" }],
      },
    ]);

    const androidContacts = await loadContactsIfPermitted();
    expect(androidContacts).toHaveLength(1);
    expect(androidContacts[0].name).toBe("Alice");
    expect(androidContacts[0].lastName).toBe("Smith");

    (Platform as any).OS = "ios";
    mockCheckPermission.mockResolvedValueOnce("authorized");
    mockGetAll.mockResolvedValueOnce([
      {
        recordID: "3",
        givenName: "Charlie",
        familyName: "Day",
        phoneNumbers: [{ number: "+1 555 000 1111", label: "mobile" }],
      },
    ]);
    const iosContacts = await loadContactsIfPermitted();
    expect(iosContacts).toHaveLength(1);
    expect(iosContacts[0].name).toBe("Charlie");
  });

  it("returns empty list when permission is denied or contacts call throws", async () => {
    (Platform as any).OS = "ios";
    mockCheckPermission.mockResolvedValueOnce("denied");
    expect(await loadContactsIfPermitted()).toEqual([]);

    mockCheckPermission.mockResolvedValueOnce("authorized");
    mockGetAll.mockRejectedValueOnce(new Error("read failed"));
    expect(await loadContactsIfPermitted()).toEqual([]);
  });

  it("handles addContact flows on Android and iOS", async () => {
    const t = ((k: string) => k) as any;

    // Android already granted + PermissionHandler triggers media agree
    (Platform as any).OS = "android";
    jest.spyOn(PermissionsAndroid, "check").mockResolvedValueOnce(true);
    mockPermissionHandler.mockImplementationOnce(async ({ handlePressAgree }: any) => {
      await handlePressAgree("media");
    });
    mockGetAll.mockResolvedValueOnce([]);
    await expect(addContact(t)).resolves.toEqual([]);

    // Android denied check -> PermissionHandler -> requestMultiple granted
    jest.spyOn(PermissionsAndroid, "check").mockResolvedValueOnce(false);
    jest.spyOn(PermissionsAndroid, "requestMultiple").mockResolvedValueOnce({
      "android.permission.READ_CONTACTS": "granted",
    } as any);
    mockPermissionHandler
      .mockImplementationOnce(({ handlePressAgree }: any) => {
        void handlePressAgree("contact");
      })
      .mockImplementationOnce(async ({ handlePressAgree }: any) => {
        await handlePressAgree("media");
      });
    mockGetAll.mockResolvedValueOnce([]);
    await expect(addContact(t)).resolves.toEqual([]);

    // Android check failure
    jest.spyOn(PermissionsAndroid, "check").mockRejectedValueOnce("boom");
    await expect(addContact(t)).rejects.toThrow("boom");

    // iOS authorized / denied / error
    (Platform as any).OS = "ios";
    mockRequestPermission.mockResolvedValueOnce("authorized");
    mockGetAll.mockResolvedValueOnce([]);
    await expect(addContact(t)).resolves.toEqual([]);

    mockRequestPermission.mockResolvedValueOnce("denied");
    await expect(addContact(t)).rejects.toThrow("Contacts permission denied");

    mockRequestPermission.mockRejectedValueOnce("ios-err");
    await expect(addContact(t)).rejects.toThrow("ios-err");
  });

  it("exposes state from useSyncContactCommon hook", () => {
    let hookVal: any;
    function Probe() {
      hookVal = useSyncContactCommon();
      return React.createElement(Text, null, hookVal.syncContactRequest.length);
    }
    let tree!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(React.createElement(Probe));
    });
    expect(hookVal.syncContactRequest).toEqual([]);
    act(() => tree.unmount());
  });
});

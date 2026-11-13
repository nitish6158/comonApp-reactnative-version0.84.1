jest.mock("react-native-config", () => ({
  __esModule: true,
  default: {
    APP_ENV: "production",
    REALM_URL: "custom-realm-app",
    REALM_AUTH_LOGIN: "token-placeholder",
  },
}));

import * as endpoints from "../src/graphql/provider/endpoints";
import { realmErrors } from "../src/schemas/errorCodes";

describe("endpoints and realmErrors", () => {
  it("exports configured endpoint constants", () => {
    expect(endpoints.LIVEKIT_URL).toBe("wss://meetus-ypdlhodh.livekit.cloud");
    expect(endpoints.REALM_URL).toBe("custom-realm-app");
    expect(endpoints.profileImage).toBe(endpoints.DefaultImageUrl + endpoints.ImageUrl);
  });

  it("maps realm error codes to human-readable messages", () => {
    expect(realmErrors[200]).toBe("Session closed (no error)");
    expect(realmErrors[202]).toBe("Access token expired");
    expect(realmErrors[234]).toContain("migration");
  });
});


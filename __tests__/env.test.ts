jest.mock("react-native-config", () => ({
  APP_ENV: "development",
  APP_NAME: "MeetUs",
  PUBLIC_JWT_EXPIRE: "15",
  USES_CLEARTEXT_TRAFFIC: "false",
  USE_LIVEKIT: "true",
}));

import { env } from "../src/config/env";

describe("env configuration", () => {
  it("resolves defaults and parses boolean and numeric flags safely", () => {
    expect(env.appEnv).toBe("development");
    expect(env.appName).toBe("MeetUs");
    expect(env.publicJwtExpire).toBe(15);
    expect(env.usesCleartextTraffic).toBe(false);
    expect(env.useLivekit).toBe(true);
    expect(env.livekitUrl).toMatch(/^wss:\/\//);
    expect(env.googlePlaceApiKey).toBe("");
  });
});


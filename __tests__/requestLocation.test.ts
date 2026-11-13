const mockGetCurrentPosition = jest.fn();

jest.mock("react-native-geolocation-service", () => ({
  getCurrentPosition: (...args: any[]) => mockGetCurrentPosition(...args),
}));

import { RESULTS, request } from "react-native-permissions";
import { requestLastKnownLocation, requestLocation } from "../src/utils/permission/requestLocation";

describe("requestLocation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("resolves lat/long when permission is granted", async () => {
    (request as jest.Mock).mockResolvedValueOnce(RESULTS.GRANTED);
    mockGetCurrentPosition.mockImplementationOnce((success: any) =>
      success({ coords: { latitude: 22.7196, longitude: 75.8577 } })
    );

    const loc = await requestLocation();
    expect(loc).toEqual({ lat: "22.7196", long: "75.8577" });
  });

  it("rejects with Error when geolocation fails", async () => {
    (request as jest.Mock).mockResolvedValueOnce(RESULTS.GRANTED);
    mockGetCurrentPosition.mockImplementationOnce((_s: any, err: any) =>
      err({ message: "GPS disabled" })
    );

    await expect(requestLocation()).rejects.toThrow("GPS disabled");
  });

  it("returns undefined when permission is denied", async () => {
    (request as jest.Mock).mockResolvedValueOnce(RESULTS.DENIED);
    expect(await requestLocation()).toBeUndefined();
  });

  it("resolves and handles errors for requestLastKnownLocation", async () => {
    const mockPos = { coords: { latitude: 10, longitude: 20 } };
    (request as jest.Mock).mockResolvedValueOnce(RESULTS.GRANTED);
    mockGetCurrentPosition.mockImplementationOnce((success: any) => success(mockPos));
    expect(await requestLastKnownLocation()).toEqual(mockPos);

    (request as jest.Mock).mockResolvedValueOnce(RESULTS.GRANTED);
    mockGetCurrentPosition.mockImplementationOnce((_s: any, err: any) => err({ message: "Timeout" }));
    await expect(requestLastKnownLocation()).rejects.toThrow("Timeout");

    (request as jest.Mock).mockResolvedValueOnce(RESULTS.DENIED);
    expect(await requestLastKnownLocation()).toBeUndefined();
  });
});


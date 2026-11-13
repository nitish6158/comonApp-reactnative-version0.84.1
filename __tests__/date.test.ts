import { getNewDate, isExpireAt, currentTimeinUnix, covertUtcToLocalDate, getLastSeen } from "../src/utils/date";

describe("date utilities", () => {
  it("computes current and future timestamps", () => {
    const now = getNewDate();
    const future = getNewDate(1);
    expect(typeof now).toBe("number");
    expect(future).toBeGreaterThan(now);
    expect(typeof currentTimeinUnix()).toBe("number");
  });

  it("checks expiration correctly", () => {
    expect(isExpireAt(undefined)).toBe(false);
    expect(isExpireAt(Date.now() - 10000)).toBe(true);
    expect(isExpireAt(Date.now() + 60000)).toBe(false);
  });

  it("formats recent and older last seen labels", () => {
    expect(getLastSeen(Date.now() - 3600 * 1000)).toBe("Today");
    const threeDaysAgo = Date.now() - 3 * 24 * 3600 * 1000;
    expect(getLastSeen(threeDaysAgo)).toMatch(/^\d{2}\.\d{2}\.\d{2}$/);
    expect(covertUtcToLocalDate(Date.now()).isValid()).toBe(true);
  });
});


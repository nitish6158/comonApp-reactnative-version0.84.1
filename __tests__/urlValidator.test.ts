import { isValidUrl } from "../src/utils/urlValidator";

describe("isValidUrl", () => {
  it("accepts valid HTTP/HTTPS URLs and bare domains", () => {
    expect(isValidUrl("https://meetus.app")).toBe(true);
    expect(isValidUrl("http://example.com/path/to/page?foo=bar&baz=1#top")).toBe(true);
    expect(isValidUrl("google.com")).toBe(true);
    expect(isValidUrl("http://192.168.1.10:8080/test")).toBe(true);
  });

  it("rejects invalid inputs, bad IP octets, and whitespace", () => {
    expect(isValidUrl("")).toBe(false);
    expect(isValidUrl("hello")).toBe(false);
    expect(isValidUrl("https://")).toBe(false);
    expect(isValidUrl("https://999.999.999.999")).toBe(false);
    expect(isValidUrl("https://example.com/with space")).toBe(false);
    expect(isValidUrl("https://example.com:abc")).toBe(false);
    expect(isValidUrl("https://example.123")).toBe(false);
    expect(isValidUrl("https://example.com#bad!")).toBe(false);
    expect(isValidUrl("https://example.com?bad$query")).toBe(false);
  });

  it("completes in linear time on pathological ReDoS-like inputs", () => {
    const start = Date.now();
    const evilInput = `https://example.com/${"a".repeat(2000)}!`;
    expect(isValidUrl(evilInput)).toBe(false);
    expect(Date.now() - start).toBeLessThan(50);
  });
});


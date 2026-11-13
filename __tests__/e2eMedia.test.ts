const mockMemFiles = new Map<string, string>();

jest.mock("react-native-get-random-values", () => ({}));
jest.mock("react-native-fs", () => ({
  CachesDirectoryPath: "/mock/caches",
  exists: jest.fn(async () => false),
  mkdir: jest.fn(async () => {}),
  readFile: jest.fn(async (path: string) => mockMemFiles.get(path) ?? ""),
  writeFile: jest.fn(async (path: string, data: string) => {
    mockMemFiles.set(path, data);
  }),
}));
jest.mock("../src/services/e2e/SignalProtocolService", () => ({
  signalProtocolService: {},
}));

import {
  encryptFileToTemp,
  decryptFileToTemp,
  stripFileScheme,
} from "../src/services/e2e/e2eMedia";

describe("e2eMedia encryption utilities", () => {
  beforeEach(() => {
    mockMemFiles.clear();
  });

  it("strips file:// URIs safely", () => {
    expect(stripFileScheme("file:///tmp/my%20file.jpg")).toBe("/tmp/my file.jpg");
    expect(stripFileScheme("/tmp/plain.jpg")).toBe("/tmp/plain.jpg");
  });

  it("encrypts and decrypts a file round-trip with cryptographic random temp paths", async () => {
    const sampleB64 = global.btoa("MeetUs-E2E-Payload");
    mockMemFiles.set("/tmp/photo.jpg", sampleB64);

    const enc = await encryptFileToTemp("file:///tmp/photo.jpg");
    expect(enc.tempPath).toMatch(/^\/mock\/caches\/e2e-media\/enc-\d+-[0-9a-f]{8}\.bin$/);
    expect(enc.mimeHint).toBe("image/jpeg");

    const decUri = await decryptFileToTemp(enc.tempPath, enc.keyB64, enc.ivB64, "jpg");
    expect(decUri).toMatch(/^file:\/\/\/mock\/caches\/e2e-media\/dec-\d+-[0-9a-f]{8}\.jpg$/);

    const decPath = stripFileScheme(decUri);
    expect(mockMemFiles.get(decPath)).toBe(sampleB64);
  });
});

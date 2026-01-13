import {
  setAdVerification,
  getAdVerification,
  getAdVerifications,
  updateAdVerification,
  cleanupOldVerifications,
  AdVerification,
} from "@/lib/ad-verifications";
import { promises as fs } from "fs";
import path from "path";

// Mock fs for testing
jest.mock("fs", () => ({
  promises: {
    mkdir: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe("Ad Verifications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful directory creation
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);
  });

  it("should store and retrieve ad verifications", async () => {
    const verification: AdVerification = {
      address: "0x1234567890123456789012345678901234567890",
      timestamp: Date.now(),
      duration: 10,
      used: false,
    };

    // Mock empty file initially
    mockFs.readFile.mockRejectedValueOnce(new Error("File not found"));

    await setAdVerification("test-hash", verification);

    // Mock file with our verification
    mockFs.readFile.mockResolvedValueOnce(
      JSON.stringify({
        "test-hash": verification,
      })
    );

    const retrieved = await getAdVerification("test-hash");
    expect(retrieved).toEqual(verification);
  });

  it("should update ad verification", async () => {
    const verification: AdVerification = {
      address: "0x1234567890123456789012345678901234567890",
      timestamp: Date.now(),
      duration: 10,
      used: false,
    };

    // Mock file with existing verification
    mockFs.readFile.mockResolvedValue(
      JSON.stringify({
        "test-hash": verification,
      })
    );

    const success = await updateAdVerification("test-hash", { used: true });
    expect(success).toBe(true);
    expect(mockFs.writeFile).toHaveBeenCalled();
  });

  it("should handle file not found gracefully", async () => {
    mockFs.readFile.mockRejectedValue(new Error("File not found"));

    const verifications = await getAdVerifications();
    expect(verifications.size).toBe(0);
  });
});

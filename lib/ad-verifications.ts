import { promises as fs } from "fs";
import path from "path";

// Shared ad verifications store
// In production, this should be replaced with Redis or a database

export interface AdVerification {
  address: string;
  timestamp: number;
  duration: number;
  used: boolean;
}

// File-based storage for serverless compatibility
const STORAGE_FILE = path.join(process.cwd(), ".tmp", "ad-verifications.json");

// Ensure storage directory exists
async function ensureStorageDir(): Promise<void> {
  const dir = path.dirname(STORAGE_FILE);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

// Load verifications from file
async function loadVerifications(): Promise<Map<string, AdVerification>> {
  try {
    await ensureStorageDir();
    const data = await fs.readFile(STORAGE_FILE, "utf-8");
    const parsed = JSON.parse(data);
    return new Map(Object.entries(parsed));
  } catch (error) {
    // File doesn't exist or is invalid, return empty map
    return new Map();
  }
}

// Save verifications to file
async function saveVerifications(
  verifications: Map<string, AdVerification>
): Promise<void> {
  try {
    await ensureStorageDir();
    const obj = Object.fromEntries(verifications);
    await fs.writeFile(STORAGE_FILE, JSON.stringify(obj, null, 2));
  } catch (error) {
    console.error("Failed to save verifications:", error);
  }
}

// Get all verifications
export async function getAdVerifications(): Promise<
  Map<string, AdVerification>
> {
  return await loadVerifications();
}

// Set a verification
export async function setAdVerification(
  hash: string,
  verification: AdVerification
): Promise<void> {
  const verifications = await loadVerifications();
  verifications.set(hash, verification);
  await saveVerifications(verifications);
}

// Get a specific verification
export async function getAdVerification(
  hash: string
): Promise<AdVerification | undefined> {
  const verifications = await loadVerifications();
  return verifications.get(hash);
}

// Update a verification (mark as used)
export async function updateAdVerification(
  hash: string,
  updates: Partial<AdVerification>
): Promise<boolean> {
  const verifications = await loadVerifications();
  const existing = verifications.get(hash);

  if (!existing) {
    return false;
  }

  verifications.set(hash, { ...existing, ...updates });
  await saveVerifications(verifications);
  return true;
}

// Cleanup function to remove old verifications
export async function cleanupOldVerifications(): Promise<void> {
  const verifications = await loadVerifications();
  const now = Date.now();
  const cutoff = now - 10 * 60 * 1000; // 10 minutes
  let hasChanges = false;

  verifications.forEach((value, key) => {
    if (value.timestamp < cutoff) {
      verifications.delete(key);
      hasChanges = true;
    }
  });

  if (hasChanges) {
    await saveVerifications(verifications);
  }
}

// For backward compatibility and debugging
export const adVerifications = new Map<string, AdVerification>();

import { NextResponse } from "next/server";
import { getAdVerifications } from "@/lib/ad-verifications";

export async function GET() {
  try {
    const verifications = await getAdVerifications();
    const verificationsArray = Array.from(verifications.entries()).map(
      ([hash, data]) => ({
        hash: hash.substring(0, 8) + "...",
        address: data.address,
        timestamp: data.timestamp,
        duration: data.duration,
        used: data.used,
        age: Date.now() - data.timestamp,
      })
    );

    return NextResponse.json({
      success: true,
      count: verifications.size,
      verifications: verificationsArray,
    });
  } catch (error) {
    console.error("Debug verifications error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load verifications",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Only allow in development
export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }

  // Clear all verifications (for testing)
  try {
    const { promises: fs } = await import("fs");
    const path = await import("path");
    const STORAGE_FILE = path.join(
      process.cwd(),
      ".tmp",
      "ad-verifications.json"
    );

    await fs.writeFile(STORAGE_FILE, "{}");

    return NextResponse.json({
      success: true,
      message: "All verifications cleared",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to clear verifications",
      },
      { status: 500 }
    );
  }
}

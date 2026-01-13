import { NextResponse } from "next/server";
import { adSessions } from "@/app/api/start-ad-session/route";

export async function GET() {
  try {
    const sessionsArray = Array.from(adSessions.entries()).map(
      ([sessionId, data]) => ({
        sessionId: sessionId.substring(0, 8) + "...",
        startTime: data.startTime,
        clientIP: data.clientIP,
        completed: data.completed,
        age: Date.now() - data.startTime,
        ageMinutes: Math.floor((Date.now() - data.startTime) / 60000),
      })
    );

    return NextResponse.json({
      success: true,
      count: adSessions.size,
      sessions: sessionsArray,
    });
  } catch (error) {
    console.error("Debug sessions error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load sessions",
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

  // Clear all sessions (for testing)
  try {
    adSessions.clear();

    return NextResponse.json({
      success: true,
      message: "All ad sessions cleared",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to clear sessions",
      },
      { status: 500 }
    );
  }
}

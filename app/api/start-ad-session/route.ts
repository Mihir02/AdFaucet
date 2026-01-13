import { NextRequest, NextResponse } from "next/server";
import { getClientIP } from "@/lib/utils";

interface StartAdSessionRequest {
  sessionId: string;
  startTime: number;
}

// In-memory store for ad sessions (in production, use Redis or database)
const adSessions = new Map<
  string,
  {
    sessionId: string;
    startTime: number;
    clientIP: string;
    completed: boolean;
  }
>();

export async function POST(request: NextRequest) {
  try {
    const body: StartAdSessionRequest = await request.json();
    const { sessionId, startTime } = body;
    const clientIP = getClientIP(request);

    // Input validation
    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_SESSION_ID",
          message: "Invalid session ID",
        },
        { status: 400 }
      );
    }

    if (!startTime || typeof startTime !== "number") {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_START_TIME",
          message: "Invalid start time",
        },
        { status: 400 }
      );
    }

    // Check if session already exists
    if (adSessions.has(sessionId)) {
      return NextResponse.json(
        {
          success: false,
          error: "SESSION_EXISTS",
          message: "Session already exists",
        },
        { status: 409 }
      );
    }

    // Check for recent sessions from same IP (prevent spam)
    const recentSessions = Array.from(adSessions.values()).filter(
      (session) =>
        session.clientIP === clientIP && startTime - session.startTime < 30000 // 30 seconds
    );

    if (recentSessions.length >= 3) {
      return NextResponse.json(
        {
          success: false,
          error: "TOO_MANY_SESSIONS",
          message:
            "Too many ad sessions. Please wait before starting a new one.",
        },
        { status: 429 }
      );
    }

    // Store session
    adSessions.set(sessionId, {
      sessionId,
      startTime,
      clientIP,
      completed: false,
    });

    // Clean up old sessions (older than 5 minutes)
    const cutoff = Date.now() - 5 * 60 * 1000;
    const keysToDelete: string[] = [];

    adSessions.forEach((value, key) => {
      if (value.startTime < cutoff) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => {
      adSessions.delete(key);
    });

    console.log(`Ad session started: ${sessionId} from IP: ${clientIP}`);

    return NextResponse.json({
      success: true,
      message: "Ad session started successfully",
    });
  } catch (error) {
    console.error("Start ad session error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_ERROR",
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Export the ad sessions map for use in verify-ad route
export { adSessions };

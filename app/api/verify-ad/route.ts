import { NextRequest, NextResponse } from "next/server";
import { isValidEthereumAddress, getClientIP } from "@/lib/utils";
import { SupabaseAdService } from "@/lib/supabase";

interface VerifyAdRequest {
  address: string;
  duration: number;
  timestamp: number;
  sessionId?: string;
  actualWatchTime?: number;
  adType?: "propeller" | "mock";
  propellerData?: any;
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyAdRequest = await request.json();
    const {
      address,
      duration,
      timestamp,
      sessionId,
      actualWatchTime,
      adType = "mock",
      propellerData,
    } = body;
    const clientIP = getClientIP(request);

    console.log("🔍 Verify-ad API called:", {
      address,
      duration,
      sessionId,
      adType,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });

    // Check rate limiting before creating new sessions
    if (!sessionId || duration === 0) {
      console.log("🔍 Checking rate limits for new session...");
      const rateLimitCheck = await SupabaseAdService.checkRateLimit(
        address.toLowerCase(),
        clientIP
      );

      if (!rateLimitCheck.allowed) {
        console.log("❌ Rate limit exceeded:", rateLimitCheck.message);
        return NextResponse.json(
          {
            success: false,
            error: "RATE_LIMITED",
            message:
              rateLimitCheck.message ||
              "Rate limit exceeded. Please try again later.",
          },
          { status: 429 }
        );
      }
    }

    // Input validation
    if (!address || !isValidEthereumAddress(address)) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_ADDRESS",
          message: "Invalid wallet address",
        },
        { status: 400 }
      );
    }

    // Allow 0 duration for session creation, otherwise require at least 10 seconds
    if (duration < 0 || (duration > 0 && duration < 10)) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_DURATION",
          message:
            "Ad duration must be at least 10 seconds or 0 for session creation",
        },
        { status: 400 }
      );
    }

    if (!timestamp || timestamp > Date.now() + 60000) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_TIMESTAMP",
          message: "Invalid timestamp",
        },
        { status: 400 }
      );
    }

    // Check if timestamp is not too old (5 minutes max)
    const now = Date.now();
    if (now - timestamp > 5 * 60 * 1000) {
      return NextResponse.json(
        {
          success: false,
          error: "TIMESTAMP_TOO_OLD",
          message: "Timestamp too old. Please try again.",
        },
        { status: 400 }
      );
    }

    let verificationSessionId = sessionId;

    if (sessionId && duration > 0) {
      // Complete existing ad verification
      console.log("🔄 Completing ad verification for session:", sessionId);
      const success = await SupabaseAdService.completeAdVerification(
        sessionId,
        duration
      );

      if (!success) {
        console.error("❌ Failed to complete ad verification");
        return NextResponse.json(
          {
            success: false,
            error: "VERIFICATION_FAILED",
            message: "Failed to verify ad completion. Please try again.",
          },
          { status: 400 }
        );
      }
      console.log("✅ Ad verification completed successfully");
    } else {
      // Create new ad verification session (for duration 0 or no sessionId)
      verificationSessionId =
        sessionId ||
        `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

      console.log("🆕 Creating new ad session:", verificationSessionId);
      const record = await SupabaseAdService.createAdSession({
        walletAddress: address.toLowerCase(),
        sessionId: verificationSessionId,
        adType,
        ipAddress: clientIP,
        propellerData,
      });

      if (!record) {
        console.error("❌ Failed to create ad session");
        return NextResponse.json(
          {
            success: false,
            error: "SESSION_CREATION_FAILED",
            message: "Failed to create ad session. Please try again.",
          },
          { status: 500 }
        );
      }
      console.log("✅ Ad session created successfully:", record.id);
    }

    // Clean up old records periodically
    await SupabaseAdService.cleanupOldRecords();

    // Log verification for monitoring
    console.log(
      `Ad verified for ${address}: ${duration}s, type: ${adType}, session: ${verificationSessionId?.substring(
        0,
        8
      )}...`
    );

    return NextResponse.json({
      success: true,
      sessionId: verificationSessionId,
      message: "Ad verification successful",
      adType,
      expiresAt: now + 5 * 60 * 1000, // 5 minutes from now
    });
  } catch (error) {
    console.error("Ad verification error:", error);
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

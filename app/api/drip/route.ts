import { NextRequest, NextResponse } from "next/server";
import { getFaucetInstance } from "@/lib/eth-faucet";
import { getClientIP, isValidEthereumAddress } from "@/lib/utils";
import { SupabaseAdService } from "@/lib/supabase";

interface DripRequest {
  address: string;
  sessionId: string;
  adType?: "propeller" | "mock";
}

export async function POST(request: NextRequest) {
  try {
    const body: DripRequest = await request.json();
    const { address, sessionId } = body;
    const clientIP = getClientIP(request);

    // Input validation
    if (!address || !isValidEthereumAddress(address)) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_ADDRESS",
          message: "Invalid Ethereum address",
        },
        { status: 400 }
      );
    }

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_SESSION_ID",
          message: "Invalid ad verification session ID",
        },
        { status: 400 }
      );
    }

    // Check rate limiting first
    const rateLimitCheck = await SupabaseAdService.checkRateLimit(
      address.toLowerCase(),
      clientIP
    );

    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "RATE_LIMITED",
          message: rateLimitCheck.message || "Rate limit exceeded",
        },
        { status: 429 }
      );
    }

    // Verify ad completion using Supabase
    const adVerification = await SupabaseAdService.getAdVerification(sessionId);
    if (!adVerification) {
      return NextResponse.json(
        {
          success: false,
          error: "AD_NOT_VERIFIED",
          message: "Ad verification not found. Please watch the ad first.",
        },
        { status: 404 }
      );
    }

    if (adVerification.used) {
      return NextResponse.json(
        {
          success: false,
          error: "AD_ALREADY_USED",
          message: "Ad verification already used",
        },
        { status: 409 }
      );
    }

    if (!adVerification.verified) {
      return NextResponse.json(
        {
          success: false,
          error: "AD_NOT_COMPLETED",
          message: "Ad verification not completed. Please watch the full ad.",
        },
        { status: 400 }
      );
    }

    if (adVerification.wallet_address.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json(
        {
          success: false,
          error: "ADDRESS_MISMATCH",
          message: "Address does not match ad verification",
        },
        { status: 403 }
      );
    }

    // Check if ad verification is too old (5 minutes max)
    const now = Date.now();
    const createdAt = new Date(adVerification.created_at).getTime();
    if (now - createdAt > 5 * 60 * 1000) {
      return NextResponse.json(
        {
          success: false,
          error: "AD_VERIFICATION_EXPIRED",
          message: "Ad verification expired. Please watch the ad again.",
        },
        { status: 410 }
      );
    }

    // Get faucet instance and send ETH
    const faucet = getFaucetInstance();
    const result = await faucet.sendEth(address, clientIP);

    if (result.success) {
      // Mark ad verification as used and record the claim
      await Promise.all([
        SupabaseAdService.markAdAsUsed(sessionId),
        SupabaseAdService.recordClaim(address.toLowerCase(), clientIP),
      ]);

      console.log("✅ ETH sent successfully and session marked as used");

      return NextResponse.json({
        success: true,
        txHash: result.txHash,
        message: result.message,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          message: result.message,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Drip API error:", error);

    // Handle specific errors
    if (error.message.includes("FAUCET_PRIVATE_KEY")) {
      return NextResponse.json(
        {
          success: false,
          error: "CONFIGURATION_ERROR",
          message: "Faucet configuration error",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_ERROR",
        message: "Internal server error. Please try again later.",
      },
      { status: 500 }
    );
  }
}

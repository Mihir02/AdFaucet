import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for ad verifications
export interface AdVerificationRecord {
  id: string;
  wallet_address: string;
  session_id: string;
  ad_type: "propeller" | "mock";
  ad_id?: string;
  start_time: string;
  end_time?: string;
  duration: number;
  ip_address: string;
  verified: boolean;
  used: boolean;
  propeller_data?: any;
  created_at: string;
  updated_at: string;
}

// Database types for rate limiting
export interface RateLimitRecord {
  id: string;
  wallet_address: string;
  ip_address: string;
  last_claim_time: string;
  claim_count: number;
  created_at: string;
  updated_at: string;
}

// Supabase service functions
export class SupabaseAdService {
  /**
   * Create a new ad verification session
   */
  static async createAdSession(data: {
    walletAddress: string;
    sessionId: string;
    adType: "propeller" | "mock";
    adId?: string;
    ipAddress: string;
    propellerData?: any;
  }): Promise<AdVerificationRecord | null> {
    try {
      console.log("🔄 Creating Supabase ad session:", {
        walletAddress: data.walletAddress,
        sessionId: data.sessionId,
        adType: data.adType,
        ipAddress: data.ipAddress,
      });

      const { data: record, error } = await supabase
        .from("ad_verifications")
        .insert({
          wallet_address: data.walletAddress,
          session_id: data.sessionId,
          ad_type: data.adType,
          ad_id: data.adId,
          start_time: new Date().toISOString(),
          duration: 0,
          ip_address: data.ipAddress,
          verified: false,
          used: false,
          propeller_data: data.propellerData,
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Supabase error creating ad session:", error);
        return null;
      }

      console.log("✅ Supabase ad session created:", record);
      return record;
    } catch (error) {
      console.error("❌ Error in createAdSession:", error);
      return null;
    }
  }

  /**
   * Update ad verification with completion data
   */
  static async completeAdVerification(
    sessionId: string,
    duration: number
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("ad_verifications")
        .update({
          end_time: new Date().toISOString(),
          duration,
          verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq("session_id", sessionId)
        .eq("verified", false);

      if (error) {
        console.error("Error completing ad verification:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in completeAdVerification:", error);
      return false;
    }
  }

  /**
   * Get ad verification by session ID
   */
  static async getAdVerification(
    sessionId: string
  ): Promise<AdVerificationRecord | null> {
    try {
      const { data, error } = await supabase
        .from("ad_verifications")
        .select("*")
        .eq("session_id", sessionId)
        .single();

      if (error) {
        console.error("Error getting ad verification:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in getAdVerification:", error);
      return null;
    }
  }

  /**
   * Mark ad verification as used
   */
  static async markAdAsUsed(sessionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("ad_verifications")
        .update({
          used: true,
          updated_at: new Date().toISOString(),
        })
        .eq("session_id", sessionId);

      if (error) {
        console.error("Error marking ad as used:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in markAdAsUsed:", error);
      return false;
    }
  }

  /**
   * Check rate limiting for wallet address and IP
   */
  static async checkRateLimit(
    walletAddress: string,
    ipAddress: string
  ): Promise<{
    allowed: boolean;
    nextAllowedTime?: Date;
    message?: string;
  }> {
    try {
      const cooldownHours = 24;
      const cutoffTime = new Date(Date.now() - cooldownHours * 60 * 60 * 1000);

      console.log("🔍 Checking rate limits:", {
        walletAddress,
        ipAddress,
        cutoffTime: cutoffTime.toISOString(),
      });

      // Check for recent successful claims (used = true)
      const { data: recentClaims, error: claimsError } = await supabase
        .from("ad_verifications")
        .select("*")
        .or(`wallet_address.eq.${walletAddress},ip_address.eq.${ipAddress}`)
        .eq("used", true)
        .gte("created_at", cutoffTime.toISOString())
        .order("created_at", { ascending: false })
        .limit(1);

      if (claimsError) {
        console.error("❌ Error checking recent claims:", claimsError);
        return { allowed: true }; // Allow on error to prevent blocking users
      }

      if (recentClaims && recentClaims.length > 0) {
        const lastClaim = recentClaims[0];
        const nextAllowed = new Date(
          new Date(lastClaim.created_at).getTime() +
            cooldownHours * 60 * 60 * 1000
        );

        console.log("❌ Recent claim found:", {
          lastClaimTime: lastClaim.created_at,
          nextAllowedTime: nextAllowed.toISOString(),
        });

        return {
          allowed: false,
          nextAllowedTime: nextAllowed,
          message: `Rate limited. Last claim was ${this.formatTimeAgo(
            new Date(lastClaim.created_at)
          )}. Try again in ${this.formatTimeRemaining(
            nextAllowed.getTime() - Date.now()
          )}`,
        };
      }

      // Check for recent incomplete sessions (to prevent spam)
      const { data: recentSessions, error: sessionsError } = await supabase
        .from("ad_verifications")
        .select("*")
        .or(`wallet_address.eq.${walletAddress},ip_address.eq.${ipAddress}`)
        .eq("verified", false)
        .gte("created_at", new Date(Date.now() - 10 * 60 * 1000).toISOString()) // Last 10 minutes
        .order("created_at", { ascending: false });

      if (sessionsError) {
        console.error("❌ Error checking recent sessions:", sessionsError);
        return { allowed: true };
      }

      if (recentSessions && recentSessions.length >= 3) {
        console.log("❌ Too many incomplete sessions:", recentSessions.length);
        return {
          allowed: false,
          message:
            "Too many incomplete ad sessions. Please complete your current session or wait 10 minutes.",
        };
      }

      console.log("✅ Rate limit check passed");
      return { allowed: true };
    } catch (error) {
      console.error("❌ Error in checkRateLimit:", error);
      return { allowed: true }; // Allow on error to prevent blocking users
    }
  }

  /**
   * Record a successful claim for rate limiting
   */
  static async recordClaim(
    walletAddress: string,
    ipAddress: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from("rate_limits").upsert(
        {
          wallet_address: walletAddress,
          ip_address: ipAddress,
          last_claim_time: new Date().toISOString(),
          claim_count: 1,
        },
        {
          onConflict: "wallet_address",
        }
      );

      if (error) {
        console.error("Error recording claim:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in recordClaim:", error);
      return false;
    }
  }

  /**
   * Clean up old records (older than 7 days)
   */
  static async cleanupOldRecords(): Promise<void> {
    try {
      const cutoffTime = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000
      ).toISOString();

      // Clean up old ad verifications
      await supabase
        .from("ad_verifications")
        .delete()
        .lt("created_at", cutoffTime);

      // Clean up old rate limit records
      await supabase.from("rate_limits").delete().lt("updated_at", cutoffTime);
    } catch (error) {
      console.error("Error cleaning up old records:", error);
    }
  }

  /**
   * Format time remaining in human-readable format
   */
  private static formatTimeRemaining(ms: number): string {
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Format time ago in human-readable format
   */
  private static formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const hours = Math.floor(diffMs / (60 * 60 * 1000));
    const minutes = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));

    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    return `${minutes}m ago`;
  }
}

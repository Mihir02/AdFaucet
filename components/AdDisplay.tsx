"use client";

import { useState, useEffect, useCallback } from "react";
import { Eye, CheckCircle, Clock, Play } from "lucide-react";
import { useFaucet } from "@/context/FaucetContext";
import { clsx } from "clsx";

interface AdDisplayProps {
  onAdVerified: () => void; // Keep for now but make it optional
}

export function AdDisplay({ onAdVerified }: AdDisplayProps) {
  const { verifyAd, isVerifyingAd, sessionId: contextSessionId } = useFaucet();
  const [isWatching, setIsWatching] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [watchStartTime, setWatchStartTime] = useState<number | null>(null);
  const [localSessionId, setLocalSessionId] = useState<string | null>(null);

  const REQUIRED_WATCH_TIME = 10; // seconds

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isWatching && watchTime < REQUIRED_WATCH_TIME && !isCompleted) {
      interval = setInterval(() => {
        setWatchTime((prev) => {
          const newTime = prev + 1;
          console.log(`⏱️ Watch time: ${newTime}/${REQUIRED_WATCH_TIME}s`);
          if (newTime >= REQUIRED_WATCH_TIME) {
            console.log("✅ Required watch time reached!");
            setIsCompleted(true);
            setIsWatching(false);
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isWatching, watchTime, isCompleted]);

  const handleStartWatching = useCallback(async () => {
    const startTime = Date.now();
    const newSessionId = `${startTime}_${Math.random()
      .toString(36)
      .substring(2, 11)}`;

    console.log("🆕 Starting ad session:", newSessionId);

    setIsWatching(true);
    setWatchTime(0);
    setIsCompleted(false);
    setWatchStartTime(startTime);
    setLocalSessionId(newSessionId);

    // Create ad session in Supabase via verify-ad API (start with duration 0)
    try {
      await verifyAd(0, newSessionId, 0, "mock");
    } catch (error) {
      console.error("Failed to start ad session:", error);
      // Reset state on error
      setIsWatching(false);
      setLocalSessionId(null);
    }
  }, [verifyAd]);

  const handleVerifyAd = useCallback(async () => {
    if (!isCompleted || !watchStartTime || !localSessionId) return;

    try {
      const actualWatchTime = Math.floor((Date.now() - watchStartTime) / 1000);

      console.log("🔄 Completing ad verification:", {
        sessionId: localSessionId,
        duration: REQUIRED_WATCH_TIME,
        actualWatchTime,
      });

      // Complete the ad verification with actual watch time
      await verifyAd(
        REQUIRED_WATCH_TIME,
        localSessionId,
        actualWatchTime,
        "mock"
      );
      // Call the callback for any additional UI updates
      onAdVerified?.();
    } catch (error) {
      console.error("Ad verification failed:", error);
    }
  }, [
    isCompleted,
    verifyAd,
    onAdVerified,
    watchStartTime,
    localSessionId,
    REQUIRED_WATCH_TIME,
  ]);

  if (contextSessionId) {
    return (
      <div className="p-6 bg-green-100 border border-green-300 rounded-lg text-center">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          Ad Verified!
        </h3>
        <p className="text-green-700">You can now claim your ETH.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-blue-50 border border-blue-300 rounded-lg">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          Watch Ad to Continue
        </h3>
        <p className="text-blue-700">
          Watch this ad for {REQUIRED_WATCH_TIME} seconds to claim your tokens
        </p>
      </div>

      {/* Mock Ad Content */}
      <div className="bg-gradient-to-r from-purple-400 to-pink-400 p-8 rounded-lg text-white text-center mb-4 relative overflow-hidden">
        <div className="relative z-10">
          <h4 className="text-xl font-bold mb-2">🚀 CryptoApp Pro</h4>
          <p className="mb-4">Trade crypto with zero fees!</p>
          <div className="text-sm opacity-90">
            Advanced trading tools • Real-time analytics • Secure wallet
          </div>
        </div>

        {/* Progress overlay */}
        {isWatching && (
          <div
            className="absolute inset-0 bg-black bg-opacity-20 transition-all duration-1000"
            style={{
              background: `linear-gradient(90deg, rgba(0,0,0,0.3) ${
                (watchTime / REQUIRED_WATCH_TIME) * 100
              }%, transparent ${(watchTime / REQUIRED_WATCH_TIME) * 100}%)`,
            }}
          />
        )}
      </div>

      <div className="text-center space-y-4">
        {!isWatching && !isCompleted && (
          <button
            onClick={handleStartWatching}
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Start watching advertisement"
          >
            <Play className="w-5 h-5" />
            Start Watching Ad
          </button>
        )}

        {isWatching && (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-lg font-semibold text-blue-800">
              <Clock className="w-5 h-5" />
              Watching... {watchTime}/{REQUIRED_WATCH_TIME}s
            </div>
            <div
              className="w-full bg-blue-200 rounded-full h-3"
              role="progressbar"
              aria-valuenow={watchTime}
              aria-valuemax={REQUIRED_WATCH_TIME}
            >
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${(watchTime / REQUIRED_WATCH_TIME) * 100}%` }}
              />
            </div>
            <p className="text-sm text-blue-600">
              Keep watching to complete verification
            </p>
            <p className="text-xs text-gray-500">
              ⚠️ Closing this tab or navigating away will reset your progress
            </p>
          </div>
        )}

        {isCompleted && !contextSessionId && (
          <button
            onClick={handleVerifyAd}
            disabled={isVerifyingAd}
            className={clsx(
              "flex items-center gap-2 mx-auto px-6 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
              isVerifyingAd
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            )}
            aria-label="Verify ad completion"
          >
            <CheckCircle className="w-5 h-5" />
            {isVerifyingAd ? "Verifying..." : "Verify Ad Completion"}
          </button>
        )}
      </div>
    </div>
  );
}

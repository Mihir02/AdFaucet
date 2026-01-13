"use client";

import { useEffect, useRef, useState } from "react";
import { Play, CheckCircle, AlertCircle } from "lucide-react";

interface PropellerAdProps {
  onAdComplete: (adData: any) => void;
  onAdError: (error: string) => void;
  sessionId: string;
  walletAddress: string;
}

declare global {
  interface Window {
    propellerads_loaded?: boolean;
    propellerads?: any;
  }
}

export function PropellerAd({
  onAdComplete,
  onAdError,
  sessionId,
  walletAddress,
}: PropellerAdProps) {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const [adState, setAdState] = useState<
    "loading" | "ready" | "playing" | "completed" | "error"
  >("loading");
  const [adData, setAdData] = useState<any>(null);
  const [watchTime, setWatchTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  // PropellerAds configuration
  const PROPELLER_CONFIG = {
    zoneId: process.env.NEXT_PUBLIC_PROPELLER_ZONE_ID || "demo-zone",
    publisherId:
      process.env.NEXT_PUBLIC_PROPELLER_PUBLISHER_ID || "demo-publisher",
    minWatchTime: 10, // seconds
  };

  useEffect(() => {
    loadPropellerAds();
  }, []);

  const loadPropellerAds = async () => {
    try {
      // Check if PropellerAds is already loaded
      if (window.propellerads_loaded) {
        setAdState("ready");
        return;
      }

      // Load PropellerAds script
      const script = document.createElement("script");
      script.src = "https://cdn.propellerads.com/tags/propeller.js";
      script.async = true;
      script.onload = () => {
        window.propellerads_loaded = true;
        initializePropellerAd();
      };
      script.onerror = () => {
        console.error("Failed to load PropellerAds script");
        setAdState("error");
        onAdError("Failed to load advertisement");
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error("Error loading PropellerAds:", error);
      setAdState("error");
      onAdError("Advertisement loading error");
    }
  };

  const initializePropellerAd = () => {
    try {
      // Initialize PropellerAds with configuration
      if (window.propellerads && adContainerRef.current) {
        // This is a placeholder for actual PropellerAds initialization
        // Replace with actual PropellerAds API calls

        const mockAdConfig = {
          zoneId: PROPELLER_CONFIG.zoneId,
          publisherId: PROPELLER_CONFIG.publisherId,
          container: adContainerRef.current,
          onAdLoaded: handleAdLoaded,
          onAdStarted: handleAdStarted,
          onAdCompleted: handleAdCompleted,
          onAdError: handleAdError,
        };

        // Simulate PropellerAds initialization
        setTimeout(() => {
          setAdState("ready");
          setAdData(mockAdConfig);
        }, 1000);
      }
    } catch (error) {
      console.error("Error initializing PropellerAds:", error);
      setAdState("error");
      onAdError("Advertisement initialization error");
    }
  };

  const handleAdLoaded = () => {
    console.log("PropellerAd loaded");
    setAdState("ready");
  };

  const handleAdStarted = () => {
    console.log("PropellerAd started");
    setAdState("playing");
    setStartTime(Date.now());

    // Start watch time counter
    const interval = setInterval(() => {
      setWatchTime((prev) => {
        const newTime = prev + 1;
        if (newTime >= PROPELLER_CONFIG.minWatchTime) {
          clearInterval(interval);
          handleAdCompleted();
        }
        return newTime;
      });
    }, 1000);
  };

  const handleAdCompleted = () => {
    console.log("PropellerAd completed");
    setAdState("completed");

    const completionData = {
      sessionId,
      walletAddress,
      adType: "propeller",
      zoneId: PROPELLER_CONFIG.zoneId,
      publisherId: PROPELLER_CONFIG.publisherId,
      watchTime,
      startTime,
      endTime: Date.now(),
      verified: true,
    };

    onAdComplete(completionData);
  };

  const handleAdError = (error: any) => {
    console.error("PropellerAd error:", error);
    setAdState("error");
    onAdError("Advertisement playback error");
  };

  const startAd = () => {
    if (adState === "ready") {
      // Simulate starting PropellerAds
      // Replace with actual PropellerAds API call
      handleAdStarted();
    }
  };

  const renderAdContent = () => {
    switch (adState) {
      case "loading":
        return (
          <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-lg">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Loading advertisement...</p>
          </div>
        );

      case "ready":
        return (
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 rounded-lg text-white mb-4">
              <h4 className="text-xl font-bold mb-2">🎯 PropellerAds</h4>
              <p className="mb-4">Watch this sponsored content to continue</p>
              <div className="text-sm opacity-90">
                Powered by PropellerAds • Zone: {PROPELLER_CONFIG.zoneId}
              </div>
            </div>
            <button
              onClick={startAd}
              className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Play className="w-5 h-5" />
              Start Advertisement
            </button>
          </div>
        );

      case "playing":
        return (
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 rounded-lg text-white mb-4 relative">
              <h4 className="text-xl font-bold mb-2">🎯 PropellerAds</h4>
              <p className="mb-4">Please watch the full advertisement</p>

              {/* Ad container for PropellerAds */}
              <div
                ref={adContainerRef}
                className="min-h-[200px] bg-black/20 rounded flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">📺</div>
                  <div>Advertisement Playing...</div>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="mt-4">
                <div className="text-sm mb-2">
                  Watch Time: {watchTime}/{PROPELLER_CONFIG.minWatchTime}s
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-white h-2 rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(
                        (watchTime / PROPELLER_CONFIG.minWatchTime) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              ⚠️ Please keep this tab active and watch the full advertisement
            </p>
          </div>
        );

      case "completed":
        return (
          <div className="text-center p-6 bg-green-100 border border-green-300 rounded-lg">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Advertisement Completed!
            </h3>
            <p className="text-green-700">You can now claim your ETH tokens.</p>
            <div className="text-sm text-green-600 mt-2">
              Verified by PropellerAds • Watch time: {watchTime}s
            </div>
          </div>
        );

      case "error":
        return (
          <div className="text-center p-6 bg-red-100 border border-red-300 rounded-lg">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Advertisement Error
            </h3>
            <p className="text-red-700">
              Failed to load advertisement. Please try again.
            </p>
            <button
              onClick={() => {
                setAdState("loading");
                loadPropellerAds();
              }}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-blue-50 border border-blue-300 rounded-lg">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          Watch Advertisement to Continue
        </h3>
        <p className="text-blue-700">
          Complete the sponsored content to claim your Sepolia ETH
        </p>
      </div>

      {renderAdContent()}
    </div>
  );
}

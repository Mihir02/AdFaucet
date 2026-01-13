"use client";

import React, { createContext, useContext, useCallback, useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { formatEther } from "viem";
import { sepolia } from "wagmi/chains";
import { ETH_AMOUNT, COOLDOWN_HOURS } from "@/lib/wagmi";
import toast from "react-hot-toast";

interface FaucetStats {
  faucetAddress: string;
  balance: string;
  network: string;
  chainId: string;
  ethAmount: string;
  cooldownHours: number;
  isOperational: boolean;
}

interface FaucetContextType {
  // User data
  userBalance: string | undefined;

  // Faucet data
  faucetStats: FaucetStats | undefined;

  // Transaction states
  isVerifyingAd: boolean;
  isRequestingEth: boolean;
  sessionId: string | null;
  lastTxHash: string | null;

  // Actions
  verifyAd: (
    duration: number,
    sessionId?: string,
    actualWatchTime?: number,
    adType?: "propeller" | "mock",
    propellerData?: any
  ) => Promise<void>;
  requestEth: () => Promise<void>;
  refreshStats: () => Promise<void>;

  // Utils
  formatEthAmount: (amount: string) => string;
}

const FaucetContext = createContext<FaucetContextType | undefined>(undefined);

export function FaucetProvider({ children }: { children: React.ReactNode }) {
  const { address } = useAccount();
  const [isVerifyingAd, setIsVerifyingAd] = useState(false);
  const [isRequestingEth, setIsRequestingEth] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [faucetStats, setFaucetStats] = useState<FaucetStats | undefined>();

  // Get user's ETH balance
  const { data: balanceData } = useBalance({
    address,
    chainId: sepolia.id,
  });

  const userBalance = balanceData ? formatEther(balanceData.value) : undefined;

  // Fetch faucet stats
  const refreshStats = useCallback(async () => {
    try {
      const response = await fetch("/api/faucet-stats");
      const data = await response.json();

      if (data.success) {
        setFaucetStats(data.stats);
      } else {
        console.error("Failed to fetch faucet stats:", data.message);
      }
    } catch (error) {
      console.error("Error fetching faucet stats:", error);
    }
  }, []);

  // Load stats on mount
  React.useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  // Verify ad viewing
  const verifyAd = useCallback(
    async (
      duration: number,
      existingSessionId?: string,
      actualWatchTime?: number,
      adType: "propeller" | "mock" = "mock",
      propellerData?: any
    ) => {
      if (!address) {
        toast.error("Please connect your wallet");
        return;
      }

      setIsVerifyingAd(true);
      try {
        const timestamp = Date.now();

        const response = await fetch("/api/verify-ad", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address,
            duration,
            timestamp,
            sessionId: existingSessionId,
            actualWatchTime,
            adType,
            propellerData,
          }),
        });

        const data = await response.json();

        if (data.success) {
          console.log("✅ Ad verification API success:", data);

          // Only set sessionId when ad is completed (duration > 0)
          if (duration > 0) {
            setSessionId(data.sessionId);
            toast.success("Ad verified successfully!");
          } else {
            // For session creation (duration = 0), just log success
            console.log("✅ Ad session created successfully");
          }
        } else {
          console.error("❌ Ad verification API failed:", data);
          toast.error(data.message || "Ad verification failed");
        }
      } catch (error: any) {
        console.error("Ad verification failed:", error);
        toast.error("Ad verification failed. Please try again.");
      } finally {
        setIsVerifyingAd(false);
      }
    },
    [address]
  );

  // Request ETH from faucet
  const requestEth = useCallback(async () => {
    if (!address || !sessionId) {
      toast.error("Please verify ad first");
      return;
    }

    setIsRequestingEth(true);
    try {
      const response = await fetch("/api/drip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          sessionId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setLastTxHash(data.txHash);
        setSessionId(null); // Clear session ID after successful use
        toast.success(`Successfully sent ${ETH_AMOUNT} ETH!`);

        // Refresh stats and user balance
        refreshStats();
      } else {
        toast.error(data.message || "ETH request failed");
      }
    } catch (error: any) {
      console.error("ETH request failed:", error);
      toast.error("ETH request failed. Please try again.");
    } finally {
      setIsRequestingEth(false);
    }
  }, [address, sessionId, refreshStats]);

  // Format ETH amount for display
  const formatEthAmount = useCallback((amount: string) => {
    const num = parseFloat(amount);
    if (num === 0) return "0";
    if (num < 0.0001) return num.toExponential(4);
    return num.toFixed(6);
  }, []);

  const value: FaucetContextType = {
    userBalance,
    faucetStats,
    isVerifyingAd,
    isRequestingEth,
    sessionId,
    lastTxHash,
    verifyAd,
    requestEth,
    refreshStats,
    formatEthAmount,
  };

  return (
    <FaucetContext.Provider value={value}>{children}</FaucetContext.Provider>
  );
}

export function useFaucet() {
  const context = useContext(FaucetContext);
  if (context === undefined) {
    throw new Error("useFaucet must be used within a FaucetProvider");
  }
  return context;
}

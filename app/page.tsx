"use client";

import { useState, useEffect } from "react";
import { WalletConnect } from "@/components/WalletConnect";
import { AdDisplay } from "@/components/AdDisplay";
import { EthClaimButton } from "@/components/TokenClaimButton";
import { useAccount } from "wagmi";
import { useFaucet } from "@/context/FaucetContext";
import { Droplets } from "lucide-react";

export default function Home() {
  const { isConnected } = useAccount();
  const { sessionId } = useFaucet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Ad is verified when we have a sessionId
  const adVerified = !!sessionId;

  return (
    <main className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Droplets className="w-12 h-12 text-white" />
            <h1 className="text-4xl font-bold text-white">
              Sepolia ETH Faucet
            </h1>
          </div>
          <p className="text-xl text-white/90 mb-2">
            Get free Sepolia ETH for testing and development
          </p>
          <p className="text-white/80">
            Connect your wallet, watch an ad, and claim your ETH!
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Step 1: Wallet Connection */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <h2 className="text-xl font-semibold">Connect Wallet</h2>
            </div>
            <WalletConnect />
          </div>

          {/* Step 2: Ad Display */}
          {mounted && isConnected && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    adVerified
                      ? "bg-green-600 text-white"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  2
                </div>
                <h2 className="text-xl font-semibold">Watch Advertisement</h2>
              </div>
              <AdDisplay onAdVerified={() => {}} />
            </div>
          )}

          {/* Step 3: ETH Claim */}
          {mounted && isConnected && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    adVerified
                      ? "bg-blue-600 text-white"
                      : "bg-gray-400 text-white"
                  }`}
                >
                  3
                </div>
                <h2 className="text-xl font-semibold">Claim ETH</h2>
              </div>
              <EthClaimButton />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-white/80">
          <p className="text-sm">
            This faucet provides Sepolia ETH for development and testing
            purposes only.
          </p>
          <p className="text-sm mt-1">
            Sepolia Testnet • Rate Limited: 1 request per 24 hours per
            address/IP
          </p>
        </div>
      </div>
    </main>
  );
}

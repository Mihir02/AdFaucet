"use client";

import { useAccount } from "wagmi";
import { Coins, Clock, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import { useFaucet } from "@/context/FaucetContext";
import { clsx } from "clsx";
import { ETH_AMOUNT } from "@/lib/wagmi";
import { useState, useEffect } from "react";

interface EthClaimButtonProps {
  // Remove adVerified prop since we'll get it from context
}

export function EthClaimButton({}: EthClaimButtonProps) {
  const { address } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const {
    userBalance,
    faucetStats,
    isRequestingEth,
    requestEth,
    formatEthAmount,
    lastTxHash,
    sessionId, // Get sessionId from context
  } = useFaucet();

  // Ad is verified when we have a sessionId
  const adVerified = !!sessionId;

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="p-6 bg-gray-100 border border-gray-300 rounded-lg text-center">
        <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-gray-700">Loading...</p>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="p-6 bg-gray-100 border border-gray-300 rounded-lg text-center">
        <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-700">Please connect your wallet first</p>
      </div>
    );
  }

  if (!adVerified) {
    return (
      <div className="p-6 bg-yellow-100 border border-yellow-300 rounded-lg text-center">
        <Clock className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
        <p className="text-yellow-800">Please watch the ad to continue</p>
      </div>
    );
  }

  const getButtonState = () => {
    if (isRequestingEth) {
      return { text: "Sending ETH...", disabled: true, variant: "loading" };
    }

    if (faucetStats && !faucetStats.isOperational) {
      return {
        text: "Faucet Temporarily Unavailable",
        disabled: true,
        variant: "empty",
      };
    }

    return {
      text: `Claim ${ETH_AMOUNT} ETH`,
      disabled: false,
      variant: "ready",
    };
  };

  const buttonState = getButtonState();

  return (
    <div className="p-6 bg-white border border-gray-300 rounded-lg">
      <div className="text-center mb-6">
        <Coins className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Claim Sepolia ETH
        </h3>

        {userBalance !== undefined && (
          <p className="text-gray-600 mb-4">
            Current Balance: {formatEthAmount(userBalance)} ETH
          </p>
        )}

        {faucetStats && (
          <div className="text-sm text-gray-500 space-y-1">
            <p>Faucet Balance: {formatEthAmount(faucetStats.balance)} ETH</p>
            <p>
              Network: {faucetStats.network} (Chain ID: {faucetStats.chainId})
            </p>
            <p
              className={clsx(
                "font-medium",
                faucetStats.isOperational ? "text-green-600" : "text-red-600"
              )}
            >
              Status:{" "}
              {faucetStats.isOperational ? "Operational" : "Low Balance"}
            </p>
          </div>
        )}
      </div>

      {lastTxHash && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg">
          <p className="text-green-800 text-sm text-center mb-2">
            ✅ Transaction successful!
          </p>
          <a
            href={`https://sepolia.etherscan.io/tx/${lastTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
          >
            View on Etherscan
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      <div className="text-center">
        <button
          onClick={requestEth}
          disabled={buttonState.disabled}
          className={clsx(
            "px-8 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
            {
              "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500":
                buttonState.variant === "ready",
              "bg-gray-400 cursor-not-allowed text-white":
                buttonState.variant === "empty",
              "bg-blue-500 cursor-not-allowed text-white":
                buttonState.variant === "loading",
            }
          )}
          aria-label={buttonState.text}
        >
          {buttonState.variant === "loading" && (
            <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
          )}
          {buttonState.text}
        </button>

        <p className="text-sm text-gray-600 mt-3">
          Limit: 1 request per 24 hours per address/IP
        </p>

        <p className="text-xs text-gray-500 mt-2">
          Free Sepolia testnet ETH for development and testing
        </p>
      </div>
    </div>
  );
}

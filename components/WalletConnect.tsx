"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Wallet, LogOut, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export function WalletConnect() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connectors, connect, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [connectingConnector, setConnectingConnector] = useState<string | null>(
    null
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getConnectorInfo = (connector: any) => {
    if (connector.name === "MetaMask") {
      return { name: "MetaMask", icon: "🦊" };
    }
    if (connector.name === "Coinbase Wallet") {
      return { name: "Coinbase Wallet", icon: "🔵" };
    }
    if (connector.name === "WalletConnect") {
      return { name: "WalletConnect", icon: "🔗" };
    }
    if (connector.name === "Injected") {
      if (connector.id.includes("metaMask")) {
        return { name: "MetaMask", icon: "🦊" };
      }
      if (connector.id.includes("coinbase")) {
        return { name: "Coinbase Wallet", icon: "🔵" };
      }
      return { name: "Browser Wallet", icon: "🌐" };
    }
    return { name: connector.name, icon: "💼" };
  };

  // Filter out duplicate connectors
  const uniqueConnectors = connectors.filter((connector, index, self) => {
    const connectorInfo = getConnectorInfo(connector);
    return (
      index ===
      self.findIndex((c) => getConnectorInfo(c).name === connectorInfo.name)
    );
  });

  const handleConnect = async (connector: any) => {
    try {
      setConnectingConnector(connector.uid);
      await connect({ connector });
      toast.success("Wallet connected successfully!");
    } catch (error: any) {
      console.error("Connection error:", error);
      toast.error(error.message || "Failed to connect wallet");
    } finally {
      setConnectingConnector(null);
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Connect Your Wallet
        </h3>
        <div className="p-4 bg-gray-100 rounded-lg text-center">
          <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading wallet connectors...</p>
        </div>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-4 p-4 bg-green-100 rounded-lg border border-green-300">
        <Wallet className="w-5 h-5 text-green-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800">Connected</p>
          <p className="text-xs text-green-600 font-mono">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
        <button
          onClick={() => disconnect()}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          aria-label="Disconnect wallet"
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">
        Connect Your Wallet
      </h3>

      {error && (
        <div className="p-3 bg-red-100 border border-red-300 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Connection Error</p>
            <p className="text-xs text-red-700 mt-1">{error.message}</p>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {uniqueConnectors.length === 0 ? (
          <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg text-center">
            <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-sm text-yellow-800">
              No wallet connectors available
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Please install MetaMask or another Web3 wallet
            </p>
          </div>
        ) : (
          uniqueConnectors.map((connector) => {
            const isConnectingThis = connectingConnector === connector.uid;
            const connectorInfo = getConnectorInfo(connector);

            return (
              <button
                key={connector.uid}
                onClick={() => handleConnect(connector)}
                disabled={isPending || isConnecting || isConnectingThis}
                className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-white"
                aria-label={`Connect with ${connectorInfo.name}`}
              >
                <span className="text-2xl">{connectorInfo.icon}</span>
                <span className="font-medium flex-1 text-left text-gray-800">
                  {connectorInfo.name}
                </span>
                {isConnectingThis && (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            );
          })
        )}
      </div>

      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          Make sure you have MetaMask or another Web3 wallet installed
        </p>
        <p className="text-xs text-gray-500">
          This faucet works on Sepolia testnet only
        </p>
      </div>

      {/* Debug info in development */}
      {process.env.NODE_ENV === "development" && (
        <details className="text-xs text-gray-500">
          <summary className="cursor-pointer">Debug Info</summary>
          <div className="mt-2 p-2 bg-gray-100 rounded">
            <p>Total connectors: {connectors.length}</p>
            <p>Unique connectors: {uniqueConnectors.length}</p>
            <p>Is connecting: {isConnecting.toString()}</p>
            <p>Is pending: {isPending.toString()}</p>
            <div className="mt-2">
              <p className="font-semibold">All connectors:</p>
              {connectors.map((c, i) => (
                <p key={i} className="ml-2">
                  {i + 1}. {c.name} ({c.id}) - {getConnectorInfo(c).name}
                </p>
              ))}
            </div>
            <div className="mt-2">
              <p className="font-semibold">Filtered connectors:</p>
              {uniqueConnectors.map((c, i) => (
                <p key={i} className="ml-2">
                  {i + 1}. {getConnectorInfo(c).icon} {getConnectorInfo(c).name}{" "}
                  ({c.id})
                </p>
              ))}
            </div>
          </div>
        </details>
      )}
    </div>
  );
}

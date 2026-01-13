"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useEffect, useState } from "react";

export default function DebugPage() {
  const { address, isConnected, isConnecting, connector } = useAccount();
  const { connectors, connect, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Wallet Connection Debug</h1>

        <div className="grid gap-6">
          {/* Account Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Account Status</h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Connected:</strong> {isConnected.toString()}
              </p>
              <p>
                <strong>Connecting:</strong> {isConnecting.toString()}
              </p>
              <p>
                <strong>Address:</strong> {address || "None"}
              </p>
              <p>
                <strong>Connector:</strong> {connector?.name || "None"}
              </p>
            </div>
          </div>

          {/* Available Connectors */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Available Connectors</h2>
            <div className="space-y-2">
              {connectors.length === 0 ? (
                <p className="text-red-600">No connectors found!</p>
              ) : (
                connectors.map((connector, index) => (
                  <div
                    key={connector.uid}
                    className="p-3 border rounded flex items-center justify-between"
                  >
                    <div>
                      <p>
                        <strong>Name:</strong> {connector.name}
                      </p>
                      <p>
                        <strong>ID:</strong> {connector.id}
                      </p>
                      <p>
                        <strong>UID:</strong> {connector.uid}
                      </p>
                    </div>
                    <button
                      onClick={() => connect({ connector })}
                      disabled={isPending || isConnecting}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isPending || isConnecting ? "Connecting..." : "Connect"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Connection Error */}
          {error && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-red-600">
                Connection Error
              </h2>
              <div className="bg-red-50 p-4 rounded border border-red-200">
                <p>
                  <strong>Message:</strong> {error.message}
                </p>
                <p>
                  <strong>Name:</strong> {error.name}
                </p>
                {error.cause && (
                  <p>
                    <strong>Cause:</strong> {String(error.cause)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Browser Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Browser Info</h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong>User Agent:</strong> {navigator.userAgent}
              </p>
              <p>
                <strong>Ethereum Provider:</strong>{" "}
                {typeof window !== "undefined" && (window as any).ethereum
                  ? "Available"
                  : "Not Available"}
              </p>
              <p>
                <strong>MetaMask:</strong>{" "}
                {typeof window !== "undefined" &&
                (window as any).ethereum?.isMetaMask
                  ? "Detected"
                  : "Not Detected"}
              </p>
              <p>
                <strong>Coinbase:</strong>{" "}
                {typeof window !== "undefined" &&
                (window as any).ethereum?.isCoinbaseWallet
                  ? "Detected"
                  : "Not Detected"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-x-4">
              {isConnected && (
                <button
                  onClick={() => disconnect()}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Disconnect
                </button>
              )}
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

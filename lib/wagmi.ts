import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected, metaMask, coinbaseWallet } from "@wagmi/connectors";

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    metaMask(),
    coinbaseWallet({
      appName: "Sepolia ETH Faucet",
    }),
    injected(), // Fallback for other injected wallets
  ],
  transports: {
    [sepolia.id]: http(
      process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.sepolia.org"
    ),
  },
});

// ETH faucet configuration
export const ETH_AMOUNT = process.env.NEXT_PUBLIC_ETH_AMOUNT || "0.0005";
export const COOLDOWN_HOURS = parseInt(
  process.env.NEXT_PUBLIC_COOLDOWN_HOURS || "24"
);

import { defineChain } from "viem";
import { hardhat } from "viem/chains";

export const ritualChain = defineChain({
  id: 1979,
  name: "Ritual Chain",
  nativeCurrency: { name: "RITUAL", symbol: "RITUAL", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
  },
  blockExplorers: {
    default: {
      name: "Ritual Explorer",
      url: "https://explorer.ritualfoundation.org",
    },
  },
});

export const PREDICT_ADDRESS =
  (process.env.NEXT_PUBLIC_PREDICT_ADDRESS as `0x${string}`) ||
  "0x0000000000000000000000000000000000000000";

export const FAUCET_URL = "https://faucet.ritualfoundation.org";
export const EXPLORER_URL = "https://explorer.ritualfoundation.org";

"use client";

import { useState, useEffect, useCallback } from "react";
import { EXPLORER_URL, FAUCET_URL } from "@/lib/config";
import { connectWallet, getPublicClient } from "@/lib/actions";
import { predictAbi } from "@/lib/predict-abi";
import { PREDICT_ADDRESS } from "@/lib/config";

export default function ConnectWallet({
  onConnect,
}: {
  onConnect: (address: `0x${string}`) => void;
}) {
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [loading, setLoading] = useState(false);

  const refreshBalance = useCallback(async (addr: `0x${string}`) => {
    const client = getPublicClient();
    const bal = await client.getBalance({ address: addr });
    setBalance((Number(bal) / 1e18).toFixed(2));
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const result = await connectWallet();
      if (result) {
        setAddress(result.address);
        await refreshBalance(result.address);
        onConnect(result.address);
      }
    } catch (err) {
      console.error("Connect failed:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ethereum = (window as any).ethereum;
    if (ethereum?.selectedAddress) {
      const addr = ethereum.selectedAddress as `0x${string}`;
      setAddress(addr);
      refreshBalance(addr);
      onConnect(addr);
    }
  }, []);

  if (address) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-right text-sm">
          <div className="text-green-400 font-mono">
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
          <div className="text-gray-400">{balance} RITUAL</div>
        </div>
        <a
          href={FAUCET_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-500 rounded"
        >
          Faucet
        </a>
        <a
          href={`${EXPLORER_URL}/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
        >
          Explorer
        </a>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 rounded font-medium transition-colors"
    >
      {loading ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}

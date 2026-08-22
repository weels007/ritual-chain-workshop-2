"use client";

import { useState, useEffect, useCallback } from "react";
import { EXPLORER_URL, FAUCET_URL } from "@/lib/config";
import { connectWallet, getPublicClient } from "@/lib/actions";

export default function ConnectWallet({
  onConnect,
}: {
  onConnect?: (address: `0x${string}`) => void;
} = {}) {
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [balance, setBalance] = useState("0");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const refreshBalance = useCallback(async (addr: `0x${string}`) => {
    try {
      const client = getPublicClient();
      const bal = await client.getBalance({ address: addr });
      setBalance((Number(bal) / 1e18).toFixed(2));
    } catch {}
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const result = await connectWallet();
      if (result) {
        setAddress(result.address);
        await refreshBalance(result.address);
        onConnect?.(result.address);
      }
    } catch (err) {
      console.error("Connect failed:", err);
    }
    setLoading(false);
  };

  const handleDisconnect = () => {
    setAddress(null);
    setBalance("0");
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ethereum = (window as any).ethereum;
    if (ethereum?.selectedAddress) {
      const addr = ethereum.selectedAddress as `0x${string}`;
      setAddress(addr);
      refreshBalance(addr);
      onConnect?.(addr);
    }
  }, []);

  if (address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border">
          <div className="w-2 h-2 rounded-full bg-yes animate-pulse" />
          <button
            onClick={copyAddress}
            className="text-sm font-mono text-foreground cursor-pointer hover:text-brand transition-colors"
            title="Click to copy"
          >
            {address.slice(0, 6)}...{address.slice(-4)}
          </button>
          <span className="text-xs text-muted border-l border-border pl-2">
            {balance} ETH
          </span>
        </div>
        <a
          href={FAUCET_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg bg-surface border border-border text-muted hover:text-brand hover:border-brand/30 transition-all text-xs"
          title="Get test ETH"
        >
          Faucet
        </a>
        <a
          href={`${EXPLORER_URL}/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg bg-surface border border-border text-muted hover:text-brand hover:border-brand/30 transition-all text-xs"
          title="View on explorer"
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
      className="px-5 py-2.5 bg-brand hover:bg-brand-dim disabled:bg-surface-light text-white text-sm font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-brand/20"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg
            className="w-4 h-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Connecting...
        </span>
      ) : (
        "Connect Wallet"
      )}
    </button>
  );
}

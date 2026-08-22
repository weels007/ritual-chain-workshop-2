"use client";

import { useState, useEffect } from "react";
import { getPublicClient } from "@/lib/actions";
import { PREDICT_ADDRESS } from "@/lib/config";
import { predictAbi } from "@/lib/predict-abi";
import { Market } from "@/lib/types";
import MarketCard from "./MarketCard";

type Filter = "all" | "open" | "resolved";

export default function MarketGrid({ filter = "all" }: { filter?: Filter }) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMarkets();
  }, []);

  async function loadMarkets() {
    try {
      const client = getPublicClient();
      const count = await client.readContract({
        address: PREDICT_ADDRESS,
        abi: predictAbi,
        functionName: "marketCount",
      });

      if (count === BigInt(0)) {
        setMarkets([]);
        setLoading(false);
        return;
      }

      const result = await client.readContract({
        address: PREDICT_ADDRESS,
        abi: predictAbi,
        functionName: "getMarkets",
      });
      setMarkets(result as unknown as Market[]);
    } catch (err) {
      setError("Failed to load markets. Is the contract deployed?");
    }
    setLoading(false);
  }

  const filtered =
    filter === "all"
      ? markets
      : filter === "open"
      ? markets.filter((m) => m.state === 0)
      : markets.filter((m) => m.state === 3);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass rounded-xl p-5 animate-pulse">
            <div className="h-6 w-16 bg-surface-light rounded-full mb-4" />
            <div className="h-5 w-3/4 bg-surface-light rounded mb-3" />
            <div className="h-4 w-1/2 bg-surface-light rounded mb-4" />
            <div className="h-1.5 w-full bg-surface-light rounded-full mb-3" />
            <div className="flex justify-between">
              <div className="h-3 w-20 bg-surface-light rounded" />
              <div className="h-3 w-12 bg-surface-light rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-no/10 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-no"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <p className="text-muted mb-4">{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            loadMarkets();
          }}
          className="px-5 py-2.5 bg-surface-light hover:bg-surface-hover text-white text-sm font-medium rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-brand"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </div>
        <p className="text-muted text-lg mb-2">No markets yet</p>
        <p className="text-muted/60 text-sm mb-6">
          Be the first to create a prediction market.
        </p>
        <a
          href="/create"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-dim text-white text-sm font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-brand/20"
        >
          Create First Market
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {filtered.map((m) => (
        <MarketCard key={Number(m.id)} market={m} />
      ))}
    </div>
  );
}

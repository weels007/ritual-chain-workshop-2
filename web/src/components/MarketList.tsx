"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPublicClient } from "@/lib/actions";
import { PREDICT_ADDRESS } from "@/lib/config";
import { predictAbi } from "@/lib/predict-abi";
import {
  Market,
  MARKET_STATE_LABELS,
  OUTCOME_LABELS,
  COMPARATOR_LABELS,
} from "@/lib/types";

export default function MarketList() {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400 animate-pulse">Loading markets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-red-400 mb-4">{error}</div>
        <button
          onClick={() => { setLoading(true); setError(null); loadMarkets(); }}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (markets.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-gray-400 text-lg mb-4">No markets yet</div>
        <Link
          href="/create"
          className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium inline-block transition-colors"
        >
          Create First Market
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {markets.map((m) => {
        const pool = m.totalYes + m.totalNo;
        const yesPct = pool === BigInt(0) ? 50 : Number((m.totalYes * BigInt(10000)) / pool) / 100;
        const isOpen = m.state === 0;

        return (
          <Link
            key={Number(m.id)}
            href={`/market/${m.id}`}
            className="block p-5 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-purple-500/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs px-2 py-0.5 rounded bg-gray-700">
                #{m.id.toString()}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  isOpen
                    ? "bg-green-900/50 text-green-400"
                    : m.state === 3
                    ? "bg-blue-900/50 text-blue-400"
                    : m.state === 4
                    ? "bg-red-900/50 text-red-400"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                {MARKET_STATE_LABELS[m.state]}
              </span>
            </div>

            <h3 className="text-white font-medium mb-3 text-lg">{m.question}</h3>

            <div className="text-sm text-gray-400 mb-3">
              {COMPARATOR_LABELS[m.comparator]} ${m.target.toString()}
              {Number(m.outcome) !== 0 && (
                <span className="ml-2 text-white font-medium">
                  → {OUTCOME_LABELS[m.outcome]}
                </span>
              )}
            </div>

            {pool > BigInt(0) && (
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${yesPct}%` }}
                />
              </div>
            )}

            <div className="flex justify-between text-xs text-gray-500">
              <span>
                YES: {(Number(m.totalYes) / 1e18).toFixed(2)} ({yesPct.toFixed(0)}%)
              </span>
              <span>
                NO: {(Number(m.totalNo) / 1e18).toFixed(2)} ({(100 - yesPct).toFixed(0)}%)
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

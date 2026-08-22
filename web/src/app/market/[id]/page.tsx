"use client";

import { useState, useEffect, use } from "react";
import { getPublicClient, placeBet, claimWinnings, claimRefund, formatRitual } from "@/lib/actions";
import { PREDICT_ADDRESS } from "@/lib/config";
import { predictAbi } from "@/lib/predict-abi";
import {
  Market,
  MARKET_STATE_LABELS,
  OUTCOME_LABELS,
  COMPARATOR_LABELS,
  MarketState,
} from "@/lib/types";

export default function MarketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const marketId = BigInt(id);

  const [market, setMarket] = useState<Market | null>(null);
  const [account, setAccount] = useState<`0x${string}` | null>(null);
  const [betAmount, setBetAmount] = useState("0.01");
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMarket();
    detectWallet();
  }, []);

  async function detectWallet() {
    if (typeof window === "undefined") return;
    const ethereum = (window as any).ethereum;
    if (ethereum?.selectedAddress) {
      setAccount(ethereum.selectedAddress as `0x${string}`);
    }
  }

  async function loadMarket() {
    try {
      const client = getPublicClient();
      const result = await client.readContract({
        address: PREDICT_ADDRESS,
        abi: predictAbi,
        functionName: "getMarket",
        args: [marketId],
      });
      setMarket(result as unknown as Market);
    } catch (err) {
      setError("Failed to load market");
    }
    setLoading(false);
  }

  async function handleBet(isYes: boolean) {
    if (!account) return;
    setTxLoading(true);
    setError(null);
    try {
      const hash = await placeBet(marketId, isYes, BigInt(Math.round(parseFloat(betAmount) * 1e18)));
      setTxHash(hash);
      await loadMarket();
    } catch (err: any) {
      setError(err?.message?.slice(0, 200) || "Bet failed");
    }
    setTxLoading(false);
  }

  async function handleClaimWinnings() {
    setTxLoading(true);
    setError(null);
    try {
      const hash = await claimWinnings(marketId);
      setTxHash(hash);
      await loadMarket();
    } catch (err: any) {
      setError(err?.message?.slice(0, 200) || "Claim failed");
    }
    setTxLoading(false);
  }

  async function handleClaimRefund() {
    setTxLoading(true);
    setError(null);
    try {
      const hash = await claimRefund(marketId);
      setTxHash(hash);
      await loadMarket();
    } catch (err: any) {
      setError(err?.message?.slice(0, 200) || "Refund failed");
    }
    setTxLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400 animate-pulse">Loading market...</div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="text-center py-20">
        <div className="text-red-400 text-lg">Market not found</div>
      </div>
    );
  }

  const pool = market.totalYes + market.totalNo;
  const yesPct = pool === BigInt(0) ? 50 : Number((market.totalYes * BigInt(10000)) / pool) / 100;
  const isOpen = market.state === MarketState.Open;
  const isResolved = market.state === MarketState.Resolved;
  const isInvalid = market.state === MarketState.Invalid;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
        <div className="flex items-start justify-between mb-4">
          <span className="text-xs px-2 py-0.5 rounded bg-gray-700">
            #{market.id.toString()}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              isOpen
                ? "bg-green-900/50 text-green-400"
                : isResolved
                ? "bg-blue-900/50 text-blue-400"
                : isInvalid
                ? "bg-red-900/50 text-red-400"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            {MARKET_STATE_LABELS[market.state]}
          </span>
        </div>

        <h1 className="text-2xl font-bold mb-3">{market.question}</h1>

        <div className="text-sm text-gray-400 mb-1">
          Resolution: observed {COMPARATOR_LABELS[market.comparator]} ${market.target.toString()}
        </div>
        {Number(market.observedValue) !== 0 && (
          <div className="text-sm text-gray-400">
            Observed value: <span className="text-white">${market.observedValue.toString()}</span>
          </div>
        )}
        {isResolved && (
          <div className="text-sm mt-2">
            Outcome: <span className="text-white font-bold">{OUTCOME_LABELS[market.outcome]}</span>
          </div>
        )}
        {isInvalid && (
          <div className="text-sm text-red-400 mt-2">
            Invalid: {market.invalidReason}
          </div>
        )}
      </div>

      {/* Pool */}
      <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
        <h2 className="text-sm font-medium text-gray-400 mb-3">Pool</h2>
        {pool > BigInt(0) && (
          <div className="w-full bg-gray-700 rounded-full h-3 mb-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all"
              style={{ width: `${yesPct}%` }}
            />
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-green-400">
            YES: {formatRitual(market.totalYes)} ({yesPct.toFixed(0)}%)
          </span>
          <span className="text-red-400">
            NO: {formatRitual(market.totalNo)} ({(100 - yesPct).toFixed(0)}%)
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Total: {formatRitual(pool)} RITUAL
        </div>
      </div>

      {/* Bet / Claim */}
      <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
        {isOpen && (
          <>
            <h2 className="text-sm font-medium text-gray-400 mb-3">Place Bet</h2>
            <div className="flex gap-3 mb-4">
              <input
                type="number"
                step="0.001"
                min="0.001"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="Amount (RITUAL)"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleBet(true)}
                disabled={txLoading || !account}
                className="py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                {txLoading ? "..." : "Bet YES"}
              </button>
              <button
                onClick={() => handleBet(false)}
                disabled={txLoading || !account}
                className="py-3 bg-red-600 hover:bg-red-500 disabled:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                {txLoading ? "..." : "Bet NO"}
              </button>
            </div>
            {!account && (
              <p className="text-xs text-gray-500 mt-3 text-center">
                Connect wallet to place bets
              </p>
            )}
          </>
        )}

        {isResolved && (
          <div className="text-center">
            <h2 className="text-sm font-medium text-gray-400 mb-3">Claim Winnings</h2>
            <button
              onClick={handleClaimWinnings}
              disabled={txLoading || !account}
              className="py-3 px-8 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 rounded-lg font-medium text-lg transition-colors"
            >
              {txLoading ? "..." : "Claim Winnings"}
            </button>
          </div>
        )}

        {isInvalid && (
          <div className="text-center">
            <h2 className="text-sm font-medium text-gray-400 mb-3">Claim Refund</h2>
            <button
              onClick={handleClaimRefund}
              disabled={txLoading || !account}
              className="py-3 px-8 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-600 rounded-lg font-medium text-lg transition-colors"
            >
              {txLoading ? "..." : "Claim Refund"}
            </button>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="p-4 bg-gray-800/30 border border-gray-700 rounded-xl text-sm">
        <div className="grid grid-cols-2 gap-2 text-gray-400">
          <span>Close block:</span>
          <span className="text-white text-right">#{market.closeBlock.toString()}</span>
          <span>Resolve block:</span>
          <span className="text-white text-right">#{market.resolveBlock.toString()}</span>
          <span>Attempts:</span>
          <span className="text-white text-right">{market.attempts}/3</span>
          <span>Schedule ID:</span>
          <span className="text-white text-right">{market.scheduleId.toString()}</span>
        </div>
      </div>

      {/* Tx Hash */}
      {txHash && (
        <div className="p-4 bg-green-900/30 border border-green-800 rounded-xl text-sm">
          <span className="text-green-400">Transaction: </span>
          <a
            href={`https://explorer.ritualfoundation.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-300 underline font-mono"
          >
            {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </a>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-900/30 border border-red-800 rounded-xl text-red-300 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}

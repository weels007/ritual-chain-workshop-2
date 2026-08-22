"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  getMarket,
  placeBet,
  claimWinnings,
  claimRefund,
  formatRitual,
  connectWallet,
} from "@/lib/actions";
import { PREDICT_ADDRESS, EXPLORER_URL } from "@/lib/config";
import { predictAbi } from "@/lib/predict-abi";
import { parseEther } from "viem";
import {
  Market,
  MarketState,
  Outcome,
  Comparator,
  MARKET_STATE_LABELS,
  OUTCOME_LABELS,
  COMPARATOR_LABELS,
} from "@/lib/types";

const QUICK_AMOUNTS = [0.01, 0.05, 0.1, 0.5];

const STATE_STYLES: Record<number, string> = {
  [MarketState.Open]: "bg-brand-dim text-brand",
  [MarketState.Closed]: "bg-blue-900/40 text-blue-400",
  [MarketState.Resolving]: "bg-yellow-900/40 text-yellow-400",
  [MarketState.Resolved]: "bg-green-900/40 text-green-400",
  [MarketState.Invalid]: "bg-red-900/40 text-red-400",
};

const CMP: Record<number, string> = {
  [Comparator.GT]: ">",
  [Comparator.GTE]: ">=",
  [Comparator.LT]: "<",
  [Comparator.LTE]: "<=",
};

function parseMarket(raw: any, id: string): Market {
  return {
    id: BigInt(raw.id ?? id),
    creator: raw.creator as `0x${string}`,
    question: raw.question as string,
    oracleUrl: raw.oracleUrl as string,
    jsonPath: raw.jsonPath as string,
    target: raw.target as bigint,
    comparator: raw.comparator as Comparator,
    closeBlock: raw.closeBlock as bigint,
    resolveBlock: raw.resolveBlock as bigint,
    scheduleId: raw.scheduleId as bigint,
    totalYes: raw.totalYes as bigint,
    totalNo: raw.totalNo as bigint,
    state: raw.state as MarketState,
    outcome: raw.outcome as Outcome,
    attempts: raw.attempts as number,
    observedValue: raw.observedValue as bigint,
    invalidReason: raw.invalidReason as string,
  };
}

export default function MarketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<`0x${string}` | null>(null);
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMarket(BigInt(id))
      .then((raw) => {
        if (!cancelled) setMarket(parseMarket(raw, id));
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || "Failed to load market");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const refresh = async () => {
    const raw = await getMarket(BigInt(id));
    setMarket(parseMarket(raw, id));
  };

  const handleConnect = async () => {
    try {
      const result = await connectWallet();
      if (result) setWallet(result.address);
    } catch (err: any) {
      setTxError(err.message);
    }
  };

  const handleBet = async (isYes: boolean) => {
    if (!amount || Number(amount) <= 0) return;
    try {
      setSubmitting(true);
      setTxError(null);
      setTxHash(null);
      const wei = parseEther(amount as `${number}`);
      const hash = await placeBet(BigInt(id), isYes, wei);
      setTxHash(hash);
      await refresh();
      setAmount("");
    } catch (err: any) {
      setTxError(err.message || "Transaction failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClaim = async (type: "winnings" | "refund") => {
    try {
      setSubmitting(true);
      setTxError(null);
      setTxHash(null);
      const hash =
        type === "winnings"
          ? await claimWinnings(BigInt(id))
          : await claimRefund(BigInt(id));
      setTxHash(hash);
      await refresh();
    } catch (err: any) {
      setTxError(err.message || "Claim failed");
    } finally {
      setSubmitting(false);
    }
  };

  const totalPool = market
    ? Number(market.totalYes + market.totalNo) / 1e18
    : 0;
  const yesPct =
    totalPool > 0
      ? (
          (Number(market?.totalYes ?? 0n) / 1e18 / totalPool) *
          100
        ).toFixed(1)
      : "0";
  const noPct =
    totalPool > 0
      ? (
          (Number(market?.totalNo ?? 0n) / 1e18 / totalPool) *
          100
        ).toFixed(1)
      : "0";

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/markets"
          className="inline-flex items-center gap-2 text-muted hover:text-brand transition-colors mb-6"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Markets
        </Link>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-brand/30 border-t-brand rounded-full animate-spin mb-4" />
            <p className="text-muted">Loading market...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/80 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && market && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass rounded-2xl p-6 border border-border-light">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      STATE_STYLES[market.state] ?? "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {MARKET_STATE_LABELS[market.state] ?? "Unknown"}
                  </span>
                  <span className="text-muted text-sm">
                    #{market.id.toString()}
                  </span>
                  {market.scheduleId > 0n && (
                    <span className="text-muted text-sm">
                      Schedule #{market.scheduleId.toString()}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl font-bold text-white mb-4">
                  {market.question}
                </h1>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-surface-light rounded-xl p-3">
                    <p className="text-muted text-xs mb-1">Comparator</p>
                    <p className="text-white font-medium">
                      {CMP[market.comparator] ?? "?"}
                    </p>
                  </div>
                  <div className="bg-surface-light rounded-xl p-3">
                    <p className="text-muted text-xs mb-1">Target</p>
                    <p className="text-white font-medium">
                      {formatRitual(market.target)}
                    </p>
                  </div>
                  <div className="bg-surface-light rounded-xl p-3">
                    <p className="text-muted text-xs mb-1">Observed</p>
                    <p className="text-white font-medium">
                      {market.observedValue > 0n
                        ? formatRitual(market.observedValue)
                        : "\u2014"}
                    </p>
                  </div>
                  <div className="bg-surface-light rounded-xl p-3">
                    <p className="text-muted text-xs mb-1">Outcome</p>
                    <p
                      className={`font-medium ${
                        market.outcome === Outcome.Yes
                          ? "text-yes"
                          : market.outcome === Outcome.No
                            ? "text-no"
                            : "text-muted"
                      }`}
                    >
                      {OUTCOME_LABELS[market.outcome] ?? "Unknown"}
                    </p>
                  </div>
                </div>

                {market.invalidReason && (
                  <div className="bg-red-900/20 border border-red-800 rounded-xl p-3 mb-4">
                    <p className="text-red-400 text-sm">
                      <span className="font-medium">Invalid reason: </span>
                      {market.invalidReason}
                    </p>
                  </div>
                )}

                <div className="text-xs text-muted">
                  <span>Created by </span>
                  <span className="text-white font-mono">
                    {market.creator.slice(0, 6)}...{market.creator.slice(-4)}
                  </span>
                  <span className="mx-2">&middot;</span>
                  <span>Attempts: {market.attempts}</span>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 border border-border-light">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Pool Distribution
                </h2>

                <div className="relative h-6 rounded-full overflow-hidden bg-surface-light mb-4">
                  <div
                    className="absolute inset-y-0 left-0 bg-yes transition-all duration-500"
                    style={{ width: `${yesPct}%` }}
                  />
                  <div
                    className="absolute inset-y-0 right-0 bg-no transition-all duration-500"
                    style={{ width: `${noPct}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yes" />
                      <span className="text-yes font-medium">YES</span>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">
                        {formatRitual(market.totalYes)} ETH
                      </p>
                      <p className="text-muted text-xs">{yesPct}%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-no" />
                      <span className="text-no font-medium">NO</span>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">
                        {formatRitual(market.totalNo)} ETH
                      </p>
                      <p className="text-muted text-xs">{noPct}%</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border-light pt-4 flex items-center justify-between">
                  <span className="text-muted text-sm">Total Pool</span>
                  <span className="text-white font-semibold">
                    {totalPool.toFixed(4)} ETH
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {!wallet ? (
                <div className="glass rounded-2xl p-6 border border-border-light text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-dim flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-brand"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Connect Wallet
                  </h3>
                  <p className="text-muted text-sm mb-4">
                    Connect your MetaMask wallet to interact with this market.
                  </p>
                  <button
                    onClick={handleConnect}
                    className="w-full px-4 py-3 bg-brand text-white rounded-xl font-medium hover:bg-brand/80 transition-colors"
                  >
                    Connect MetaMask
                  </button>
                </div>
              ) : market.state === MarketState.Open ? (
                <div className="glass rounded-2xl p-6 border border-border-light">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Place Bet
                  </h3>

                  <div className="mb-4">
                    <label className="text-muted text-sm mb-2 block">
                      Amount (ETH)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.0"
                      className="w-full px-4 py-3 bg-surface-light border border-border-light rounded-xl text-white placeholder-muted focus:outline-none focus:border-brand transition-colors"
                    />
                  </div>

                  <div className="flex gap-2 mb-6">
                    {QUICK_AMOUNTS.map((a) => (
                      <button
                        key={a}
                        onClick={() => setAmount(String(a))}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                          amount === String(a)
                            ? "bg-brand text-white"
                            : "bg-surface-light text-muted hover:text-white hover:bg-surface-light/80"
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleBet(true)}
                      disabled={submitting || !amount || Number(amount) <= 0}
                      className="py-3 bg-yes text-white rounded-xl font-semibold hover:bg-yes/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Placing..." : "Bet YES"}
                    </button>
                    <button
                      onClick={() => handleBet(false)}
                      disabled={submitting || !amount || Number(amount) <= 0}
                      className="py-3 bg-no text-white rounded-xl font-semibold hover:bg-no/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Placing..." : "Bet NO"}
                    </button>
                  </div>
                </div>
              ) : market.state === MarketState.Resolved ? (
                <div className="glass rounded-2xl p-6 border border-border-light">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Claim Winnings
                  </h3>
                  <p className="text-muted text-sm mb-6">
                    This market has been resolved. Claim your winnings if you
                    bet on the winning outcome.
                  </p>
                  <button
                    onClick={() => handleClaim("winnings")}
                    disabled={submitting}
                    className="w-full py-3 bg-brand text-white rounded-xl font-semibold hover:bg-brand/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Claiming..." : "Claim Winnings"}
                  </button>
                </div>
              ) : market.state === MarketState.Invalid ? (
                <div className="glass rounded-2xl p-6 border border-border-light">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Claim Refund
                  </h3>
                  <p className="text-muted text-sm mb-6">
                    This market was marked invalid. You can claim a refund of
                    your original bet.
                  </p>
                  <button
                    onClick={() => handleClaim("refund")}
                    disabled={submitting}
                    className="w-full py-3 bg-yellow-500 text-black rounded-xl font-semibold hover:bg-yellow-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Claiming..." : "Claim Refund"}
                  </button>
                </div>
              ) : (
                <div className="glass rounded-2xl p-6 border border-border-light text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-light flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-muted"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {MARKET_STATE_LABELS[market.state]}
                  </h3>
                  <p className="text-muted text-sm">
                    {market.state === MarketState.Closed
                      ? "Betting is closed. Waiting for resolution."
                      : "Waiting for oracle resolution."}
                  </p>
                </div>
              )}

              {txHash && (
                <div className="glass rounded-2xl p-4 border border-border-light">
                  <p className="text-yes text-sm font-medium mb-1">
                    Transaction Sent!
                  </p>
                  <a
                    href={`${EXPLORER_URL}/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand text-xs font-mono hover:underline break-all"
                  >
                    {txHash}
                  </a>
                </div>
              )}

              {txError && (
                <div className="glass rounded-2xl p-4 border border-red-800">
                  <p className="text-red-400 text-sm">{txError}</p>
                </div>
              )}

              <a
                href={`${EXPLORER_URL}/address/${PREDICT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="glass rounded-2xl p-4 border border-border-light flex items-center justify-between hover:border-brand transition-colors group"
              >
                <div>
                  <p className="text-white text-sm font-medium">
                    View Contract
                  </p>
                  <p className="text-muted text-xs font-mono">
                    {PREDICT_ADDRESS.slice(0, 10)}...
                  </p>
                </div>
                <svg
                  className="w-4 h-4 text-muted group-hover:text-brand transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

"use client";

import Link from "next/link";
import { Market, MARKET_STATE_LABELS, COMPARATOR_LABELS } from "@/lib/types";

function PoolBar({ yes, no }: { yes: bigint; no: bigint }) {
  const pool = yes + no;
  if (pool === BigInt(0)) {
    return <div className="w-full bg-surface-light rounded-full h-1.5" />;
  }
  const yesPct = Number((yes * BigInt(10000)) / pool) / 100;
  return (
    <div className="w-full bg-surface-light rounded-full h-1.5 overflow-hidden flex">
      <div
        className="bg-yes h-full transition-all duration-500"
        style={{ width: `${yesPct}%` }}
      />
      <div
        className="bg-no h-full transition-all duration-500"
        style={{ width: `${100 - yesPct}%` }}
      />
    </div>
  );
}

function StateBadge({ state }: { state: number }) {
  const styles: Record<number, string> = {
    0: "bg-yes/10 text-yes border-yes/20",
    1: "bg-surface-light text-muted border-border",
    2: "bg-brand/10 text-brand border-brand/20",
    3: "bg-brand/10 text-brand border-brand/20",
    4: "bg-no/10 text-no border-no/20",
  };
  return (
    <span
      className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
        styles[state] || styles[1]
      }`}
    >
      {MARKET_STATE_LABELS[state]}
    </span>
  );
}

export default function MarketCard({ market }: { market: Market }) {
  const pool = market.totalYes + market.totalNo;
  const yesPct =
    pool === BigInt(0) ? 50 : Number((market.totalYes * BigInt(10000)) / pool) / 100;
  const isOpen = market.state === 0;
  const isResolved = market.state === 3;

  return (
    <Link href={`/market/${market.id}`} className="block group">
      <div className="glass glass-hover rounded-xl p-5 transition-all duration-300 h-full">
        <div className="flex items-start justify-between mb-3">
          <StateBadge state={market.state} />
          <span className="text-xs text-muted font-mono">
            #{market.id.toString()}
          </span>
        </div>

        <h3 className="text-white font-semibold text-base mb-3 line-clamp-2 group-hover:text-brand transition-colors">
          {market.question}
        </h3>

        <p className="text-xs text-muted mb-4">
          {COMPARATOR_LABELS[market.comparator]} ${market.target.toString()}
        </p>

        <PoolBar yes={market.totalYes} no={market.totalNo} />

        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-yes" />
              <span className="text-muted">
                YES {(Number(market.totalYes) / 1e18).toFixed(1)}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-no" />
              <span className="text-muted">
                NO {(Number(market.totalNo) / 1e18).toFixed(1)}
              </span>
            </span>
          </div>
          {pool > BigInt(0) && (
            <span className="text-xs font-semibold text-white">
              {yesPct.toFixed(0)}%
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

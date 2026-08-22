"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MarketGrid from "@/components/MarketGrid";

type Filter = "all" | "open" | "resolved";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All Markets" },
  { key: "open", label: "Open" },
  { key: "resolved", label: "Resolved" },
];

export default function MarketsPage() {
  const [filter, setFilter] = useState<Filter>("all");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold text-white">Markets</h1>
              <p className="text-muted mt-1">
                Browse and trade on active prediction markets.
              </p>
            </div>
            <a
              href="/create"
              className="px-5 py-2.5 bg-brand hover:bg-brand-dim text-white text-sm font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-brand/20"
            >
              + Create Market
            </a>
          </div>

          <div className="flex items-center gap-2 mb-8">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === key
                    ? "bg-surface-light text-white border border-border-light"
                    : "text-muted hover:text-white hover:bg-surface-light/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <MarketGrid filter={filter} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

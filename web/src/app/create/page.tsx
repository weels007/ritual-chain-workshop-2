"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createMarket } from "@/lib/actions";

const COMPARATORS = [
  { label: "Greater than (>)", value: 0 },
  { label: "Greater or equal (>=)", value: 1 },
  { label: "Less than (<)", value: 2 },
  { label: "Less or equal (<=)", value: 3 },
];

export default function CreateMarketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [question, setQuestion] = useState("");
  const [oracleUrl, setOracleUrl] = useState("");
  const [jsonPath, setJsonPath] = useState(".price");
  const [target, setTarget] = useState("");
  const [comparator, setComparator] = useState(1);
  const [bettingMinutes, setBettingMinutes] = useState(3);
  const [resolveDelayMinutes, setResolveDelayMinutes] = useState(1);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createMarket({
        question,
        oracleUrl,
        jsonPath,
        target: BigInt(Math.round(parseFloat(target) * 1e18)),
        comparator,
        bettingSeconds: BigInt(bettingMinutes * 60),
        resolveDelaySeconds: BigInt(resolveDelayMinutes * 60),
      });
      setSuccess(true);
      setTimeout(() => router.push("/markets"), 1500);
    } catch (err: any) {
      setError(err?.message?.slice(0, 200) || "Transaction failed");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white">Create Market</h1>
            <p className="text-muted mt-2">
              Define your prediction question and oracle parameters.
            </p>
          </div>

          {success ? (
            <div className="glass rounded-xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-yes/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yes" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Market Created!</h2>
              <p className="text-muted">Redirecting to markets...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="glass rounded-xl p-6 space-y-5">
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Question
                </h2>
                <div>
                  <label className="block text-xs text-muted mb-2 font-medium">
                    What are you predicting?
                  </label>
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Will ETH/USD be at least $4,000 when this market resolves?"
                    className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-white placeholder:text-muted/50 focus:border-brand focus:outline-none transition-colors text-sm"
                    required
                  />
                </div>
              </div>

              <div className="glass rounded-xl p-6 space-y-5">
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Oracle Configuration
                </h2>
                <div>
                  <label className="block text-xs text-muted mb-2 font-medium">
                    Oracle URL
                  </label>
                  <input
                    type="url"
                    value={oracleUrl}
                    onChange={(e) => setOracleUrl(e.target.value)}
                    placeholder="https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
                    className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-white placeholder:text-muted/50 focus:border-brand focus:outline-none transition-colors text-sm font-mono"
                    required
                  />
                  <p className="text-xs text-muted/60 mt-1.5">
                    Publicly accessible JSON endpoint. TEE executors will fetch this URL.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-muted mb-2 font-medium">
                      JSON Path
                    </label>
                    <input
                      type="text"
                      value={jsonPath}
                      onChange={(e) => setJsonPath(e.target.value)}
                      placeholder=".ethereum.usd"
                      className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-white placeholder:text-muted/50 focus:border-brand focus:outline-none transition-colors text-sm font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-2 font-medium">
                      Target Value
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      placeholder="4000"
                      className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-white placeholder:text-muted/50 focus:border-brand focus:outline-none transition-colors text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-muted mb-2 font-market">
                    Condition
                  </label>
                  <select
                    value={comparator}
                    onChange={(e) => setComparator(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-white focus:border-brand focus:outline-none transition-colors text-sm"
                  >
                    {COMPARATORS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="glass rounded-xl p-6 space-y-5">
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Timing
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-muted mb-2 font-medium">
                      Betting Window (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1440"
                      value={bettingMinutes}
                      onChange={(e) => setBettingMinutes(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-white focus:border-brand focus:outline-none transition-colors text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-2 font-medium">
                      Resolve Delay (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1440"
                      value={resolveDelayMinutes}
                      onChange={(e) => setResolveDelayMinutes(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-white focus:border-brand focus:outline-none transition-colors text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-no/5 border border-no/20 rounded-lg text-no text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !question || !oracleUrl || !target}
                className="w-full py-4 bg-brand hover:bg-brand-dim disabled:bg-surface-light disabled:text-muted text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-brand/20 text-base"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating Market...
                  </span>
                ) : (
                  "Create Market"
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
      const hash = await createMarket({
        question,
        oracleUrl,
        jsonPath,
        target: BigInt(Math.round(parseFloat(target) * 1e18)),
        comparator,
        bettingSeconds: BigInt(bettingMinutes * 60),
        resolveDelaySeconds: BigInt(resolveDelayMinutes * 60),
      });
      router.push("/");
    } catch (err: any) {
      setError(err?.message?.slice(0, 200) || "Transaction failed");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create Market</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Question
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Will ETH/USD be at least $4,000 when this market resolves?"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Oracle URL
          </label>
          <input
            type="url"
            value={oracleUrl}
            onChange={(e) => setOracleUrl(e.target.value)}
            placeholder="https://your-tunnel.example/api/oracle/eth"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Must be publicly accessible. TEE executors fetch this URL.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              JSON Path
            </label>
            <input
              type="text"
              value={jsonPath}
              onChange={(e) => setJsonPath(e.target.value)}
              placeholder=".price"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target Value
            </label>
            <input
              type="number"
              step="0.01"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="4000"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Condition
          </label>
          <select
            value={comparator}
            onChange={(e) => setComparator(Number(e.target.value))}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
          >
            {COMPARATORS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Betting Window (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="1440"
              value={bettingMinutes}
              onChange={(e) => setBettingMinutes(Number(e.target.value))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Resolve Delay (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="1440"
              value={resolveDelayMinutes}
              onChange={(e) => setResolveDelayMinutes(Number(e.target.value))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
              required
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 rounded-lg font-medium text-lg transition-colors"
        >
          {loading ? "Creating..." : "Create Market"}
        </button>
      </form>
    </div>
  );
}

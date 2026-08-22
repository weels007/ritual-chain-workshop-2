"use client";

import { useState } from "react";
import Link from "next/link";
import ConnectWallet from "@/components/ConnectWallet";

export default function Shell({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<`0x${string}` | null>(null);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🔮</span>
            <span className="font-bold text-lg">Ritual Predict</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/create"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors"
            >
              + Create Market
            </Link>
            <ConnectWallet onConnect={setAddress} />
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}

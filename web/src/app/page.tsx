"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-1.341 4.023a2.25 2.25 0 01-2.134 1.477H8.475a2.25 2.25 0 01-2.134-1.477L5 14.5m14 0V7.75a2.25 2.25 0 00-2.25-2.25H7.25A2.25 2.25 0 005 7.75v6.75" />
      </svg>
    ),
    title: "TEE-Powered Resolution",
    desc: "Markets settle automatically via Trusted Execution Environment oracles. No human intervention, no manipulation.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: "Instant & Gasless",
    desc: "Ritual Chain delivers 195ms block times. Bet, resolve, and claim in seconds with minimal gas costs.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: "Fully On-Chain",
    desc: "All bets, balances, and resolutions live on-chain. Your funds are always verifiable and self-custodied.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    title: "Any Oracle",
    desc: "Connect any JSON API as your data source. Price feeds, sports scores, election results — you name it.",
  },
];

const STEPS = [
  { num: "01", title: "Create", desc: "Define your question, oracle endpoint, and resolution conditions." },
  { num: "02", title: "Bet", desc: "Users stake ETH on YES or NO outcomes during the betting window." },
  { num: "03", title: "Resolve", desc: "TEE executors fetch data, evaluate conditions, and settle on-chain automatically." },
  { num: "04", title: "Claim", desc: "Winners claim their share of the pool. No manual payouts needed." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden pt-32 pb-20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.12),transparent_60%)]" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand/5 rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand/20 bg-brand/5 text-brand text-xs font-medium mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
              Built on Ritual Chain
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
              Prediction Markets
              <br />
              <span className="gradient-text">That Settle Themselves</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
              Binary outcome markets resolved by TEE oracles. No admin keys, no
              manual buttons, no trust required. Just code.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/markets"
                className="px-8 py-4 bg-brand hover:bg-brand-dim text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-brand/25 text-base"
              >
                Browse Markets
              </Link>
              <Link
                href="/create"
                className="px-8 py-4 bg-surface-light hover:bg-surface-hover border border-border text-white font-semibold rounded-xl transition-all text-base"
              >
                Create Market
              </Link>
            </div>

            {/* Stats bar */}
            <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {[
                { label: "Chain", value: "Ritual" },
                { label: "Block Time", value: "~195ms" },
                { label: "Resolution", value: "TEE Oracle" },
                { label: "Settlement", value: "Automatic" },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <div className="text-lg font-bold text-white">{value}</div>
                  <div className="text-xs text-muted mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-20 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                How It Works
              </h2>
              <p className="text-muted max-w-lg mx-auto">
                Four steps from question to settlement. Fully automated,
                fully on-chain.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {STEPS.map(({ num, title, desc }) => (
                <div key={num} className="relative">
                  <div className="text-5xl font-bold text-surface-light mb-4 select-none">
                    {num}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Why Outcome?
              </h2>
              <p className="text-muted max-w-lg mx-auto">
                Built for a world where trust is replaced by verification.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {FEATURES.map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="glass rounded-xl p-6 glass-hover transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-lg bg-brand/10 flex items-center justify-center text-brand mb-4">
                    {icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="glass rounded-2xl p-12 sm:p-16 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.08),transparent_70%)]" />
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Ready to Predict?
                </h2>
                <p className="text-muted max-w-md mx-auto mb-8">
                  Join the first fully automated prediction market on Ritual
                  Chain.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/markets"
                    className="px-8 py-4 bg-brand hover:bg-brand-dim text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-brand/25"
                  >
                    Start Trading
                  </Link>
                  <a
                    href="https://github.com/weels007/ritual-chain-workshop-2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-4 bg-surface-light hover:bg-surface-hover border border-border text-white font-semibold rounded-xl transition-all"
                  >
                    View Source
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

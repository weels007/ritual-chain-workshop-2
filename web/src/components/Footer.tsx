import Link from "next/link";

const LINKS = [
  { label: "GitHub", href: "https://github.com/weels007/ritual-chain-workshop-2" },
  { label: "Ritual Chain", href: "https://ritual.foundation" },
  { label: "Documentation", href: "#" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center text-white font-bold text-sm">
                O
              </div>
              <span className="font-bold text-lg text-white">Outcome</span>
            </div>
            <p className="text-sm text-muted leading-relaxed max-w-xs">
              Self-resolving binary prediction markets powered by TEE oracles on
              Ritual Chain. No intermediaries, no manual resolution.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Resources
            </h3>
            <ul className="space-y-2">
              {LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted hover:text-brand transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Network
            </h3>
            <div className="space-y-2 text-sm text-muted">
              <p>Chain: Ritual Chain Testnet</p>
              <p>Block Time: ~195ms</p>
              <p>Consensus: TEE-backed</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted">
            Built for Ritual Chain Bootcamp 2 — Proof of Building
          </p>
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} Outcome
          </p>
        </div>
      </div>
    </footer>
  );
}

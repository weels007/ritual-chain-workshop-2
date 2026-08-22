import MarketList from "@/components/MarketList";

export default function Home() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Prediction Markets</h1>
        <p className="text-gray-400">
          Stake RITUAL on YES or NO. Markets resolve themselves — no buttons, no backend.
        </p>
      </div>
      <MarketList />
    </div>
  );
}

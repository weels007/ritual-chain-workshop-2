/**
 * Full flow test: deploy + create market + place bets + verify state.
 * Runs on the built-in EDR network (no external node needed).
 *
 *   npx hardhat run scripts/test-flow.ts
 */
import { network } from "hardhat";
import { parseEther, formatEther } from "viem";
import type { Address } from "viem";

const SCHEDULER_ADDR = "0x56e776BAE2DD60664b69Bd5F865F1180ffB7D58B" as Address;
const RITUAL_WALLET_ADDR = "0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948" as Address;
const TEE_REGISTRY_ADDR = "0x9644e8562cE0Fe12b4deeC4163c064A8862Bf47F" as Address;

const { connection, viem } = await network.create();
const [wallet, user1, user2] = await viem.getWalletClients();
const publicClient = await viem.getPublicClient();
const deployer = wallet.account.address;

console.log("═══════════════════════════════════════════════════════════");
console.log("  RitualPredict - Full Flow Test");
console.log("═══════════════════════════════════════════════════════════\n");

// ── Step 1: Deploy mock system contracts ──
console.log("▸ Step 1: Deploy mock system contracts...");

const tempScheduler = await viem.deployContract("MockScheduler", [], { account: deployer });
const schedulerCode = await publicClient.getCode({ address: tempScheduler.address });

const tempWallet = await viem.deployContract("MockRitualWallet", [], { account: deployer });
const walletCode = await publicClient.getCode({ address: tempWallet.address });

const tempTee = await viem.deployContract("MockTEEServiceRegistry", [], { account: deployer });
const teeCode = await publicClient.getCode({ address: tempTee.address });

await publicClient.request({ method: "hardhat_setCode" as any, params: [SCHEDULER_ADDR, schedulerCode] } as any);
await publicClient.request({ method: "hardhat_setCode" as any, params: [RITUAL_WALLET_ADDR, walletCode] } as any);
await publicClient.request({ method: "hardhat_setCode" as any, params: [TEE_REGISTRY_ADDR, teeCode] } as any);
console.log("  ✓ System contracts deployed at Ritual Chain addresses\n");

// ── Step 2: Deploy RitualPredict ──
console.log("▸ Step 2: Deploy RitualPredict...");

const predict = await viem.deployContract("RitualPredict", [195n], { account: deployer });
console.log(`  ✓ RitualPredict: ${predict.address}`);

// Fund execution fees
const fundHash = await predict.write.fundExecution([500_000n], { value: parseEther("1.0") });
await publicClient.waitForTransactionReceipt({ hash: fundHash });
const execBalance = await predict.read.executionBalance();
console.log(`  ✓ Execution balance: ${formatEther(execBalance)} ETH\n`);

// ── Step 3: Create Market #1 ──
console.log("▸ Step 3: Create Market #1 - ETH/USD Prediction...");

const createHash1 = await predict.write.createMarket([{
  question: "Will ETH/USD be at least $4,000 when this market resolves?",
  oracleUrl: "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
  jsonPath: ".ethereum.usd",
  target: 4000000000000000000000n, // 4000 * 1e18
  comparator: 1, // GTE
  bettingSeconds: 300n, // 5 minutes
  resolveDelaySeconds: 60n, // 1 minute
}], { account: deployer });
await publicClient.waitForTransactionReceipt({ hash: createHash1 });

const market1 = await predict.read.getMarket([1n]);
console.log(`  ✓ Market #1 created`);
console.log(`    Question: ${market1.question}`);
console.log(`    State: ${["Open", "Closed", "Resolving", "Resolved", "Invalid"][Number(market1.state)]}`);
console.log(`    Close block: #${market1.closeBlock}`);
console.log(`    Resolve block: #${market1.resolveBlock}`);
console.log(`    Schedule ID: ${market1.scheduleId}\n`);

// ── Step 4: Create Market #2 ──
console.log("▸ Step 4: Create Market #2 - Bitcoin Prediction...");

const createHash2 = await predict.write.createMarket([{
  question: "Will BTC be above $60,000 at resolution?",
  oracleUrl: "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
  jsonPath: ".bitcoin.usd",
  target: 60000000000000000000000n, // 60000 * 1e18
  comparator: 2, // LT (less than)
  bettingSeconds: 180n, // 3 minutes
  resolveDelaySeconds: 60n,
}], { account: deployer });
await publicClient.waitForTransactionReceipt({ hash: createHash2 });

const market2 = await predict.read.getMarket([2n]);
console.log(`  ✓ Market #2 created`);
console.log(`    Question: ${market2.question}`);
console.log(`    State: ${["Open", "Closed", "Resolving", "Resolved", "Invalid"][Number(market2.state)]}\n`);

// ── Step 5: Place Bets ──
console.log("▸ Step 5: Place bets...");

// User 1 bets YES on Market 1
const bet1Hash = await predict.write.bet([1n, true], {
  account: user1.account.address,
  value: parseEther("0.5"),
});
await publicClient.waitForTransactionReceipt({ hash: bet1Hash });
console.log(`  ✓ User1: 0.5 ETH → YES on Market #1`);

// User 2 bets NO on Market 1
const bet2Hash = await predict.write.bet([1n, false], {
  account: user2.account.address,
  value: parseEther("1.0"),
});
await publicClient.waitForTransactionReceipt({ hash: bet2Hash });
console.log(`  ✓ User2: 1.0 ETH → NO on Market #1`);

// Deployer bets YES on Market 1
const bet3Hash = await predict.write.bet([1n, true], {
  account: deployer,
  value: parseEther("0.3"),
});
await publicClient.waitForTransactionReceipt({ hash: bet3Hash });
console.log(`  ✓ Deployer: 0.3 ETH → YES on Market #1`);

// User 1 bets YES on Market 2
const bet4Hash = await predict.write.bet([2n, true], {
  account: user1.account.address,
  value: parseEther("0.2"),
});
await publicClient.waitForTransactionReceipt({ hash: bet4Hash });
console.log(`  ✓ User1: 0.2 ETH → YES on Market #2\n`);

// ── Step 6: Verify State ──
console.log("▸ Step 6: Verify market state...");

const m1 = await predict.read.getMarket([1n]);
const m1Pool = m1.totalYes + m1.totalNo;
const m1YesPct = Number((m1.totalYes * 10000n) / m1Pool) / 100;

console.log(`  Market #1:`);
console.log(`    Pool: ${formatEther(m1Pool)} ETH`);
console.log(`    YES: ${formatEther(m1.totalYes)} (${m1YesPct.toFixed(1)}%)`);
console.log(`    NO:  ${formatEther(m1.totalNo)} (${(100 - m1YesPct).toFixed(1)}%)`);

const m2 = await predict.read.getMarket([2n]);
console.log(`  Market #2:`);
console.log(`    Pool: ${formatEther(m2.totalYes + m2.totalNo)} ETH`);
console.log(`    YES: ${formatEther(m2.totalYes)}`);
console.log(`    NO:  ${formatEther(m2.totalNo)}\n`);

// ── Step 7: Check stakes ──
console.log("▸ Step 7: Check individual stakes...");

const stakes1 = await predict.read.stakesOf([1n, user1.account.address]);
console.log(`  User1 on Market #1: YES=${formatEther(stakes1[0])} NO=${formatEther(stakes1[1])}`);

const stakes2 = await predict.read.stakesOf([1n, user2.account.address]);
console.log(`  User2 on Market #1: YES=${formatEther(stakes2[0])} NO=${formatEther(stakes2[1])}`);

const stakes3 = await predict.read.stakesOf([1n, deployer]);
console.log(`  Deployer on Market #1: YES=${formatEther(stakes3[0])} NO=${formatEther(stakes3[1])}\n`);

// ── Step 8: List all markets ──
console.log("▸ Step 8: List all markets...");

const allMarkets = await predict.read.getMarkets();
for (const m of allMarkets) {
  const state = ["Open", "Closed", "Resolving", "Resolved", "Invalid"][Number(m.state)];
  const pool = m.totalYes + m.totalNo;
  console.log(`  #${m.id} [${state}] ${m.question}`);
  console.log(`       Pool: ${formatEther(pool)} ETH | YES: ${formatEther(m.totalYes)} | NO: ${formatEther(m.totalNo)}`);
}

console.log("\n═══════════════════════════════════════════════════════════");
console.log("  ✓ Full flow test completed successfully!");
console.log("═══════════════════════════════════════════════════════════");

await connection.close();

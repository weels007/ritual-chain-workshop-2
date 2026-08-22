/**
 * Deploy RitualPredict to a local Hardhat node with mock system contracts.
 *
 *   Terminal 1:  npx hardhat node
 *   Terminal 2:  npx hardhat run scripts/deploy-local.ts --network localhost
 */
import { network } from "hardhat";
import { parseEther } from "viem";

const { connection, viem } = await network.create({ network: "hardhatMainnet", chainType: "l1" });
const [wallet] = await viem.getWalletClients();
const publicClient = await viem.getPublicClient();
const deployer = wallet.account.address;

console.log("── Deployer ──────────────────────────────────────────────");
console.log(`Address:   ${deployer}`);
const balance = await publicClient.getBalance({ address: deployer });
console.log(`Balance:   ${formatEth(balance)} ETH`);

console.log("\n── Deploy Mock System Contracts ───────────────────────────");

const scheduler = await viem.deployContract("MockScheduler", [], { account: deployer });
console.log(`MockScheduler:       ${scheduler.address}`);

const ritualWallet = await viem.deployContract("MockRitualWallet", [], { account: deployer });
console.log(`MockRitualWallet:    ${ritualWallet.address}`);

const teeRegistry = await viem.deployContract("MockTEEServiceRegistry", [], { account: deployer });
console.log(`MockTEEServiceReg:   ${teeRegistry.address}`);

console.log("\n── Deploy RitualPredict ───────────────────────────────────");

// Use 195ms block time (Ritual Chain average)
const blockTimeMs = 195n;
const predict = await viem.deployContract("RitualPredict", [blockTimeMs], { account: deployer });
console.log(`RitualPredict:       ${predict.address}`);

// Prepay execution fees
const funding = parseEther("1.0");
const fundHash = await predict.write.fundExecution([500_000n], { value: funding });
await publicClient.waitForTransactionReceipt({ hash: fundHash });
const execBalance = await predict.read.executionBalance();
console.log(`Execution balance:   ${formatEth(execBalance)} ETH`);

console.log("\n── Summary ────────────────────────────────────────────────");
console.log(`Copy this to web/.env.local:`);
console.log(`NEXT_PUBLIC_PREDICT_ADDRESS=${predict.address}`);

console.log(`\nOr run create-demo-market:`);
console.log(`PREDICT_ADDRESS=${predict.address} ORACLE_URL=http://localhost:3000/api/oracle/eth npx hardhat run scripts/create-demo-market.ts --network localhost`);

await connection.close();

function formatEth(wei: bigint): string {
  return (Number(wei) / 1e18).toFixed(4);
}

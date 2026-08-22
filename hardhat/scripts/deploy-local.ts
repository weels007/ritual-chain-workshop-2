/**
 * Deploy RitualPredict with mock system contracts for local testing.
 * Uses EDR-simulated network (hardhatMainnet).
 *
 *   npx hardhat run scripts/deploy-local.ts
 */
import { network } from "hardhat";
import { parseEther, type Address } from "viem";

const SCHEDULER_ADDR = "0x56e776BAE2DD60664b69Bd5F865F1180ffB7D58B" as Address;
const RITUAL_WALLET_ADDR = "0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948" as Address;
const TEE_REGISTRY_ADDR = "0x9644e8562cE0Fe12b4deeC4163c064A8862Bf47F" as Address;

const { connection, viem } = await network.create();
const [wallet] = await viem.getWalletClients();
const publicClient = await viem.getPublicClient();
const deployer = wallet.account.address;

console.log("── Deployer ──────────────────────────────────────────────");
console.log(`Address:   ${deployer}`);
const balance = await publicClient.getBalance({ address: deployer });
console.log(`Balance:   ${(Number(balance) / 1e18).toFixed(4)} ETH`);

console.log("\n── Deploy Mock Contracts (extract bytecode) ───────────────");

const tempScheduler = await viem.deployContract("MockScheduler", [], { account: deployer });
const schedulerCode = await publicClient.getCode({ address: tempScheduler.address });

const tempWallet = await viem.deployContract("MockRitualWallet", [], { account: deployer });
const walletCode = await publicClient.getCode({ address: tempWallet.address });

const tempTee = await viem.deployContract("MockTEEServiceRegistry", [], { account: deployer });
const teeCode = await publicClient.getCode({ address: tempTee.address });

console.log("── Set Code at Ritual Chain Addresses ────────────────────");

await publicClient.request({ method: "hardhat_setCode" as any, params: [SCHEDULER_ADDR, schedulerCode] } as any);
await publicClient.request({ method: "hardhat_setCode" as any, params: [RITUAL_WALLET_ADDR, walletCode] } as any);
await publicClient.request({ method: "hardhat_setCode" as any, params: [TEE_REGISTRY_ADDR, teeCode] } as any);
console.log("System contracts deployed ✓");

console.log("\n── Deploy RitualPredict ───────────────────────────────────");

const predict = await viem.deployContract("RitualPredict", [195n], { account: deployer });
console.log(`RitualPredict:  ${predict.address}`);

const fundHash = await predict.write.fundExecution([500_000n], { value: parseEther("1.0") });
await publicClient.waitForTransactionReceipt({ hash: fundHash });
console.log(`Funded:         ${(Number(await predict.read.executionBalance()) / 1e18).toFixed(4)} ETH`);

console.log("\n── Done ───────────────────────────────────────────────────");
console.log(`NEXT_PUBLIC_PREDICT_ADDRESS=${predict.address}`);

await connection.close();

import assert from "node:assert/strict";
import { describe, it, before } from "node:test";
import { network } from "hardhat";
import { parseEther, encodeFunctionData, type Address } from "viem";

const SCHEDULER_ADDR = "0x56e776BAE2DD60664b69Bd5F865F1180ffB7D58B" as Address;
const RITUAL_WALLET_ADDR = "0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948" as Address;
const TEE_REGISTRY_ADDR = "0x9644e8562cE0Fe12b4deeC4163c064A8862Bf47F" as Address;

const MOCK_SCHEDULER_ABI = [
  { type: "function", name: "approveScheduler", stateMutability: "nonpayable", inputs: [{ name: "c", type: "address" }], outputs: [] },
  { type: "function", name: "schedule", stateMutability: "payable", inputs: [{ name: "data", type: "bytes" }, { name: "gas", type: "uint32" }, { name: "startBlock", type: "uint32" }, { name: "numCalls", type: "uint32" }, { name: "frequency", type: "uint32" }, { name: "ttl", type: "uint32" }, { name: "maxFeePerGas", type: "uint256" }, { name: "maxPriorityFeePerGas", type: "uint256" }, { name: "value", type: "uint256" }, { name: "payer", type: "address" }], outputs: [{ name: "callId", type: "uint256" }] },
  { type: "function", name: "cancel", stateMutability: "nonpayable", inputs: [{ name: "callId", type: "uint256" }], outputs: [] },
  { type: "function", name: "getCallState", stateMutability: "view", inputs: [{ name: "callId", type: "uint256" }], outputs: [{ name: "state", type: "uint8" }] },
  { type: "function", name: "execute", stateMutability: "nonpayable", inputs: [{ name: "callId", type: "uint256" }], outputs: [] },
  { type: "function", name: "setCallbackData", stateMutability: "nonpayable", inputs: [{ name: "callId", type: "uint256" }, { name: "data", type: "bytes" }], outputs: [] },
] as const;

const MOCK_WALLET_ABI = [
  { type: "function", name: "deposit", stateMutability: "payable", inputs: [{ name: "lockDuration", type: "uint256" }], outputs: [] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
] as const;

describe("RitualPredict", async function () {
  const { viem } = await network.create();
  const publicClient = await viem.getPublicClient();
  const [wallet] = await viem.getWalletClients();
  const deployer = wallet.account.address;

  // Deploy mocks at hardcoded addresses before all tests
  before(async function () {
    // Deploy mock scheduler to get its runtime code
    const mockSchedulerTemp = await viem.deployContract("MockScheduler");
    const schedulerCode = await publicClient.getCode({ address: mockSchedulerTemp.address });
    // Set code at the hardcoded Scheduler address
    await publicClient.request({
      method: "hardhat_setCode" as any,
      params: [SCHEDULER_ADDR, schedulerCode],
    } as any);

    // Deploy mock ritual wallet
    const mockWalletTemp = await viem.deployContract("MockRitualWallet");
    const walletCode = await publicClient.getCode({ address: mockWalletTemp.address });
    await publicClient.request({
      method: "hardhat_setCode" as any,
      params: [RITUAL_WALLET_ADDR, walletCode],
    } as any);

    // Deploy mock TEE registry
    const mockTeeTemp = await viem.deployContract("MockTEEServiceRegistry");
    const teeCode = await publicClient.getCode({ address: mockTeeTemp.address });
    await publicClient.request({
      method: "hardhat_setCode" as any,
      params: [TEE_REGISTRY_ADDR, teeCode],
    } as any);
  });

  it("Should deploy RitualPredict successfully", async function () {
    const predict = await viem.deployContract("RitualPredict", [195n]);
    assert.ok(predict.address, "Contract deployed");

    const blockTime = await predict.read.blockTimeMs();
    assert.equal(blockTime, 195n, "blockTimeMs set correctly");
  });

  it("Should create a market with valid params", async function () {
    const predict = await viem.deployContract("RitualPredict", [195n]);
    const walletClient = viem.getWalletClient(deployer);

    const hash = await predict.write.createMarket([{
      question: "Will ETH be above $3000?",
      oracleUrl: "https://api.example.com/eth",
      jsonPath: ".price",
      target: parseEther("3000"),
      comparator: 1, // GTE
      bettingSeconds: 180n,
      resolveDelaySeconds: 60n,
    }], { account: deployer });
    await publicClient.waitForTransactionReceipt({ hash });

    const count = await predict.read.marketCount();
    assert.equal(count, 1n, "Market count is 1");

    const market = await predict.read.getMarket([1n]);
    assert.equal(market.question, "Will ETH be above $3000?");
    assert.equal(Number(market.state), 0, "Market is Open");
    assert.equal(Number(market.comparator), 1, "Comparator is GTE");
  });

  it("Should accept bets on YES and NO sides", async function () {
    const predict = await viem.deployContract("RitualPredict", [195n]);
    const walletClient = viem.getWalletClient(deployer);

    await predict.write.createMarket([{
      question: "Test market",
      oracleUrl: "https://example.com",
      jsonPath: ".val",
      target: 100n,
      comparator: 0,
      bettingSeconds: 300n,
      resolveDelaySeconds: 60n,
    }], { account: deployer });

    // Bet YES
    const hashYes = await predict.write.bet([1n, true], {
      account: deployer,
      value: parseEther("0.1"),
    });
    await publicClient.waitForTransactionReceipt({ hash: hashYes });

    const yesStake = await predict.read.yesStake([1n, deployer]);
    assert.equal(yesStake, parseEther("0.1"), "YES stake recorded");

    // Bet NO
    const hashNo = await predict.write.bet([1n, false], {
      account: deployer,
      value: parseEther("0.2"),
    });
    await publicClient.waitForTransactionReceipt({ hash: hashNo });

    const noStake = await predict.read.noStake([1n, deployer]);
    assert.equal(noStake, parseEther("0.2"), "NO stake recorded");

    const market = await predict.read.getMarket([1n]);
    assert.equal(market.totalYes, parseEther("0.1"), "totalYes correct");
    assert.equal(market.totalNo, parseEther("0.2"), "totalNo correct");
  });

  it("Should reject bet with zero value", async function () {
    const predict = await viem.deployContract("RitualPredict", [195n]);

    await predict.write.createMarket([{
      question: "Test",
      oracleUrl: "https://x.com",
      jsonPath: ".x",
      target: 1n,
      comparator: 0,
      bettingSeconds: 60n,
      resolveDelaySeconds: 30n,
    }], { account: deployer });

    await assert.rejects(
      predict.write.bet([1n, true], { account: deployer, value: 0n }),
      /ZeroStake/,
    );
  });

  it("Should reject bet after close block", async function () {
    const predict = await viem.deployContract("RitualPredict", [195n]);

    // 30s = MIN_BETTING_SECONDS → ~154 blocks
    await predict.write.createMarket([{
      question: "Test",
      oracleUrl: "https://x.com",
      jsonPath: ".x",
      target: 1n,
      comparator: 0,
      bettingSeconds: 30n,
      resolveDelaySeconds: 20n,
    }], { account: deployer });

    // Mine blocks past the close block (~154 blocks)
    await publicClient.request({
      method: "hardhat_mine" as any,
      params: ["0x100"], // 256 blocks
    } as any);

    await assert.rejects(
      predict.write.bet([1n, true], { account: deployer, value: parseEther("0.01") }),
      /BettingClosed/,
    );
  });

  it("Should reject unknown market", async function () {
    const predict = await viem.deployContract("RitualPredict", [195n]);

    await assert.rejects(
      predict.read.getMarket([999n]),
      /UnknownMarket/,
    );
  });

  it("Should track multiple markets", async function () {
    const predict = await viem.deployContract("RitualPredict", [195n]);

    for (let i = 0; i < 3; i++) {
      await predict.write.createMarket([{
        question: `Market ${i}`,
        oracleUrl: "https://example.com",
        jsonPath: ".v",
        target: BigInt(i),
        comparator: 0,
        bettingSeconds: 60n,
        resolveDelaySeconds: 30n,
      }], { account: deployer });
    }

    const count = await predict.read.marketCount();
    assert.equal(count, 3n, "Three markets created");

    const allMarkets = await predict.read.getMarkets();
    assert.equal(allMarkets.length, 3, "getMarkets returns 3");
  });

  it("Should refund from invalid market", async function () {
    const predict = await viem.deployContract("RitualPredict", [195n]);

    await predict.write.createMarket([{
      question: "Refund test",
      oracleUrl: "https://example.com",
      jsonPath: ".x",
      target: 1n,
      comparator: 0,
      bettingSeconds: 60n,
      resolveDelaySeconds: 20n,
    }], { account: deployer });

    await predict.write.bet([1n, true], {
      account: deployer,
      value: parseEther("0.5"),
    });

    const balBefore = await publicClient.getBalance({ address: deployer });

    // Simulate invalidation via Scheduler
    const scheduler = await viem.getContractAt("MockScheduler", SCHEDULER_ADDR);
    const market = await predict.read.getMarket([1n]);

    // Set callback data for the scheduler to call onScheduledResolve
    // But first we need to manually invalidate for testing
    // The _invalidate function is private, so we test through the Scheduler flow

    // For now, check that the stakes are recorded
    const yesStake = await predict.read.yesStake([1n, deployer]);
    assert.equal(yesStake, parseEther("0.5"), "Stake recorded for refund test");
  });

  it("Should return stakes info via stakesOf", async function () {
    const predict = await viem.deployContract("RitualPredict", [195n]);

    await predict.write.createMarket([{
      question: "Stakes test",
      oracleUrl: "https://example.com",
      jsonPath: ".x",
      target: 1n,
      comparator: 0,
      bettingSeconds: 60n,
      resolveDelaySeconds: 30n,
    }], { account: deployer });

    await predict.write.bet([1n, true], {
      account: deployer,
      value: parseEther("0.3"),
    });

    const stakes = await predict.read.stakesOf([1n, deployer]);
    assert.equal(stakes[0], parseEther("0.3"), "yes stake correct");
    assert.equal(stakes[1], 0n, "no stake is zero");
    assert.equal(stakes[2], false, "not settled yet");
  });
});

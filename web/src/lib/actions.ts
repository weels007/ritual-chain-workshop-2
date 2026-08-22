"use client";

import { createPublicClient, createWalletClient, http, parseEther } from "viem";
import { ritualChain, PREDICT_ADDRESS } from "./config";
import { predictAbi } from "./predict-abi";

export function getPublicClient() {
  return createPublicClient({
    chain: ritualChain,
    transport: http(),
  });
}

export function getWalletClient() {
  return createWalletClient({
    chain: ritualChain,
    transport: http(),
  });
}

export async function connectWallet() {
  if (typeof window === "undefined") return null;
  const wallet = getWalletClient();
  const [address] = await wallet.requestAddresses();
  return { wallet, address: address as `0x${string}` };
}

export async function getMarketCount() {
  const client = getPublicClient();
  const count = await client.readContract({
    address: PREDICT_ADDRESS,
    abi: predictAbi,
    functionName: "marketCount",
  });
  return count;
}

export async function getMarket(marketId: bigint) {
  const client = getPublicClient();
  const market = await client.readContract({
    address: PREDICT_ADDRESS,
    abi: predictAbi,
    functionName: "getMarket",
    args: [marketId],
  });
  return market;
}

export async function getMarkets() {
  const client = getPublicClient();
  const markets = await client.readContract({
    address: PREDICT_ADDRESS,
    abi: predictAbi,
    functionName: "getMarkets",
  });
  return markets;
}

export async function getStakes(marketId: bigint, account: `0x${string}`) {
  const client = getPublicClient();
  const stakes = await client.readContract({
    address: PREDICT_ADDRESS,
    abi: predictAbi,
    functionName: "stakesOf",
    args: [marketId, account],
  });
  return stakes;
}

export async function createMarket(params: {
  question: string;
  oracleUrl: string;
  jsonPath: string;
  target: bigint;
  comparator: number;
  bettingSeconds: bigint;
  resolveDelaySeconds: bigint;
}) {
  const { wallet, address } = (await connectWallet())!;
  const hash = await wallet.writeContract({
    address: PREDICT_ADDRESS,
    abi: predictAbi,
    functionName: "createMarket",
    account: address,
    args: [params],
  });
  return hash;
}

export async function placeBet(marketId: bigint, isYes: boolean, amount: bigint) {
  const { wallet, address } = (await connectWallet())!;
  const hash = await wallet.writeContract({
    address: PREDICT_ADDRESS,
    abi: predictAbi,
    functionName: "bet",
    account: address,
    args: [marketId, isYes],
    value: amount,
  });
  return hash;
}

export async function claimWinnings(marketId: bigint) {
  const { wallet, address } = (await connectWallet())!;
  const hash = await wallet.writeContract({
    address: PREDICT_ADDRESS,
    abi: predictAbi,
    functionName: "claimWinnings",
    account: address,
    args: [marketId],
  });
  return hash;
}

export async function claimRefund(marketId: bigint) {
  const { wallet, address } = (await connectWallet())!;
  const hash = await wallet.writeContract({
    address: PREDICT_ADDRESS,
    abi: predictAbi,
    functionName: "claimRefund",
    account: address,
    args: [marketId],
  });
  return hash;
}

export function formatRitual(wei: bigint): string {
  const eth = Number(wei) / 1e18;
  return eth.toFixed(4);
}

export function formatBlock(block: bigint, currentBlock: bigint, blockTimeMs: bigint): string {
  if (block <= currentBlock) return "now";
  const seconds = Number((block - currentBlock) * blockTimeMs) / 1000;
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${(seconds / 3600).toFixed(1)}h`;
}

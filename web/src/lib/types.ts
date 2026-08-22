export enum MarketState {
  Open = 0,
  Closed = 1,
  Resolving = 2,
  Resolved = 3,
  Invalid = 4,
}

export enum Comparator {
  GT = 0,
  GTE = 1,
  LT = 2,
  LTE = 3,
}

export enum Outcome {
  Unresolved = 0,
  Yes = 1,
  No = 2,
}

export interface Market {
  id: bigint;
  creator: `0x${string}`;
  question: string;
  oracleUrl: string;
  jsonPath: string;
  target: bigint;
  comparator: Comparator;
  closeBlock: bigint;
  resolveBlock: bigint;
  scheduleId: bigint;
  totalYes: bigint;
  totalNo: bigint;
  state: MarketState;
  outcome: Outcome;
  attempts: number;
  observedValue: bigint;
  invalidReason: string;
}

export interface Stakes {
  yes: bigint;
  no: bigint;
  alreadySettled: boolean;
  claimable: bigint;
}

export const MARKET_STATE_LABELS = [
  "Open",
  "Closed",
  "Resolving",
  "Resolved",
  "Invalid",
] as const;

export const OUTCOME_LABELS = ["Unresolved", "YES", "NO"] as const;

export const COMPARATOR_LABELS = ["greater than", "greater or equal", "less than", "less or equal"] as const;

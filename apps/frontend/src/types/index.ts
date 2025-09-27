export interface User {
  id: string;
  worldId: string;
  walletAddress?: string;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface ArbitrageOpportunity {
  id: string;
  tokenA: string;
  tokenB: string;
  priceA: number;
  priceB: number;
  profit: number;
  profitPercentage: number;
  gasEstimate: number;
  dexA: string;
  dexB: string;
  chainId: number;
  expiresAt: Date;
}

export interface Trade {
  id: string;
  userId: string;
  opportunityId: string;
  amount: number;
  profit: number;
  gasUsed: number;
  txHash: string;
  status: "pending" | "success" | "failed";
  createdAt: Date;
}

export interface UserStats {
  totalTrades: number;
  totalProfit: number;
  successRate: number;
  rank: number;
}

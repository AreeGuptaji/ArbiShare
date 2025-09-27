import { ArbitrageOpportunity, Trade, User, UserStats } from "@/types";

export const mockUser: User = {
  id: "user-123",
  worldId: "0x1234567890abcdef",
  walletAddress: "0x742d35Cc6634C0532925a3b8D7c9c6F8C1234567",
  createdAt: new Date("2024-01-15"),
  lastActiveAt: new Date(),
};

export const mockOpportunities: ArbitrageOpportunity[] = [
  {
    id: "opp-1",
    tokenA: "USDC",
    tokenB: "USDT",
    priceA: 1.001,
    priceB: 0.999,
    profit: 50.25,
    profitPercentage: 0.025,
    gasEstimate: 15,
    dexA: "Uniswap V3",
    dexB: "Curve",
    chainId: 8453,
    expiresAt: new Date(Date.now() + 300000),
  },
  {
    id: "opp-2",
    tokenA: "ETH",
    tokenB: "WETH",
    priceA: 2450.5,
    priceB: 2445.25,
    profit: 125.75,
    profitPercentage: 0.021,
    gasEstimate: 22,
    dexA: "Aerodrome",
    dexB: "Uniswap V3",
    chainId: 8453,
    expiresAt: new Date(Date.now() + 180000),
  },
  {
    id: "opp-3",
    tokenA: "OP",
    tokenB: "OP",
    priceA: 2.15,
    priceB: 2.12,
    profit: 75.3,
    profitPercentage: 0.014,
    gasEstimate: 18,
    dexA: "Velodrome",
    dexB: "Uniswap V3",
    chainId: 10,
    expiresAt: new Date(Date.now() + 240000),
  },
];

export const mockTrades: Trade[] = [
  {
    id: "trade-1",
    userId: "user-123",
    opportunityId: "opp-1",
    amount: 1000,
    profit: 25.5,
    gasUsed: 12,
    txHash:
      "0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890",
    status: "success",
    createdAt: new Date("2024-09-27T10:30:00Z"),
  },
  {
    id: "trade-2",
    userId: "user-123",
    opportunityId: "opp-2",
    amount: 2500,
    profit: 67.25,
    gasUsed: 18,
    txHash:
      "0x2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890ab",
    status: "success",
    createdAt: new Date("2024-09-27T09:15:00Z"),
  },
  {
    id: "trade-3",
    userId: "user-123",
    opportunityId: "opp-3",
    amount: 500,
    profit: -5.75,
    gasUsed: 15,
    txHash:
      "0x3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcd",
    status: "failed",
    createdAt: new Date("2024-09-26T16:45:00Z"),
  },
];

export const mockUserStats: UserStats = {
  totalTrades: 15,
  totalProfit: 342.75,
  successRate: 0.87,
  rank: 42,
};

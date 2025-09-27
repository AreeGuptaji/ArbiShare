export const mockMiniAppUser = {
  name: "Alex Chen",
  avatar: "👨‍💼",
  worldIdVerified: true,
  totalBalance: 24567.89,
  dailyChange: 2.3,
  mode: "arbitrage" as "arbitrage" | "lp",
};

export const mockArbitrageStats = {
  todaysOpportunities: 47,
  opportunitiesChange: 12,
  successRate: 94.2,
  successRateChange: 2.1,
  totalProfit: 8234,
  profitChange: 5.7,
};

export const mockLPStats = {
  totalLPValue: 8432.1,
  currentAPY: 12.4,
  rewardsEarned: 247.83,
  activePools: 5,
  dailyYield: 34.21,
};

export const mockLPPositions = [
  {
    id: "lp-1",
    pair: "ETH/USDC",
    protocol: "Uniswap V3",
    fee: "0.3%",
    value: 3247.5,
    dailyEarnings: 12.43,
  },
  {
    id: "lp-2",
    pair: "WBTC/ETH",
    protocol: "SushiSwap",
    fee: "0.25%",
    value: 2184.6,
    dailyEarnings: 8.92,
  },
  {
    id: "lp-3",
    pair: "DAI/USDC",
    protocol: "Curve",
    fee: "Stable Pool",
    value: 3000.0,
    dailyEarnings: 13.86,
  },
];

export const mockRecentActivity = [
  {
    id: "act-1",
    type: "arbitrage",
    pair: "ETH/USDC",
    profit: 234.56,
    timestamp: "2 minutes ago",
    success: true,
  },
  {
    id: "act-2",
    type: "arbitrage",
    pair: "BTC/USDT",
    profit: 187.43,
    timestamp: "8 minutes ago",
    success: true,
  },
  {
    id: "act-3",
    type: "arbitrage",
    pair: "MATIC/ETH",
    profit: -23.12,
    timestamp: "15 minutes ago",
    success: false,
  },
];

export const mockRateLimit = {
  used: 12,
  total: 15,
  resetTime: "4m 23s",
};

export const mockMarketData = {
  eth: { price: 3247.82, change: 2.4 },
  btc: { price: 67234.15, change: -1.2 },
};

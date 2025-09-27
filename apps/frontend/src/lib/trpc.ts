// Mock API functions to replace tRPC
import {
  mockOpportunities,
  mockTrades,
  mockUser,
  mockUserStats,
} from "./mockData";

export const api = {
  arbitrage: {
    getOpportunities: () => Promise.resolve(mockOpportunities),
    executeArbitrage: (opportunityId: string) =>
      Promise.resolve({
        success: true,
        txHash: "0x123...abc",
        profit:
          mockOpportunities.find((o) => o.id === opportunityId)?.profit || 0,
      }),
  },
  user: {
    getProfile: () => Promise.resolve(mockUser),
    getStats: () => Promise.resolve(mockUserStats),
    getTrades: () => Promise.resolve(mockTrades),
  },
  auth: {
    verifyWorldID: () => Promise.resolve({ success: true, userId: "user-123" }),
    logout: () => Promise.resolve({ success: true }),
  },
};

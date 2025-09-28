// Decentralized analytics using on-chain data and IPFS
import { onChainState } from "./on-chain-state.js";
import { ipfsStorage } from "./ipfs-storage.js";

export interface ProtocolMetrics {
  totalVolume: number;
  totalProfits: number;
  uniqueUsers: number;
  successRate: number;
  averageProfit: number;
  topPerformers: UserPerformance[];
  chainDistribution: ChainMetrics[];
  timeSeriesData: TimeSeriesPoint[];
}

export interface UserPerformance {
  address: string;
  totalEarnings: string;
  successfulArbitrages: number;
  mevScore: number;
  rank: number;
  winRate: number;
}

export interface ChainMetrics {
  chainId: number;
  chainName: string;
  volume: number;
  executions: number;
  averageGas: number;
  profitability: number;
}

export interface TimeSeriesPoint {
  timestamp: number;
  volume: number;
  executions: number;
  profits: number;
  uniqueUsers: number;
}

export interface OpportunityAnalytics {
  tokenPair: string;
  frequency: number;
  averageProfit: number;
  successRate: number;
  competitionLevel: number;
  optimalTiming: string[];
}

export class DecentralizedAnalytics {
  private cache: Map<string, { data: any; expiry: number }> = new Map();
  private readonly CACHE_DURATION = 300000; // 5 minutes

  // Get comprehensive protocol metrics
  async getProtocolMetrics(): Promise<ProtocolMetrics> {
    const cacheKey = "protocol-metrics";
    const cached = this.cache.get(cacheKey);

    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    try {
      // Get base protocol stats from on-chain state
      const baseStats = onChainState.getProtocolStats();
      const recentExecutions = onChainState.getRecentExecutions(1000);

      // Calculate advanced metrics
      const successRate = this.calculateSuccessRate(recentExecutions);
      const topPerformers = await this.getTopPerformers();
      const chainDistribution =
        this.calculateChainDistribution(recentExecutions);
      const timeSeriesData = this.generateTimeSeriesData(recentExecutions);

      const metrics: ProtocolMetrics = {
        totalVolume: baseStats.totalVolume,
        totalProfits: baseStats.totalProfits,
        uniqueUsers: baseStats.uniqueUsers,
        successRate,
        averageProfit: baseStats.averageProfit,
        topPerformers,
        chainDistribution,
        timeSeriesData,
      };

      // Cache the results
      this.cache.set(cacheKey, {
        data: metrics,
        expiry: Date.now() + this.CACHE_DURATION,
      });

      return metrics;
    } catch (error) {
      console.error("Error getting protocol metrics:", error);
      return this.getDefaultMetrics();
    }
  }

  // Get user-specific analytics
  async getUserAnalytics(userAddress: string): Promise<{
    performance: UserPerformance;
    executionHistory: any[];
    profitTrends: TimeSeriesPoint[];
    favoriteTokens: { token: string; count: number; profit: number }[];
    recommendations: string[];
  }> {
    try {
      const userStats = await onChainState.getUserStats(userAddress);
      const executions = onChainState.getUserExecutions(userAddress);

      if (!userStats) {
        throw new Error("User not found");
      }

      // Calculate user performance metrics
      const performance: UserPerformance = {
        address: userAddress,
        totalEarnings: userStats.totalEarnings.toString(),
        successfulArbitrages: userStats.successfulArbitrages,
        mevScore: userStats.mevScore,
        rank: await this.getUserRank(userAddress),
        winRate: this.calculateWinRate(executions),
      };

      // Generate profit trends
      const profitTrends = this.generateUserProfitTrends(executions);

      // Find favorite tokens
      const favoriteTokens = this.analyzeFavoriteTokens(executions);

      // Generate personalized recommendations
      const recommendations = this.generateRecommendations(
        userStats,
        executions
      );

      return {
        performance,
        executionHistory: executions.slice(0, 50), // Last 50 executions
        profitTrends,
        favoriteTokens,
        recommendations,
      };
    } catch (error) {
      console.error("Error getting user analytics:", error);
      throw error;
    }
  }

  // Analyze MEV opportunities by token pairs
  async getOpportunityAnalytics(): Promise<OpportunityAnalytics[]> {
    try {
      const executions = onChainState.getRecentExecutions(5000);
      const tokenPairMap = new Map<string, any[]>();

      // Group executions by token pair
      executions.forEach((exec) => {
        const pair = `${exec.tokenIn}-${exec.tokenOut}`;
        if (!tokenPairMap.has(pair)) {
          tokenPairMap.set(pair, []);
        }
        tokenPairMap.get(pair)!.push(exec);
      });

      const analytics: OpportunityAnalytics[] = [];

      for (const [tokenPair, pairExecutions] of tokenPairMap.entries()) {
        const totalExecutions = pairExecutions.length;
        const successfulExecutions = pairExecutions.filter(
          (exec) => Number(exec.actualProfit) > 0
        ).length;

        const averageProfit =
          pairExecutions.reduce(
            (sum, exec) => sum + Number(exec.actualProfit),
            0
          ) / totalExecutions;

        const successRate = (successfulExecutions / totalExecutions) * 100;

        // Analyze timing patterns
        const hourlyDistribution = this.analyzeTimingPatterns(pairExecutions);
        const optimalTiming = this.getOptimalTimingWindows(hourlyDistribution);

        // Calculate competition level based on execution frequency
        const competitionLevel = Math.min(100, (totalExecutions / 100) * 100);

        analytics.push({
          tokenPair,
          frequency: totalExecutions,
          averageProfit,
          successRate,
          competitionLevel,
          optimalTiming,
        });
      }

      return analytics.sort((a, b) => b.frequency - a.frequency);
    } catch (error) {
      console.error("Error getting opportunity analytics:", error);
      return [];
    }
  }

  // Get real-time market conditions
  async getMarketConditions(): Promise<{
    volatility: number;
    opportunityCount: number;
    competitionLevel: number;
    optimalChains: number[];
    riskLevel: "low" | "medium" | "high";
    recommendations: string[];
  }> {
    try {
      const recentExecutions = onChainState.getRecentExecutions(100);
      const currentTime = Date.now();
      const oneHourAgo = currentTime - 3600000;

      // Filter recent executions (last hour)
      const recentActivity = recentExecutions.filter(
        (exec) => exec.timestamp > oneHourAgo
      );

      // Calculate volatility based on profit variance
      const profits = recentActivity.map((exec) => Number(exec.actualProfit));
      const volatility = this.calculateVolatility(profits);

      // Count current opportunities (mock data for demo)
      const opportunityCount = Math.floor(Math.random() * 20) + 5;

      // Calculate competition level
      const competitionLevel = Math.min(
        100,
        (recentActivity.length / 10) * 100
      );

      // Determine optimal chains based on recent success
      const chainSuccess = this.analyzeChainPerformance(recentActivity);
      const optimalChains = chainSuccess
        .sort((a, b) => b.successRate - a.successRate)
        .slice(0, 3)
        .map((chain) => chain.chainId);

      // Determine risk level
      let riskLevel: "low" | "medium" | "high" = "low";
      if (volatility > 50 || competitionLevel > 70) riskLevel = "high";
      else if (volatility > 25 || competitionLevel > 40) riskLevel = "medium";

      // Generate recommendations
      const recommendations = this.generateMarketRecommendations(
        volatility,
        competitionLevel,
        opportunityCount
      );

      return {
        volatility,
        opportunityCount,
        competitionLevel,
        optimalChains,
        riskLevel,
        recommendations,
      };
    } catch (error) {
      console.error("Error getting market conditions:", error);
      return {
        volatility: 0,
        opportunityCount: 0,
        competitionLevel: 0,
        optimalChains: [],
        riskLevel: "low",
        recommendations: [],
      };
    }
  }

  // Store analytics data on IPFS for historical preservation
  async storeAnalyticsSnapshot(): Promise<string | null> {
    try {
      const metrics = await this.getProtocolMetrics();
      const marketConditions = await this.getMarketConditions();

      const snapshot = {
        timestamp: Date.now(),
        version: "1.0.0",
        protocolMetrics: metrics,
        marketConditions,
        metadata: {
          totalUsers: metrics.uniqueUsers,
          totalVolume: metrics.totalVolume,
          snapshotType: "daily",
        },
      };

      const ipfsHash = await ipfsStorage.storeExecutionMetadata(
        snapshot as any
      );

      if (ipfsHash) {
        console.log(`📊 Analytics snapshot stored on IPFS: ${ipfsHash}`);
      }

      return ipfsHash;
    } catch (error) {
      console.error("Error storing analytics snapshot:", error);
      return null;
    }
  }

  // Private helper methods
  private calculateSuccessRate(executions: any[]): number {
    if (executions.length === 0) return 0;
    const successful = executions.filter(
      (exec) => Number(exec.actualProfit) > 0
    );
    return (successful.length / executions.length) * 100;
  }

  private async getTopPerformers(): Promise<UserPerformance[]> {
    // In production, this would query all users and rank them
    // For demo, return mock top performers
    return [
      {
        address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4",
        totalEarnings: "15000000000000000000", // 15 ETH
        successfulArbitrages: 156,
        mevScore: 2340,
        rank: 1,
        winRate: 94.2,
      },
      {
        address: "0x8ba1f109551bD432803012645Hac136c22C57B",
        totalEarnings: "12500000000000000000", // 12.5 ETH
        successfulArbitrages: 134,
        mevScore: 2100,
        rank: 2,
        winRate: 91.8,
      },
    ];
  }

  private calculateChainDistribution(executions: any[]): ChainMetrics[] {
    const chainMap = new Map<number, any>();

    executions.forEach((exec) => {
      if (!chainMap.has(exec.chainId)) {
        chainMap.set(exec.chainId, {
          chainId: exec.chainId,
          chainName: this.getChainName(exec.chainId),
          volume: 0,
          executions: 0,
          totalGas: 0,
          totalProfit: 0,
        });
      }

      const chain = chainMap.get(exec.chainId);
      chain.volume += Number(exec.amountIn);
      chain.executions += 1;
      chain.totalGas += Number(exec.gasUsed || 0);
      chain.totalProfit += Number(exec.actualProfit);
    });

    return Array.from(chainMap.values()).map((chain) => ({
      ...chain,
      averageGas: chain.executions > 0 ? chain.totalGas / chain.executions : 0,
      profitability:
        chain.executions > 0 ? chain.totalProfit / chain.executions : 0,
    }));
  }

  private generateTimeSeriesData(executions: any[]): TimeSeriesPoint[] {
    const timeMap = new Map<number, TimeSeriesPoint>();
    const now = Date.now();

    // Generate hourly buckets for last 24 hours
    for (let i = 23; i >= 0; i--) {
      const timestamp = now - i * 3600000;
      const hourStart = Math.floor(timestamp / 3600000) * 3600000;

      timeMap.set(hourStart, {
        timestamp: hourStart,
        volume: 0,
        executions: 0,
        profits: 0,
        uniqueUsers: 0,
      });
    }

    // Populate with actual data
    const userSet = new Set<string>();
    executions.forEach((exec) => {
      const hourStart = Math.floor(exec.timestamp / 3600000) * 3600000;
      const point = timeMap.get(hourStart);

      if (point) {
        point.volume += Number(exec.amountIn);
        point.executions += 1;
        point.profits += Number(exec.actualProfit);
        userSet.add(exec.user);
      }
    });

    // Set unique users (simplified - in production would be more accurate)
    timeMap.forEach((point) => {
      point.uniqueUsers = Math.floor(
        userSet.size * (point.executions / executions.length)
      );
    });

    return Array.from(timeMap.values()).sort(
      (a, b) => a.timestamp - b.timestamp
    );
  }

  private getChainName(chainId: number): string {
    const names: { [key: number]: string } = {
      11155111: "Ethereum Sepolia",
      421614: "Arbitrum Sepolia",
      84532: "Base Sepolia",
      11155420: "Optimism Sepolia",
    };
    return names[chainId] || `Chain ${chainId}`;
  }

  private getDefaultMetrics(): ProtocolMetrics {
    return {
      totalVolume: 0,
      totalProfits: 0,
      uniqueUsers: 0,
      successRate: 0,
      averageProfit: 0,
      topPerformers: [],
      chainDistribution: [],
      timeSeriesData: [],
    };
  }

  // Additional helper methods would go here...
  private async getUserRank(userAddress: string): Promise<number> {
    // Simplified ranking - in production would query all users
    return Math.floor(Math.random() * 1000) + 1;
  }

  private calculateWinRate(executions: any[]): number {
    if (executions.length === 0) return 0;
    const wins = executions.filter((exec) => Number(exec.actualProfit) > 0);
    return (wins.length / executions.length) * 100;
  }

  private generateUserProfitTrends(executions: any[]): TimeSeriesPoint[] {
    // Generate simplified profit trends
    return executions.slice(0, 30).map((exec, index) => ({
      timestamp: exec.timestamp,
      volume: Number(exec.amountIn),
      executions: 1,
      profits: Number(exec.actualProfit),
      uniqueUsers: 1,
    }));
  }

  private analyzeFavoriteTokens(
    executions: any[]
  ): { token: string; count: number; profit: number }[] {
    const tokenMap = new Map<string, { count: number; profit: number }>();

    executions.forEach((exec) => {
      const token = exec.tokenIn;
      if (!tokenMap.has(token)) {
        tokenMap.set(token, { count: 0, profit: 0 });
      }
      const data = tokenMap.get(token)!;
      data.count += 1;
      data.profit += Number(exec.actualProfit);
    });

    return Array.from(tokenMap.entries())
      .map(([token, data]) => ({ token, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private generateRecommendations(userStats: any, executions: any[]): string[] {
    const recommendations: string[] = [];

    if (userStats.successfulArbitrages < 10) {
      recommendations.push("Start with smaller trades to build experience");
    }

    if (userStats.mevScore < 500) {
      recommendations.push(
        "Focus on high-confidence opportunities to improve MEV score"
      );
    }

    recommendations.push(
      "Consider diversifying across multiple chains for better opportunities"
    );

    return recommendations;
  }

  private analyzeTimingPatterns(executions: any[]): number[] {
    const hourlyCount = new Array(24).fill(0);

    executions.forEach((exec) => {
      const hour = new Date(exec.timestamp).getHours();
      hourlyCount[hour] += 1;
    });

    return hourlyCount;
  }

  private getOptimalTimingWindows(hourlyDistribution: number[]): string[] {
    const maxCount = Math.max(...hourlyDistribution);
    const threshold = maxCount * 0.8;

    const optimalHours: string[] = [];
    hourlyDistribution.forEach((count, hour) => {
      if (count >= threshold) {
        optimalHours.push(`${hour}:00-${hour + 1}:00 UTC`);
      }
    });

    return optimalHours;
  }

  private calculateVolatility(profits: number[]): number {
    if (profits.length < 2) return 0;

    const mean = profits.reduce((sum, p) => sum + p, 0) / profits.length;
    const variance =
      profits.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) /
      profits.length;

    return Math.sqrt(variance);
  }

  private analyzeChainPerformance(
    executions: any[]
  ): { chainId: number; successRate: number }[] {
    const chainMap = new Map<number, { total: number; successful: number }>();

    executions.forEach((exec) => {
      if (!chainMap.has(exec.chainId)) {
        chainMap.set(exec.chainId, { total: 0, successful: 0 });
      }
      const data = chainMap.get(exec.chainId)!;
      data.total += 1;
      if (Number(exec.actualProfit) > 0) {
        data.successful += 1;
      }
    });

    return Array.from(chainMap.entries()).map(([chainId, data]) => ({
      chainId,
      successRate: data.total > 0 ? (data.successful / data.total) * 100 : 0,
    }));
  }

  private generateMarketRecommendations(
    volatility: number,
    competition: number,
    opportunities: number
  ): string[] {
    const recommendations: string[] = [];

    if (volatility > 50) {
      recommendations.push(
        "High volatility detected - consider smaller position sizes"
      );
    }

    if (competition > 70) {
      recommendations.push("High competition - focus on unique opportunities");
    }

    if (opportunities < 5) {
      recommendations.push(
        "Low opportunity count - consider expanding to more chains"
      );
    }

    return recommendations;
  }
}

// Singleton instance
export const analytics = new DecentralizedAnalytics();

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
export declare class DecentralizedAnalytics {
    private cache;
    private readonly CACHE_DURATION;
    getProtocolMetrics(): Promise<ProtocolMetrics>;
    getUserAnalytics(userAddress: string): Promise<{
        performance: UserPerformance;
        executionHistory: any[];
        profitTrends: TimeSeriesPoint[];
        favoriteTokens: {
            token: string;
            count: number;
            profit: number;
        }[];
        recommendations: string[];
    }>;
    getOpportunityAnalytics(): Promise<OpportunityAnalytics[]>;
    getMarketConditions(): Promise<{
        volatility: number;
        opportunityCount: number;
        competitionLevel: number;
        optimalChains: number[];
        riskLevel: "low" | "medium" | "high";
        recommendations: string[];
    }>;
    storeAnalyticsSnapshot(): Promise<string | null>;
    private calculateSuccessRate;
    private getTopPerformers;
    private calculateChainDistribution;
    private generateTimeSeriesData;
    private getChainName;
    private getDefaultMetrics;
    private getUserRank;
    private calculateWinRate;
    private generateUserProfitTrends;
    private analyzeFavoriteTokens;
    private generateRecommendations;
    private analyzeTimingPatterns;
    private getOptimalTimingWindows;
    private calculateVolatility;
    private analyzeChainPerformance;
    private generateMarketRecommendations;
}
export declare const analytics: DecentralizedAnalytics;

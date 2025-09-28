export declare const MEV_SHARE_ADDRESSES: {
    11155111: string;
    421614: string;
    84532: string;
    11155420: string;
};
export interface UserStats {
    address: string;
    totalEarnings: bigint;
    successfulArbitrages: number;
    mevScore: number;
    lastExecutionTime: number;
    worldIdVerified: boolean;
    nullifierHash?: string;
}
export interface ArbitrageExecution {
    executionId: string;
    user: string;
    tokenIn: string;
    tokenOut: string;
    amountIn: bigint;
    actualProfit: bigint;
    userShare: bigint;
    protocolShare: bigint;
    timestamp: number;
    txHash: string;
    chainId: number;
}
export declare class OnChainStateManager {
    private clients;
    private eventSubscriptions;
    private userStats;
    private executions;
    private subscribers;
    constructor();
    subscribe(eventType: string, callback: (data: any) => void): () => void;
    private emit;
    startEventListening(): Promise<void>;
    stopEventListening(): void;
    getUserStats(userAddress: string): Promise<UserStats | null>;
    getUserExecutions(userAddress: string): ArbitrageExecution[];
    getRecentExecutions(limit?: number): ArbitrageExecution[];
    private updateUserStats;
    private updateUserWorldIDStatus;
    getProtocolStats(): {
        totalExecutions: number;
        totalVolume: number;
        totalProfits: number;
        uniqueUsers: number;
        averageProfit: number;
    };
}
export declare const onChainState: OnChainStateManager;

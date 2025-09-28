import { createPublicClient, http, parseAbiItem } from "viem";
import { SUPPORTED_CHAINS } from "./mev-scanner.js";
// MEV-Share Hook ABI for event listening
const MEV_SHARE_HOOK_ABI = [
    parseAbiItem("event MEVOpportunityDetected(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 expectedProfit, uint256 sourceChain, uint256 targetChain, bytes32 opportunityId)"),
    parseAbiItem("event CrossChainArbitrageExecuted(address indexed user, bytes32 indexed executionId, address tokenIn, address tokenOut, uint256 amountIn, uint256 actualProfit, uint256 userShare, uint256 protocolShare)"),
    parseAbiItem("event WorldIDVerified(address indexed user, uint256 indexed nullifierHash, uint256 root)"),
    parseAbiItem("event RateLimitTriggered(uint256 nullifierHash, uint256 nextAllowedTime)"),
    parseAbiItem("event MEVStatsUpdated(address indexed user, uint256 totalEarnings, uint256 successfulArbitrages, uint256 newMEVScore)"),
];
// Contract addresses for each supported chain
export const MEV_SHARE_ADDRESSES = {
    11155111: "0x44440000000000000000000000000000000000cc", // Ethereum Sepolia
    421614: "0x44440000000000000000000000000000000000cc", // Arbitrum Sepolia
    84532: "0x44440000000000000000000000000000000000cc", // Base Sepolia
    11155420: "0x44440000000000000000000000000000000000cc", // Optimism Sepolia
};
export class OnChainStateManager {
    clients = new Map();
    eventSubscriptions = new Map();
    userStats = new Map();
    executions = [];
    subscribers = new Map();
    constructor() {
        // Initialize clients for all supported chains
        Object.entries(SUPPORTED_CHAINS).forEach(([chainId, config]) => {
            this.clients.set(Number(chainId), createPublicClient({
                chain: config.chain,
                transport: http(config.rpc),
            }));
        });
    }
    // Subscribe to specific event types
    subscribe(eventType, callback) {
        if (!this.subscribers.has(eventType)) {
            this.subscribers.set(eventType, []);
        }
        this.subscribers.get(eventType).push(callback);
        return () => {
            const callbacks = this.subscribers.get(eventType);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index > -1)
                    callbacks.splice(index, 1);
            }
        };
    }
    emit(eventType, data) {
        const callbacks = this.subscribers.get(eventType);
        if (callbacks) {
            callbacks.forEach((callback) => callback(data));
        }
    }
    // Start listening to on-chain events
    async startEventListening() {
        console.log("🔗 Starting on-chain event listening...");
        for (const [chainId, client] of this.clients.entries()) {
            const contractAddress = MEV_SHARE_ADDRESSES[chainId];
            if (!contractAddress)
                continue;
            try {
                // Listen to MEV opportunity detection events
                const unsubscribeOpportunity = client.watchEvent({
                    address: contractAddress,
                    event: parseAbiItem("event MEVOpportunityDetected(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 expectedProfit, uint256 sourceChain, uint256 targetChain, bytes32 opportunityId)"),
                    onLogs: (logs) => {
                        logs.forEach((log) => {
                            this.emit("opportunityDetected", {
                                chainId,
                                user: log.args.user,
                                tokenIn: log.args.tokenIn,
                                tokenOut: log.args.tokenOut,
                                expectedProfit: log.args.expectedProfit,
                                sourceChain: log.args.sourceChain,
                                targetChain: log.args.targetChain,
                                opportunityId: log.args.opportunityId,
                                blockNumber: log.blockNumber,
                                txHash: log.transactionHash,
                            });
                        });
                    },
                });
                // Listen to arbitrage execution events
                const unsubscribeExecution = client.watchEvent({
                    address: contractAddress,
                    event: parseAbiItem("event CrossChainArbitrageExecuted(address indexed user, bytes32 indexed executionId, address tokenIn, address tokenOut, uint256 amountIn, uint256 actualProfit, uint256 userShare, uint256 protocolShare)"),
                    onLogs: (logs) => {
                        logs.forEach((log) => {
                            const execution = {
                                executionId: log.args.executionId,
                                user: log.args.user,
                                tokenIn: log.args.tokenIn,
                                tokenOut: log.args.tokenOut,
                                amountIn: log.args.amountIn,
                                actualProfit: log.args.actualProfit,
                                userShare: log.args.userShare,
                                protocolShare: log.args.protocolShare,
                                timestamp: Date.now(),
                                txHash: log.transactionHash,
                                chainId,
                            };
                            this.executions.push(execution);
                            this.emit("arbitrageExecuted", execution);
                        });
                    },
                });
                // Listen to World ID verification events
                const unsubscribeWorldID = client.watchEvent({
                    address: contractAddress,
                    event: parseAbiItem("event WorldIDVerified(address indexed user, uint256 indexed nullifierHash, uint256 root)"),
                    onLogs: (logs) => {
                        logs.forEach((log) => {
                            this.updateUserWorldIDStatus(log.args.user, log.args.nullifierHash);
                            this.emit("worldIdVerified", {
                                user: log.args.user,
                                nullifierHash: log.args.nullifierHash,
                                root: log.args.root,
                                chainId,
                            });
                        });
                    },
                });
                // Listen to MEV stats updates
                const unsubscribeStats = client.watchEvent({
                    address: contractAddress,
                    event: parseAbiItem("event MEVStatsUpdated(address indexed user, uint256 totalEarnings, uint256 successfulArbitrages, uint256 newMEVScore)"),
                    onLogs: (logs) => {
                        logs.forEach((log) => {
                            this.updateUserStats(log.args.user, {
                                totalEarnings: log.args.totalEarnings,
                                successfulArbitrages: Number(log.args.successfulArbitrages),
                                mevScore: Number(log.args.newMEVScore),
                            });
                            this.emit("statsUpdated", {
                                user: log.args.user,
                                totalEarnings: log.args.totalEarnings,
                                successfulArbitrages: log.args.successfulArbitrages,
                                mevScore: log.args.newMEVScore,
                                chainId,
                            });
                        });
                    },
                });
                // Store unsubscribe functions
                this.eventSubscriptions.set(chainId, {
                    unsubscribeOpportunity,
                    unsubscribeExecution,
                    unsubscribeWorldID,
                    unsubscribeStats,
                });
                console.log(`✅ Event listening started for chain ${chainId}`);
            }
            catch (error) {
                console.error(`❌ Error setting up event listeners for chain ${chainId}:`, error);
            }
        }
    }
    // Stop event listening
    stopEventListening() {
        this.eventSubscriptions.forEach((subs, chainId) => {
            try {
                subs.unsubscribeOpportunity?.();
                subs.unsubscribeExecution?.();
                subs.unsubscribeWorldID?.();
                subs.unsubscribeStats?.();
                console.log(`🛑 Stopped event listening for chain ${chainId}`);
            }
            catch (error) {
                console.error(`Error stopping listeners for chain ${chainId}:`, error);
            }
        });
        this.eventSubscriptions.clear();
    }
    // Get user statistics from on-chain data
    async getUserStats(userAddress) {
        // First check local cache
        const cached = this.userStats.get(userAddress.toLowerCase());
        if (cached)
            return cached;
        // Fetch from on-chain if not cached
        try {
            // Query the contract directly for user stats
            const chainId = 11155111; // Default to Ethereum Sepolia
            const client = this.clients.get(chainId);
            const contractAddress = MEV_SHARE_ADDRESSES[chainId];
            if (!client || !contractAddress)
                return null;
            const stats = await client.readContract({
                address: contractAddress,
                abi: [
                    {
                        name: "getUserMEVStats",
                        type: "function",
                        stateMutability: "view",
                        inputs: [{ name: "user", type: "address" }],
                        outputs: [
                            { name: "totalEarnings", type: "uint256" },
                            { name: "successfulArbitrages", type: "uint256" },
                            { name: "lastExecutionTime", type: "uint256" },
                            { name: "mevScore", type: "uint256" },
                        ],
                    },
                ],
                functionName: "getUserMEVStats",
                args: [userAddress],
            });
            const userStats = {
                address: userAddress,
                totalEarnings: stats[0],
                successfulArbitrages: Number(stats[1]),
                lastExecutionTime: Number(stats[2]),
                mevScore: Number(stats[3]),
                worldIdVerified: false, // Will be updated by events
            };
            this.userStats.set(userAddress.toLowerCase(), userStats);
            return userStats;
        }
        catch (error) {
            console.error("Error fetching user stats:", error);
            return null;
        }
    }
    // Get user's arbitrage execution history
    getUserExecutions(userAddress) {
        return this.executions.filter((exec) => exec.user.toLowerCase() === userAddress.toLowerCase());
    }
    // Get all recent executions (for leaderboard/analytics)
    getRecentExecutions(limit = 50) {
        return this.executions
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }
    // Update user stats locally
    updateUserStats(userAddress, updates) {
        const existing = this.userStats.get(userAddress.toLowerCase()) || {
            address: userAddress,
            totalEarnings: 0n,
            successfulArbitrages: 0,
            mevScore: 0,
            lastExecutionTime: 0,
            worldIdVerified: false,
        };
        this.userStats.set(userAddress.toLowerCase(), {
            ...existing,
            ...updates,
        });
    }
    // Update World ID verification status
    updateUserWorldIDStatus(userAddress, nullifierHash) {
        const existing = this.userStats.get(userAddress.toLowerCase()) || {
            address: userAddress,
            totalEarnings: 0n,
            successfulArbitrages: 0,
            mevScore: 0,
            lastExecutionTime: 0,
            worldIdVerified: false,
        };
        this.userStats.set(userAddress.toLowerCase(), {
            ...existing,
            worldIdVerified: true,
            nullifierHash: nullifierHash.toString(),
        });
    }
    // Get protocol-wide statistics
    getProtocolStats() {
        const totalExecutions = this.executions.length;
        const totalVolume = this.executions.reduce((sum, exec) => sum + Number(exec.amountIn), 0);
        const totalProfits = this.executions.reduce((sum, exec) => sum + Number(exec.actualProfit), 0);
        const uniqueUsers = new Set(this.executions.map((exec) => exec.user)).size;
        return {
            totalExecutions,
            totalVolume,
            totalProfits,
            uniqueUsers,
            averageProfit: totalExecutions > 0 ? totalProfits / totalExecutions : 0,
        };
    }
}
// Singleton instance
export const onChainState = new OnChainStateManager();

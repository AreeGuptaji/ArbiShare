export interface LiquidationOpportunity {
    protocol: "aave" | "compound" | "maker";
    user: string;
    collateral: string;
    debt: string;
    healthFactor: number;
    liquidationBonus: number;
    estimatedProfit: number;
    chainId: number;
}
export interface SandwichOpportunity {
    targetTx: string;
    tokenIn: string;
    tokenOut: string;
    amountIn: bigint;
    poolAddress: string;
    frontrunProfit: number;
    backrunProfit: number;
    totalProfit: number;
    riskScore: number;
}
export interface FlashLoanArbitrage {
    sourcePool: string;
    targetPool: string;
    token: string;
    amount: bigint;
    profit: number;
    gasEstimate: number;
    confidence: number;
}
export declare class AdvancedMEVStrategies {
    scanLiquidationOpportunities(chainId: number): Promise<LiquidationOpportunity[]>;
    detectSandwichOpportunities(chainId: number): Promise<SandwichOpportunity[]>;
    scanFlashLoanArbitrage(chainId: number): Promise<FlashLoanArbitrage[]>;
    getOptimalStrategy(opportunities: {
        arbitrage: any[];
        liquidation: LiquidationOpportunity[];
        flashLoan: FlashLoanArbitrage[];
    }): Promise<{
        strategy: "arbitrage" | "liquidation" | "flashloan" | "none";
        opportunity: any;
        expectedProfit: number;
        riskScore: number;
    }>;
    getAntiMEVRecommendations(txParams: {
        tokenIn: string;
        tokenOut: string;
        amountIn: bigint;
        chainId: number;
    }): Promise<{
        recommendedSlippage: number;
        optimalTiming: number;
        protectionStrategies: string[];
    }>;
}
export declare const advancedMEV: AdvancedMEVStrategies;

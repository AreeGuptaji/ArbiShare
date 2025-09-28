export interface PriceData {
    price: number;
    confidence: number;
    timestamp: number;
    source: "pyth" | "uniswap" | "aggregated";
    chainId: number;
}
export interface TokenPair {
    token0: string;
    token1: string;
    fee: number;
}
export declare class DecentralizedPriceOracle {
    private clients;
    private priceCache;
    private readonly CACHE_DURATION;
    constructor();
    getPrice(tokenSymbol: string, chainId: number): Promise<PriceData | null>;
    private getPythPrice;
    private getUniswapPrice;
    private findUniswapPool;
    private getPoolPrice;
    private getAggregatedPrice;
    getBatchPrices(requests: {
        tokenSymbol: string;
        chainId: number;
    }[]): Promise<Map<string, PriceData | null>>;
    clearCache(): void;
    getCacheStats(): {
        total: number;
        active: number;
        expired: number;
    };
}
export declare const priceOracle: DecentralizedPriceOracle;

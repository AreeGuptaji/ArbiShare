import { createPublicClient, http, parseAbi, getContract } from "viem";
import { SUPPORTED_CHAINS, SUPPORTED_TOKENS } from "./mev-scanner.js";

// Pyth Network contract addresses
const PYTH_ADDRESSES = {
  11155111: "0xDd24F84d36BF92C65F92307595335bdFab5Bbd21", // Ethereum Sepolia
  421614: "0x4374e5a8b9C22271E9EB878A2AA31DE97DF15DAF", // Arbitrum Sepolia
  84532: "0x8250f4aF4B972684F7b336503E2D6dFeDeB1487a", // Base Sepolia
  11155420: "0x0708325268dF9F66270F1401206434524814508b", // Optimism Sepolia
};

// Uniswap V3 Pool Factory addresses for price discovery
const UNISWAP_V3_FACTORY = {
  11155111: "0x0227628f3F023bb0B980b67D528571c95c6DaC1c", // Ethereum Sepolia
  421614: "0x248AB79Bbb9bC29bB72f7Cd42F17e054Fc40188e", // Arbitrum Sepolia
  84532: "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24", // Base Sepolia
  11155420: "0x8CE191193D15ea94e11d327b4c7ad8bbE520f6aF", // Optimism Sepolia
};

// Pyth Oracle ABI
const PYTH_ABI = parseAbi([
  "function getPrice(bytes32 id) external view returns (int64 price, uint64 conf, int32 expo, uint publishTime)",
  "function getPriceUnsafe(bytes32 id) external view returns (int64 price, uint64 conf, int32 expo, uint publishTime)",
  "function getValidTimePeriod() external view returns (uint validTimePeriod)",
  "function priceFeedExists(bytes32 id) external view returns (bool exists)",
]);

// Uniswap V3 Pool ABI (minimal)
const UNISWAP_V3_POOL_ABI = parseAbi([
  "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
  "function fee() external view returns (uint24)",
]);

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

export class DecentralizedPriceOracle {
  private clients: Map<number, any> = new Map();
  private priceCache: Map<string, { data: PriceData; expiry: number }> =
    new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds

  constructor() {
    // Initialize clients for all supported chains
    Object.entries(SUPPORTED_CHAINS).forEach(([chainId, config]) => {
      this.clients.set(
        Number(chainId),
        createPublicClient({
          chain: config.chain,
          transport: http(config.rpc),
        })
      );
    });
  }

  // Get price with fallback mechanisms
  async getPrice(
    tokenSymbol: string,
    chainId: number
  ): Promise<PriceData | null> {
    const cacheKey = `${tokenSymbol}-${chainId}`;

    // Check cache first
    const cached = this.priceCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    try {
      // Try Pyth Network first (most reliable)
      let priceData = await this.getPythPrice(tokenSymbol, chainId);

      // Fallback to Uniswap V3 pools
      if (!priceData) {
        priceData = await this.getUniswapPrice(tokenSymbol, chainId);
      }

      // Fallback to aggregated price (multiple sources)
      if (!priceData) {
        priceData = await this.getAggregatedPrice(tokenSymbol, chainId);
      }

      if (priceData) {
        // Cache the result
        this.priceCache.set(cacheKey, {
          data: priceData,
          expiry: Date.now() + this.CACHE_DURATION,
        });
      }

      return priceData;
    } catch (error) {
      console.error(
        `Error getting price for ${tokenSymbol} on chain ${chainId}:`,
        error
      );
      return null;
    }
  }

  // Get price from Pyth Network
  private async getPythPrice(
    tokenSymbol: string,
    chainId: number
  ): Promise<PriceData | null> {
    try {
      const client = this.clients.get(chainId);
      const pythAddress =
        PYTH_ADDRESSES[chainId as keyof typeof PYTH_ADDRESSES];

      if (!client || !pythAddress) return null;

      const tokenConfig =
        SUPPORTED_TOKENS[tokenSymbol as keyof typeof SUPPORTED_TOKENS];
      if (!tokenConfig?.pythPriceId) return null;

      const pythContract = getContract({
        address: pythAddress as `0x${string}`,
        abi: PYTH_ABI,
        client: { public: client },
      });

      // Check if price feed exists
      const exists = await client.readContract({
        address: pythAddress as `0x${string}`,
        abi: PYTH_ABI,
        functionName: "priceFeedExists",
        args: [tokenConfig.pythPriceId as `0x${string}`],
      });
      if (!exists) return null;

      // Get price data
      const priceData = await client.readContract({
        address: pythAddress as `0x${string}`,
        abi: PYTH_ABI,
        functionName: "getPrice",
        args: [tokenConfig.pythPriceId as `0x${string}`],
      });
      const [price, conf, expo, publishTime] = priceData;

      // Convert to human-readable format
      const adjustedPrice = Number(price) * Math.pow(10, expo);
      const confidence = Number(conf) * Math.pow(10, expo);
      const confidencePercentage = (confidence / adjustedPrice) * 100;

      return {
        price: adjustedPrice,
        confidence: Math.max(0, 100 - confidencePercentage), // Higher is better
        timestamp: Number(publishTime) * 1000,
        source: "pyth",
        chainId,
      };
    } catch (error) {
      console.error(`Error fetching Pyth price for ${tokenSymbol}:`, error);
      return null;
    }
  }

  // Get price from Uniswap V3 pools
  private async getUniswapPrice(
    tokenSymbol: string,
    chainId: number
  ): Promise<PriceData | null> {
    try {
      const client = this.clients.get(chainId);
      if (!client) return null;

      const tokenConfig =
        SUPPORTED_TOKENS[tokenSymbol as keyof typeof SUPPORTED_TOKENS];
      const tokenAddress =
        tokenConfig?.addresses[chainId as keyof typeof tokenConfig.addresses];
      if (!tokenAddress) return null;

      // Find the best pool for this token (against USDC or WETH)
      const baseTokens = ["USDC", "WETH"].filter((t) => t !== tokenSymbol);

      for (const baseToken of baseTokens) {
        const baseConfig =
          SUPPORTED_TOKENS[baseToken as keyof typeof SUPPORTED_TOKENS];
        const baseAddress =
          baseConfig?.addresses[chainId as keyof typeof baseConfig.addresses];
        if (!baseAddress) continue;

        const poolAddress = await this.findUniswapPool(
          tokenAddress,
          baseAddress,
          chainId
        );
        if (!poolAddress) continue;

        const price = await this.getPoolPrice(
          poolAddress,
          tokenAddress,
          baseAddress,
          chainId
        );
        if (price) {
          // Convert to USD if base token is not USDC
          let usdPrice = price;
          if (baseToken === "WETH") {
            const ethPrice = await this.getPythPrice("WETH", chainId);
            if (ethPrice) {
              usdPrice = price * ethPrice.price;
            }
          }

          return {
            price: usdPrice,
            confidence: 80, // Uniswap pools are generally reliable
            timestamp: Date.now(),
            source: "uniswap",
            chainId,
          };
        }
      }

      return null;
    } catch (error) {
      console.error(`Error fetching Uniswap price for ${tokenSymbol}:`, error);
      return null;
    }
  }

  // Find Uniswap V3 pool address
  private async findUniswapPool(
    token0: string,
    token1: string,
    chainId: number
  ): Promise<string | null> {
    try {
      // This is a simplified implementation
      // In production, you'd query the Uniswap V3 Factory contract
      // For now, return null to indicate pool not found
      return null;
    } catch (error) {
      return null;
    }
  }

  // Get price from Uniswap V3 pool
  private async getPoolPrice(
    poolAddress: string,
    token0: string,
    token1: string,
    chainId: number
  ): Promise<number | null> {
    try {
      const client = this.clients.get(chainId);
      if (!client) return null;

      const slot0 = await client.readContract({
        address: poolAddress as `0x${string}`,
        abi: UNISWAP_V3_POOL_ABI,
        functionName: "slot0",
      });
      const sqrtPriceX96 = slot0[0];

      // Convert sqrtPriceX96 to actual price
      // This is a simplified calculation - production would need proper decimal handling
      const price = Math.pow(Number(sqrtPriceX96) / Math.pow(2, 96), 2);

      return price;
    } catch (error) {
      console.error("Error getting pool price:", error);
      return null;
    }
  }

  // Get aggregated price from multiple sources
  private async getAggregatedPrice(
    tokenSymbol: string,
    chainId: number
  ): Promise<PriceData | null> {
    try {
      // For demo purposes, return a mock aggregated price
      // In production, this would aggregate prices from multiple DEXs and oracles

      const mockPrices = {
        WETH: 3000,
        USDC: 1,
      };

      const basePrice = mockPrices[tokenSymbol as keyof typeof mockPrices];
      if (!basePrice) return null;

      // Add some realistic variation
      const variation = (Math.random() - 0.5) * 0.02; // ±1%
      const price = basePrice * (1 + variation);

      return {
        price,
        confidence: 70, // Lower confidence for aggregated prices
        timestamp: Date.now(),
        source: "aggregated",
        chainId,
      };
    } catch (error) {
      console.error(
        `Error getting aggregated price for ${tokenSymbol}:`,
        error
      );
      return null;
    }
  }

  // Get prices for multiple tokens across chains
  async getBatchPrices(
    requests: { tokenSymbol: string; chainId: number }[]
  ): Promise<Map<string, PriceData | null>> {
    const results = new Map<string, PriceData | null>();

    // Execute all price requests in parallel
    const promises = requests.map(async ({ tokenSymbol, chainId }) => {
      const key = `${tokenSymbol}-${chainId}`;
      const price = await this.getPrice(tokenSymbol, chainId);
      results.set(key, price);
    });

    await Promise.all(promises);
    return results;
  }

  // Clear price cache
  clearCache() {
    this.priceCache.clear();
  }

  // Get cache statistics
  getCacheStats() {
    const now = Date.now();
    const total = this.priceCache.size;
    const expired = Array.from(this.priceCache.values()).filter(
      (item) => item.expiry <= now
    ).length;

    return {
      total,
      active: total - expired,
      expired,
    };
  }
}

// Singleton instance
export const priceOracle = new DecentralizedPriceOracle();

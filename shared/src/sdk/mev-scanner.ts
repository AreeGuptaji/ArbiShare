import { createPublicClient, http, parseAbi, formatUnits } from "viem";
import {
  mainnet,
  arbitrum,
  base,
  optimism,
  sepolia,
  arbitrumSepolia,
  baseSepolia,
  optimismSepolia,
} from "viem/chains";

// Supported chains configuration
export const SUPPORTED_CHAINS = {
  // Mainnet chains
  1: { chain: mainnet, name: "Ethereum", rpc: "https://eth.llamarpc.com" },
  42161: {
    chain: arbitrum,
    name: "Arbitrum",
    rpc: "https://arb1.arbitrum.io/rpc",
  },
  8453: { chain: base, name: "Base", rpc: "https://mainnet.base.org" },
  10: { chain: optimism, name: "Optimism", rpc: "https://mainnet.optimism.io" },

  // Testnet chains (current implementation)
  11155111: {
    chain: sepolia,
    name: "Ethereum Sepolia",
    rpc: "https://rpc.sepolia.org",
  },
  421614: {
    chain: arbitrumSepolia,
    name: "Arbitrum Sepolia",
    rpc: "https://sepolia-rollup.arbitrum.io/rpc",
  },
  84532: {
    chain: baseSepolia,
    name: "Base Sepolia",
    rpc: "https://sepolia.base.org",
  },
  11155420: {
    chain: optimismSepolia,
    name: "Optimism Sepolia",
    rpc: "https://sepolia.optimism.io",
  },
};

// Token configurations across chains
export const SUPPORTED_TOKENS = {
  WETH: {
    symbol: "WETH",
    decimals: 18,
    pythPriceId:
      "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace", // ETH/USD
    addresses: {
      11155111: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
      421614: "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73",
      84532: "0x4200000000000000000000000000000000000006",
      11155420: "0x4200000000000000000000000000000000000006",
    },
  },
  USDC: {
    symbol: "USDC",
    decimals: 6,
    pythPriceId:
      "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a", // USDC/USD
    addresses: {
      11155111: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
      421614: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
      84532: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      11155420: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
    },
  },
};

export interface MEVOpportunity {
  id: string;
  tokenSymbol: string;
  tokenAddress: string;
  sourceChain: number;
  targetChain: number;
  sourcePrice: number;
  targetPrice: number;
  priceDifference: number;
  profitPercentage: number;
  estimatedProfit: number;
  gasEstimate: number;
  confidence: number;
  timestamp: number;
  expiresAt: number;
}

export class DecentralizedMEVScanner {
  private clients: Map<number, any> = new Map();
  private isScanning = false;
  private opportunities: MEVOpportunity[] = [];
  private subscribers: ((opportunities: MEVOpportunity[]) => void)[] = [];

  constructor() {
    // Initialize RPC clients for all supported chains
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

  // Subscribe to real-time opportunity updates
  subscribe(callback: (opportunities: MEVOpportunity[]) => void) {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) this.subscribers.splice(index, 1);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach((callback) =>
      callback(this.getValidOpportunities())
    );
  }

  // Start scanning for MEV opportunities
  async startScanning(intervalMs = 15000) {
    // 15 seconds default
    if (this.isScanning) return;

    console.log("🔍 Starting decentralized MEV scanning...");

    // Initial scan
    await this.scanOpportunities();

    // Set up periodic scanning
    const scanInterval = setInterval(async () => {
      await this.scanOpportunities();
    }, intervalMs);

    this.isScanning = true;

    return () => {
      clearInterval(scanInterval);
      this.isScanning = false;
    };
  }

  private async scanOpportunities() {
    try {
      const newOpportunities: MEVOpportunity[] = [];
      const chainIds = Object.keys(SUPPORTED_CHAINS).map(Number);

      // Scan each token across all chain pairs
      for (const [tokenSymbol, tokenConfig] of Object.entries(
        SUPPORTED_TOKENS
      )) {
        for (let i = 0; i < chainIds.length; i++) {
          for (let j = i + 1; j < chainIds.length; j++) {
            const sourceChain = chainIds[i];
            const targetChain = chainIds[j];

            // Skip if token not available on these chains
            if (
              !tokenConfig.addresses[
                sourceChain as keyof typeof tokenConfig.addresses
              ] ||
              !tokenConfig.addresses[
                targetChain as keyof typeof tokenConfig.addresses
              ]
            ) {
              continue;
            }

            const opportunity = await this.checkCrossChainArbitrage(
              tokenSymbol,
              tokenConfig,
              sourceChain,
              targetChain
            );

            if (opportunity) {
              newOpportunities.push(opportunity);
            }
          }
        }
      }

      // Update opportunities and notify subscribers
      this.opportunities = newOpportunities;
      this.notifySubscribers();

      console.log(`🔍 Found ${newOpportunities.length} MEV opportunities`);
    } catch (error) {
      console.error("❌ Error scanning for opportunities:", error);
    }
  }

  private async checkCrossChainArbitrage(
    tokenSymbol: string,
    tokenConfig: any,
    sourceChain: number,
    targetChain: number
  ): Promise<MEVOpportunity | null> {
    try {
      // Get prices from both chains using on-chain data
      const [sourcePrice, targetPrice] = await Promise.all([
        this.getTokenPrice(
          tokenConfig.addresses[
            sourceChain as keyof typeof tokenConfig.addresses
          ],
          sourceChain
        ),
        this.getTokenPrice(
          tokenConfig.addresses[
            targetChain as keyof typeof tokenConfig.addresses
          ],
          targetChain
        ),
      ]);

      if (!sourcePrice || !targetPrice) return null;

      // Calculate arbitrage metrics
      const priceDifference = Math.abs(sourcePrice - targetPrice);
      const avgPrice = (sourcePrice + targetPrice) / 2;
      const profitPercentage = (priceDifference / avgPrice) * 100;

      // Only consider opportunities with >2% profit potential
      if (profitPercentage < 2) return null;

      // Estimate gas costs and profit
      const gasEstimate = await this.estimateGasCosts(sourceChain, targetChain);
      const tradeSize = 1000; // Assume $1000 trade size
      const estimatedProfit = priceDifference * tradeSize - gasEstimate;

      if (estimatedProfit <= 0) return null;

      return {
        id: `${tokenSymbol}-${sourceChain}-${targetChain}-${Date.now()}`,
        tokenSymbol,
        tokenAddress:
          tokenConfig.addresses[
            sourceChain as keyof typeof tokenConfig.addresses
          ],
        sourceChain,
        targetChain,
        sourcePrice,
        targetPrice,
        priceDifference,
        profitPercentage,
        estimatedProfit,
        gasEstimate,
        confidence: 85, // Base confidence, can be enhanced with more data
        timestamp: Date.now(),
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes expiry
      };
    } catch (error) {
      console.error(`Error checking arbitrage for ${tokenSymbol}:`, error);
      return null;
    }
  }

  private async getTokenPrice(
    tokenAddress: string,
    chainId: number
  ): Promise<number | null> {
    try {
      const client = this.clients.get(chainId);
      if (!client) return null;

      // For demo purposes, we'll use a simple price oracle call
      // In production, this would call actual DEX pools or price oracles

      // Simulate price fetching from on-chain sources
      // This could be Uniswap V3 pools, Chainlink oracles, etc.
      const mockPrices = {
        WETH: 3000 + (Math.random() - 0.5) * 100, // $3000 ± $50
        USDC: 1 + (Math.random() - 0.5) * 0.01, // $1 ± $0.005
      };

      // Add some chain-specific price variation to simulate real arbitrage opportunities
      const chainVariation = {
        11155111: 1.0, // Ethereum base
        421614: 0.998, // Arbitrum slightly lower
        84532: 1.002, // Base slightly higher
        11155420: 0.999, // Optimism slightly lower
      };

      const tokenSymbol = this.getTokenSymbolByAddress(tokenAddress);
      if (!tokenSymbol) return null;

      const basePrice = mockPrices[tokenSymbol as keyof typeof mockPrices];
      const variation =
        chainVariation[chainId as keyof typeof chainVariation] || 1.0;

      return basePrice * variation;
    } catch (error) {
      console.error(
        `Error getting price for ${tokenAddress} on chain ${chainId}:`,
        error
      );
      return null;
    }
  }

  private getTokenSymbolByAddress(address: string): string | null {
    for (const [symbol, config] of Object.entries(SUPPORTED_TOKENS)) {
      if (Object.values(config.addresses).includes(address.toLowerCase())) {
        return symbol;
      }
    }
    return null;
  }

  private async estimateGasCosts(
    sourceChain: number,
    targetChain: number
  ): Promise<number> {
    // Simplified gas estimation based on chain characteristics
    const gasEstimates = {
      11155111: 50, // Ethereum - higher gas
      421614: 5, // Arbitrum - low gas
      84532: 10, // Base - medium gas
      11155420: 10, // Optimism - medium gas
    };

    const sourceGas =
      gasEstimates[sourceChain as keyof typeof gasEstimates] || 50;
    const targetGas =
      gasEstimates[targetChain as keyof typeof gasEstimates] || 50;
    const bridgeFee = 20; // Cross-chain bridge fee

    return sourceGas + targetGas + bridgeFee;
  }

  // Get current valid opportunities
  getValidOpportunities(): MEVOpportunity[] {
    const now = Date.now();
    return this.opportunities.filter((opp) => opp.expiresAt > now);
  }

  // Get opportunity by ID
  getOpportunityById(id: string): MEVOpportunity | null {
    return this.opportunities.find((opp) => opp.id === id) || null;
  }

  // Stop scanning
  stopScanning() {
    this.isScanning = false;
    this.opportunities = [];
    this.notifySubscribers();
  }
}

// Singleton instance for global use
export const mevScanner = new DecentralizedMEVScanner();

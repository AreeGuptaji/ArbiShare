// Chain IDs
export const CHAIN_IDS = {
  BASE: 8453,
  OPTIMISM: 10,
  ETHEREUM: 1,
  BASE_SEPOLIA: 84532,
  OPTIMISM_SEPOLIA: 11155420,
} as const;

// Contract addresses will be populated after deployment
export const CONTRACT_ADDRESSES = {
  [CHAIN_IDS.BASE]: {
    FLASH_ARB_HOOK: "",
    ARBITRAGE_ENGINE: "",
    SYBIL_GUARD: "",
  },
  [CHAIN_IDS.OPTIMISM]: {
    FLASH_ARB_HOOK: "",
    ARBITRAGE_ENGINE: "",
    SYBIL_GUARD: "",
  },
} as const;

// API endpoints
export const API_ENDPOINTS = {
  ONEINCH: "https://api.1inch.dev",
  WORLDCOIN: "https://developer.worldcoin.org",
} as const;

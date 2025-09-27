flasharb/
├── README.md
├── .gitignore
├── .env.example
├── docker-compose.yml
├── package.json
├── yarn.lock
└── apps/
├── contracts/ # Smart contracts with Foundry
│ ├── foundry.toml # Foundry configuration
│ ├── .env.example
│ ├── .gitmodules # Git submodules for dependencies
│ ├── lib/ # Foundry dependencies (git submodules)
│ │ ├── forge-std/ # Standard test utilities
│ │ ├── openzeppelin-contracts/ # OpenZeppelin contracts
│ │ ├── uniswap-v4-core/ # Uniswap v4 core contracts
│ │ └── worldcoin-contracts/ # World ID contracts
│ ├── src/
│ │ ├── hooks/
│ │ │ ├── FlashArbHook.sol # Uniswap v4 hooks
│ │ │ ├── BeforeSwapHook.sol
│ │ │ └── AfterSwapHook.sol
│ │ ├── core/
│ │ │ ├── FlashLoanContract.sol # Flash loan logic
│ │ │ ├── ArbitrageEngine.sol # Arbitrage execution
│ │ │ ├── SybilGuard.sol # World ID integration
│ │ │ └── LiquidityPool.sol # LP management
│ │ ├── interfaces/
│ │ │ ├── IFlashArb.sol
│ │ │ ├── IWorldID.sol
│ │ │ └── I1inchRouter.sol
│ │ ├── libraries/
│ │ │ ├── PriceCalculator.sol
│ │ │ ├── GasEstimator.sol
│ │ │ └── Math.sol
│ │ └── mocks/
│ │ ├── MockWorldID.sol
│ │ └── MockUniswapV4.sol
│ ├── test/
│ │ ├── unit/
│ │ │ ├── FlashArbHook.t.sol # Foundry tests (.t.sol)
│ │ │ ├── ArbitrageEngine.t.sol
│ │ │ └── SybilGuard.t.sol
│ │ ├── integration/
│ │ │ ├── CrossChainArbitrage.t.sol
│ │ │ └── WorldIDIntegration.t.sol
│ │ ├── fuzz/
│ │ │ ├── ArbitrageFuzz.t.sol # Fuzz testing
│ │ │ └── PriceCalculatorFuzz.t.sol
│ │ ├── invariant/
│ │ │ └── LiquidityInvariant.t.sol
│ │ └── utils/
│ │ ├── BaseTest.sol
│ │ ├── TestHelpers.sol
│ │ └── Fixtures.sol
│ ├── script/
│ │ ├── Deploy.s.sol # Foundry deployment scripts
│ │ ├── SetupPools.s.sol
│ │ └── Verify.s.sol
│ ├── broadcast/ # Foundry deployment artifacts
│ │ ├── Deploy.s.sol/
│ │ └── SetupPools.s.sol/
│ ├── out/ # Compiled artifacts
│ ├── cache/ # Foundry cache
│ └── deployments.json # Custom deployment tracking
│
├── backend/ # tRPC Backend API (Hackathon Minimal)
│ ├── package.json
│ ├── tsconfig.json
│ ├── .env.example
│ ├── src/
│ │ ├── server.ts # tRPC server entry point
│ │ ├── trpc/
│ │ │ ├── trpc.ts # tRPC instance
│ │ │ └── router.ts # Main router
│ │ ├── routers/
│ │ │ ├── arbitrage.router.ts # Arbitrage operations
│ │ │ ├── user.router.ts # User management
│ │ │ └── auth.router.ts # World ID auth
│ │ ├── services/
│ │ │ ├── arbitrage.service.ts
│ │ │ ├── worldcoin.service.ts
│ │ │ ├── oneinch.service.ts
│ │ │ └── database.service.ts # Simple JSON database
│ │ ├── utils/
│ │ │ ├── logger.ts
│ │ │ ├── validators.ts
│ │ │ └── constants.ts
│ │ └── types/
│ │ ├── api.types.ts
│ │ └── database.types.ts
│ ├── data/
│ │ └── db.json # JSON file database
│ └── tests/
│ └── basic.test.ts
│
├── frontend/ # Next.js Web Dashboard (Hackathon Minimal)
│ ├── package.json
│ ├── next.config.js
│ ├── tailwind.config.js
│ ├── tsconfig.json
│ ├── .env.local.example
│ ├── public/
│ │ ├── favicon.ico
│ │ └── logo.svg
│ ├── src/
│ │ ├── app/
│ │ │ ├── layout.tsx
│ │ │ ├── page.tsx
│ │ │ ├── dashboard/
│ │ │ │ └── page.tsx
│ │ │ ├── portfolio/
│ │ │ │ └── page.tsx
│ │ │ └── api/
│ │ │ └── trpc/
│ │ │ └── [trpc]/
│ │ │ └── route.ts # tRPC API route
│ │ ├── components/
│ │ │ ├── ui/ # Basic UI components
│ │ │ │ ├── Button.tsx
│ │ │ │ ├── Card.tsx
│ │ │ │ └── Loading.tsx
│ │ │ ├── dashboard/
│ │ │ │ ├── OpportunityCard.tsx
│ │ │ │ └── TradeHistory.tsx
│ │ │ └── auth/
│ │ │ └── WorldIDConnect.tsx
│ │ ├── hooks/
│ │ │ ├── useAuth.ts
│ │ │ └── useArbitrage.ts
│ │ ├── lib/
│ │ │ ├── trpc.ts # Simple tRPC client
│ │ │ └── utils.ts
│ │ └── types/
│ │ └── index.ts
│ └── tests/
│ └── components/
│
├── mini-app/ # Worldcoin Mini App (Hackathon Minimal)
│ ├── package.json
│ ├── next.config.js
│ ├── tailwind.config.js
│ ├── tsconfig.json
│ ├── .env.local.example
│ ├── public/
│ │ └── app-manifest.json # Worldcoin Mini App manifest
│ ├── src/
│ │ ├── app/
│ │ │ ├── layout.tsx
│ │ │ ├── page.tsx # Main mini app interface
│ │ │ ├── arbitrage/
│ │ │ │ └── page.tsx
│ │ │ └── api/
│ │ │ └── trpc/
│ │ │ └── [trpc]/
│ │ │ └── route.ts # tRPC API route
│ │ ├── components/
│ │ │ ├── WorldIDVerify.tsx
│ │ │ ├── ArbitrageInterface.tsx
│ │ │ └── MobileUI.tsx
│ │ ├── hooks/
│ │ │ └── useWorldcoin.ts
│ │ ├── lib/
│ │ │ └── trpc.ts # Shared tRPC client
│ │ └── utils/
│ │ └── miniapp.utils.ts
│ └── worldcoin.config.js
│
└── shared/ # Shared packages/utilities
├── package.json
├── src/
│ ├── types/
│ │ ├── common.types.ts
│ │ ├── contracts.types.ts
│ │ └── api.types.ts
│ ├── utils/
│ │ ├── formatters.ts
│ │ └── constants.ts
│ ├── contracts/
│ │ ├── abis/ # Generated from Foundry
│ │ │ ├── FlashArbHook.json
│ │ │ └── ArbitrageEngine.json
│ │ └── addresses/
│ │ ├── base.json
│ │ └── optimism.json
│ └── sdk/
│ ├── FlashArbSDK.ts
│ └── WorldcoinIntegration.ts
└── tests/

# Root Configuration Files (Hackathon Minimal)

├── .github/
│ └── workflows/
│ └── basic-ci.yml # Simple CI only
├── docs/
│ ├── README.md
│ ├── api-endpoints.md
│ └── deployment.md
├── scripts/
│ ├── setup.sh
│ └── build-all.sh
└── .gitignore

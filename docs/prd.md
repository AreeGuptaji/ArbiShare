# MEV-Share Product Requirements Document (PRD)

## Project Overview

**Updated Project Name**: MEV-Share (formerly FlashArb)

MEV-Share is a cross-chain, sybil-resistant MEV (Maximal Extractable Value) protocol that enables human-verified users to participate in and profit from MEV opportunities through atomic flash loan arbitrage. The system leverages Uniswap v4 hooks, Worldcoin Mini Apps for sybil resistance, and Pyth Network oracles for price discovery. The goal is to democratize MEV extraction by making profitable arbitrage strategies accessible to verified humans, not bots, while providing fair profit sharing and cross-chain execution capabilities.

---

## Goals and Success Metrics

- **Democratize MEV extraction** for verified humans through sybil-resistant access
- **Fair MEV distribution** with 75% user profit share, 25% protocol share
- **Cross-chain arbitrage execution** across 5 supported Sepolia testnets
- **Ensure 99.9% sybil resistance** through Worldcoin verification with 1-hour rate limiting
- **Real-time MEV detection** during regular swaps with enhanced execution
- **Achieve $100K+ MEV volume** in testnet phase with 1000+ verified users
- **Maintain <2% failed arbitrage** executions with automatic rollback and gas compensation

---

## Target Audience/User Personas

- Crypto-native DeFi traders seeking fair arbitrage
- Mainstream Worldcoin users with basic DeFi literacy
- Institutional DeFi participants needing compliance and fair access

---

## Use Cases

### Primary Use Cases (Implemented)

- **MEV-Enhanced Swaps**: User performs regular swap, hook detects MEV opportunity, executes enhanced swap with bonus profit sharing
- **Manual Cross-Chain Arbitrage**: User runs MEV-Share mini-app, passes Worldcoin verification, receives arbitrage opportunity alert, and executes cross-chain atomic arbitrage using Uniswap v4 hooks
- **Real-time MEV Monitoring**: Live cross-chain scanner detects price discrepancies across supported chains and alerts verified users
- **Sybil-Resistant Rate Limiting**: One arbitrage execution per verified World ID per hour to prevent bot exploitation

### Secondary Use Cases (Planned)

- **LP MEV Revenue Sharing**: Liquidity providers earn additional yield from MEV operations executed through their provided liquidity
- **Social MEV Features**: Leaderboards, achievement systems, and community-driven MEV education
- **Institutional Compliance**: Audit trail and compliance features for institutional MEV participation

---

## MoSCoW Prioritization

### Must Have ✅ (Implemented)

- **Worldcoin identity verification** ✅ - World ID proof verification with nullifier tracking
- **Uniswap v4 hooks** ✅ - MEVShareHook with beforeSwap/afterSwap MEV detection and execution
- **Pyth Network price oracles** ✅ - Real-time cross-chain price discovery and confidence scoring
- **Cross-chain arbitrage execution** ✅ - Support for 5 Sepolia testnets with atomic execution
- **Mini-app UX** ✅ - Mobile-optimized Worldcoin Mini App with dashboard and execution interface
- **Automated rollback** ✅ - Transaction rollback with gas compensation on execution failure
- **Sybil resistance** ✅ - Rate limiting: one arbitrage per World-ID per hour
- **MEV profit sharing** ✅ - 75% user share, 25% protocol share with automatic distribution

### Should Have 🟡 (Partially Implemented)

- **Multi-chain support** ✅ - 5 Sepolia testnets: Ethereum, Arbitrum, Unichain, Base, Optimism
- **User statistics tracking** ✅ - MEV score, total earnings, success rate tracking
- **Venue comparison** ✅ - Advanced venue scoring and selection algorithms
- **Price calculation libraries** ✅ - Comprehensive price calculation with confidence scoring
- **Liquidity provider dashboard** 🟡 - Basic LP mode in mini-app, needs full implementation
- **Dynamic fee calculation** 🟡 - Basic structure in place, needs market condition integration
- **User leaderboard** 🟡 - Frontend components ready, backend integration needed
- **Analytics portal** 🟡 - Mock data and UI components, needs real data integration

### Could Have 🔲 (Not Implemented)

- **Advanced notifications** 🔲 - Push/email alerts for MEV opportunities
- **Off-chain simulation** 🔲 - Bulk opportunity testing environment
- **Gamification system** 🔲 - XP, badges, achievements for successful MEV extraction
- **Social features** 🔲 - Referral system with sybil-resistant incentives
- **NFT reputation system** 🔲 - Proof of reputation for top MEV extractors
- **Advanced MEV strategies** 🔲 - Sandwich protection, liquidation MEV, etc.
- **Cross-chain bridge integration** 🔲 - Direct bridge protocol integration for faster execution

### Won’t Have (This Release)

- Automated highly-leveraged lending/borrowing extensions
- Direct fiat on-ramp/off-ramp integrations
- Bot access to arbitrage pool actions
- Support for non-EVM chains in initial MVP
- On-chain governance (will default to off-chain, human-only voting)

---

## Functional Requirements

### ✅ Implemented Core Features

- **MEVShareHook Contract** - Comprehensive Uniswap v4 hook with MEV detection, flash loan execution, and profit distribution
- **World ID Integration** - Sybil-resistant verification with nullifier tracking and rate limiting
- **Cross-Chain Price Discovery** - Pyth Network oracle integration with confidence scoring
- **Atomic Arbitrage Execution** - Flash loan-based cross-chain arbitrage with automatic rollback
- **Mobile Mini-App** - Worldcoin-compatible mini-app with full MEV interface
- **Web Dashboard** - Desktop interface for MEV monitoring and execution
- **Real-time MEV Detection** - Automatic MEV opportunity detection during regular swaps

### 🟡 Partially Implemented

- **1inch API Integration** - Structure in place, needs full implementation for enhanced routing
- **Advanced Analytics** - Frontend components ready, backend data pipeline needed
- **LP Revenue Sharing** - Basic framework implemented, needs full integration

### 🔲 Not Implemented

- **Production Bridge Integration** - Currently simulated, needs real cross-chain bridge protocols
- **Advanced MEV Strategies** - Currently focused on simple arbitrage, room for expansion

---

## Non-Functional Requirements

- Security: OpenZeppelin audit, sybil resistance, rate limits
- Performance: <3 seconds end-to-end arbitrage opportunity execution
- Compliance: Full audit trail, KYC/AML compatibility for institutional clients
- Scalability: 5000 concurrent human users

---

## Technical Architecture

### ✅ Implemented Smart Contracts

- **MEVShareHook.sol** (887 lines) - Main Uniswap v4 hook with comprehensive MEV functionality
- **PriceCalculator.sol** (209 lines) - Advanced price calculation library with Pyth integration
- **VenueComparator.sol** (389 lines) - Sophisticated venue ranking and selection algorithms
- **IPythOracle.sol** - Pyth Network oracle interface for real-time price feeds
- **IWorldIDRouter.sol** - World ID verification interface

### ✅ Implemented Frontend Applications

- **Web Dashboard** - Next.js 14 with TypeScript, tRPC, Tailwind CSS
  - Authentication flow with World ID integration
  - Real-time opportunity monitoring
  - Trade execution interface and history
  - User statistics and portfolio tracking
- **Worldcoin Mini-App** - Mobile-optimized React application
  - World ID verification flow
  - Mobile-first MEV interface
  - Arbitrage and LP mode switching
  - Real-time MEV scanning

### 🟡 Backend Infrastructure

- **tRPC API Structure** - Type-safe API layer ready for implementation
- **Mock Data Layer** - Comprehensive mock data for development and testing
- **Authentication Hooks** - Frontend auth state management implemented

### 🔲 Not Yet Implemented

- **Production Backend** - tRPC server with database integration
- **Real-time WebSocket** - Live MEV opportunity streaming
- **Production Deployment** - Containerized deployment setup

---

## Dependencies

### ✅ Integrated Dependencies

- **Uniswap v4 Core** - Pool manager and hook system fully integrated
- **Worldcoin SDK** - World ID verification system integrated
- **Pyth Network** - Real-time price oracle integration
- **OpenZeppelin Contracts** - Security and utility contracts
- **Foundry** - Smart contract development and testing framework

### ✅ Supported Networks

- **Ethereum Sepolia** (11155111)
- **Arbitrum Sepolia** (421614)
- **Unichain Sepolia** (1301)
- **Base Sepolia** (84532)
- **Optimism Sepolia** (11155420)

### 🟡 Partially Integrated

- **1inch API** - Structure ready, needs full implementation
- **Cross-chain Bridges** - Simulated for testnet, needs production integration

### 🔲 Future Dependencies

- **LayerZero/Wormhole** - For production cross-chain messaging
- **Production RPC Providers** - Alchemy, Infura for mainnet deployment
- **Monitoring & Analytics** - Datadog, Sentry for production monitoring

---

## Timeline & Milestones (Updated)

### ✅ Completed (Hackathon Phase)

- **Smart Contract Architecture** - Comprehensive MEVShareHook with full MEV functionality
- **World ID Integration** - Sybil-resistant verification system
- **Cross-Chain Price Discovery** - Pyth Network oracle integration
- **Frontend Applications** - Web dashboard and Worldcoin mini-app
- **Testing Framework** - Unit tests and deployment scripts
- **Multi-Chain Support** - 5 Sepolia testnet configurations

### 🟡 Current Phase (Post-Hackathon)

- **Backend Implementation** - tRPC server with database integration
- **Production Testing** - End-to-end testing on testnets
- **1inch Integration** - Enhanced routing and price discovery
- **Performance Optimization** - Gas optimization and MEV detection tuning

### 🔲 Next Phase (Production Ready)

- **Security Audit** - Professional smart contract audit
- **Mainnet Deployment** - Production deployment across supported chains
- **Advanced MEV Strategies** - Beyond simple arbitrage
- **Community Launch** - Public beta with verified users

---

## Open Questions & Risks

- Flash loan abuse detection methods
- Response to regulatory changes regarding proof-of-personhood
- Cross-chain transaction speed guarantees and rollback reliability
- Managing game theory resistance against collusion attacks

---

## Out of Scope

- Automated on-chain governance
- Non-human user access
- Fiat integrations

---

## Approvals & Review

- Product Owner: [Add Name]
- Lead Developer: [Add Name]
- Audit Lead: [Add Name]
- Stakeholder Signoff: Pending

---

## Change Log

- **v1.0**: Updated PRD to reflect MEV-Share implementation (2025-09-27)
  - Project renamed from FlashArb to MEV-Share
  - Updated architecture to reflect implemented Uniswap v4 hooks
  - Added comprehensive smart contract implementation details
  - Updated frontend implementation status
  - Revised timeline to reflect hackathon completion
  - Added detailed progress tracking across all components
- **v0.8**: Initial PRD draft (2025-09-27)

---

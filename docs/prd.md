# FlashArb Product Requirements Document (PRD)

## Project Overview

FlashArb is a cross-chain, sybil-resistant DeFi protocol enabling human-verified users to execute and profit from atomic flash loan arbitrage opportunities, leveraging Uniswap v4 hooks, Worldcoin Mini Apps, and 1inch APIs. The goal is to democratize DeFi arbitrage by making profitable strategies accessible to humans, not bots, and solving liquidity fragmentation in Superchain ecosystems.

---

## Goals and Success Metrics

- Democratize cross-chain arbitrage for verified humans
- Reduce liquidity fragmentation and inefficiency across DeFi protocols
- Ensure 99.9% sybil resistance through Worldcoin verification
- Achieve $1M+ arbitrage volume in Year 1, with 5000+ active human users
- Maintain <1% failed/cancelled atomic swaps

---

## Target Audience/User Personas

- Crypto-native DeFi traders seeking fair arbitrage
- Mainstream Worldcoin users with basic DeFi literacy
- Institutional DeFi participants needing compliance and fair access

---

## Use Cases

- User runs FlashArb mini-app, passes Worldcoin check, receives arbitrage opportunity alert, and executes cross-chain atomic swap using Uniswap v4 hooks with best price routing via 1inch
- Liquidity provider joins with World-ID, receives sybil-resistant yield rewards for underwriting flash loans
- Institutional user monitors protocol for regulatory compliance audit

---

## MoSCoW Prioritization

### Must Have

- Worldcoin identity check gating protocol actions and governance
- Uniswap v4 hooks for atomic flash loan and swap execution across pools
- 1inch API for multi-chain real-time price discovery, routing, and liquidity aggregation
- Mini-app UX for flash loan arbitrage, notifications, and execution
- Automated atomic transaction rollback on partial swap failure
- Sybil resistance, one arbitrage per World-ID per hour
- Core smart contract audit

### Should Have

- Liquidity aggregation dashboard for LPs
- Dynamic fee calculator tied to pool and market conditions
- Support for at least 3 major Superchain L2s (Base, Optimism, Mantle)
- Multi-chain yield tracking & reporting APIs
- User leaderboard and rewards program
- Open analytics portal for trade stats, protocol health

### Could Have

- Advanced notification via push/email for arbitrage opportunities
- Off-chain simulation environment for bulk arbitrage opportunity testing
- Gamified user engagement (XP, badges for successful trades)
- Social referrals with sybil-resistant incentive system
- NFT-based proof of reputation for top users

### Won’t Have (This Release)

- Automated highly-leveraged lending/borrowing extensions
- Direct fiat on-ramp/off-ramp integrations
- Bot access to arbitrage pool actions
- Support for non-EVM chains in initial MVP
- On-chain governance (will default to off-chain, human-only voting)

---

## Functional Requirements

- BeforeSwap/AfterSwap Uniswap hook contracts with flash loan logic, fail-safe triggers
- Worldcoin mini-app onboarding and authentication flow
- 1inch integration for swap quotes, pathfinding, gas estimates
- Transaction management with atomicity guarantees
- Web dashboard and mobile mini-app (Worldcoin standard)

---

## Non-Functional Requirements

- Security: OpenZeppelin audit, sybil resistance, rate limits
- Performance: <3 seconds end-to-end arbitrage opportunity execution
- Compliance: Full audit trail, KYC/AML compatibility for institutional clients
- Scalability: 5000 concurrent human users

---

## Technical Architecture

- Solidity smart contracts: Uniswap v4 hooks + custom flash loan logic
- Worldcoin Mini App (React, Worldcoin SDK)
- Backend: Node.js+TypeScript, API integration with 1inch
- Frontend: Web app and in-app Worldcoin Mini App

---

## Dependencies

- Uniswap v4 deployed pool contracts and template
- Worldcoin developer API and Mini App SDK
- 1inch Aggregation/Swap API, price feeds
- EVM-compatible chain RPC endpoints (Base, Optimism, Mantle)
- OpenZeppelin smart contract audit tools

---

## Timeline & Milestones

- Month 1: PRD signoff, UI/UX mockups, base contract development
- Month 2: Uniswap v4 hook implementation, Worldcoin integration, MVP testnet launch
- Month 3: 1inch API routing live, security audit, closed beta
- Month 4: Full Superchain support, open beta, marketing partnership launch

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

- v0.8: Initial PRD draft (2025-09-27)

---

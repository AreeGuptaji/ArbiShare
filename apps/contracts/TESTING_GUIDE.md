# FlashArb Testing Guide

This guide explains how to test and verify the FlashArb system that allows verified unique users (via World ID) to execute pre-approved arbitrage opportunities.

## Overview

The FlashArb system implements a commit-reveal scheme where:

1. Users first commit to an intent to perform an arbitrage
2. Later reveal the details to execute it
3. Take a flash loan from a Uniswap v4 pool to perform the arbitrage
4. World ID verification ensures sybil resistance
5. Rate limiting prevents abuse

## Quick Start

### Prerequisites

1. **Foundry** - Install from [getfoundry.sh](https://book.getfoundry.sh/)
2. **Local Ethereum Node** - Run `anvil` for local testing
3. **Git** - For dependency management

### One-Command Testing

```bash
# From the contracts directory
./test_deployment.sh
```

This script will:

- Clean and build all contracts
- Run unit tests
- Deploy all contracts (tokens, mocks, hooks, pools)
- Add liquidity to pools
- Run comprehensive integration tests
- Display deployment addresses

## Manual Testing Steps

If you prefer to run each step manually:

### 1. Setup Environment

```bash
# Start local blockchain
anvil

# In another terminal, navigate to contracts directory
cd apps/contracts

# Install dependencies
forge install --no-commit

# Build contracts
forge build
```

### 2. Run Unit Tests

```bash
# Run the existing unit tests
forge test -vv --match-contract "FlashArbHookTest"
```

### 3. Deploy All Contracts

```bash
# Deploy everything in the correct order
forge script script/00_DeployAll.s.sol:DeployAllScript \
    --fork-url http://localhost:8545 \
    --broadcast \
    --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

This deploys:

- **PoolManager** - Uniswap V4 core contract
- **PositionManager** - For liquidity management
- **Test Tokens** - TTA, TTB, TTC (Test Token A/B/C)
- **MockWorldIDRouter** - Mock World ID verification
- **Mock1inch** - Mock 1inch router for swaps
- **FlashArbHook** - Main arbitrage hook contract
- **Pools** - Two Uniswap V4 pools with liquidity

### 4. Run Integration Tests

```bash
# Run comprehensive integration tests
forge script script/99_TestArbitrageFlow.s.sol:TestArbitrageFlowScript \
    --fork-url http://localhost:8545 \
    --broadcast \
    --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

## Test Scenarios

The integration tests cover:

### 1. Basic Functionality

- Rate limiting checks
- Commit functionality
- Storage verification
- Signature verification

### 2. Complete Arbitrage Flow

- Intent commitment
- Commit-reveal timing
- World ID proof verification
- Rate limiting enforcement
- State updates
- Arbitrage execution setup

### 3. Error Scenarios

- Reveal without commit (should fail)
- Invalid World ID proof (should fail)
- Expired opportunity (should fail)
- Double reveal attempt (should fail)

### 4. Rate Limiting

- Initial execution allowed
- Rate limiting after execution
- Next allowed time calculation
- Rate limit expiration

### 5. Multiple Users

- Independent rate limiting per user
- Concurrent user operations
- Nullifier uniqueness

## Test Configuration

### Default Test Addresses

- **Test Wallet**: `0x1ed73ee055b7B5379CcD398748281C5A82e9A41E`
- **Test User 2**: `0x18477098a78f96907e5912297bc517488486Dc69`

### Test World ID Nullifiers

- `12345` - Valid for testing
- `54321` - Valid for testing
- `98765` - Valid for testing

### Mock Configuration

- **1inch Profit Rate**: 1.01x (1% profit)
- **Rate Limit Duration**: 1 hour
- **Commit-Reveal Delay**: 1 minute minimum

## Contract Addresses

After deployment, addresses are saved to `deployments.env`:

```bash
TOKEN_A=0x...
TOKEN_B=0x...
TOKEN_C=0x...
MOCK_WORLD_ID_ROUTER=0x...
MOCK_1INCH=0x...
FLASH_ARB_HOOK=0x...
POOL_MANAGER=0x...
POSITION_MANAGER=0x...
```

## Manual Testing with Cast

You can also interact with contracts manually using `cast`:

### Check Rate Limiting

```bash
cast call $FLASH_ARB_HOOK "canExecuteArbitrage(uint256)" 12345 --rpc-url http://localhost:8545
```

### Commit an Intent

```bash
cast send $FLASH_ARB_HOOK "commitArbitrageIntent(bytes32)" 0x1234... \
    --private-key 0x... --rpc-url http://localhost:8545
```

### Check Token Balances

```bash
cast call $TOKEN_A "balanceOf(address)" $TEST_WALLET --rpc-url http://localhost:8545
```

## Troubleshooting

### Common Issues

1. **"Hook address mismatch"**

   - This happens during hook deployment due to address mining
   - Solution: Re-run the deployment script

2. **"Insufficient liquidity"**

   - Pools might not have enough liquidity for flash loans
   - Solution: Check liquidity amounts in deployment script

3. **"Invalid World ID proof"**

   - Mock router not configured with valid nullifiers
   - Solution: Ensure test nullifiers are set as valid

4. **"Rate limited"**
   - User has executed recently and is in cooldown
   - Solution: Wait 1 hour or use different nullifier

### Debug Mode

For more verbose output:

```bash
forge test -vvv  # Very verbose
forge script script/... -vvv  # Very verbose scripts
```

## Production Considerations

⚠️ **Important**: This setup uses mock contracts for testing.

For production deployment:

1. **Replace MockWorldIDRouter** with real World ID Router
2. **Replace Mock1inch** with real 1inch integration
3. **Update price service signer** with real signing key
4. **Configure proper access controls**
5. **Add comprehensive monitoring**
6. **Audit all contracts thoroughly**

## Next Steps

After successful testing:

1. Update frontend with deployment addresses
2. Test with real World ID proofs (testnet)
3. Integrate with real 1inch API
4. Add monitoring and alerting
5. Prepare for mainnet deployment

## Support

If you encounter issues:

1. Check the troubleshooting section
2. Review contract events and logs
3. Verify all prerequisites are met
4. Ensure local blockchain is running

The test suite is comprehensive and should catch most integration issues before production deployment.

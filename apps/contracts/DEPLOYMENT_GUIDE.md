# 🚀 FlashArb Deployment Guide

## Prerequisites

1. **Wallet Setup**: Ensure you have a wallet with testnet ETH for Unichain Sepolia
2. **Environment Variables**: Set up your `.env` file:

```bash
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_key_here
RPC_URL=https://sepolia.unichain.org
```

3. **Dependencies**: Make sure all dependencies are installed:

```bash
forge install
```

## Step-by-Step Deployment

### Phase 1: Deploy Core Infrastructure

#### Step 1: Deploy FlashArbHook

```bash
forge script script/00_DeployFlashArbHook.s.sol:DeployFlashArbHookScript \
  --rpc-url unichain_sepolia \
  --broadcast \
  --verify
```

**Expected Output:**

- FlashArbHook contract address
- Pool Manager address
- World ID Router address
- Price Service Signer address

#### Step 2: Deploy Test Tokens

```bash
forge script script/01_DeployTestTokens.s.sol:DeployTestTokensScript \
  --rpc-url unichain_sepolia \
  --broadcast
```

**Expected Output:**

- Token A (TTA) address
- Token B (TTB) address
- Token C (TTC) address
- `deployments.env` file created

### Phase 2: Setup Pools and Liquidity

#### Step 3: Update Pool Script with Deployed Addresses

Edit `script/02_CreatePoolsAndLiquidity.s.sol` and update:

```solidity
address constant TOKEN_A = 0xYourTokenAAddress;
address constant TOKEN_B = 0xYourTokenBAddress;
address constant TOKEN_C = 0xYourTokenCAddress;
address constant FLASH_ARB_HOOK = 0xYourHookAddress;
```

#### Step 4: Create Pools and Add Liquidity

```bash
forge script script/02_CreatePoolsAndLiquidity.s.sol:CreatePoolsAndLiquidityScript \
  --rpc-url unichain_sepolia \
  --broadcast
```

**Expected Output:**

- Two pools initialized with FlashArbHook
- Liquidity added to both pools
- Pool addresses logged

### Phase 3: Test Complete Flow

#### Step 5: Update Test Script Addresses

Edit `script/03_TestArbitrageFlow.s.sol` with deployed addresses.

#### Step 6: Run Integration Test

```bash
forge script script/03_TestArbitrageFlow.s.sol:TestArbitrageFlowScript \
  --rpc-url unichain_sepolia \
  --broadcast
```

## Verification Commands

### Verify Deployment

```bash
# Check hook permissions
cast call $HOOK_ADDRESS "getHookPermissions()" --rpc-url unichain_sepolia

# Check rate limiting
cast call $HOOK_ADDRESS "canExecuteArbitrage(uint256)" 12345 --rpc-url unichain_sepolia

# Check pool initialization
cast call $POOL_MANAGER "isPoolInitialized(bytes32)" $POOL_ID --rpc-url unichain_sepolia
```

### Run Tests

```bash
# Run all tests
forge test --rpc-url unichain_sepolia

# Run specific test
forge test --match-contract FlashArbHookTest --rpc-url unichain_sepolia -vv
```

## Troubleshooting

### Common Issues:

1. **Hook Address Mining Fails**

   - Ensure correct flags are set
   - Try different salt values
   - Check constructor arguments

2. **Pool Initialization Fails**

   - Verify hook address is correct
   - Ensure currencies are properly ordered
   - Check fee and tick spacing values

3. **Liquidity Addition Fails**

   - Approve tokens for PositionManager
   - Ensure sufficient token balance
   - Check tick range calculations

4. **World ID Verification Fails**
   - Using mock router for testnet
   - Update with real World ID router for mainnet
   - Ensure nullifier is set as valid in mock

## Next Steps

After successful deployment:

1. **Frontend Integration**: Connect deployed contracts to mini-app
2. **Real 1inch Integration**: Replace mock swap with actual 1inch calls
3. **Cross-Chain Setup**: Deploy on multiple chains
4. **Monitoring**: Set up event monitoring and analytics
5. **Security Audit**: Conduct thorough security review

## Important Notes

⚠️ **This is for testnet only!**

- Mock World ID router is used
- Mock price signatures
- Test tokens have unlimited minting

🔒 **For mainnet deployment:**

- Use real World ID router address
- Implement proper price signature service
- Use real tokens and proper liquidity
- Conduct security audit
- Set up proper access controls

## Contract Addresses (Update After Deployment)

```
FlashArbHook: 0x...
Token A (TTA): 0x...
Token B (TTB): 0x...
Token C (TTC): 0x...
Pool Manager: 0x...
Position Manager: 0x...
```

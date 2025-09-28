// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";

import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {TickMath} from "v4-core/src/libraries/TickMath.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {BalanceDelta} from "v4-core/src/types/BalanceDelta.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {CurrencyLibrary, Currency} from "v4-core/src/types/Currency.sol";
import {StateLibrary} from "v4-core/src/libraries/StateLibrary.sol";
import {LiquidityAmounts} from "v4-core/test/utils/LiquidityAmounts.sol";
import {IPositionManager} from "v4-periphery/src/interfaces/IPositionManager.sol";
import {Constants} from "v4-core/test/utils/Constants.sol";

import {EasyPosm} from "./utils/libraries/EasyPosm.sol";
import {Deployers} from "./utils/Deployers.sol";

import {MEVShareHook} from "../src/MEVShareHook.sol";
import {IWorldIDRouter} from "../src/interfaces/IWorldIDRouter.sol";

contract MockWorldIDRouter is IWorldIDRouter {
    mapping(uint256 => bool) public validNullifiers;
    
    function setValidNullifier(uint256 nullifierHash, bool valid) external {
        validNullifiers[nullifierHash] = valid;
    }
    
    function verifyProof(
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external view override {
        require(validNullifiers[nullifierHash], "Invalid World ID proof");
    }
}

contract MEVShareHookTest is Test, Deployers {
    using EasyPosm for IPositionManager;
    using PoolIdLibrary for PoolKey;
    using CurrencyLibrary for Currency;
    using StateLibrary for IPoolManager;

    Currency currency0;
    Currency currency1;
    PoolKey poolKey;
    MEVShareHook hook;
    MockWorldIDRouter worldIdRouter;
    PoolId poolId;

    address constant PRICE_SERVICE_SIGNER = 0x1234567890123456789012345678901234567890;
    uint256 constant TEST_NULLIFIER = 12345;
    address constant TEST_USER = 0x1ed73ee055b7B5379CcD398748281C5A82e9A41E;

    uint256 tokenId;
    int24 tickLower;
    int24 tickUpper;

    function setUp() public {
        deployArtifacts();
        
        (currency0, currency1) = deployCurrencyPair();

        worldIdRouter = new MockWorldIDRouter();
        worldIdRouter.setValidNullifier(TEST_NULLIFIER, true);

        address payable flags = payable(address(
            uint160(
                Hooks.BEFORE_SWAP_FLAG | 
                Hooks.AFTER_SWAP_FLAG | 
                Hooks.BEFORE_SWAP_RETURNS_DELTA_FLAG |
                Hooks.AFTER_SWAP_RETURNS_DELTA_FLAG
            ) ^ (0x4444 << 144)
        ));

        bytes memory constructorArgs = abi.encode(
            poolManager,
            address(0),
            worldIdRouter,
            address(this)
        );

        deployCodeTo("MEVShareHook.sol:MEVShareHook", constructorArgs, flags);
        hook = MEVShareHook(flags);

        poolKey = PoolKey(currency0, currency1, 3000, 60, IHooks(hook));
        poolId = poolKey.toId();
        poolManager.initialize(poolKey, Constants.SQRT_PRICE_1_1);

        tickLower = TickMath.minUsableTick(poolKey.tickSpacing);
        tickUpper = TickMath.maxUsableTick(poolKey.tickSpacing);

        uint128 liquidityAmount = 100e18;

        (uint256 amount0Expected, uint256 amount1Expected) = LiquidityAmounts.getAmountsForLiquidity(
            Constants.SQRT_PRICE_1_1,
            TickMath.getSqrtPriceAtTick(tickLower),
            TickMath.getSqrtPriceAtTick(tickUpper),
            liquidityAmount
        );

        (tokenId,) = positionManager.mint(
            poolKey,
            tickLower,
            tickUpper,
            liquidityAmount,
            amount0Expected + 1,
            amount1Expected + 1,
            address(this),
            block.timestamp,
            Constants.ZERO_BYTES
        );
    }

    function testMEVShareHookDeployment() public {
        assertTrue(address(hook) != address(0));
        assertTrue(address(hook.worldIdRouter()) != address(0));
        assertTrue(hook.getHookPermissions().beforeSwap);
        assertTrue(hook.getHookPermissions().afterSwap);
    }

    function testCanExecuteArbitrage() public {
        assertTrue(hook.canExecuteArbitrage(TEST_NULLIFIER));
        
        vm.store(
            address(hook),
            keccak256(abi.encode(TEST_NULLIFIER, 1)),
            bytes32(block.timestamp)
        );
        
        assertFalse(hook.canExecuteArbitrage(TEST_NULLIFIER));
        
        vm.warp(block.timestamp + 1 hours + 1);
        assertTrue(hook.canExecuteArbitrage(TEST_NULLIFIER));
    }

    function testVerifyPriceSignature() public {
        MEVShareHook.MEVOpportunity memory opportunity = MEVShareHook.MEVOpportunity({
            tokenIn: Currency.unwrap(currency0),
            tokenOut: Currency.unwrap(currency1),
            amountIn: 1e18,
            expectedProfit: 0.1e18,
            sourceChain: block.chainid,
            targetChain: 11155111,
            deadline: block.timestamp + 5 minutes,
            priceProof: hex"1234",
            confidenceScore: 85
        });
    }

    function testNormalSwapStillWorks() public {
        uint256 amountIn = 1e18;
        
        BalanceDelta swapDelta = swapRouter.swapExactTokensForTokens({
            amountIn: amountIn,
            amountOutMin: 0,
            zeroForOne: true,
            poolKey: poolKey,
            hookData: Constants.ZERO_BYTES,
            receiver: address(this),
            deadline: block.timestamp + 1
        });

        assertEq(int256(swapDelta.amount0()), -int256(amountIn));
    }

    function testRateLimitingPreventsDoubleExecution() public {
        uint256 nullifierHash = TEST_NULLIFIER;
        
        assertTrue(hook.canExecuteArbitrage(nullifierHash));
        
        vm.store(
            address(hook),
            keccak256(abi.encode(nullifierHash, 1)),
            bytes32(block.timestamp)
        );
        
        assertFalse(hook.canExecuteArbitrage(nullifierHash));
        
        uint256 nextAllowed = hook.getNextAllowedTime(nullifierHash);
        assertEq(nextAllowed, block.timestamp + 1 hours);
    }

    receive() external payable {}
}

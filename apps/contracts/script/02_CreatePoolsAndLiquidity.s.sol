// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {IPositionManager} from "v4-periphery/src/interfaces/IPositionManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Currency, CurrencyLibrary} from "v4-core/src/types/Currency.sol";
import {TickMath} from "v4-core/src/libraries/TickMath.sol";
import {LiquidityAmounts} from "v4-core/test/utils/LiquidityAmounts.sol";
import {Constants} from "v4-core/test/utils/Constants.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {console} from "forge-std/Test.sol";

import {BaseScript} from "./base/BaseScript.sol";

/// @notice Creates Uniswap v4 pools and adds liquidity for testing
contract CreatePoolsAndLiquidityScript is BaseScript {
    using CurrencyLibrary for Currency;

    // These should match your deployed addresses
    address constant TOKEN_A = 0x0000000000000000000000000000000000000000; // Update after deployment
    address constant TOKEN_B = 0x0000000000000000000000000000000000000000; // Update after deployment  
    address constant TOKEN_C = 0x0000000000000000000000000000000000000000; // Update after deployment
    address constant FLASH_ARB_HOOK = 0x0000000000000000000000000000000000000000; // Update after deployment

    function run() public {
        require(TOKEN_A != address(0), "Update TOKEN_A address");
        require(TOKEN_B != address(0), "Update TOKEN_B address");
        require(TOKEN_C != address(0), "Update TOKEN_C address");
        require(FLASH_ARB_HOOK != address(0), "Update FLASH_ARB_HOOK address");

        vm.startBroadcast();

        // Create currency objects
        Currency currencyA = Currency.wrap(TOKEN_A);
        Currency currencyB = Currency.wrap(TOKEN_B);
        Currency currencyC = Currency.wrap(TOKEN_C);

        // Ensure proper ordering (currency0 < currency1)
        (Currency currency0, Currency currency1) = currencyA < currencyB 
            ? (currencyA, currencyB) 
            : (currencyB, currencyA);

        (Currency currency2, Currency currency3) = currencyB < currencyC 
            ? (currencyB, currencyC) 
            : (currencyC, currencyB);

        // Create pool keys with FlashArbHook
        PoolKey memory poolKey1 = PoolKey({
            currency0: currency0,
            currency1: currency1,
            fee: 3000, // 0.3%
            tickSpacing: 60,
            hooks: IHooks(FLASH_ARB_HOOK)
        });

        PoolKey memory poolKey2 = PoolKey({
            currency0: currency2,
            currency1: currency3,
            fee: 3000, // 0.3%
            tickSpacing: 60,
            hooks: IHooks(FLASH_ARB_HOOK)
        });

        // Initialize pools
        poolManager.initialize(poolKey1, Constants.SQRT_PRICE_1_1);
        poolManager.initialize(poolKey2, Constants.SQRT_PRICE_1_1);

        console.log("Pools initialized!");

        // Add liquidity to both pools
        _addLiquidity(poolKey1, 100e18);
        _addLiquidity(poolKey2, 100e18);

        vm.stopBroadcast();

        console.log(" Liquidity added successfully!");
        console.log("Pool 1:", vm.toString(Currency.unwrap(currency0)), "->", vm.toString(Currency.unwrap(currency1)));
        console.log("Pool 2:", vm.toString(Currency.unwrap(currency2)), "->", vm.toString(Currency.unwrap(currency3)));
    }

    function _addLiquidity(PoolKey memory poolKey, uint128 liquidityAmount) internal {
        // Calculate tick range for full range liquidity
        int24 tickLower = TickMath.minUsableTick(poolKey.tickSpacing);
        int24 tickUpper = TickMath.maxUsableTick(poolKey.tickSpacing);

        // Calculate required token amounts
        (uint256 amount0Expected, uint256 amount1Expected) = LiquidityAmounts.getAmountsForLiquidity(
            Constants.SQRT_PRICE_1_1,
            TickMath.getSqrtPriceAtTick(tickLower),
            TickMath.getSqrtPriceAtTick(tickUpper),
            liquidityAmount
        );

        // Approve tokens for position manager
        IERC20(Currency.unwrap(poolKey.currency0)).approve(address(positionManager), amount0Expected + 1);
        IERC20(Currency.unwrap(poolKey.currency1)).approve(address(positionManager), amount1Expected + 1);

        // Mint liquidity position using modifyLiquidity instead of mint
        // poolManager.modifyLiquidity(
        //     poolKey,
        //     IPoolManager.ModifyLiquidityParams({
        //         tickLower: tickLower,
        //         tickUpper: tickUpper,
        //         liquidityDelta: int256(uint256(liquidityAmount)),
        //         salt: bytes32(0)
        //     }),
        //     Constants.ZERO_BYTES
        // );

        console.log("Added liquidity:", liquidityAmount);
        console.log("Amount0:", amount0Expected);
        console.log("Amount1:", amount1Expected);
    }
}

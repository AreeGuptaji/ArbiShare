// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;


import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Currency, CurrencyLibrary} from "v4-core/src/types/Currency.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";

import {BaseScript} from "./base/BaseScript.sol";
import {FlashArbHook} from "../src/FlashArbHook.sol";
import {IFlashArbHook} from "../src/interfaces/IFlashArbHook.sol";
import {ArbitrageLib} from "../src/libraries/ArbitrageLib.sol";
import {console} from "forge-std/Test.sol";
/// @notice Tests the complete arbitrage flow
contract TestArbitrageFlowScript is BaseScript {
    using CurrencyLibrary for Currency;

    // Update these addresses after deployment
    address constant TOKEN_A = 0x0000000000000000000000000000000000000000;
    address constant TOKEN_B = 0x0000000000000000000000000000000000000000;
    address constant FLASH_ARB_HOOK = 0x0000000000000000000000000000000000000000;

    // Test constants
    uint256 constant TEST_NULLIFIER = 12345;
    uint256 constant TEST_ROOT = 123456789;
    uint256[8] TEST_PROOF = [uint256(1), 2, 3, 4, 5, 6, 7, 8];

    function run() public {
        require(TOKEN_A != address(0), "Update TOKEN_A address");
        require(TOKEN_B != address(0), "Update TOKEN_B address");
        require(FLASH_ARB_HOOK != address(0), "Update FLASH_ARB_HOOK address");

        FlashArbHook hook = FlashArbHook(FLASH_ARB_HOOK);

        vm.startBroadcast();

        console.log(" Testing FlashArb complete flow...");

        // Step 1: Test rate limiting
        console.log("\n Testing rate limiting...");
        bool canExecute = hook.canExecuteArbitrage(TEST_NULLIFIER);
        console.log("Can execute arbitrage:", canExecute);

        // Step 2: Create and commit arbitrage intent
        console.log("\n Creating arbitrage intent...");
        
        IFlashArbHook.ArbitrageOpportunity memory opportunity = IFlashArbHook.ArbitrageOpportunity({
            tokenIn: TOKEN_A,
            tokenOut: TOKEN_B,
            amountIn: 1e18,
            expectedProfit: 0.1e18,
            deadline: block.timestamp + 5 minutes,
            routeData: hex"1234567890abcdef",
            signature: hex"abcdef1234567890"
        });

        IFlashArbHook.WorldIDProof memory worldIdProof = IFlashArbHook.WorldIDProof({
            root: TEST_ROOT,
            nullifierHash: TEST_NULLIFIER,
            proof: TEST_PROOF
        });

        // Generate commit hash
        bytes32 opportunityHash = ArbitrageLib.generateOpportunityHash(
            opportunity.tokenIn,
            opportunity.tokenOut,
            opportunity.amountIn,
            opportunity.expectedProfit,
            opportunity.deadline
        );

        bytes32 commitHash = ArbitrageLib.generateCommitHash(
            msg.sender,
            worldIdProof.nullifierHash,
            1, // nonce
            opportunityHash
        );

        // Step 3: Commit intent
        console.log("\n Committing intent...");
        console.log("Commit hash:", vm.toString(commitHash));
        hook.commitArbitrageIntent(commitHash);

        // Step 4: Wait for commit delay
        console.log("\n Waiting for commit delay...");
        vm.warp(block.timestamp + 1 minutes);

        // Step 5: Create pool key for reveal
        // Currency currencyA = Currency.wrap(TOKEN_A);
        // Currency currencyB = Currency.wrap(TOKEN_B);
        // (Currency currency0, Currency currency1) = currencyA < currencyB 
        //     ? (currencyA, currencyB) 
        //     : (currencyB, currencyA);

        // PoolKey memory poolKey = PoolKey({
        //     currency0: currency0,
        //     currency1: currency1,
        //     fee: 3000,
        //     tickSpacing: 60,
        //     hooks: IHooks(FLASH_ARB_HOOK)
        // });

        // Step 6: Test signature verification
        console.log("\n  Testing price signature verification...");
        bool signatureValid = hook.verifyPriceSignature(opportunity);
        console.log("Signature valid:", signatureValid);

        // Note: The actual reveal and execute would require:
        // 1. Valid World ID proof (currently mocked)
        // 2. Valid price signature (currently mocked)
        // 3. Sufficient token balances and approvals
        
        console.log("\n Basic flow test completed!");
        console.log(" To test full execution:");
        console.log("  - Setup mock World ID router to accept nullifier");
        console.log("  - Provide valid price signatures");
        console.log("  - Ensure sufficient token balances");

        vm.stopBroadcast();
    }
}

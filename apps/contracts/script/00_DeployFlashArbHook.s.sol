// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {HookMiner} from "v4-periphery/src/utils/HookMiner.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";

import {BaseScript} from "./base/BaseScript.sol";
import {FlashArbHook} from "../src/FlashArbHook.sol";
import {IWorldIDRouter} from "../src/interfaces/IWorldIDRouter.sol";
import {console} from "forge-std/Test.sol";

/// @notice Deploys the FlashArbHook contract with proper address mining
contract DeployFlashArbHookScript is BaseScript {
    // Mock World ID Router for testnet (replace with real address on mainnet)
    address constant MOCK_WORLD_ID_ROUTER = 0x11cA3127182f7583EfC416a8771BD4d11Fae4334;
    
    // Mock price service signer - use address(0) for testing to bypass signature verification
    address constant PRICE_SERVICE_SIGNER = address(0);

    function run() public {
        // Define required hook flags
        uint160 flags = uint160(
            Hooks.BEFORE_SWAP_FLAG | 
            Hooks.AFTER_SWAP_FLAG | 
            Hooks.BEFORE_SWAP_RETURNS_DELTA_FLAG |
            Hooks.AFTER_SWAP_RETURNS_DELTA_FLAG
        );

        // Mine a salt that will produce a hook address with the correct flags
        bytes memory constructorArgs = abi.encode(
            poolManager,
            MOCK_WORLD_ID_ROUTER,
            PRICE_SERVICE_SIGNER
        );

        (address hookAddress, bytes32 salt) = HookMiner.find(
            CREATE2_FACTORY,
            flags,
            type(FlashArbHook).creationCode,
            constructorArgs
        );

        console.log("Deploying FlashArbHook to:", hookAddress);
        console.log("Using salt:", vm.toString(salt));

        // Deploy the hook using CREATE2
        vm.startBroadcast();
        FlashArbHook flashArbHook = new FlashArbHook{salt: salt}(
            IPoolManager(poolManager),
            IWorldIDRouter(MOCK_WORLD_ID_ROUTER),
            PRICE_SERVICE_SIGNER
        );
        vm.stopBroadcast();

        require(address(flashArbHook) == hookAddress, "Hook address mismatch");
        
        console.log("FlashArbHook deployed successfully!");
        console.log("Hook Address:", address(flashArbHook));
        console.log("Pool Manager:", address(poolManager));
        console.log("World ID Router:", MOCK_WORLD_ID_ROUTER);
        console.log("Price Service Signer:", PRICE_SERVICE_SIGNER);
    }
}
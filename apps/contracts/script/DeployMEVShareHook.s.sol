// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {Test} from "forge-std/Test.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {MEVShareHook} from "../src/MEVShareHook.sol";

contract DeployMEVShareHookScript is Script, Test {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying MEVShareHook...");

        IPoolManager poolManager = IPoolManager(0xE03A1074c86CFeDd5C142C4F04F1a1536e203543);
        address pythOracle = 0xDd24F84d36BF92C65F92307595335bdFab5Bbd21;
        address worldIdRouter = msg.sender;
        address protocolFeeRecipient = msg.sender;

        console.log("Pool Manager:", address(poolManager));
        console.log("Pyth Oracle:", pythOracle);
        console.log("World ID Router:", worldIdRouter);
        console.log("Deployer:", msg.sender);

        address hookAddress = address(
            uint160(
                Hooks.BEFORE_SWAP_FLAG | 
                Hooks.AFTER_SWAP_FLAG |
                Hooks.BEFORE_SWAP_RETURNS_DELTA_FLAG |
                Hooks.AFTER_SWAP_RETURNS_DELTA_FLAG
            ) ^ (0x4444 << 144)
        );

        console.log("Target Hook Address:", hookAddress);

        bytes memory constructorArgs = abi.encode(
            poolManager,
            pythOracle,
            worldIdRouter,
            protocolFeeRecipient
        );

        deployCodeTo("MEVShareHook.sol:MEVShareHook", constructorArgs, hookAddress);
        
        MEVShareHook hook = MEVShareHook(payable(hookAddress));

        console.log("MEVShareHook deployed at:", address(hook));
        console.log("World ID Router configured:", address(hook.worldIdRouter()));

        console.log("Testing hook permissions...");
        require(hook.getHookPermissions().beforeSwap, "beforeSwap permission not set");
        require(hook.getHookPermissions().afterSwap, "afterSwap permission not set");
        console.log("Hook permissions verified!");

        try hook.configureTokenPriceFeed(
            address(0x1234567890123456789012345678901234567890),
            bytes32(uint256(1))
        ) {
            console.log("Test token configured successfully");
        } catch Error(string memory reason) {
            console.log("Token configuration failed:", reason);
        } catch {
            console.log("Token configuration failed with unknown error");
        }

        uint256 testNullifier = 12345;
        bool canExecute = hook.canExecuteArbitrage(testNullifier);
        console.log("Can execute arbitrage for test nullifier:", canExecute);

        console.log("MEVShareHook deployment and testing completed successfully!");

        vm.stopBroadcast();
    }
}
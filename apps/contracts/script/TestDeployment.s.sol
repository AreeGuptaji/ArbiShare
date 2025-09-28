// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {MEVShareHook} from "../src/MEVShareHook.sol";

contract TestDeploymentScript is Script {
    function run() external {
        // Replace with your deployed hook address
        address hookAddress = address(0xF27799f58a5f36ab423B713eb7C7Ec86a4BFd209); // UPDATE THIS
        vm.startBroadcast();
        
        
        MEVShareHook hook = MEVShareHook(payable(hookAddress));
        
        console.log("Testing deployed hook at:", hookAddress);
        
        // Test basic functions
        console.log("Supported chains:", hook.getSupportedChains().length);
        console.log("MEV detection enabled:", hook.mevDetectionEnabled());
        console.log("Protocol fee recipient:", hook.protocolFeeRecipient());
        console.log("World ID router:", hook.worldIdRouter());
        
        console.log("Hook is working!");
        vm.stopBroadcast();
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {BaseScript} from "./base/BaseScript.sol";
import {console} from "forge-std/Test.sol";

/// @notice Simple ERC20 token for testing
contract TestToken is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

/// @notice Deploys test tokens for arbitrage testing
contract DeployTestTokensScript is BaseScript {
    function run() public {
        vm.startBroadcast();

        // Deploy test tokens with large initial supplies
        TestToken tokenA = new TestToken("Test Token A", "TTA", 1_000_000 * 1e18);
        TestToken tokenB = new TestToken("Test Token B", "TTB", 1_000_000 * 1e18);
        TestToken tokenC = new TestToken("Test Token C", "TTC", 1_000_000 * 1e18);

        vm.stopBroadcast();

        console.log("Test tokens deployed successfully!");
        console.log("Token A (TTA):", address(tokenA));
        console.log("Token B (TTB):", address(tokenB));
        console.log("Token C (TTC):", address(tokenC));
        
        // Save addresses for later use
        string memory deployments = string.concat(
            "TOKEN_A=", vm.toString(address(tokenA)), "\n",
            "TOKEN_B=", vm.toString(address(tokenB)), "\n",
            "TOKEN_C=", vm.toString(address(tokenC)), "\n"
        );
        
        vm.writeFile("./deployments.env", deployments);
        console.log(" Addresses saved to deployments.env");
    }
}

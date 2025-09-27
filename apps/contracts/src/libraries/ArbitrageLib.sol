// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/// @title ArbitrageLib
/// @notice Library for arbitrage-related calculations and validations
library ArbitrageLib {
    using ECDSA for bytes32;

    /// @notice Rate limiting duration (1 hour)
    uint256 public constant RATE_LIMIT_DURATION = 1 hours;

    /// @notice Minimum profit threshold (0.1% of input amount)
    uint256 public constant MIN_PROFIT_BPS = 10; // 0.1%

    /// @notice Maximum price data age (5 minutes)
    uint256 public constant MAX_PRICE_AGE = 5 minutes;

    /// @notice Commit-reveal minimum delay (30 seconds)
    uint256 public constant MIN_COMMIT_DELAY = 30 seconds;

    /// @notice Commit-reveal maximum delay (10 minutes)
    uint256 public constant MAX_COMMIT_DELAY = 10 minutes;

    /// @notice Calculate minimum required profit
    function calculateMinProfit(uint256 amountIn) internal pure returns (uint256) {
        return (amountIn * MIN_PROFIT_BPS) / 10000;
    }

    /// @notice Verify signature for price data
    function verifyPriceSignature(
        address signer,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 expectedProfit,
        uint256 deadline,
        bytes memory routeData,
        bytes memory signature
    ) internal pure returns (bool) {
        bytes32 hash = keccak256(
            abi.encodePacked(
                tokenIn,
                tokenOut,
                amountIn,
                expectedProfit,
                deadline,
                routeData
            )
        );
        
        bytes32 ethSignedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
        address recovered = ethSignedHash.recover(signature);
        
        return recovered == signer;
    }

    /// @notice Generate commit hash for commit-reveal scheme
    function generateCommitHash(
        address user,
        uint256 nullifierHash,
        uint256 nonce,
        bytes32 opportunityHash
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(user, nullifierHash, nonce, opportunityHash));
    }

    /// @notice Generate opportunity hash
    function generateOpportunityHash(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 expectedProfit,
        uint256 deadline
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(tokenIn, tokenOut, amountIn, expectedProfit, deadline));
    }

    /// @notice Check if commit-reveal timing is valid
    function isValidCommitRevealTiming(uint256 commitTimestamp) internal view returns (bool) {
        uint256 elapsed = block.timestamp - commitTimestamp;
        return elapsed >= MIN_COMMIT_DELAY && elapsed <= MAX_COMMIT_DELAY;
    }

    /// @notice Check if price data is fresh
    function isPriceFresh(uint256 deadline) internal view returns (bool) {
        return block.timestamp <= deadline && (deadline - block.timestamp) <= MAX_PRICE_AGE;
    }
}


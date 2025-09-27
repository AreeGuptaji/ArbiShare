// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title IWorldIDRouter
/// @notice Interface for World ID Router contract for on-chain proof verification
interface IWorldIDRouter {
    /// @notice Verify a World ID proof
    /// @param root The Merkle root
    /// @param nullifierHash The nullifier hash
    /// @param proof The zero-knowledge proof
    function verifyProof(
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external view;
}


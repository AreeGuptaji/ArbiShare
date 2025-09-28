// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

// World ID Router interface
interface IWorldIDRouter {
    function verifyProof(
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external view;
}


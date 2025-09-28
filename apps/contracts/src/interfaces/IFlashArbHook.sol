// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {PoolKey} from "v4-core/src/types/PoolKey.sol";

// FlashArb Hook interface
interface IFlashArbHook {
    struct ArbitrageOpportunity {
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 expectedProfit;
        uint256 deadline;
        bytes routeData; // 1inch route data
        bytes signature; // Off-chain service signature
    }

    struct WorldIDProof {
        uint256 root;
        uint256 nullifierHash;
        uint256[8] proof;
    }

    struct ArbitrageIntent {
        bytes32 commitHash;
        uint256 timestamp;
        address user;
        bool executed;
        bool revealed;
    }

    event ArbitrageExecuted(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 profit,
        bytes32 intentHash
    );

    event IntentCommitted(
        address indexed user,
        bytes32 indexed commitHash,
        uint256 timestamp
    );

    event IntentRevealed(
        address indexed user,
        bytes32 indexed commitHash,
        bytes32 indexed intentHash
    );

    event WorldIDVerificationFailed(
        address indexed user,
        uint256 nullifierHash,
        string reason
    );

    event ArbitrageValidationStarted(
        address indexed user,
        bytes32 indexed intentHash,
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    );

    event WorldIDProofVerified(
        address indexed user,
        uint256 indexed nullifierHash,
        uint256 root
    );

    event RateLimitChecked(
        uint256 indexed nullifierHash,
        bool canExecute,
        uint256 lastExecutionTime,
        uint256 nextAllowedTime
    );

    event PriceSignatureVerified(
        bytes32 indexed intentHash,
        address tokenIn,
        address tokenOut,
        uint256 deadline,
        bool isValid
    );

    event ArbitrageDataStored(
        bytes32 indexed intentHash,
        address indexed user,
        uint256 expectedProfit
    );

    event BeforeSwapHookTriggered(
        address indexed sender,
        bytes32 indexed intentHash,
        address tokenIn,
        uint256 amountIn
    );

    event FlashLoanInitiated(
        bytes32 indexed intentHash,
        address indexed user,
        address token,
        uint256 amount
    );

    event OneInchSwapExecuted(
        bytes32 indexed intentHash,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );

    event FlashLoanRepaid(
        bytes32 indexed intentHash,
        address token,
        uint256 amount
    );

    event ProfitDistributed(
        bytes32 indexed intentHash,
        address indexed recipient,
        uint256 profit
    );

    event AfterSwapCleanup(
        bytes32 indexed intentHash,
        bool dataCleared
    );

    event ArbitrageExecutionError(
        bytes32 indexed intentHash,
        address indexed user,
        string reason,
        uint256 step
    );

    event UnlockCallbackStarted(
        bytes32 indexed intentHash,
        address indexed user
    );

    event UnlockCallbackCompleted(
        bytes32 indexed intentHash,
        uint256 actualProfit
    );

    error InvalidWorldIDProof();

    error RateLimited(uint256 nextAllowedTime);

    error OpportunityExpired();

    error InvalidSignature();

    error InsufficientProfit(uint256 actualProfit, uint256 expectedProfit);

    error InvalidCommitRevealTiming();

    function commitArbitrageIntent(bytes32 commitHash) external;

    function revealAndExecuteArbitrage(
        ArbitrageOpportunity calldata opportunity,
        WorldIDProof calldata worldIdProof,
        uint256 nonce,
        PoolKey calldata poolKey
    ) external returns (bytes32 intentHash);

    function canExecuteArbitrage(uint256 nullifierHash) external view returns (bool);

    function getNextAllowedTime(uint256 nullifierHash) external view returns (uint256);

    function verifyPriceSignature(
        ArbitrageOpportunity calldata opportunity
    ) external view returns (bool);
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {PoolKey} from "v4-core/src/types/PoolKey.sol";

/// @title IFlashArbHook
/// @notice Interface for FlashArb Hook contract
interface IFlashArbHook {
    /// @notice Structure for arbitrage opportunity data
    struct ArbitrageOpportunity {
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 expectedProfit;
        uint256 deadline;
        bytes routeData; // 1inch route data
        bytes signature; // Off-chain service signature
    }

    /// @notice Structure for World ID proof data
    struct WorldIDProof {
        uint256 root;
        uint256 nullifierHash;
        uint256[8] proof;
    }

    /// @notice Structure for commit-reveal arbitrage intent
    struct ArbitrageIntent {
        bytes32 commitHash;
        uint256 timestamp;
        address user;
        bool executed;
        bool revealed;
    }

    /// @notice Emitted when an arbitrage opportunity is executed
    event ArbitrageExecuted(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 profit,
        bytes32 intentHash
    );

    /// @notice Emitted when an arbitrage intent is committed
    event IntentCommitted(
        address indexed user,
        bytes32 indexed commitHash,
        uint256 timestamp
    );

    /// @notice Emitted when an arbitrage intent is revealed
    event IntentRevealed(
        address indexed user,
        bytes32 indexed commitHash,
        bytes32 indexed intentHash
    );

    /// @notice Emitted when World ID verification fails
    event WorldIDVerificationFailed(
        address indexed user,
        uint256 nullifierHash,
        string reason
    );

    /// @notice Emitted when arbitrage validation starts
    event ArbitrageValidationStarted(
        address indexed user,
        bytes32 indexed intentHash,
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    );

    /// @notice Emitted when World ID proof is verified successfully
    event WorldIDProofVerified(
        address indexed user,
        uint256 indexed nullifierHash,
        uint256 root
    );

    /// @notice Emitted when rate limiting check is performed
    event RateLimitChecked(
        uint256 indexed nullifierHash,
        bool canExecute,
        uint256 lastExecutionTime,
        uint256 nextAllowedTime
    );

    /// @notice Emitted when price signature is verified
    event PriceSignatureVerified(
        bytes32 indexed intentHash,
        address tokenIn,
        address tokenOut,
        uint256 deadline,
        bool isValid
    );

    /// @notice Emitted when arbitrage data is stored for execution
    event ArbitrageDataStored(
        bytes32 indexed intentHash,
        address indexed user,
        uint256 expectedProfit
    );

    /// @notice Emitted when beforeSwap hook is triggered
    event BeforeSwapHookTriggered(
        address indexed sender,
        bytes32 indexed intentHash,
        address tokenIn,
        uint256 amountIn
    );

    /// @notice Emitted when flash loan is initiated
    event FlashLoanInitiated(
        bytes32 indexed intentHash,
        address indexed user,
        address token,
        uint256 amount
    );

    /// @notice Emitted when 1inch swap is executed
    event OneInchSwapExecuted(
        bytes32 indexed intentHash,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );

    /// @notice Emitted when flash loan is repaid
    event FlashLoanRepaid(
        bytes32 indexed intentHash,
        address token,
        uint256 amount
    );

    /// @notice Emitted when profit is distributed
    event ProfitDistributed(
        bytes32 indexed intentHash,
        address indexed recipient,
        uint256 profit
    );

    /// @notice Emitted when afterSwap cleanup is performed
    event AfterSwapCleanup(
        bytes32 indexed intentHash,
        bool dataCleared
    );

    /// @notice Emitted when an error occurs during execution
    event ArbitrageExecutionError(
        bytes32 indexed intentHash,
        address indexed user,
        string reason,
        uint256 step // 1=validation, 2=flash_loan, 3=swap, 4=repay
    );

    /// @notice Emitted when unlock callback starts
    event UnlockCallbackStarted(
        bytes32 indexed intentHash,
        address indexed user
    );

    /// @notice Emitted when unlock callback completes
    event UnlockCallbackCompleted(
        bytes32 indexed intentHash,
        uint256 actualProfit
    );

    /// @notice Error thrown when World ID verification fails
    error InvalidWorldIDProof();

    /// @notice Error thrown when user is rate limited
    error RateLimited(uint256 nextAllowedTime);

    /// @notice Error thrown when arbitrage opportunity has expired
    error OpportunityExpired();

    /// @notice Error thrown when signature verification fails
    error InvalidSignature();

    /// @notice Error thrown when profit is insufficient
    error InsufficientProfit(uint256 actualProfit, uint256 expectedProfit);

    /// @notice Error thrown when commit-reveal timing is invalid
    error InvalidCommitRevealTiming();

    /// @notice Commit an arbitrage intent (commit phase)
    function commitArbitrageIntent(bytes32 commitHash) external;

    /// @notice Reveal and execute arbitrage intent (reveal phase)
    function revealAndExecuteArbitrage(
        ArbitrageOpportunity calldata opportunity,
        WorldIDProof calldata worldIdProof,
        uint256 nonce,
        PoolKey calldata poolKey
    ) external returns (bytes32 intentHash);

    /// @notice Check if user can execute arbitrage (not rate limited)
    function canExecuteArbitrage(uint256 nullifierHash) external view returns (bool);

    /// @notice Get next allowed execution time for user
    function getNextAllowedTime(uint256 nullifierHash) external view returns (uint256);

    /// @notice Verify off-chain price signature
    function verifyPriceSignature(
        ArbitrageOpportunity calldata opportunity
    ) external view returns (bool);
}

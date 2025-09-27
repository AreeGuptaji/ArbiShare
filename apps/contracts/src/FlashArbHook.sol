// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseHook} from "@openzeppelin/uniswap-hooks/src/base/BaseHook.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {IPoolManager, SwapParams} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {BalanceDelta} from "v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "v4-core/src/types/BeforeSwapDelta.sol";
import {Currency, CurrencyLibrary} from "v4-core/src/types/Currency.sol";
import {IUnlockCallback} from "v4-core/src/interfaces/callback/IUnlockCallback.sol";
import {CurrencySettler} from "v4-core/test/utils/CurrencySettler.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import {IFlashArbHook} from "./interfaces/IFlashArbHook.sol";
import {IWorldIDRouter} from "./interfaces/IWorldIDRouter.sol";
import {ArbitrageLib} from "./libraries/ArbitrageLib.sol";

/// @title FlashArbHook
/// @notice Uniswap v4 Hook for sybil-resistant flash loan arbitrage
contract FlashArbHook is BaseHook, IFlashArbHook, ReentrancyGuard, IUnlockCallback {
    using PoolIdLibrary for PoolKey;
    using CurrencyLibrary for Currency;
    using CurrencySettler for Currency;
    using SafeERC20 for IERC20;
    using ArbitrageLib for uint256;

    /// @notice World ID Router for proof verification
    IWorldIDRouter public immutable worldIdRouter;

    /// @notice Off-chain price service signer address
    address public immutable priceServiceSigner;

    /// @notice Mapping to track user rate limiting by nullifier hash
    mapping(uint256 => uint256) public lastExecutionTime;

    /// @notice Mapping to track used nullifier hashes to prevent replay
    mapping(uint256 => bool) public usedNullifiers;

    /// @notice Mapping to track committed arbitrage intents
    mapping(bytes32 => ArbitrageIntent) public commitments;

    /// @notice Mapping to track revealed intents to prevent double execution
    mapping(bytes32 => bool) public executedIntents;

    /// @notice Mapping to store validated arbitrage data for execution
    mapping(bytes32 => ArbitrageOpportunity) public validatedOpportunities;

    /// @notice Mapping to store world ID proofs for execution
    mapping(bytes32 => WorldIDProof) public validatedProofs;

    /// @notice Empty bytes array for gas-optimized Uniswap V4 calls
    bytes private constant EMPTY_BYTES = "";

    /// @notice Data structure for unlock callback operations
    struct FlashLoanCallback {
        address user;
        PoolKey poolKey;
        ArbitrageOpportunity opportunity;
        WorldIDProof worldIdProof;
        bytes32 intentHash;
    }

    constructor(
        IPoolManager _poolManager,
        IWorldIDRouter _worldIdRouter,
        address _priceServiceSigner
    ) BaseHook(_poolManager) {
        worldIdRouter = _worldIdRouter;
        priceServiceSigner = _priceServiceSigner;
    }

    /// @notice Returns the hook permissions
    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: false,
            beforeAddLiquidity: false,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity: false,
            beforeSwap: true,
            afterSwap: true,
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: true,
            afterSwapReturnDelta: true,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    /// @notice Commit an arbitrage intent (commit phase)
    function commitArbitrageIntent(bytes32 commitHash) external override {
        commitments[commitHash] = ArbitrageIntent({
            commitHash: commitHash,
            timestamp: block.timestamp,
            user: msg.sender,
            executed: false,
            revealed: false
        });

        emit IntentCommitted(msg.sender, commitHash, block.timestamp);
    }

    /// @notice Reveal and execute arbitrage intent (reveal phase)
    function revealAndExecuteArbitrage(
        ArbitrageOpportunity calldata opportunity,
        WorldIDProof calldata worldIdProof,
        uint256 nonce,
        PoolKey calldata 
    ) external override nonReentrant returns (bytes32 intentHash) {
        // Generate intent hash from revealed data
        bytes32 opportunityHash = ArbitrageLib.generateOpportunityHash(
            opportunity.tokenIn,
            opportunity.tokenOut,
            opportunity.amountIn,
            opportunity.expectedProfit,
            opportunity.deadline
        );

        intentHash = ArbitrageLib.generateCommitHash(
            msg.sender,
            worldIdProof.nullifierHash,
            nonce,
            opportunityHash
        );

        // Emit validation start event
        emit ArbitrageValidationStarted(
            msg.sender,
            intentHash,
            opportunity.tokenIn,
            opportunity.tokenOut,
            opportunity.amountIn
        );

        // Verify commit exists and timing is valid
        ArbitrageIntent storage commitment = commitments[intentHash];
        if (commitment.user != msg.sender) revert InvalidCommitRevealTiming();
        if (!ArbitrageLib.isValidCommitRevealTiming(commitment.timestamp)) {
            revert InvalidCommitRevealTiming();
        }
        if (commitment.revealed) revert InvalidCommitRevealTiming();

        // Mark as revealed
        commitment.revealed = true;
        emit IntentRevealed(msg.sender, intentHash, intentHash);

        // Verify World ID proof
        _verifyWorldIDProof(worldIdProof);
        emit WorldIDProofVerified(msg.sender, worldIdProof.nullifierHash, worldIdProof.root);

        // Check rate limiting
        bool canExecute = canExecuteArbitrage(worldIdProof.nullifierHash);
        emit RateLimitChecked(
            worldIdProof.nullifierHash,
            canExecute,
            lastExecutionTime[worldIdProof.nullifierHash],
            getNextAllowedTime(worldIdProof.nullifierHash)
        );
        
        if (!canExecute) {
            revert RateLimited(getNextAllowedTime(worldIdProof.nullifierHash));
        }

        // Verify price signature and freshness
        bool signatureValid = verifyPriceSignature(opportunity);
        emit PriceSignatureVerified(
            intentHash,
            opportunity.tokenIn,
            opportunity.tokenOut,
            opportunity.deadline,
            signatureValid
        );
        
        if (!signatureValid) {
            revert InvalidSignature();
        }

        if (!ArbitrageLib.isPriceFresh(opportunity.deadline)) {
            revert OpportunityExpired();
        }

        // Update rate limiting
        lastExecutionTime[worldIdProof.nullifierHash] = block.timestamp;
        usedNullifiers[worldIdProof.nullifierHash] = true;

        // Store validated arbitrage data for swap execution
        validatedOpportunities[intentHash] = opportunity;
        validatedProofs[intentHash] = worldIdProof;
        
        emit ArbitrageDataStored(intentHash, msg.sender, opportunity.expectedProfit);
        
        // The actual execution will happen when user makes a swap with this intentHash as hookData
        return intentHash;
    }

    /// @notice Handles Uniswap V4 unlock callback for flash loan arbitrage
    function unlockCallback(bytes calldata rawData)
        external
        override
        onlyPoolManager
        returns (bytes memory)
    {
        FlashLoanCallback memory data = abi.decode(rawData, (FlashLoanCallback));
        
        emit UnlockCallbackStarted(data.intentHash, data.user);
        
        // Prevent double execution
        if (executedIntents[data.intentHash]) {
            emit ArbitrageExecutionError(data.intentHash, data.user, "Double execution attempt", 1);
            revert InvalidCommitRevealTiming();
        }

        // Validate minimum profit
        uint256 minProfit = data.opportunity.amountIn.calculateMinProfit();
        if (data.opportunity.expectedProfit < minProfit) {
            emit ArbitrageExecutionError(data.intentHash, data.user, "Insufficient expected profit", 1);
            revert InsufficientProfit(data.opportunity.expectedProfit, minProfit);
        }

        // Mark intent as executed
        executedIntents[data.intentHash] = true;

        Currency tokenIn = Currency.wrap(data.opportunity.tokenIn);
        
        // Take flash loan from pool
        emit FlashLoanInitiated(data.intentHash, data.user, data.opportunity.tokenIn, data.opportunity.amountIn);
        poolManager.take(tokenIn, address(this), data.opportunity.amountIn);

        // Execute 1inch swap with the flash loaned tokens
        uint256 amountOut = _execute1inchSwap(data.opportunity);
        emit OneInchSwapExecuted(
            data.intentHash,
            data.opportunity.tokenIn,
            data.opportunity.tokenOut,
            data.opportunity.amountIn,
            amountOut
        );

        // Calculate actual profit
        if (amountOut <= data.opportunity.amountIn) {
            emit ArbitrageExecutionError(data.intentHash, data.user, "Swap resulted in loss", 3);
            revert InsufficientProfit(0, data.opportunity.expectedProfit);
        }

        uint256 actualProfit = amountOut - data.opportunity.amountIn;

        // Repay flash loan to pool
        emit FlashLoanRepaid(data.intentHash, data.opportunity.tokenIn, data.opportunity.amountIn);
        tokenIn.settle(poolManager, address(this), data.opportunity.amountIn, false);

        // Transfer profit to user
        emit ProfitDistributed(data.intentHash, data.user, actualProfit);
        IERC20(data.opportunity.tokenOut).safeTransfer(data.user, actualProfit);

        // Emit success event
        emit ArbitrageExecuted(
            data.user,
            data.opportunity.tokenIn,
            data.opportunity.tokenOut,
            data.opportunity.amountIn,
            actualProfit,
            data.intentHash
        );

        emit UnlockCallbackCompleted(data.intentHash, actualProfit);
        return abi.encode(actualProfit);
    }

    /// @notice Before swap hook - triggers arbitrage if hookData contains intentHash
    function _beforeSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata /* params */,
        bytes calldata hookData
    ) internal override returns (bytes4, BeforeSwapDelta, uint24) {
        if (hookData.length == 0) {
            // Normal swap, no arbitrage
            return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
        }

        // Decode intentHash from hookData
        bytes32 intentHash = abi.decode(hookData, (bytes32));
        
        // Get the commitment data
        ArbitrageIntent storage commitment = commitments[intentHash];
        if (!commitment.revealed || commitment.executed) {
            emit ArbitrageExecutionError(intentHash, sender, "Invalid commitment state", 1);
            revert InvalidCommitRevealTiming();
        }

        // Get the validated arbitrage data
        ArbitrageOpportunity memory opportunity = validatedOpportunities[intentHash];
        WorldIDProof memory worldIdProof = validatedProofs[intentHash];
        
        // Verify the opportunity exists
        if (opportunity.tokenIn == address(0)) {
            emit ArbitrageExecutionError(intentHash, sender, "Opportunity data not found", 1);
            revert InvalidCommitRevealTiming();
        }

        emit BeforeSwapHookTriggered(sender, intentHash, opportunity.tokenIn, opportunity.amountIn);

        // Mark as executed to prevent double execution
        commitment.executed = true;

        // Execute the flash loan arbitrage via unlock callback
        FlashLoanCallback memory callbackData = FlashLoanCallback({
            user: sender,
            poolKey: key,
            opportunity: opportunity,
            worldIdProof: worldIdProof,
            intentHash: intentHash
        });
        
        // Execute the flash loan via pool manager unlock
        poolManager.unlock(abi.encode(callbackData));
        
        return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
    }

    /// @notice After swap hook - handles post-swap cleanup
    function _afterSwap(
        address /* sender */,
        PoolKey calldata /* key */,
        SwapParams calldata /* params */,
        BalanceDelta /* delta */,
        bytes calldata hookData
    ) internal override returns (bytes4, int128) {
        if (hookData.length == 0) {
            // Normal swap, no arbitrage
            return (BaseHook.afterSwap.selector, 0);
        }

        // Clean up stored arbitrage data
        bytes32 intentHash = abi.decode(hookData, (bytes32));
        delete validatedOpportunities[intentHash];
        delete validatedProofs[intentHash];

        emit AfterSwapCleanup(intentHash, true);
        return (BaseHook.afterSwap.selector, 0);
    }

    /// @notice Execute 1inch swap using provided route data
    function _execute1inchSwap(ArbitrageOpportunity memory opportunity) private pure returns (uint256 amountOut) {
        // This is a simplified implementation
        // In production, you'd call the 1inch router with the route data
        // IERC20 tokenIn = IERC20(opportunity.tokenIn);
        // IERC20 tokenOut = IERC20(opportunity.tokenOut);

        // Approve 1inch router to spend tokens
        // address oneInchRouter = _extract1inchRouter(opportunity.routeData);
        // tokenIn.safeApprove(oneInchRouter, opportunity.amountIn);

        // Execute swap via 1inch router
        // (bool success, bytes memory result) = oneInchRouter.call(opportunity.routeData);
        // require(success, "1inch swap failed");

        // For now, return expected amount (this would be actual swap result)
        return opportunity.amountIn + opportunity.expectedProfit;
    }

    /// @notice Verify World ID proof
    function _verifyWorldIDProof(WorldIDProof memory proof) private {
        try worldIdRouter.verifyProof(proof.root, proof.nullifierHash, proof.proof) {
            // Proof is valid
        } catch {
            emit WorldIDVerificationFailed(msg.sender, proof.nullifierHash, "Proof verification failed");
            revert InvalidWorldIDProof();
        }
    }

    /// @notice Check if user can execute arbitrage (not rate limited)
    function canExecuteArbitrage(uint256 nullifierHash) public view override returns (bool) {
        return block.timestamp >= lastExecutionTime[nullifierHash] + ArbitrageLib.RATE_LIMIT_DURATION;
    }

    /// @notice Get next allowed execution time for user
    function getNextAllowedTime(uint256 nullifierHash) public view override returns (uint256) {
        return lastExecutionTime[nullifierHash] + ArbitrageLib.RATE_LIMIT_DURATION;
    }

    /// @notice Verify off-chain price signature
    function verifyPriceSignature(
        ArbitrageOpportunity calldata opportunity
    ) public view override returns (bool) {
        return ArbitrageLib.verifyPriceSignature(
            priceServiceSigner,
            opportunity.tokenIn,
            opportunity.tokenOut,
            opportunity.amountIn,
            opportunity.expectedProfit,
            opportunity.deadline,
            opportunity.routeData,
            opportunity.signature
        );
    }

    /// @notice Emergency function to recover stuck tokens
    function emergencyRecoverToken(address token, address to, uint256 amount) external {
        // Only allow recovery by hook deployer or governance
        // This is a simplified version - add proper access control
        IERC20(token).safeTransfer(to, amount);
    }
}

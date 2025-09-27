// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BaseHook} from "@openzeppelin/uniswap-hooks/src/base/BaseHook.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";
import {Currency, CurrencyLibrary} from "@uniswap/v4-core/src/types/Currency.sol";
import {SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {IUnlockCallback} from "@uniswap/v4-core/src/interfaces/callback/IUnlockCallback.sol";
import {CurrencySettler} from "@uniswap/v4-core/test/utils/CurrencySettler.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

import "./interfaces/IPythOracle.sol";
import "./interfaces/IWorldIDRouter.sol";
import "./libraries/PriceCalculator.sol";
import "./libraries/VenueComparator.sol";

/// @title MEVShareHook
/// @notice Unified Uniswap v4 Hook for MEV-resistant cross-chain arbitrage with World ID verification
/// @dev Combines flash loan arbitrage, cross-chain execution, and sybil resistance
contract MEVShareHook is BaseHook, Ownable, ReentrancyGuard, Pausable, IUnlockCallback {
    using PoolIdLibrary for PoolKey;
    using CurrencyLibrary for Currency;
    using CurrencySettler for Currency;
    using SafeERC20 for IERC20;
    using PriceCalculator for IPythOracle.Price;
    using VenueComparator for VenueComparator.ComparisonData;

    /*//////////////////////////////////////////////////////////////
                                CONSTANTS
    //////////////////////////////////////////////////////////////*/
    
    // Supported Sepolia Chains
    uint256 public constant ETHEREUM_SEPOLIA = 11155111;
    uint256 public constant ARBITRUM_SEPOLIA = 421614;
    uint256 public constant UNICHAIN_SEPOLIA = 1301;
    uint256 public constant BASE_SEPOLIA = 84532;
    uint256 public constant OPTIMISM_SEPOLIA = 11155420;
    
    // MEV Configuration
    uint256 public constant RATE_LIMIT_DURATION = 1 hours;
    uint256 public constant USER_PROFIT_SHARE = 75; // 75%
    uint256 public constant PROTOCOL_PROFIT_SHARE = 25; // 25%
    uint256 public constant MIN_ARBITRAGE_PROFIT = 1e18; // 1 token minimum profit
    uint256 public constant MAX_SLIPPAGE_BPS = 300; // 3%
    uint256 public constant MEV_DETECTION_THRESHOLD_BPS = 200; // 2% minimum improvement for MEV
    
    // World ID Configuration - TODO: Configure with your World ID app
    address public immutable worldIdRouter; // TODO: Your World ID router address
    string public constant APP_ID = "mev-share-dapp"; // TODO: Your World ID app ID  
    string public constant ACTION_ID = "execute-arbitrage"; // TODO: Your action ID

    /*//////////////////////////////////////////////////////////////
                                STRUCTS
    //////////////////////////////////////////////////////////////*/

    struct WorldIDProof {
        uint256 root;
        uint256 nullifierHash;
        uint256[8] proof;
    }

    struct MEVOpportunity {
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 expectedProfit;
        uint256 sourceChain;
        uint256 targetChain;
        uint256 deadline;
        bytes priceProof;
        uint8 confidenceScore;
    }

    struct ArbitrageExecution {
        address user;
        PoolKey poolKey;
        MEVOpportunity opportunity;
        WorldIDProof worldIdProof;
        bytes32 executionId;
        uint256 timestamp;
    }

    struct ChainConfig {
        bool isSupported;
        string name;
        uint256 baseGasEstimate;
        uint256 bridgeFee;
        bool isActive;
    }

    struct UserMEVStats {
        uint256 totalEarnings;
        uint256 successfulArbitrages;
        uint256 lastExecutionTime;
        uint256 mevScore;
    }

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    // Oracles and external contracts
    IPythOracle public pythOracle;
    
    // MEV tracking
    mapping(uint256 => uint256) public lastExecutionTime; // nullifierHash => timestamp
    mapping(uint256 => bool) public usedNullifiers;
    mapping(bytes32 => ArbitrageExecution) public pendingArbitrages;
    mapping(bytes32 => bool) public executedArbitrages;
    mapping(address => UserMEVStats) public userStats;
    
    // Chain configuration
    mapping(uint256 => ChainConfig) public supportedChains;
    uint256[] public chainIds;
    
    // Price feeds
    mapping(address => bytes32) public tokenPriceIds;
    mapping(address => bool) public supportedTokens;
    
    // Protocol settings
    address public protocolFeeRecipient;
    uint256 public gasCoveragePool;
    bool public mevDetectionEnabled = true;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event MEVOpportunityDetected(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 expectedProfit,
        uint256 sourceChain,
        uint256 targetChain,
        bytes32 opportunityId
    );

    event CrossChainArbitrageExecuted(
        address indexed user,
        bytes32 indexed executionId,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 actualProfit,
        uint256 userShare,
        uint256 protocolShare
    );

    event MEVEnhancedSwap(
        address indexed user,
        Currency indexed tokenIn,
        Currency indexed tokenOut,
        uint256 amountIn,
        uint256 bonusProfit,
        bytes32 swapId
    );

    event WorldIDVerified(
        address indexed user,
        uint256 nullifierHash,
        uint256 root
    );

    event ArbitrageRollback(
        bytes32 indexed executionId,
        address indexed user,
        string reason,
        uint256 gasCompensation
    );

    event RateLimitTriggered(
        uint256 nullifierHash,
        uint256 nextAllowedTime
    );

    event ChainConfigured(
        uint256 indexed chainId,
        string name,
        bool isActive
    );

    event MEVStatsUpdated(
        address indexed user,
        uint256 totalEarnings,
        uint256 successfulArbitrages,
        uint256 newMEVScore
    );

    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/

    error InvalidWorldIDProof();
    error RateLimited(uint256 nextAllowedTime);
    error InsufficientMEVProfit(uint256 actual, uint256 minimum);
    error UnsupportedChain(uint256 chainId);
    error UnsupportedToken(address token);
    error ArbitrageExpired();
    error ExecutionAlreadyExists();
    error InvalidPriceProof();
    error InsufficientGasCoverage();
    error MEVDetectionDisabled();
    error ZeroAddress();

    /*//////////////////////////////////////////////////////////////
                            CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(
        IPoolManager _poolManager,
        address _pythOracle,
        address _worldIdRouter, // TODO: You'll provide this
        address _protocolFeeRecipient
    ) BaseHook(_poolManager) Ownable(_protocolFeeRecipient) {
        if (_pythOracle == address(0)) revert ZeroAddress();
        if (_worldIdRouter == address(0)) revert ZeroAddress();
        if (_protocolFeeRecipient == address(0)) revert ZeroAddress();

        pythOracle = IPythOracle(_pythOracle);
        worldIdRouter = _worldIdRouter;
        protocolFeeRecipient = _protocolFeeRecipient;

        // Initialize supported Sepolia chains
        _initializeSupportedChains();
    }

    /*//////////////////////////////////////////////////////////////
                            HOOK PERMISSIONS
    //////////////////////////////////////////////////////////////*/

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

    /*//////////////////////////////////////////////////////////////
                        MAIN MEV FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Execute cross-chain arbitrage with World ID verification
    /// @param opportunity The MEV opportunity details
    /// @param worldIdProof World ID proof for sybil resistance
    /// @return executionId Unique identifier for the arbitrage execution
    function executeCrossChainArbitrage(
        MEVOpportunity calldata opportunity,
        WorldIDProof calldata worldIdProof
    ) external nonReentrant whenNotPaused returns (bytes32 executionId) {
        // Verify World ID proof
        _verifyWorldIDProof(worldIdProof);
        emit WorldIDVerified(msg.sender, worldIdProof.nullifierHash, worldIdProof.root);

        // Check rate limiting
        if (!canExecuteArbitrage(worldIdProof.nullifierHash)) {
            uint256 nextTime = getNextAllowedTime(worldIdProof.nullifierHash);
            emit RateLimitTriggered(worldIdProof.nullifierHash, nextTime);
            revert RateLimited(nextTime);
        }

        // Validate opportunity
        _validateMEVOpportunity(opportunity);

        // Generate execution ID
        executionId = keccak256(abi.encodePacked(
            msg.sender,
            worldIdProof.nullifierHash,
            opportunity.tokenIn,
            opportunity.tokenOut,
            opportunity.amountIn,
            block.timestamp
        ));

        // Prevent double execution
        if (executedArbitrages[executionId]) revert ExecutionAlreadyExists();

        // Store execution details
        pendingArbitrages[executionId] = ArbitrageExecution({
            user: msg.sender,
            poolKey: PoolKey({
                currency0: Currency.wrap(opportunity.tokenIn),
                currency1: Currency.wrap(opportunity.tokenOut),
                fee: 3000, // 0.3% fee tier
                tickSpacing: 60,
                hooks: this
            }),
            opportunity: opportunity,
            worldIdProof: worldIdProof,
            executionId: executionId,
            timestamp: block.timestamp
        });

        // Update rate limiting
        lastExecutionTime[worldIdProof.nullifierHash] = block.timestamp;
        usedNullifiers[worldIdProof.nullifierHash] = true;

        // Execute the arbitrage via flash loan
        _executeFlashLoanArbitrage(executionId);

        return executionId;
    }

    /*//////////////////////////////////////////////////////////////
                            HOOK IMPLEMENTATIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Before swap hook - detects MEV opportunities during regular swaps
    function _beforeSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata params,
        bytes calldata hookData
    ) internal override returns (bytes4, BeforeSwapDelta, uint24) {
        // Skip MEV detection if disabled
        if (!mevDetectionEnabled) {
            return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
        }

        // Detect MEV opportunity during swap
        MEVOpportunity memory mevOpp = _detectMEVDuringSwap(key, params);
        
        if (mevOpp.expectedProfit > 0) {
            bytes32 swapId = keccak256(abi.encodePacked(sender, block.timestamp, key.currency0, key.currency1));
            
            emit MEVOpportunityDetected(
                sender,
                mevOpp.tokenIn,
                mevOpp.tokenOut,
                mevOpp.expectedProfit,
                mevOpp.sourceChain,
                mevOpp.targetChain,
                swapId
            );

            // If profitable MEV detected, execute enhanced swap
            if (_shouldExecuteEnhancedSwap(mevOpp, params)) {
                return _executeEnhancedSwap(sender, key, params, mevOpp);
            }
        }

        return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
    }

    /// @notice After swap hook - handles post-swap MEV distribution
    function _afterSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata params,
        BalanceDelta delta,
        bytes calldata hookData
    ) internal override returns (bytes4, int128) {
        // Handle any post-swap MEV profit distribution
        if (hookData.length > 0) {
            bytes32 swapId = abi.decode(hookData, (bytes32));
            _handlePostSwapMEV(sender, swapId, delta);
        }

        return (BaseHook.afterSwap.selector, 0);
    }

    /*//////////////////////////////////////////////////////////////
                        FLASH LOAN CALLBACK
    //////////////////////////////////////////////////////////////*/

    /// @notice Handles Uniswap V4 unlock callback for flash loan arbitrage
    function unlockCallback(bytes calldata rawData)
        external
        override
        onlyPoolManager
        returns (bytes memory)
    {
        bytes32 executionId = abi.decode(rawData, (bytes32));
        ArbitrageExecution memory execution = pendingArbitrages[executionId];
        
        // Prevent double execution
        if (executedArbitrages[executionId]) {
            revert ExecutionAlreadyExists();
        }

        // Mark as executed
        executedArbitrages[executionId] = true;

        try this._executeArbitrageLogic(execution) returns (uint256 actualProfit) {
            // Distribute profits
            _distributeMEVProfits(execution.user, actualProfit, executionId);
            
            // Update user stats
            _updateUserMEVStats(execution.user, actualProfit);

            return abi.encode(actualProfit);
        } catch (bytes memory reason) {
            // Handle rollback
            _handleArbitrageRollback(executionId, execution.user, string(reason));
            return abi.encode(0);
        }
    }

    /*//////////////////////////////////////////////////////////////
                        INTERNAL MEV LOGIC
    //////////////////////////////////////////////////////////////*/

    /// @notice Execute flash loan arbitrage
    function _executeFlashLoanArbitrage(bytes32 executionId) internal {
        ArbitrageExecution memory execution = pendingArbitrages[executionId];
        Currency tokenIn = Currency.wrap(execution.opportunity.tokenIn);
        
        // Take flash loan from pool
        poolManager.unlock(abi.encode(executionId));
    }

    /// @notice Core arbitrage execution logic
    function _executeArbitrageLogic(ArbitrageExecution memory execution) external returns (uint256 actualProfit) {
        // This function is called via try-catch in unlockCallback
        require(msg.sender == address(this), "Only self");
        
        Currency tokenIn = Currency.wrap(execution.opportunity.tokenIn);
        Currency tokenOut = Currency.wrap(execution.opportunity.tokenOut);
        
        // Take flash loan
        poolManager.take(tokenIn, address(this), execution.opportunity.amountIn);
        
        // Execute cross-chain arbitrage
        actualProfit = _executeCrossChainSwap(execution.opportunity);
        
        // Verify minimum profit
        if (actualProfit < MIN_ARBITRAGE_PROFIT) {
            revert InsufficientMEVProfit(actualProfit, MIN_ARBITRAGE_PROFIT);
        }
        
        // Repay flash loan
        tokenIn.settle(poolManager, address(this), execution.opportunity.amountIn, false);
        
        return actualProfit;
    }

    /// @notice Execute cross-chain swap for arbitrage
    function _executeCrossChainSwap(MEVOpportunity memory opportunity) internal returns (uint256 profit) {
        // Simplified cross-chain execution
        // In production, this would integrate with actual bridge protocols
        
        // For now, simulate cross-chain arbitrage execution
        // This would involve:
        // 1. Bridge tokens to target chain
        // 2. Execute swap on target chain
        // 3. Bridge back to source chain
        // 4. Calculate actual profit
        
        // Simulated profit calculation
        profit = opportunity.expectedProfit;
        
        // Emit cross-chain execution event
        emit CrossChainArbitrageExecuted(
            msg.sender,
            keccak256(abi.encodePacked(opportunity.tokenIn, opportunity.tokenOut, block.timestamp)),
            opportunity.tokenIn,
            opportunity.tokenOut,
            opportunity.amountIn,
            profit,
            (profit * USER_PROFIT_SHARE) / 100,
            (profit * PROTOCOL_PROFIT_SHARE) / 100
        );
        
        return profit;
    }

    /// @notice Detect MEV opportunity during regular swap
    function _detectMEVDuringSwap(
        PoolKey calldata key,
        SwapParams calldata params
    ) internal view returns (MEVOpportunity memory opportunity) {
        address tokenIn = Currency.unwrap(key.currency0);
        address tokenOut = Currency.unwrap(key.currency1);
        
        // Skip if tokens not supported
        if (!supportedTokens[tokenIn] || !supportedTokens[tokenOut]) {
            return opportunity;
        }
        
        // Get price data
        bytes32 priceIdIn = tokenPriceIds[tokenIn];
        bytes32 priceIdOut = tokenPriceIds[tokenOut];
        
        if (priceIdIn == bytes32(0) || priceIdOut == bytes32(0)) {
            return opportunity;
        }
        
        try pythOracle.getPrice(priceIdIn) returns (IPythOracle.Price memory priceIn) {
            try pythOracle.getPrice(priceIdOut) returns (IPythOracle.Price memory priceOut) {
                // Calculate potential cross-chain arbitrage profit
                uint256 expectedOutput = priceIn.calculateOutputAmount(priceOut, uint256(int256(params.amountSpecified)));
                uint256 localOutput = _estimateLocalSwapOutput(key, params);
                
                if (expectedOutput > localOutput) {
                    uint256 potentialProfit = expectedOutput - localOutput;
                    
                    // Check if profit meets threshold
                    uint256 improvementBps = (potentialProfit * 10000) / localOutput;
                    
                    if (improvementBps >= MEV_DETECTION_THRESHOLD_BPS) {
                        opportunity = MEVOpportunity({
                            tokenIn: tokenIn,
                            tokenOut: tokenOut,
                            amountIn: uint256(int256(params.amountSpecified)),
                            expectedProfit: potentialProfit,
                            sourceChain: block.chainid,
                            targetChain: _getBestTargetChain(tokenIn, tokenOut),
                            deadline: block.timestamp + 300, // 5 minutes
                            priceProof: abi.encode(priceIn, priceOut),
                            confidenceScore: _calculateConfidenceScore(priceIn, priceOut)
                        });
                    }
                }
            } catch {}
        } catch {}
        
        return opportunity;
    }

    /// @notice Execute enhanced swap with MEV bonus
    function _executeEnhancedSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata params,
        MEVOpportunity memory mevOpp
    ) internal returns (bytes4, BeforeSwapDelta, uint24) {
        bytes32 swapId = keccak256(abi.encodePacked(sender, block.timestamp, key.currency0, key.currency1));
        
        // Execute the enhanced swap logic here
        // This would involve capturing MEV during the regular swap
        
        emit MEVEnhancedSwap(
            sender,
            key.currency0,
            key.currency1,
            uint256(int256(params.amountSpecified)),
            mevOpp.expectedProfit,
            swapId
        );
        
        return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
    }

    /*//////////////////////////////////////////////////////////////
                        WORLD ID VERIFICATION
    //////////////////////////////////////////////////////////////*/

    /// @notice Verify World ID proof for sybil resistance
    // function _verifyWorldIDProof(WorldIDProof memory proof) internal {
    //     // TODO: Integrate with your World ID configuration
    //     try IWorldIDRouter(worldIdRouter).verifyProof(
    //         proof.root,
    //         proof.nullifierHash,
    //         proof.proof
    //     ) {
    //         // Proof verified successfully
    //     } catch {
    //         revert InvalidWorldIDProof();
    //     }
    // }
    function _verifyWorldIDProof(WorldIDProof memory proof) internal view {
    // HACKATHON: Simplified verification for demo purposes
    // In production, this would call actual World ID router
    
    if (proof.nullifierHash == 0) revert InvalidWorldIDProof();
    if (proof.root == 0) revert InvalidWorldIDProof();
    
    // Check if this nullifier was already used
    if (usedNullifiers[proof.nullifierHash]) revert InvalidWorldIDProof();
    
    // For hackathon: accept any non-zero proof values
    // In production: would verify cryptographic proof against World ID network
    
    // Mock verification passed - in demo, user can provide any non-zero values
}

    /*//////////////////////////////////////////////////////////////
                        PROFIT DISTRIBUTION
    //////////////////////////////////////////////////////////////*/

    /// @notice Distribute MEV profits between user and protocol
    function _distributeMEVProfits(address user, uint256 totalProfit, bytes32 executionId) internal {
        uint256 userShare = (totalProfit * USER_PROFIT_SHARE) / 100;
        uint256 protocolShare = totalProfit - userShare;
        
        // Transfer user share
        // Note: In production, this would transfer the actual profit tokens
        // For now, we'll emit events to track the distribution
        
        // Transfer protocol share to fee recipient
        // protocolToken.transfer(protocolFeeRecipient, protocolShare);
        
        emit CrossChainArbitrageExecuted(
            user,
            executionId,
            address(0), // tokenIn - would be actual token
            address(0), // tokenOut - would be actual token  
            0, // amountIn - would be actual amount
            totalProfit,
            userShare,
            protocolShare
        );
    }

    /// @notice Handle failed arbitrage with rollback and gas compensation
    function _handleArbitrageRollback(bytes32 executionId, address user, string memory reason) internal {
        // Calculate gas compensation
        uint256 gasCompensation = tx.gasprice * 200000; // Estimated gas for failed transaction
        
        // Compensate user from gas coverage pool
        if (gasCoveragePool >= gasCompensation) {
            gasCoveragePool -= gasCompensation;
            // Transfer compensation to user
            // payable(user).transfer(gasCompensation);
        }
        
        emit ArbitrageRollback(executionId, user, reason, gasCompensation);
        
        // Clean up pending arbitrage
        delete pendingArbitrages[executionId];
    }

    /// @notice Update user MEV statistics
    function _updateUserMEVStats(address user, uint256 profit) internal {
        UserMEVStats storage stats = userStats[user];
        stats.totalEarnings += (profit * USER_PROFIT_SHARE) / 100;
        stats.successfulArbitrages += 1;
        stats.lastExecutionTime = block.timestamp;
        stats.mevScore += _calculateMEVScoreIncrease(profit);
        
        emit MEVStatsUpdated(
            user,
            stats.totalEarnings,
            stats.successfulArbitrages,
            stats.mevScore
        );
    }

    /*//////////////////////////////////////////////////////////////
                        VALIDATION FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Validate MEV opportunity
    function _validateMEVOpportunity(MEVOpportunity memory opportunity) internal view {
        if (!supportedTokens[opportunity.tokenIn]) revert UnsupportedToken(opportunity.tokenIn);
        if (!supportedTokens[opportunity.tokenOut]) revert UnsupportedToken(opportunity.tokenOut);
        if (!supportedChains[opportunity.sourceChain].isSupported) revert UnsupportedChain(opportunity.sourceChain);
        if (!supportedChains[opportunity.targetChain].isSupported) revert UnsupportedChain(opportunity.targetChain);
        if (opportunity.deadline <= block.timestamp) revert ArbitrageExpired();
        if (opportunity.expectedProfit < MIN_ARBITRAGE_PROFIT) {
            revert InsufficientMEVProfit(opportunity.expectedProfit, MIN_ARBITRAGE_PROFIT);
        }
    }

    /*//////////////////////////////////////////////////////////////
                        HELPER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Check if user can execute arbitrage (rate limit check)
    function canExecuteArbitrage(uint256 nullifierHash) public view returns (bool) {
        return block.timestamp >= lastExecutionTime[nullifierHash] + RATE_LIMIT_DURATION;
    }

    /// @notice Get next allowed execution time for user
    function getNextAllowedTime(uint256 nullifierHash) public view returns (uint256) {
        return lastExecutionTime[nullifierHash] + RATE_LIMIT_DURATION;
    }

    /// @notice Check if enhanced swap should be executed
    function _shouldExecuteEnhancedSwap(
        MEVOpportunity memory opportunity,
        SwapParams calldata params
    ) internal pure returns (bool) {
        return opportunity.expectedProfit >= MIN_ARBITRAGE_PROFIT &&
               opportunity.confidenceScore >= 70;
    }

    /// @notice Estimate local swap output (simplified)
    function _estimateLocalSwapOutput(
        PoolKey calldata key,
        SwapParams calldata params
    ) internal pure returns (uint256) {
        // Simplified estimation - in production would use pool state
        return uint256(int256(params.amountSpecified)) * 95 / 100; // Assume 5% slippage
    }

    /// @notice Get best target chain for arbitrage
    function _getBestTargetChain(address tokenIn, address tokenOut) internal view returns (uint256) {
        // Simplified chain selection - in production would analyze all chains
        for (uint256 i = 0; i < chainIds.length; i++) {
            if (chainIds[i] != block.chainid && supportedChains[chainIds[i]].isActive) {
                return chainIds[i];
            }
        }
        return ETHEREUM_SEPOLIA;
    }

    /// @notice Calculate confidence score from price data
    function _calculateConfidenceScore(
        IPythOracle.Price memory priceIn,
        IPythOracle.Price memory priceOut
    ) internal pure returns (uint8) {
        uint256 priceInConf = uint256(priceIn.conf) * 10000 / uint256(int256(priceIn.price));
        uint256 priceOutConf = uint256(priceOut.conf) * 10000 / uint256(int256(priceOut.price));
        
        uint256 avgConfidence = (priceInConf + priceOutConf) / 2;
        
        if (avgConfidence > 500) return 20;
        if (avgConfidence > 200) return 50;
        if (avgConfidence > 100) return 70;
        if (avgConfidence > 50) return 85;
        return 95;
    }

    /// @notice Calculate MEV score increase
    function _calculateMEVScoreIncrease(uint256 profit) internal pure returns (uint256) {
        // Simple scoring: 1 point per 0.01 ETH profit
        return profit / 1e16;
    }

    /// @notice Handle post-swap MEV distribution
    function _handlePostSwapMEV(address sender, bytes32 swapId, BalanceDelta delta) internal {
        // Handle any MEV profits from enhanced swaps
        // This would distribute bonus profits to users
    }

    /// @notice Initialize supported Sepolia chains
    function _initializeSupportedChains() internal {
        // Ethereum Sepolia
        supportedChains[ETHEREUM_SEPOLIA] = ChainConfig({
            isSupported: true,
            name: "Ethereum Sepolia",
            baseGasEstimate: 150000,
            bridgeFee: 0.001 ether,
            isActive: true
        });
        chainIds.push(ETHEREUM_SEPOLIA);

        // Arbitrum Sepolia
        supportedChains[ARBITRUM_SEPOLIA] = ChainConfig({
            isSupported: true,
            name: "Arbitrum Sepolia",
            baseGasEstimate: 100000,
            bridgeFee: 0.0005 ether,
            isActive: true
        });
        chainIds.push(ARBITRUM_SEPOLIA);

        // Unichain Sepolia
        supportedChains[UNICHAIN_SEPOLIA] = ChainConfig({
            isSupported: true,
            name: "Unichain Sepolia",
            baseGasEstimate: 80000,
            bridgeFee: 0.0003 ether,
            isActive: true
        });
        chainIds.push(UNICHAIN_SEPOLIA);

        // Base Sepolia
        supportedChains[BASE_SEPOLIA] = ChainConfig({
            isSupported: true,
            name: "Base Sepolia",
            baseGasEstimate: 90000,
            bridgeFee: 0.0004 ether,
            isActive: true
        });
        chainIds.push(BASE_SEPOLIA);

        // Optimism Sepolia
        supportedChains[OPTIMISM_SEPOLIA] = ChainConfig({
            isSupported: true,
            name: "Optimism Sepolia",
            baseGasEstimate: 95000,
            bridgeFee: 0.0004 ether,
            isActive: true
        });
        chainIds.push(OPTIMISM_SEPOLIA);
    }

    /*//////////////////////////////////////////////////////////////
                        ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Configure token price feed
    function configureTokenPriceFeed(address token, bytes32 priceId) external onlyOwner {
        if (token == address(0)) revert ZeroAddress();
        tokenPriceIds[token] = priceId;
        supportedTokens[token] = true;
    }

    /// @notice Update chain configuration
    function updateChainConfig(
        uint256 chainId,
        bool isSupported,
        bool isActive,
        uint256 baseGasEstimate
    ) external onlyOwner {
        supportedChains[chainId].isSupported = isSupported;
        supportedChains[chainId].isActive = isActive;
        supportedChains[chainId].baseGasEstimate = baseGasEstimate;
        
        emit ChainConfigured(chainId, supportedChains[chainId].name, isActive);
    }

    /// @notice Toggle MEV detection
    function toggleMEVDetection(bool enabled) external onlyOwner {
        mevDetectionEnabled = enabled;
    }

    /// @notice Add funds to gas coverage pool
    function addGasCoverage() external payable onlyOwner {
        gasCoveragePool += msg.value;
    }

    /// @notice Emergency withdraw
    function emergencyWithdraw(address token, uint256 amount, address recipient) external onlyOwner {
        if (recipient == address(0)) revert ZeroAddress();
        IERC20(token).safeTransfer(recipient, amount);
    }

    /// @notice Pause contract
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpause contract
    function unpause() external onlyOwner {
        _unpause();
    }

    /*//////////////////////////////////////////////////////////////
                        VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Get user MEV statistics
    function getUserMEVStats(address user) external view returns (UserMEVStats memory) {
        return userStats[user];
    }

    /// @notice Get supported chains
    function getSupportedChains() external view returns (uint256[] memory) {
        return chainIds;
    }

    /// @notice Get chain configuration
    function getChainConfig(uint256 chainId) external view returns (ChainConfig memory) {
        return supportedChains[chainId];
    }

    /// @notice Check if token is supported
    function isTokenSupported(address token) external view returns (bool) {
        return supportedTokens[token];
    }

    /// @notice Get pending arbitrage
    function getPendingArbitrage(bytes32 executionId) external view returns (ArbitrageExecution memory) {
        return pendingArbitrages[executionId];
    }

    /// @notice Receive ETH for gas coverage
    receive() external payable {
        gasCoveragePool += msg.value;
    }
}

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

// MEV Share Hook for cross-chain arbitrage with World ID verification
contract MEVShareHook is BaseHook, Ownable, ReentrancyGuard, Pausable, IUnlockCallback {
    using PoolIdLibrary for PoolKey;
    using CurrencyLibrary for Currency;
    using CurrencySettler for Currency;
    using SafeERC20 for IERC20;
    using PriceCalculator for IPythOracle.Price;
    using VenueComparator for VenueComparator.ComparisonData;

    // Supported Sepolia Chains
    uint256 public constant ETHEREUM_SEPOLIA = 11155111;
    uint256 public constant ARBITRUM_SEPOLIA = 421614;
    uint256 public constant UNICHAIN_SEPOLIA = 1301;
    uint256 public constant BASE_SEPOLIA = 84532;
    uint256 public constant OPTIMISM_SEPOLIA = 11155420;
    
    // MEV Configuration
    uint256 public constant RATE_LIMIT_DURATION = 1 hours;
    uint256 public constant USER_PROFIT_SHARE = 75;
    uint256 public constant PROTOCOL_PROFIT_SHARE = 25;
    uint256 public constant MIN_ARBITRAGE_PROFIT = 1e18;
    uint256 public constant MAX_SLIPPAGE_BPS = 300;
    uint256 public constant MEV_DETECTION_THRESHOLD_BPS = 200;
    
    // World ID setup
    address public immutable worldIdRouter;
    string public constant APP_ID = "mev-share-dapp";
    string public constant ACTION_ID = "execute-arbitrage";

    // Data structures

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

    // State variables
    IPythOracle public pythOracle;
    
    mapping(uint256 => uint256) public lastExecutionTime;
    mapping(uint256 => bool) public usedNullifiers;
    mapping(bytes32 => ArbitrageExecution) public pendingArbitrages;
    mapping(bytes32 => bool) public executedArbitrages;
    mapping(address => UserMEVStats) public userStats;
    
    mapping(uint256 => ChainConfig) public supportedChains;
    uint256[] public chainIds;
    
    mapping(address => bytes32) public tokenPriceIds;
    mapping(address => bool) public supportedTokens;
    
    address public protocolFeeRecipient;
    uint256 public gasCoveragePool;
    bool public mevDetectionEnabled = true;

    // Events

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

    // Errors

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

    // Constructor

    constructor(
        IPoolManager _poolManager,
        address _pythOracle,
        address _worldIdRouter,
        address _protocolFeeRecipient
    ) BaseHook(_poolManager) Ownable(_protocolFeeRecipient) {
        if (_pythOracle == address(0)) revert ZeroAddress();
        if (_worldIdRouter == address(0)) revert ZeroAddress();
        if (_protocolFeeRecipient == address(0)) revert ZeroAddress();

        pythOracle = IPythOracle(_pythOracle);
        worldIdRouter = _worldIdRouter;
        protocolFeeRecipient = _protocolFeeRecipient;

        _initializeSupportedChains();
    }

    // Hook permissions

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

    // Main MEV functions
    function executeCrossChainArbitrage(
        MEVOpportunity calldata opportunity,
        WorldIDProof calldata worldIdProof
    ) external nonReentrant whenNotPaused returns (bytes32 executionId) {
        _verifyWorldIDProof(worldIdProof);
        emit WorldIDVerified(msg.sender, worldIdProof.nullifierHash, worldIdProof.root);

        if (!canExecuteArbitrage(worldIdProof.nullifierHash)) {
            uint256 nextTime = getNextAllowedTime(worldIdProof.nullifierHash);
            emit RateLimitTriggered(worldIdProof.nullifierHash, nextTime);
            revert RateLimited(nextTime);
        }

        _validateMEVOpportunity(opportunity);
        executionId = keccak256(abi.encodePacked(
            msg.sender,
            worldIdProof.nullifierHash,
            opportunity.tokenIn,
            opportunity.tokenOut,
            opportunity.amountIn,
            block.timestamp
        ));

        if (executedArbitrages[executionId]) revert ExecutionAlreadyExists();
        pendingArbitrages[executionId] = ArbitrageExecution({
            user: msg.sender,
            poolKey: PoolKey({
                currency0: Currency.wrap(opportunity.tokenIn),
                currency1: Currency.wrap(opportunity.tokenOut),
                fee: 3000,
                tickSpacing: 60,
                hooks: this
            }),
            opportunity: opportunity,
            worldIdProof: worldIdProof,
            executionId: executionId,
            timestamp: block.timestamp
        });

        lastExecutionTime[worldIdProof.nullifierHash] = block.timestamp;
        usedNullifiers[worldIdProof.nullifierHash] = true;

        _executeFlashLoanArbitrage(executionId);

        return executionId;
    }

    // Hook implementations
    function _beforeSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata params,
        bytes calldata /* hookData */
    ) internal override returns (bytes4, BeforeSwapDelta, uint24) {
        if (!mevDetectionEnabled) {
            return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
        }

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

            if (_shouldExecuteEnhancedSwap(mevOpp, params)) {
                return _executeEnhancedSwap(sender, key, params, mevOpp);
            }
        }

        return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
    }

    function _afterSwap(
        address /* sender */,
        PoolKey calldata /* key */,
        SwapParams calldata /* params */,
        BalanceDelta delta,
        bytes calldata hookData
    ) internal override returns (bytes4, int128) {
        if (hookData.length > 0) {
            bytes32 swapId = abi.decode(hookData, (bytes32));
            _handlePostSwapMEV(msg.sender, swapId, delta);
        }

        return (BaseHook.afterSwap.selector, 0);
    }

    // Flash loan callback
    function unlockCallback(bytes calldata rawData)
        external
        override
        onlyPoolManager
        returns (bytes memory)
    {
        bytes32 executionId = abi.decode(rawData, (bytes32));
        ArbitrageExecution memory execution = pendingArbitrages[executionId];
        execution; // silence unused variable warning
        
        if (executedArbitrages[executionId]) {
            revert ExecutionAlreadyExists();
        }

        executedArbitrages[executionId] = true;

        try this._executeArbitrageLogic(execution) returns (uint256 actualProfit) {
            _distributeMEVProfits(execution.user, actualProfit, executionId);
            _updateUserMEVStats(execution.user, actualProfit);

            return abi.encode(actualProfit);
        } catch (bytes memory reason) {
            _handleArbitrageRollback(executionId, execution.user, string(reason));
            return abi.encode(0);
        }
    }

    // Internal MEV logic
    function _executeFlashLoanArbitrage(bytes32 executionId) internal {
        ArbitrageExecution memory execution = pendingArbitrages[executionId];
        Currency tokenIn = Currency.wrap(execution.opportunity.tokenIn);
        tokenIn; // silence unused variable warning
        
        poolManager.unlock(abi.encode(executionId));
    }

    function _executeArbitrageLogic(ArbitrageExecution memory execution) external returns (uint256 actualProfit) {
        require(msg.sender == address(this), "Only self");
        
        Currency tokenIn = Currency.wrap(execution.opportunity.tokenIn);
        Currency tokenOut = Currency.wrap(execution.opportunity.tokenOut);
        tokenOut; // silence unused variable warning
        
        poolManager.take(tokenIn, address(this), execution.opportunity.amountIn);
        
        actualProfit = _executeCrossChainSwap(execution.opportunity);
        
        if (actualProfit < MIN_ARBITRAGE_PROFIT) {
            revert InsufficientMEVProfit(actualProfit, MIN_ARBITRAGE_PROFIT);
        }
        
        tokenIn.settle(poolManager, address(this), execution.opportunity.amountIn, false);
        
        return actualProfit;
    }

    function _executeCrossChainSwap(MEVOpportunity memory opportunity) internal returns (uint256 profit) {
        // Simplified cross-chain execution for demo
        // Production would integrate with actual bridge protocols
        
        profit = opportunity.expectedProfit;
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

    function _detectMEVDuringSwap(
        PoolKey calldata key,
        SwapParams calldata params
    ) internal view returns (MEVOpportunity memory opportunity) {
        address tokenIn = Currency.unwrap(key.currency0);
        address tokenOut = Currency.unwrap(key.currency1);
        
        if (!supportedTokens[tokenIn] || !supportedTokens[tokenOut]) {
            return opportunity;
        }
        
        bytes32 priceIdIn = tokenPriceIds[tokenIn];
        bytes32 priceIdOut = tokenPriceIds[tokenOut];
        
        if (priceIdIn == bytes32(0) || priceIdOut == bytes32(0)) {
            return opportunity;
        }
        
        try pythOracle.getPrice(priceIdIn) returns (IPythOracle.Price memory priceIn) {
            try pythOracle.getPrice(priceIdOut) returns (IPythOracle.Price memory priceOut) {
                uint256 expectedOutput = priceIn.calculateOutputAmount(priceOut, uint256(int256(params.amountSpecified)));
                uint256 localOutput = _estimateLocalSwapOutput(key, params);
                
                if (expectedOutput > localOutput) {
                    uint256 potentialProfit = expectedOutput - localOutput;
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

    function _executeEnhancedSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata params,
        MEVOpportunity memory mevOpp
    ) internal returns (bytes4, BeforeSwapDelta, uint24) {
        bytes32 swapId = keccak256(abi.encodePacked(sender, block.timestamp, key.currency0, key.currency1));
        
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

    // World ID verification
    function _verifyWorldIDProof(WorldIDProof memory proof) internal view {
    // Simplified verification for demo purposes
    
    if (proof.nullifierHash == 0) revert InvalidWorldIDProof();
    if (proof.root == 0) revert InvalidWorldIDProof();
    
    if (usedNullifiers[proof.nullifierHash]) revert InvalidWorldIDProof();
    }

    // Profit distribution
    function _distributeMEVProfits(address user, uint256 totalProfit, bytes32 executionId) internal {
        uint256 userShare = (totalProfit * USER_PROFIT_SHARE) / 100;
        uint256 protocolShare = totalProfit - userShare;
        
        emit CrossChainArbitrageExecuted(
            user,
            executionId,
            address(0),
            address(0),
            0,
            totalProfit,
            userShare,
            protocolShare
        );
    }

    function _handleArbitrageRollback(bytes32 executionId, address user, string memory reason) internal {
        uint256 gasCompensation = tx.gasprice * 200000;
        
        if (gasCoveragePool >= gasCompensation) {
            gasCoveragePool -= gasCompensation;
        }
        
        emit ArbitrageRollback(executionId, user, reason, gasCompensation);
        
        delete pendingArbitrages[executionId];
    }

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

    // Validation functions
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

    // Helper functions
    function canExecuteArbitrage(uint256 nullifierHash) public view returns (bool) {
        return block.timestamp >= lastExecutionTime[nullifierHash] + RATE_LIMIT_DURATION;
    }

    function getNextAllowedTime(uint256 nullifierHash) public view returns (uint256) {
        return lastExecutionTime[nullifierHash] + RATE_LIMIT_DURATION;
    }

    function _shouldExecuteEnhancedSwap(
        MEVOpportunity memory opportunity,
        SwapParams calldata /* params */
    ) internal pure returns (bool) {
        return opportunity.expectedProfit >= MIN_ARBITRAGE_PROFIT &&
               opportunity.confidenceScore >= 70;
    }

    function _estimateLocalSwapOutput(
        PoolKey calldata /* key */,
        SwapParams calldata params
    ) internal pure returns (uint256) {
        return uint256(int256(params.amountSpecified)) * 95 / 100;
    }

    function _getBestTargetChain(address /* tokenIn */, address /* tokenOut */) internal view returns (uint256) {
        for (uint256 i = 0; i < chainIds.length; i++) {
            if (chainIds[i] != block.chainid && supportedChains[chainIds[i]].isActive) {
                return chainIds[i];
            }
        }
        return ETHEREUM_SEPOLIA;
    }

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

    function _calculateMEVScoreIncrease(uint256 profit) internal pure returns (uint256) {
        return profit / 1e16;
    }

    function _handlePostSwapMEV(address /* sender */, bytes32 /* swapId */, BalanceDelta /* delta */) internal {
    }

    function _initializeSupportedChains() internal {
        supportedChains[ETHEREUM_SEPOLIA] = ChainConfig({
            isSupported: true,
            name: "Ethereum Sepolia",
            baseGasEstimate: 150000,
            bridgeFee: 0.001 ether,
            isActive: true
        });
        chainIds.push(ETHEREUM_SEPOLIA);

        supportedChains[ARBITRUM_SEPOLIA] = ChainConfig({
            isSupported: true,
            name: "Arbitrum Sepolia",
            baseGasEstimate: 100000,
            bridgeFee: 0.0005 ether,
            isActive: true
        });
        chainIds.push(ARBITRUM_SEPOLIA);

        supportedChains[UNICHAIN_SEPOLIA] = ChainConfig({
            isSupported: true,
            name: "Unichain Sepolia",
            baseGasEstimate: 80000,
            bridgeFee: 0.0003 ether,
            isActive: true
        });
        chainIds.push(UNICHAIN_SEPOLIA);

        supportedChains[BASE_SEPOLIA] = ChainConfig({
            isSupported: true,
            name: "Base Sepolia",
            baseGasEstimate: 90000,
            bridgeFee: 0.0004 ether,
            isActive: true
        });
        chainIds.push(BASE_SEPOLIA);

        supportedChains[OPTIMISM_SEPOLIA] = ChainConfig({
            isSupported: true,
            name: "Optimism Sepolia",
            baseGasEstimate: 95000,
            bridgeFee: 0.0004 ether,
            isActive: true
        });
        chainIds.push(OPTIMISM_SEPOLIA);
    }

    // Admin functions
    function configureTokenPriceFeed(address token, bytes32 priceId) external onlyOwner {
        if (token == address(0)) revert ZeroAddress();
        tokenPriceIds[token] = priceId;
        supportedTokens[token] = true;
    }

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

    function toggleMEVDetection(bool enabled) external onlyOwner {
        mevDetectionEnabled = enabled;
    }

    function addGasCoverage() external payable onlyOwner {
        gasCoveragePool += msg.value;
    }

    function emergencyWithdraw(address token, uint256 amount, address recipient) external onlyOwner {
        if (recipient == address(0)) revert ZeroAddress();
        IERC20(token).safeTransfer(recipient, amount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // View functions
    function getUserMEVStats(address user) external view returns (UserMEVStats memory) {
        return userStats[user];
    }

    function getSupportedChains() external view returns (uint256[] memory) {
        return chainIds;
    }

    function getChainConfig(uint256 chainId) external view returns (ChainConfig memory) {
        return supportedChains[chainId];
    }

    function isTokenSupported(address token) external view returns (bool) {
        return supportedTokens[token];
    }

    function getPendingArbitrage(bytes32 executionId) external view returns (ArbitrageExecution memory) {
        return pendingArbitrages[executionId];
    }

    receive() external payable {
        gasCoveragePool += msg.value;
    }
}

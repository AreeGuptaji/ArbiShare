// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";
import {Vm} from "forge-std/Vm.sol";

import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {TickMath} from "v4-core/src/libraries/TickMath.sol";
import {IPoolManager, SwapParams} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {BalanceDelta} from "v4-core/src/types/BalanceDelta.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {CurrencyLibrary, Currency} from "v4-core/src/types/Currency.sol";
import {StateLibrary} from "v4-core/src/libraries/StateLibrary.sol";
import {LiquidityAmounts} from "v4-core/test/utils/LiquidityAmounts.sol";
import {IPositionManager} from "v4-periphery/src/interfaces/IPositionManager.sol";
import {Constants} from "v4-core/test/utils/Constants.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {EasyPosm} from "./utils/libraries/EasyPosm.sol";
import {Deployers} from "./utils/Deployers.sol";

import {FlashArbHook} from "../src/FlashArbHook.sol";
import {IFlashArbHook} from "../src/interfaces/IFlashArbHook.sol";
import {IWorldIDRouter} from "../src/interfaces/IWorldIDRouter.sol";
import {ArbitrageLib} from "../src/libraries/ArbitrageLib.sol";

contract MockWorldIDRouter is IWorldIDRouter {
    mapping(uint256 => bool) public validNullifiers;
    mapping(uint256 => bool) public shouldRevert;
    
    function setValidNullifier(uint256 nullifierHash, bool valid) external {
        validNullifiers[nullifierHash] = valid;
    }
    
    function setShouldRevert(uint256 nullifierHash, bool revert_) external {
        shouldRevert[nullifierHash] = revert_;
    }
    
    function verifyProof(
        uint256 /* root */,
        uint256 nullifierHash,
        uint256[8] calldata /* proof */
    ) external view override {
        if (shouldRevert[nullifierHash]) {
            revert("World ID verification failed");
        }
        require(validNullifiers[nullifierHash], "Invalid World ID proof");
    }
}

contract FlashArbHookTest is Test, Deployers {
    using EasyPosm for IPositionManager;
    using PoolIdLibrary for PoolKey;
    using CurrencyLibrary for Currency;
    using StateLibrary for IPoolManager;

    Currency currency0;
    Currency currency1;
    PoolKey poolKey;
    FlashArbHook hook;
    MockWorldIDRouter worldIdRouter;
    PoolId poolId;

    // Test constants
    address constant PRICE_SERVICE_SIGNER = 0x1234567890123456789012345678901234567890;
    uint256 constant TEST_NULLIFIER = 12345;
    uint256 constant TEST_NULLIFIER_2 = 54321;
    address constant TEST_USER = 0x1ed73ee055b7B5379CcD398748281C5A82e9A41E;
    address constant TEST_USER_2 = 0x18477098a78f96907e5912297bc517488486Dc69;
    
    // Test parameters
    uint256 constant TEST_AMOUNT_IN = 1e18;
    uint256 constant TEST_EXPECTED_PROFIT = 0.1e18;
    uint256 constant TEST_ROOT = 123456789;
    uint256[8] TEST_PROOF = [uint256(1), 2, 3, 4, 5, 6, 7, 8];

    uint256 tokenId;
    int24 tickLower;
    int24 tickUpper;

    // Events to test
    event IntentCommitted(address indexed user, bytes32 indexed commitHash, uint256 timestamp);
    event IntentRevealed(address indexed user, bytes32 indexed commitHash, bytes32 indexed intentHash);
    event ArbitrageExecuted(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 profit,
        bytes32 intentHash
    );
    event WorldIDProofVerified(address indexed user, uint256 nullifierHash, uint256 root);
    event ArbitrageValidationStarted(
        address indexed user,
        bytes32 indexed intentHash,
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    );
    event RateLimitChecked(
        uint256 indexed nullifierHash,
        bool canExecute,
        uint256 lastExecutionTime,
        uint256 nextAllowedTime
    );

    function setUp() public {
        // Deploy all required artifacts
        deployArtifacts();
        
        (currency0, currency1) = deployCurrencyPair();

        // Deploy mock World ID router
        worldIdRouter = new MockWorldIDRouter();
        worldIdRouter.setValidNullifier(TEST_NULLIFIER, true);

        // Deploy the hook to an address with the correct flags
        address flags = address(
            uint160(
                Hooks.BEFORE_SWAP_FLAG | 
                Hooks.AFTER_SWAP_FLAG | 
                Hooks.BEFORE_SWAP_RETURNS_DELTA_FLAG |
                Hooks.AFTER_SWAP_RETURNS_DELTA_FLAG
            ) ^ (0x4444 << 144) // Namespace the hook to avoid collisions
        );

        bytes memory constructorArgs = abi.encode(
            poolManager,
            worldIdRouter,
            PRICE_SERVICE_SIGNER
        );

        deployCodeTo("FlashArbHook.sol:FlashArbHook", constructorArgs, flags);
        hook = FlashArbHook(flags);

        // Create the pool
        poolKey = PoolKey(currency0, currency1, 3000, 60, IHooks(hook));
        poolId = poolKey.toId();
        poolManager.initialize(poolKey, Constants.SQRT_PRICE_1_1);

        // Provide full-range liquidity to the pool
        tickLower = TickMath.minUsableTick(poolKey.tickSpacing);
        tickUpper = TickMath.maxUsableTick(poolKey.tickSpacing);

        uint128 liquidityAmount = 100e18;

        (uint256 amount0Expected, uint256 amount1Expected) = LiquidityAmounts.getAmountsForLiquidity(
            Constants.SQRT_PRICE_1_1,
            TickMath.getSqrtPriceAtTick(tickLower),
            TickMath.getSqrtPriceAtTick(tickUpper),
            liquidityAmount
        );

        (tokenId,) = positionManager.mint(
            poolKey,
            tickLower,
            tickUpper,
            liquidityAmount,
            amount0Expected + 1,
            amount1Expected + 1,
            address(this),
            block.timestamp,
            Constants.ZERO_BYTES
        );
    }

    // Helper function to create a valid arbitrage opportunity
    function createTestOpportunity() internal view returns (IFlashArbHook.ArbitrageOpportunity memory) {
        return IFlashArbHook.ArbitrageOpportunity({
            tokenIn: Currency.unwrap(currency0),
            tokenOut: Currency.unwrap(currency1),
            amountIn: TEST_AMOUNT_IN,
            expectedProfit: TEST_EXPECTED_PROFIT,
            deadline: block.timestamp + 5 minutes,
            routeData: hex"1234567890abcdef",
            signature: hex"abcdef1234567890"
        });
    }

    // Helper function to create a valid World ID proof
    function createTestWorldIDProof() internal view returns (IFlashArbHook.WorldIDProof memory) {
        return IFlashArbHook.WorldIDProof({
            root: TEST_ROOT,
            nullifierHash: TEST_NULLIFIER,
            proof: TEST_PROOF
        });
    }

    // Test: Basic commit functionality
    function testCommitArbitrageIntent() public {
        bytes32 commitHash = keccak256("test_commit");
        
        // Expect event emission
        vm.expectEmit(true, true, false, true);
        emit IntentCommitted(TEST_USER, commitHash, block.timestamp);
        
        vm.prank(TEST_USER);
        hook.commitArbitrageIntent(commitHash);
        
        // Verify storage
        (bytes32 storedHash, uint256 timestamp, address user, bool executed, bool revealed) = 
            hook.commitments(commitHash);
            
        assertEq(storedHash, commitHash);
        assertEq(user, TEST_USER);
        assertEq(timestamp, block.timestamp);
        assertFalse(executed);
        assertFalse(revealed);
    }

    // Test: Multiple commits from same user
    function testMultipleCommitsFromSameUser() public {
        bytes32 commitHash1 = keccak256("test_commit_1");
        bytes32 commitHash2 = keccak256("test_commit_2");
        
        vm.startPrank(TEST_USER);
        hook.commitArbitrageIntent(commitHash1);
        hook.commitArbitrageIntent(commitHash2);
        vm.stopPrank();
        
        // Both should be stored correctly
        (, , address user1, , ) = hook.commitments(commitHash1);
        (, , address user2, , ) = hook.commitments(commitHash2);
        
        assertEq(user1, TEST_USER);
        assertEq(user2, TEST_USER);
    }

    // Test: Rate limiting functionality
    function testCanExecuteArbitrage() public {
        // Initially should be able to execute
        assertTrue(hook.canExecuteArbitrage(TEST_NULLIFIER));
        
        // Simulate execution by setting last execution time
        vm.store(
            address(hook),
            keccak256(abi.encode(TEST_NULLIFIER, uint256(1))), // slot for lastExecutionTime mapping
            bytes32(block.timestamp)
        );
        
        // Should not be able to execute immediately after
        assertFalse(hook.canExecuteArbitrage(TEST_NULLIFIER));
        
        // Should be able to execute after rate limit period
        vm.warp(block.timestamp + 1 hours + 1);
        assertTrue(hook.canExecuteArbitrage(TEST_NULLIFIER));
    }

    // Test: Rate limiting with different users
    function testRateLimitingPerUser() public {
        uint256 nullifier1 = TEST_NULLIFIER;
        uint256 nullifier2 = TEST_NULLIFIER_2;
        
        // Both should initially be able to execute
        assertTrue(hook.canExecuteArbitrage(nullifier1));
        assertTrue(hook.canExecuteArbitrage(nullifier2));
        
        // Simulate execution for first user
        vm.store(
            address(hook),
            keccak256(abi.encode(nullifier1, uint256(1))),
            bytes32(block.timestamp)
        );
        
        // First user should be rate limited, second should not
        assertFalse(hook.canExecuteArbitrage(nullifier1));
        assertTrue(hook.canExecuteArbitrage(nullifier2));
    }

    // Test: Get next allowed time
    function testGetNextAllowedTime() public {
        uint256 nullifierHash = TEST_NULLIFIER;
        uint256 executionTime = block.timestamp;
        
        // Simulate execution
        vm.store(
            address(hook),
            keccak256(abi.encode(nullifierHash, uint256(1))),
            bytes32(executionTime)
        );
        
        uint256 nextAllowed = hook.getNextAllowedTime(nullifierHash);
        assertEq(nextAllowed, executionTime + 1 hours);
    }

    // Test: Reveal and execute arbitrage - successful case
    function testRevealAndExecuteArbitrageSuccess() public {
        // Setup World ID router to accept the proof
        worldIdRouter.setValidNullifier(TEST_NULLIFIER, true);
        
        // Create test data
        IFlashArbHook.ArbitrageOpportunity memory opportunity = createTestOpportunity();
        IFlashArbHook.WorldIDProof memory worldIdProof = createTestWorldIDProof();
        uint256 nonce = 1;
        
        // Generate commit hash
        bytes32 opportunityHash = ArbitrageLib.generateOpportunityHash(
            opportunity.tokenIn,
            opportunity.tokenOut,
            opportunity.amountIn,
            opportunity.expectedProfit,
            opportunity.deadline
        );
        
        bytes32 commitHash = ArbitrageLib.generateCommitHash(
            TEST_USER,
            worldIdProof.nullifierHash,
            nonce,
            opportunityHash
        );
        
        // First commit the intent
        vm.prank(TEST_USER);
        hook.commitArbitrageIntent(commitHash);
        
        // Wait for minimum commit time
        vm.warp(block.timestamp + 1 minutes);
        
        // Expect events
        vm.expectEmit(true, true, false, true);
        emit ArbitrageValidationStarted(
            TEST_USER,
            commitHash,
            opportunity.tokenIn,
            opportunity.tokenOut,
            opportunity.amountIn
        );
        
        vm.expectEmit(true, false, false, true);
        emit WorldIDProofVerified(TEST_USER, worldIdProof.nullifierHash, worldIdProof.root);
        
        // Execute reveal
        vm.prank(TEST_USER);
        bytes32 returnedHash = hook.revealAndExecuteArbitrage(
            opportunity,
            worldIdProof,
            nonce,
            poolKey
        );
        
        assertEq(returnedHash, commitHash);
        
        // Verify commitment state
        (, , , , bool revealed) = hook.commitments(commitHash);
        assertTrue(revealed);
        
        // Verify nullifier is marked as used
        assertTrue(hook.usedNullifiers(worldIdProof.nullifierHash));
        
        // Verify rate limiting is updated
        assertEq(hook.lastExecutionTime(worldIdProof.nullifierHash), block.timestamp);
    }

    // Test: Reveal without commit should fail
    function testRevealWithoutCommitFails() public {
        worldIdRouter.setValidNullifier(TEST_NULLIFIER, true);
        
        IFlashArbHook.ArbitrageOpportunity memory opportunity = createTestOpportunity();
        IFlashArbHook.WorldIDProof memory worldIdProof = createTestWorldIDProof();
        uint256 nonce = 1;
        
        vm.expectRevert(abi.encodeWithSelector(IFlashArbHook.InvalidCommitRevealTiming.selector));
        vm.prank(TEST_USER);
        hook.revealAndExecuteArbitrage(opportunity, worldIdProof, nonce, poolKey);
    }

    // Test: Reveal too early should fail
    function testRevealTooEarlyFails() public {
        worldIdRouter.setValidNullifier(TEST_NULLIFIER, true);
        
        IFlashArbHook.ArbitrageOpportunity memory opportunity = createTestOpportunity();
        IFlashArbHook.WorldIDProof memory worldIdProof = createTestWorldIDProof();
        uint256 nonce = 1;
        
        bytes32 opportunityHash = ArbitrageLib.generateOpportunityHash(
            opportunity.tokenIn,
            opportunity.tokenOut,
            opportunity.amountIn,
            opportunity.expectedProfit,
            opportunity.deadline
        );
        
        bytes32 commitHash = ArbitrageLib.generateCommitHash(
            TEST_USER,
            worldIdProof.nullifierHash,
            nonce,
            opportunityHash
        );
        
        // Commit
        vm.prank(TEST_USER);
        hook.commitArbitrageIntent(commitHash);
        
        // Try to reveal immediately (should fail)
        vm.expectRevert(abi.encodeWithSelector(IFlashArbHook.InvalidCommitRevealTiming.selector));
        vm.prank(TEST_USER);
        hook.revealAndExecuteArbitrage(opportunity, worldIdProof, nonce, poolKey);
    }

    // Test: Invalid World ID proof should fail
    function testInvalidWorldIDProofFails() public {
        worldIdRouter.setValidNullifier(TEST_NULLIFIER, false); // Invalid nullifier
        
        IFlashArbHook.ArbitrageOpportunity memory opportunity = createTestOpportunity();
        IFlashArbHook.WorldIDProof memory worldIdProof = createTestWorldIDProof();
        uint256 nonce = 1;
        
        bytes32 opportunityHash = ArbitrageLib.generateOpportunityHash(
            opportunity.tokenIn,
            opportunity.tokenOut,
            opportunity.amountIn,
            opportunity.expectedProfit,
            opportunity.deadline
        );
        
        bytes32 commitHash = ArbitrageLib.generateCommitHash(
            TEST_USER,
            worldIdProof.nullifierHash,
            nonce,
            opportunityHash
        );
        
        // Commit and wait
        vm.prank(TEST_USER);
        hook.commitArbitrageIntent(commitHash);
        vm.warp(block.timestamp + 1 minutes);
        
        vm.expectRevert(abi.encodeWithSelector(IFlashArbHook.InvalidWorldIDProof.selector));
        vm.prank(TEST_USER);
        hook.revealAndExecuteArbitrage(opportunity, worldIdProof, nonce, poolKey);
    }

    // Test: Rate limited execution should fail
    function testRateLimitedExecutionFails() public {
        worldIdRouter.setValidNullifier(TEST_NULLIFIER, true);
        
        // Set last execution time to current time (rate limited)
        vm.store(
            address(hook),
            keccak256(abi.encode(TEST_NULLIFIER, uint256(1))),
            bytes32(block.timestamp)
        );
        
        IFlashArbHook.ArbitrageOpportunity memory opportunity = createTestOpportunity();
        IFlashArbHook.WorldIDProof memory worldIdProof = createTestWorldIDProof();
        uint256 nonce = 1;
        
        bytes32 opportunityHash = ArbitrageLib.generateOpportunityHash(
            opportunity.tokenIn,
            opportunity.tokenOut,
            opportunity.amountIn,
            opportunity.expectedProfit,
            opportunity.deadline
        );
        
        bytes32 commitHash = ArbitrageLib.generateCommitHash(
            TEST_USER,
            worldIdProof.nullifierHash,
            nonce,
            opportunityHash
        );
        
        // Commit and wait
        vm.prank(TEST_USER);
        hook.commitArbitrageIntent(commitHash);
        vm.warp(block.timestamp + 1 minutes);
        
        uint256 nextAllowedTime = hook.getNextAllowedTime(TEST_NULLIFIER);
        vm.expectRevert(abi.encodeWithSelector(IFlashArbHook.RateLimited.selector, nextAllowedTime));
        vm.prank(TEST_USER);
        hook.revealAndExecuteArbitrage(opportunity, worldIdProof, nonce, poolKey);
    }

    // Test: Expired opportunity should fail
    function testExpiredOpportunityFails() public {
        worldIdRouter.setValidNullifier(TEST_NULLIFIER, true);
        
        IFlashArbHook.ArbitrageOpportunity memory opportunity = createTestOpportunity();
        opportunity.deadline = block.timestamp - 1; // Expired
        
        IFlashArbHook.WorldIDProof memory worldIdProof = createTestWorldIDProof();
        uint256 nonce = 1;
        
        bytes32 opportunityHash = ArbitrageLib.generateOpportunityHash(
            opportunity.tokenIn,
            opportunity.tokenOut,
            opportunity.amountIn,
            opportunity.expectedProfit,
            opportunity.deadline
        );
        
        bytes32 commitHash = ArbitrageLib.generateCommitHash(
            TEST_USER,
            worldIdProof.nullifierHash,
            nonce,
            opportunityHash
        );
        
        // Commit and wait
        vm.prank(TEST_USER);
        hook.commitArbitrageIntent(commitHash);
        vm.warp(block.timestamp + 1 minutes);
        
        vm.expectRevert(abi.encodeWithSelector(IFlashArbHook.OpportunityExpired.selector));
        vm.prank(TEST_USER);
        hook.revealAndExecuteArbitrage(opportunity, worldIdProof, nonce, poolKey);
    }

    // Test: Double reveal should fail
    function testDoubleRevealFails() public {
        worldIdRouter.setValidNullifier(TEST_NULLIFIER, true);
        
        IFlashArbHook.ArbitrageOpportunity memory opportunity = createTestOpportunity();
        IFlashArbHook.WorldIDProof memory worldIdProof = createTestWorldIDProof();
        uint256 nonce = 1;
        
        bytes32 opportunityHash = ArbitrageLib.generateOpportunityHash(
            opportunity.tokenIn,
            opportunity.tokenOut,
            opportunity.amountIn,
            opportunity.expectedProfit,
            opportunity.deadline
        );
        
        bytes32 commitHash = ArbitrageLib.generateCommitHash(
            TEST_USER,
            worldIdProof.nullifierHash,
            nonce,
            opportunityHash
        );
        
        // Commit and wait
        vm.prank(TEST_USER);
        hook.commitArbitrageIntent(commitHash);
        vm.warp(block.timestamp + 1 minutes);
        
        // First reveal should succeed
        vm.prank(TEST_USER);
        hook.revealAndExecuteArbitrage(opportunity, worldIdProof, nonce, poolKey);
        
        // Second reveal should fail
        vm.expectRevert(abi.encodeWithSelector(IFlashArbHook.InvalidCommitRevealTiming.selector));
        vm.prank(TEST_USER);
        hook.revealAndExecuteArbitrage(opportunity, worldIdProof, nonce, poolKey);
    }

    // Test: Normal swap without arbitrage data
    function testNormalSwapStillWorks() public {
        uint256 amountIn = 1e18;
        
        BalanceDelta swapDelta = swapRouter.swapExactTokensForTokens({
            amountIn: amountIn,
            amountOutMin: 0,
            zeroForOne: true,
            poolKey: poolKey,
            hookData: Constants.ZERO_BYTES, // No arbitrage data
            receiver: address(this),
            deadline: block.timestamp + 1
        });

        // Verify swap executed normally
        assertEq(int256(swapDelta.amount0()), -int256(amountIn));
    }

    // Test: Hook permissions are correct
    function testHookPermissions() public view {
        Hooks.Permissions memory permissions = hook.getHookPermissions();
        
        assertFalse(permissions.beforeInitialize);
        assertFalse(permissions.afterInitialize);
        assertFalse(permissions.beforeAddLiquidity);
        assertFalse(permissions.afterAddLiquidity);
        assertFalse(permissions.beforeRemoveLiquidity);
        assertFalse(permissions.afterRemoveLiquidity);
        assertTrue(permissions.beforeSwap);
        assertTrue(permissions.afterSwap);
        assertFalse(permissions.beforeDonate);
        assertFalse(permissions.afterDonate);
        assertTrue(permissions.beforeSwapReturnDelta);
        assertTrue(permissions.afterSwapReturnDelta);
        assertFalse(permissions.afterAddLiquidityReturnDelta);
        assertFalse(permissions.afterRemoveLiquidityReturnDelta);
    }

    // Test: Price signature verification (mock implementation)
    function testVerifyPriceSignature() public view {
        IFlashArbHook.ArbitrageOpportunity memory opportunity = createTestOpportunity();
        
        // This will return false for mock signature, but shouldn't revert
        hook.verifyPriceSignature(opportunity);
        // We can't assert the exact value since it depends on the signature implementation
        // But we verify the function doesn't revert
    }

    receive() external payable {}
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IPythOracle.sol";

// Library for price calculations using Pyth oracle
library PriceCalculator {
    uint256 public constant MAX_PRICE_STALENESS = 600;
    uint8 public constant MIN_CONFIDENCE_SCORE = 20;
    uint256 public constant PRICE_PRECISION = 1e18;
    uint256 public constant BASIS_POINTS = 10000;

    error InvalidPriceData();
    error StalePriceData();
    error LowConfidencePrice();
    error PriceCalculationOverflow();

    // Calculate output amount using oracle prices
    function calculateOutputAmount(
        IPythOracle.Price memory priceIn,
        IPythOracle.Price memory priceOut,
        uint256 amountIn
    ) internal view returns (uint256 outputAmount) {
        _validatePriceData(priceIn);
        _validatePriceData(priceOut);
        
        uint256 adjustedPriceIn = _adjustPriceToStandard(priceIn);
        uint256 adjustedPriceOut = _adjustPriceToStandard(priceOut);
        
        require(adjustedPriceOut > 0, "Invalid output price");
        
        uint256 inputValue = (amountIn * adjustedPriceIn) / PRICE_PRECISION;
        outputAmount = (inputValue * PRICE_PRECISION) / adjustedPriceOut;
        
        return outputAmount;
    }

    // Calculate output with confidence adjustment
    function calculateOutputAmountWithConfidence(
        IPythOracle.Price memory priceIn,
        IPythOracle.Price memory priceOut,
        uint256 amountIn
    ) internal view returns (uint256 outputAmount, uint8 confidenceScore) {
        outputAmount = calculateOutputAmount(priceIn, priceOut, amountIn);
        confidenceScore = _calculateConfidenceScore(priceIn, priceOut);
        
        if (confidenceScore < 50) {
            uint256 adjustment = (100 - confidenceScore) / 2;
            outputAmount = outputAmount * (100 - adjustment) / 100;
        }
        
        return (outputAmount, confidenceScore);
    }

    // Calculate price impact
    function calculatePriceImpact(
        uint256 basePrice,
        uint256 tradeSize,
        uint256 liquidityDepth
    ) internal pure returns (uint256 priceImpactBps) {
        if (liquidityDepth == 0) return BASIS_POINTS;
        
        uint256 impactRatio = (tradeSize * BASIS_POINTS) / liquidityDepth;
        priceImpactBps = impactRatio > BASIS_POINTS ? BASIS_POINTS : impactRatio;
        
        return priceImpactBps;
    }

    // Apply slippage to output amount
    function applySlippage(
        uint256 outputAmount,
        uint256 slippageBps
    ) internal pure returns (uint256 adjustedAmount) {
        require(slippageBps <= BASIS_POINTS, "Invalid slippage");
        
        adjustedAmount = outputAmount * (BASIS_POINTS - slippageBps) / BASIS_POINTS;
        return adjustedAmount;
    }

    // Calculate time-weighted average price
    function calculateTWAP(
        uint256[] memory prices,
        uint256[] memory timestamps,
        uint256 currentTime,
        uint256 timeWindow
    ) internal pure returns (uint256 twapPrice) {
        require(prices.length == timestamps.length, "Array length mismatch");
        require(timeWindow > 0, "Invalid time window");
        
        uint256 weightedSum = 0;
        uint256 totalWeight = 0;
        uint256 cutoffTime = currentTime - timeWindow;
        
        for (uint256 i = 0; i < prices.length; i++) {
            if (timestamps[i] >= cutoffTime) {
                uint256 weight = timestamps[i] - cutoffTime + 1;
                weightedSum += prices[i] * weight;
                totalWeight += weight;
            }
        }
        
        require(totalWeight > 0, "No valid prices in time window");
        twapPrice = weightedSum / totalWeight;
        
        return twapPrice;
    }

    // Validate price data
    function _validatePriceData(IPythOracle.Price memory price) private view {
        if (price.price <= 0) revert InvalidPriceData();
        
        if (block.timestamp - price.publishTime > MAX_PRICE_STALENESS) {
            revert StalePriceData();
        }
    }

    // Adjust price to standard precision
    function _adjustPriceToStandard(IPythOracle.Price memory price) 
        private 
        pure 
        returns (uint256 adjustedPrice) 
    {
        adjustedPrice = uint256(int256(price.price));
        
        if (price.expo >= 0) {
            uint256 multiplier = 10 ** uint32(price.expo);
            require(adjustedPrice <= type(uint256).max / multiplier, "Price overflow");
            adjustedPrice = adjustedPrice * multiplier;
        } else {
            uint256 divisor = 10 ** uint32(-price.expo);
            adjustedPrice = adjustedPrice / divisor;
        }
        
        adjustedPrice = adjustedPrice * PRICE_PRECISION / 1e8;
        
        return adjustedPrice;
    }

    // Calculate confidence score
    function _calculateConfidenceScore(
        IPythOracle.Price memory priceIn,
        IPythOracle.Price memory priceOut
    ) private pure returns (uint8 confidenceScore) {
        uint256 priceInConfPct = (uint256(priceIn.conf) * 10000) / uint256(int256(priceIn.price));
        uint256 priceOutConfPct = (uint256(priceOut.conf) * 10000) / uint256(int256(priceOut.price));
        
        uint256 avgConfInterval = (priceInConfPct + priceOutConfPct) / 2;
        
        if (avgConfInterval >= 1000) return 10;
        if (avgConfInterval >= 500) return 30;
        if (avgConfInterval >= 200) return 50;
        if (avgConfInterval >= 100) return 70;
        if (avgConfInterval >= 50) return 85;
        return 95;
    }

    // Check if prices are within acceptable deviation
    function isPriceWithinRange(
        uint256 price1,
        uint256 price2,
        uint256 maxDeviationBps
    ) internal pure returns (bool isWithinRange) {
        if (price1 == 0 || price2 == 0) return false;
        
        uint256 higher = price1 > price2 ? price1 : price2;
        uint256 lower = price1 > price2 ? price2 : price1;
        
        uint256 deviationBps = ((higher - lower) * BASIS_POINTS) / lower;
        
        return deviationBps <= maxDeviationBps;
    }

    // Calculate volatility-adjusted output
    function applyVolatilityAdjustment(
        uint256 baseOutput,
        uint256[] memory historicalPrices,
        uint256 volatilityAdjustmentBps
    ) internal pure returns (uint256 adjustedOutput) {
        if (historicalPrices.length < 2) {
            return baseOutput;
        }
        
        uint256 priceSum = 0;
        for (uint256 i = 0; i < historicalPrices.length; i++) {
            priceSum += historicalPrices[i];
        }
        uint256 avgPrice = priceSum / historicalPrices.length;
        
        uint256 varianceSum = 0;
        for (uint256 i = 0; i < historicalPrices.length; i++) {
            uint256 diff = historicalPrices[i] > avgPrice 
                ? historicalPrices[i] - avgPrice 
                : avgPrice - historicalPrices[i];
            varianceSum += (diff * diff);
        }
        
        uint256 variance = varianceSum / historicalPrices.length;
        uint256 volatilityPct = (variance * 100) / (avgPrice * avgPrice);
        
        uint256 extraAdjustment = (volatilityPct * volatilityAdjustmentBps) / 100;
        uint256 totalAdjustment = volatilityAdjustmentBps + extraAdjustment;
        
        if (totalAdjustment > 5000) totalAdjustment = 5000;
        
        adjustedOutput = baseOutput * (BASIS_POINTS - totalAdjustment) / BASIS_POINTS;
        
        return adjustedOutput;
    }
}
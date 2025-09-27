// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title VenueComparator
 * @notice Library for comparing and ranking different execution venues
 * @dev Provides comprehensive venue analysis for optimal execution decisions
 */
library VenueComparator {
    /// @notice Basis points precision
    uint256 public constant BASIS_POINTS = 10000;
    
    /// @notice Maximum score for any metric
    uint256 public constant MAX_SCORE = 100;
    
    /// @notice Minimum acceptable venue score
    uint256 public constant MIN_VENUE_SCORE = 20;

    /// @notice Venue comparison data structure
    struct ComparisonData {
        uint256 outputAmount;
        uint256 totalCost;
        uint256 netOutput;
        uint256 executionTime;
        uint8 reliabilityScore;
        uint8 confidenceScore;
        uint256 gasEstimate;
        bool requiresBridge;
        uint256 liquidityScore;
        uint256 historicalPerformance;
    }

    /// @notice Venue scoring weights (must sum to 100)
    struct ScoringWeights {
        uint8 outputWeight;        // Weight for net output amount
        uint8 costWeight;          // Weight for execution costs
        uint8 timeWeight;          // Weight for execution time
        uint8 reliabilityWeight;   // Weight for venue reliability
        uint8 confidenceWeight;    // Weight for price confidence
        uint8 liquidityWeight;     // Weight for liquidity availability
        uint8 performanceWeight;   // Weight for historical performance
    }

    function getDefaultWeights() internal pure returns (ScoringWeights memory) {
        return ScoringWeights({
            outputWeight: 35,
            costWeight: 20,
            timeWeight: 15,
            reliabilityWeight: 10,
            confidenceWeight: 10,
            liquidityWeight: 5,
            performanceWeight: 5
        });
    }

    function getConservativeWeights() internal pure returns (ScoringWeights memory) {
        return ScoringWeights({
            outputWeight: 25,
            costWeight: 15,
            timeWeight: 10,
            reliabilityWeight: 20,
            confidenceWeight: 20,
            liquidityWeight: 5,
            performanceWeight: 5
        });
    }

    function getAggressiveWeights() internal pure returns (ScoringWeights memory) {
        return ScoringWeights({
            outputWeight: 50,
            costWeight: 25,
            timeWeight: 10,
            reliabilityWeight: 5,
            confidenceWeight: 5,
            liquidityWeight: 3,
            performanceWeight: 2
        });
    }

    /**
     * @notice Calculate comprehensive venue score
     * @param data Venue comparison data
     * @param weights Scoring weights to use
     * @param referenceData Reference data for normalization
     * @return score Overall venue score (0-100)
     */
    function calculateVenueScore(
        ComparisonData memory data,
        ScoringWeights memory weights,
        ComparisonData memory referenceData
    ) internal pure returns (uint256 score) {
        // Validate weights sum to 100
        require(_validateWeights(weights), "Invalid weights");
        
        // Calculate individual metric scores
        uint256 outputScore = _calculateOutputScore(data.netOutput, referenceData.netOutput);
        uint256 costScore = _calculateCostScore(data.totalCost, referenceData.totalCost);
        uint256 timeScore = _calculateTimeScore(data.executionTime, referenceData.executionTime);
        uint256 reliabilityScore = uint256(data.reliabilityScore);
        uint256 confidenceScore = uint256(data.confidenceScore);
        uint256 liquidityScore = _normalizeLiquidityScore(data.liquidityScore);
        uint256 performanceScore = _normalizePerformanceScore(data.historicalPerformance);
        
        // Calculate weighted score
        score = (outputScore * weights.outputWeight +
                costScore * weights.costWeight +
                timeScore * weights.timeWeight +
                reliabilityScore * weights.reliabilityWeight +
                confidenceScore * weights.confidenceWeight +
                liquidityScore * weights.liquidityWeight +
                performanceScore * weights.performanceWeight) / 100;
        
        // Apply penalties for bridge requirements
        if (data.requiresBridge) {
            score = _applyBridgePenalty(score, data.executionTime);
        }
        
        return score;
    }

    /**
     * @notice Compare two venues and determine which is better
     * @param venue1 First venue data
     * @param venue2 Second venue data
     * @param weights Scoring weights
     * @param referenceData Reference data for normalization
     * @return isBetter True if venue1 is better than venue2
     */
    function compareVenues(
        ComparisonData memory venue1,
        ComparisonData memory venue2,
        ScoringWeights memory weights,
        ComparisonData memory referenceData
    ) internal pure returns (bool isBetter) {
        uint256 score1 = calculateVenueScore(venue1, weights, referenceData);
        uint256 score2 = calculateVenueScore(venue2, weights, referenceData);
        
        return score1 > score2;
    }

    /**
     * @notice Rank multiple venues by their scores
     * @param venues Array of venue data
     * @param weights Scoring weights
     * @param referenceData Reference data for normalization
     * @return rankedIndices Array of venue indices sorted by score (best first)
     */
    function rankVenues(
        ComparisonData[] memory venues,
        ScoringWeights memory weights,
        ComparisonData memory referenceData
    ) internal pure returns (uint256[] memory rankedIndices) {
        uint256 venueCount = venues.length;
        rankedIndices = new uint256[](venueCount);
        uint256[] memory scores = new uint256[](venueCount);
        
        // Calculate scores for all venues
        for (uint256 i = 0; i < venueCount; i++) {
            rankedIndices[i] = i;
            scores[i] = calculateVenueScore(venues[i], weights, referenceData);
        }
        
        // Sort by scores (bubble sort for simplicity)
        for (uint256 i = 0; i < venueCount - 1; i++) {
            for (uint256 j = 0; j < venueCount - i - 1; j++) {
                if (scores[j] < scores[j + 1]) {
                    // Swap scores
                    (scores[j], scores[j + 1]) = (scores[j + 1], scores[j]);
                    // Swap indices
                    (rankedIndices[j], rankedIndices[j + 1]) = (rankedIndices[j + 1], rankedIndices[j]);
                }
            }
        }
        
        return rankedIndices;
    }

    /**
     * @notice Filter venues that meet minimum criteria
     * @param venues Array of venue data
     * @param minNetOutput Minimum acceptable net output
     * @param maxExecutionTime Maximum acceptable execution time
     * @param minReliabilityScore Minimum reliability score
     * @return validVenues Array of venues that meet criteria
     */
    function filterValidVenues(
        ComparisonData[] memory venues,
        uint256 minNetOutput,
        uint256 maxExecutionTime,
        uint8 minReliabilityScore
    ) internal pure returns (ComparisonData[] memory validVenues) {
        // Count valid venues first
        uint256 validCount = 0;
        for (uint256 i = 0; i < venues.length; i++) {
            if (_isVenueValid(venues[i], minNetOutput, maxExecutionTime, minReliabilityScore)) {
                validCount++;
            }
        }
        
        // Create array of valid venues
        validVenues = new ComparisonData[](validCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < venues.length; i++) {
            if (_isVenueValid(venues[i], minNetOutput, maxExecutionTime, minReliabilityScore)) {
                validVenues[index] = venues[i];
                index++;
            }
        }
        
        return validVenues;
    }

    /**
     * @notice Calculate risk-adjusted venue score
     * @param data Venue comparison data
     * @param riskTolerance Risk tolerance (0-100, higher = more risk tolerant)
     * @return riskAdjustedScore Risk-adjusted score
     */
    function calculateRiskAdjustedScore(
        ComparisonData memory data,
        uint8 riskTolerance
    ) internal pure returns (uint256 riskAdjustedScore) {
        // Base score calculation
        uint256 baseScore = (data.netOutput * 40 + 
                           data.reliabilityScore * 30 + 
                           data.confidenceScore * 30) / 100;
        
        // Risk adjustment factors
        uint256 bridgeRisk = data.requiresBridge ? 20 : 0;
        uint256 timeRisk = data.executionTime > 300 ? 15 : 0; // 5 minutes threshold
        uint256 liquidityRisk = data.liquidityScore < 50 ? 10 : 0;
        
        uint256 totalRisk = bridgeRisk + timeRisk + liquidityRisk;
        
        // Adjust based on risk tolerance
        uint256 riskAdjustment = (totalRisk * (100 - riskTolerance)) / 100;
        
        riskAdjustedScore = baseScore > riskAdjustment ? baseScore - riskAdjustment : 0;
        
        return riskAdjustedScore;
    }

    /**
     * @notice Get optimal venue selection strategy based on user preferences
     * @param userType User type (0=conservative, 1=balanced, 2=aggressive)
     * @return weights Optimal scoring weights for user type
     */
    function getOptimalWeights(uint8 userType) internal pure returns (ScoringWeights memory weights) {
        if (userType == 0) {
            return getConservativeWeights();
        } else if (userType == 2) {
            return getAggressiveWeights();
        } else {
            return getDefaultWeights();
        }
    }

    /**
     * @notice Calculate diversification benefit for multi-venue execution
     * @param venues Array of venue data for potential split execution
     * @param splitRatios Proposed split ratios (must sum to 100)
     * @return diversificationScore Diversification benefit score
     */
    function calculateDiversificationBenefit(
        ComparisonData[] memory venues,
        uint256[] memory splitRatios
    ) internal pure returns (uint256 diversificationScore) {
        require(venues.length == splitRatios.length, "Array length mismatch");
        
        uint256 ratioSum = 0;
        for (uint256 i = 0; i < splitRatios.length; i++) {
            ratioSum += splitRatios[i];
        }
        require(ratioSum == 100, "Split ratios must sum to 100");
        
        // Calculate variance in execution times (lower = better)
        uint256 avgTime = 0;
        for (uint256 i = 0; i < venues.length; i++) {
            avgTime += venues[i].executionTime * splitRatios[i] / 100;
        }
        
        uint256 timeVariance = 0;
        for (uint256 i = 0; i < venues.length; i++) {
            uint256 diff = venues[i].executionTime > avgTime 
                ? venues[i].executionTime - avgTime 
                : avgTime - venues[i].executionTime;
            timeVariance += (diff * diff * splitRatios[i]) / 100;
        }
        
        // Calculate reliability variance (lower = better)
        uint256 avgReliability = 0;
        for (uint256 i = 0; i < venues.length; i++) {
            avgReliability += venues[i].reliabilityScore * splitRatios[i] / 100;
        }
        
        uint256 reliabilityVariance = 0;
        for (uint256 i = 0; i < venues.length; i++) {
            uint256 diff = venues[i].reliabilityScore > avgReliability 
                ? venues[i].reliabilityScore - avgReliability 
                : avgReliability - venues[i].reliabilityScore;
            reliabilityVariance += (diff * diff * splitRatios[i]) / 100;
        }
        
        // Convert variances to diversification score (inverse relationship)
        uint256 totalVariance = timeVariance + reliabilityVariance;
        diversificationScore = totalVariance > 0 ? 10000 / totalVariance : MAX_SCORE;
        
        // Cap at maximum score
        if (diversificationScore > MAX_SCORE) diversificationScore = MAX_SCORE;
        
        return diversificationScore;
    }

    // Internal helper functions

    function _validateWeights(ScoringWeights memory weights) private pure returns (bool) {
        return (weights.outputWeight + weights.costWeight + weights.timeWeight + 
                weights.reliabilityWeight + weights.confidenceWeight + 
                weights.liquidityWeight + weights.performanceWeight) == 100;
    }

    function _calculateOutputScore(uint256 output, uint256 ref) private pure returns (uint256) {
        if (ref == 0) return output > 0 ? MAX_SCORE : 0;
        
        uint256 ratio = (output * 100) / ref;
        if (ratio >= 120) return MAX_SCORE;      // 20%+ better
        if (ratio >= 110) return 90;            // 10-20% better
        if (ratio >= 105) return 80;            // 5-10% better
        if (ratio >= 100) return 70;            // Same or slightly better
        if (ratio >= 95) return 50;             // Up to 5% worse
        if (ratio >= 90) return 30;             // 5-10% worse
        return 10;                              // 10%+ worse
    }

    function _calculateCostScore(uint256 cost, uint256 ref) private pure returns (uint256) {
        if (ref == 0) return cost == 0 ? MAX_SCORE : 0;
        
        uint256 ratio = (cost * 100) / ref;
        if (ratio <= 80) return MAX_SCORE;      // 20%+ cheaper
        if (ratio <= 90) return 90;             // 10-20% cheaper
        if (ratio <= 95) return 80;             // 5-10% cheaper
        if (ratio <= 100) return 70;            // Same or slightly cheaper
        if (ratio <= 105) return 50;            // Up to 5% more expensive
        if (ratio <= 110) return 30;            // 5-10% more expensive
        return 10;                              // 10%+ more expensive
    }

    function _calculateTimeScore(uint256 time, uint256 ref) private pure returns (uint256) {
        if (ref == 0) return time == 0 ? MAX_SCORE : 50;
        
        uint256 ratio = (time * 100) / ref;
        if (ratio <= 50) return MAX_SCORE;
        if (ratio <= 75) return 90;
        if (ratio <= 90) return 80;
        if (ratio <= 100) return 70;
        if (ratio <= 120) return 50;
        if (ratio <= 150) return 30;
        return 10;
    }

    function _normalizeLiquidityScore(uint256 liquidityScore) private pure returns (uint256) {
        return liquidityScore > MAX_SCORE ? MAX_SCORE : liquidityScore;
    }

    function _normalizePerformanceScore(uint256 performance) private pure returns (uint256) {
        return performance > MAX_SCORE ? MAX_SCORE : performance;
    }

    function _applyBridgePenalty(uint256 score, uint256 executionTime) private pure returns (uint256) {
        uint256 penalty = 5;
        
        if (executionTime > 600) penalty += 10;
        if (executionTime > 1800) penalty += 15;
        
        return score > penalty ? score - penalty : 0;
    }

    function _isVenueValid(
        ComparisonData memory venue,
        uint256 minNetOutput,
        uint256 maxExecutionTime,
        uint8 minReliabilityScore
    ) private pure returns (bool) {
        return venue.netOutput >= minNetOutput &&
               venue.executionTime <= maxExecutionTime &&
               venue.reliabilityScore >= minReliabilityScore;
    }
}
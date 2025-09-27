// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Interface for Pyth Network oracle
interface IPythOracle {
    struct Price {
        int64 price;
        uint64 conf;
        int32 expo;
        uint publishTime;
    }

    struct PriceFeed {
        Price price;
        Price emaPrice;
    }

    // Get price feed
    function getPriceFeed(bytes32 id) external view returns (PriceFeed memory price);

    // Get current price
    function getPrice(bytes32 id) external view returns (Price memory price);

    // Get price without safety checks
    function getPriceUnsafe(bytes32 id) external view returns (Price memory price);

    // Get price with age limit
    function getPriceNoOlderThan(bytes32 id, uint age) external view returns (Price memory price);

    // Get EMA price
    function getEmaPrice(bytes32 id) external view returns (Price memory price);

    // Get EMA price without safety checks
    function getEmaPriceUnsafe(bytes32 id) external view returns (Price memory price);

    // Get EMA price with age limit
    function getEmaPriceNoOlderThan(bytes32 id, uint age) external view returns (Price memory price);

    // Update price feeds
    function updatePriceFeeds(bytes[] calldata updateData) external payable;

    // Update price feeds if necessary
    function updatePriceFeedsIfNecessary(
        bytes[] calldata updateData,
        bytes32[] calldata priceIds,
        uint64[] calldata publishTimes
    ) external payable;

    // Parse price feed updates
    function parsePriceFeedUpdates(
        bytes[] calldata updateData,
        bytes32[] calldata priceIds,
        uint64 minPublishTime,
        uint64 maxPublishTime
    ) external payable returns (PriceFeed[] memory priceFeeds);

    // Get update fee
    function getUpdateFee(bytes[] calldata updateData) external view returns (uint feeAmount);

    // Check if price feed exists
    function priceFeedExists(bytes32 id) external view returns (bool exists);

    // Get valid time period
    function getValidTimePeriod() external view returns (uint validTimePeriod);

    event PriceFeedUpdate(
        bytes32 indexed id,
        uint64 publishTime,
        int64 price,
        uint64 conf
    );

    event BatchPriceFeedUpdate(
        uint16 chainId,
        uint64 sequenceNumber
    );
}
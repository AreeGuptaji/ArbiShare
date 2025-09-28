// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Pyth Network oracle interface
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

    function getPriceFeed(bytes32 id) external view returns (PriceFeed memory price);
    function getPrice(bytes32 id) external view returns (Price memory price);
    function getPriceUnsafe(bytes32 id) external view returns (Price memory price);
    function getPriceNoOlderThan(bytes32 id, uint age) external view returns (Price memory price);
    function getEmaPrice(bytes32 id) external view returns (Price memory price);
    function getEmaPriceUnsafe(bytes32 id) external view returns (Price memory price);
    function getEmaPriceNoOlderThan(bytes32 id, uint age) external view returns (Price memory price);
    function updatePriceFeeds(bytes[] calldata updateData) external payable;
    function updatePriceFeedsIfNecessary(
        bytes[] calldata updateData,
        bytes32[] calldata priceIds,
        uint64[] calldata publishTimes
    ) external payable;
    function parsePriceFeedUpdates(
        bytes[] calldata updateData,
        bytes32[] calldata priceIds,
        uint64 minPublishTime,
        uint64 maxPublishTime
    ) external payable returns (PriceFeed[] memory priceFeeds);
    function getUpdateFee(bytes[] calldata updateData) external view returns (uint feeAmount);
    function priceFeedExists(bytes32 id) external view returns (bool exists);
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
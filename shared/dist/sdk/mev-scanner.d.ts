export declare const SUPPORTED_CHAINS: {
    1: {
        chain: {
            blockExplorers: {
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://etherscan.io";
                    readonly apiUrl: "https://api.etherscan.io/api";
                };
            };
            blockTime: 12000;
            contracts: {
                readonly ensUniversalResolver: {
                    readonly address: "0xeeeeeeee14d718c2b47d9923deab1335e144eeee";
                    readonly blockCreated: 23085558;
                };
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 14353601;
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 1;
            name: "Ethereum";
            nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://eth.merkle.io"];
                };
            };
            sourceId?: number | undefined | undefined;
            testnet?: boolean | undefined | undefined;
            custom?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters?: undefined;
            serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
        };
        name: string;
        rpc: string;
    };
    42161: {
        chain: {
            blockExplorers: {
                readonly default: {
                    readonly name: "Arbiscan";
                    readonly url: "https://arbiscan.io";
                    readonly apiUrl: "https://api.arbiscan.io/api";
                };
            };
            blockTime: 250;
            contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 7654707;
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 42161;
            name: "Arbitrum One";
            nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://arb1.arbitrum.io/rpc"];
                };
            };
            sourceId?: number | undefined | undefined;
            testnet?: boolean | undefined | undefined;
            custom?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters?: undefined;
            serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
        };
        name: string;
        rpc: string;
    };
    8453: {
        chain: {
            blockExplorers: {
                readonly default: {
                    readonly name: "Basescan";
                    readonly url: "https://basescan.org";
                    readonly apiUrl: "https://api.basescan.org/api";
                };
            };
            blockTime: 2000;
            contracts: {
                readonly disputeGameFactory: {
                    readonly 1: {
                        readonly address: "0x43edB88C4B80fDD2AdFF2412A7BebF9dF42cB40e";
                    };
                };
                readonly l2OutputOracle: {
                    readonly 1: {
                        readonly address: "0x56315b90c40730925ec5485cf004d835058518A0";
                    };
                };
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 5022;
                };
                readonly portal: {
                    readonly 1: {
                        readonly address: "0x49048044D57e1C92A77f79988d21Fa8fAF74E97e";
                        readonly blockCreated: 17482143;
                    };
                };
                readonly l1StandardBridge: {
                    readonly 1: {
                        readonly address: "0x3154Cf16ccdb4C6d922629664174b904d80F2C35";
                        readonly blockCreated: 17482143;
                    };
                };
                readonly gasPriceOracle: {
                    readonly address: "0x420000000000000000000000000000000000000F";
                };
                readonly l1Block: {
                    readonly address: "0x4200000000000000000000000000000000000015";
                };
                readonly l2CrossDomainMessenger: {
                    readonly address: "0x4200000000000000000000000000000000000007";
                };
                readonly l2Erc721Bridge: {
                    readonly address: "0x4200000000000000000000000000000000000014";
                };
                readonly l2StandardBridge: {
                    readonly address: "0x4200000000000000000000000000000000000010";
                };
                readonly l2ToL1MessagePasser: {
                    readonly address: "0x4200000000000000000000000000000000000016";
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 8453;
            name: "Base";
            nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.base.org"];
                };
            };
            sourceId: 1;
            testnet?: boolean | undefined | undefined;
            custom?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters: {
                readonly block: {
                    exclude: [] | undefined;
                    format: (args: import("viem/chains").OpStackRpcBlock) => {
                        baseFeePerGas: bigint | null;
                        blobGasUsed: bigint;
                        difficulty: bigint;
                        excessBlobGas: bigint;
                        extraData: import("viem").Hex;
                        gasLimit: bigint;
                        gasUsed: bigint;
                        hash: `0x${string}` | null;
                        logsBloom: `0x${string}` | null;
                        miner: import("viem").Address;
                        mixHash: import("viem").Hash;
                        nonce: `0x${string}` | null;
                        number: bigint | null;
                        parentBeaconBlockRoot?: `0x${string}` | undefined;
                        parentHash: import("viem").Hash;
                        receiptsRoot: import("viem").Hex;
                        sealFields: import("viem").Hex[];
                        sha3Uncles: import("viem").Hash;
                        size: bigint;
                        stateRoot: import("viem").Hash;
                        timestamp: bigint;
                        totalDifficulty: bigint | null;
                        transactions: `0x${string}`[] | import("viem/chains").OpStackTransaction<boolean>[];
                        transactionsRoot: import("viem").Hash;
                        uncles: import("viem").Hash[];
                        withdrawals?: import("viem").Withdrawal[] | undefined | undefined;
                        withdrawalsRoot?: `0x${string}` | undefined;
                    } & {};
                    type: "block";
                };
                readonly transaction: {
                    exclude: [] | undefined;
                    format: (args: import("viem/chains").OpStackRpcTransaction) => ({
                        blockHash: `0x${string}` | null;
                        blockNumber: bigint | null;
                        from: import("viem").Address;
                        gas: bigint;
                        hash: import("viem").Hash;
                        input: import("viem").Hex;
                        nonce: number;
                        r: import("viem").Hex;
                        s: import("viem").Hex;
                        to: import("viem").Address | null;
                        transactionIndex: number | null;
                        typeHex: import("viem").Hex | null;
                        v: bigint;
                        value: bigint;
                        yParity: number;
                        gasPrice?: undefined | undefined;
                        maxFeePerBlobGas?: undefined | undefined;
                        maxFeePerGas: bigint;
                        maxPriorityFeePerGas: bigint;
                        isSystemTx?: boolean;
                        mint?: bigint | undefined | undefined;
                        sourceHash: import("viem").Hex;
                        type: "deposit";
                    } | {
                        r: import("viem").Hex;
                        s: import("viem").Hex;
                        v: bigint;
                        value: bigint;
                        gas: bigint;
                        to: import("viem").Address | null;
                        from: import("viem").Address;
                        nonce: number;
                        blockHash: `0x${string}` | null;
                        blockNumber: bigint | null;
                        transactionIndex: number | null;
                        hash: import("viem").Hash;
                        input: import("viem").Hex;
                        typeHex: import("viem").Hex | null;
                        accessList?: undefined | undefined;
                        authorizationList?: undefined | undefined;
                        blobVersionedHashes?: undefined | undefined;
                        chainId?: number | undefined;
                        yParity?: undefined | undefined;
                        type: "legacy";
                        gasPrice: bigint;
                        maxFeePerBlobGas?: undefined | undefined;
                        maxFeePerGas?: undefined | undefined;
                        maxPriorityFeePerGas?: undefined | undefined;
                        isSystemTx?: undefined | undefined;
                        mint?: undefined | undefined;
                        sourceHash?: undefined | undefined;
                    } | {
                        blockHash: `0x${string}` | null;
                        blockNumber: bigint | null;
                        from: import("viem").Address;
                        gas: bigint;
                        hash: import("viem").Hash;
                        input: import("viem").Hex;
                        nonce: number;
                        r: import("viem").Hex;
                        s: import("viem").Hex;
                        to: import("viem").Address | null;
                        transactionIndex: number | null;
                        typeHex: import("viem").Hex | null;
                        v: bigint;
                        value: bigint;
                        yParity: number;
                        accessList: import("viem").AccessList;
                        authorizationList?: undefined | undefined;
                        blobVersionedHashes?: undefined | undefined;
                        chainId: number;
                        type: "eip2930";
                        gasPrice: bigint;
                        maxFeePerBlobGas?: undefined | undefined;
                        maxFeePerGas?: undefined | undefined;
                        maxPriorityFeePerGas?: undefined | undefined;
                        isSystemTx?: undefined | undefined;
                        mint?: undefined | undefined;
                        sourceHash?: undefined | undefined;
                    } | {
                        blockHash: `0x${string}` | null;
                        blockNumber: bigint | null;
                        from: import("viem").Address;
                        gas: bigint;
                        hash: import("viem").Hash;
                        input: import("viem").Hex;
                        nonce: number;
                        r: import("viem").Hex;
                        s: import("viem").Hex;
                        to: import("viem").Address | null;
                        transactionIndex: number | null;
                        typeHex: import("viem").Hex | null;
                        v: bigint;
                        value: bigint;
                        yParity: number;
                        accessList: import("viem").AccessList;
                        authorizationList?: undefined | undefined;
                        blobVersionedHashes?: undefined | undefined;
                        chainId: number;
                        type: "eip1559";
                        gasPrice?: undefined | undefined;
                        maxFeePerBlobGas?: undefined | undefined;
                        maxFeePerGas: bigint;
                        maxPriorityFeePerGas: bigint;
                        isSystemTx?: undefined | undefined;
                        mint?: undefined | undefined;
                        sourceHash?: undefined | undefined;
                    } | {
                        blockHash: `0x${string}` | null;
                        blockNumber: bigint | null;
                        from: import("viem").Address;
                        gas: bigint;
                        hash: import("viem").Hash;
                        input: import("viem").Hex;
                        nonce: number;
                        r: import("viem").Hex;
                        s: import("viem").Hex;
                        to: import("viem").Address | null;
                        transactionIndex: number | null;
                        typeHex: import("viem").Hex | null;
                        v: bigint;
                        value: bigint;
                        yParity: number;
                        accessList: import("viem").AccessList;
                        authorizationList?: undefined | undefined;
                        blobVersionedHashes: readonly import("viem").Hex[];
                        chainId: number;
                        type: "eip4844";
                        gasPrice?: undefined | undefined;
                        maxFeePerBlobGas: bigint;
                        maxFeePerGas: bigint;
                        maxPriorityFeePerGas: bigint;
                        isSystemTx?: undefined | undefined;
                        mint?: undefined | undefined;
                        sourceHash?: undefined | undefined;
                    } | {
                        blockHash: `0x${string}` | null;
                        blockNumber: bigint | null;
                        from: import("viem").Address;
                        gas: bigint;
                        hash: import("viem").Hash;
                        input: import("viem").Hex;
                        nonce: number;
                        r: import("viem").Hex;
                        s: import("viem").Hex;
                        to: import("viem").Address | null;
                        transactionIndex: number | null;
                        typeHex: import("viem").Hex | null;
                        v: bigint;
                        value: bigint;
                        yParity: number;
                        accessList: import("viem").AccessList;
                        authorizationList: import("viem").SignedAuthorizationList;
                        blobVersionedHashes?: undefined | undefined;
                        chainId: number;
                        type: "eip7702";
                        gasPrice?: undefined | undefined;
                        maxFeePerBlobGas?: undefined | undefined;
                        maxFeePerGas: bigint;
                        maxPriorityFeePerGas: bigint;
                        isSystemTx?: undefined | undefined;
                        mint?: undefined | undefined;
                        sourceHash?: undefined | undefined;
                    }) & {};
                    type: "transaction";
                };
                readonly transactionReceipt: {
                    exclude: [] | undefined;
                    format: (args: import("viem/chains").OpStackRpcTransactionReceipt) => {
                        blobGasPrice?: bigint | undefined;
                        blobGasUsed?: bigint | undefined;
                        blockHash: import("viem").Hash;
                        blockNumber: bigint;
                        contractAddress: import("viem").Address | null | undefined;
                        cumulativeGasUsed: bigint;
                        effectiveGasPrice: bigint;
                        from: import("viem").Address;
                        gasUsed: bigint;
                        logs: import("viem").Log<bigint, number, false>[];
                        logsBloom: import("viem").Hex;
                        root?: `0x${string}` | undefined;
                        status: "success" | "reverted";
                        to: import("viem").Address | null;
                        transactionHash: import("viem").Hash;
                        transactionIndex: number;
                        type: import("viem").TransactionType;
                        l1GasPrice: bigint | null;
                        l1GasUsed: bigint | null;
                        l1Fee: bigint | null;
                        l1FeeScalar: number | null;
                    } & {};
                    type: "transactionReceipt";
                };
            };
            serializers: {
                readonly transaction: typeof import("viem/chains").serializeTransactionOpStack;
            };
        };
        name: string;
        rpc: string;
    };
    10: {
        chain: {
            blockExplorers: {
                readonly default: {
                    readonly name: "Optimism Explorer";
                    readonly url: "https://optimistic.etherscan.io";
                    readonly apiUrl: "https://api-optimistic.etherscan.io/api";
                };
            };
            blockTime: 2000;
            contracts: {
                readonly disputeGameFactory: {
                    readonly 1: {
                        readonly address: "0xe5965Ab5962eDc7477C8520243A95517CD252fA9";
                    };
                };
                readonly l2OutputOracle: {
                    readonly 1: {
                        readonly address: "0xdfe97868233d1aa22e815a266982f2cf17685a27";
                    };
                };
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 4286263;
                };
                readonly portal: {
                    readonly 1: {
                        readonly address: "0xbEb5Fc579115071764c7423A4f12eDde41f106Ed";
                    };
                };
                readonly l1StandardBridge: {
                    readonly 1: {
                        readonly address: "0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1";
                    };
                };
                readonly gasPriceOracle: {
                    readonly address: "0x420000000000000000000000000000000000000F";
                };
                readonly l1Block: {
                    readonly address: "0x4200000000000000000000000000000000000015";
                };
                readonly l2CrossDomainMessenger: {
                    readonly address: "0x4200000000000000000000000000000000000007";
                };
                readonly l2Erc721Bridge: {
                    readonly address: "0x4200000000000000000000000000000000000014";
                };
                readonly l2StandardBridge: {
                    readonly address: "0x4200000000000000000000000000000000000010";
                };
                readonly l2ToL1MessagePasser: {
                    readonly address: "0x4200000000000000000000000000000000000016";
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 10;
            name: "OP Mainnet";
            nativeCurrency: {
                readonly name: "Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://mainnet.optimism.io"];
                };
            };
            sourceId: 1;
            testnet?: boolean | undefined | undefined;
            custom?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters: {
                readonly block: {
                    exclude: [] | undefined;
                    format: (args: import("viem/chains").OpStackRpcBlock) => {
                        baseFeePerGas: bigint | null;
                        blobGasUsed: bigint;
                        difficulty: bigint;
                        excessBlobGas: bigint;
                        extraData: import("viem").Hex;
                        gasLimit: bigint;
                        gasUsed: bigint;
                        hash: `0x${string}` | null;
                        logsBloom: `0x${string}` | null;
                        miner: import("viem").Address;
                        mixHash: import("viem").Hash;
                        nonce: `0x${string}` | null;
                        number: bigint | null;
                        parentBeaconBlockRoot?: `0x${string}` | undefined;
                        parentHash: import("viem").Hash;
                        receiptsRoot: import("viem").Hex;
                        sealFields: import("viem").Hex[];
                        sha3Uncles: import("viem").Hash;
                        size: bigint;
                        stateRoot: import("viem").Hash;
                        timestamp: bigint;
                        totalDifficulty: bigint | null;
                        transactions: `0x${string}`[] | import("viem/chains").OpStackTransaction<boolean>[];
                        transactionsRoot: import("viem").Hash;
                        uncles: import("viem").Hash[];
                        withdrawals?: import("viem").Withdrawal[] | undefined | undefined;
                        withdrawalsRoot?: `0x${string}` | undefined;
                    } & {};
                    type: "block";
                };
                readonly transaction: {
                    exclude: [] | undefined;
                    format: (args: import("viem/chains").OpStackRpcTransaction) => ({
                        blockHash: `0x${string}` | null;
                        blockNumber: bigint | null;
                        from: import("viem").Address;
                        gas: bigint;
                        hash: import("viem").Hash;
                        input: import("viem").Hex;
                        nonce: number;
                        r: import("viem").Hex;
                        s: import("viem").Hex;
                        to: import("viem").Address | null;
                        transactionIndex: number | null;
                        typeHex: import("viem").Hex | null;
                        v: bigint;
                        value: bigint;
                        yParity: number;
                        gasPrice?: undefined | undefined;
                        maxFeePerBlobGas?: undefined | undefined;
                        maxFeePerGas: bigint;
                        maxPriorityFeePerGas: bigint;
                        isSystemTx?: boolean;
                        mint?: bigint | undefined | undefined;
                        sourceHash: import("viem").Hex;
                        type: "deposit";
                    } | {
                        r: import("viem").Hex;
                        s: import("viem").Hex;
                        v: bigint;
                        value: bigint;
                        gas: bigint;
                        to: import("viem").Address | null;
                        from: import("viem").Address;
                        nonce: number;
                        blockHash: `0x${string}` | null;
                        blockNumber: bigint | null;
                        transactionIndex: number | null;
                        hash: import("viem").Hash;
                        input: import("viem").Hex;
                        typeHex: import("viem").Hex | null;
                        accessList?: undefined | undefined;
                        authorizationList?: undefined | undefined;
                        blobVersionedHashes?: undefined | undefined;
                        chainId?: number | undefined;
                        yParity?: undefined | undefined;
                        type: "legacy";
                        gasPrice: bigint;
                        maxFeePerBlobGas?: undefined | undefined;
                        maxFeePerGas?: undefined | undefined;
                        maxPriorityFeePerGas?: undefined | undefined;
                        isSystemTx?: undefined | undefined;
                        mint?: undefined | undefined;
                        sourceHash?: undefined | undefined;
                    } | {
                        blockHash: `0x${string}` | null;
                        blockNumber: bigint | null;
                        from: import("viem").Address;
                        gas: bigint;
                        hash: import("viem").Hash;
                        input: import("viem").Hex;
                        nonce: number;
                        r: import("viem").Hex;
                        s: import("viem").Hex;
                        to: import("viem").Address | null;
                        transactionIndex: number | null;
                        typeHex: import("viem").Hex | null;
                        v: bigint;
                        value: bigint;
                        yParity: number;
                        accessList: import("viem").AccessList;
                        authorizationList?: undefined | undefined;
                        blobVersionedHashes?: undefined | undefined;
                        chainId: number;
                        type: "eip2930";
                        gasPrice: bigint;
                        maxFeePerBlobGas?: undefined | undefined;
                        maxFeePerGas?: undefined | undefined;
                        maxPriorityFeePerGas?: undefined | undefined;
                        isSystemTx?: undefined | undefined;
                        mint?: undefined | undefined;
                        sourceHash?: undefined | undefined;
                    } | {
                        blockHash: `0x${string}` | null;
                        blockNumber: bigint | null;
                        from: import("viem").Address;
                        gas: bigint;
                        hash: import("viem").Hash;
                        input: import("viem").Hex;
                        nonce: number;
                        r: import("viem").Hex;
                        s: import("viem").Hex;
                        to: import("viem").Address | null;
                        transactionIndex: number | null;
                        typeHex: import("viem").Hex | null;
                        v: bigint;
                        value: bigint;
                        yParity: number;
                        accessList: import("viem").AccessList;
                        authorizationList?: undefined | undefined;
                        blobVersionedHashes?: undefined | undefined;
                        chainId: number;
                        type: "eip1559";
                        gasPrice?: undefined | undefined;
                        maxFeePerBlobGas?: undefined | undefined;
                        maxFeePerGas: bigint;
                        maxPriorityFeePerGas: bigint;
                        isSystemTx?: undefined | undefined;
                        mint?: undefined | undefined;
                        sourceHash?: undefined | undefined;
                    } | {
                        blockHash: `0x${string}` | null;
                        blockNumber: bigint | null;
                        from: import("viem").Address;
                        gas: bigint;
                        hash: import("viem").Hash;
                        input: import("viem").Hex;
                        nonce: number;
                        r: import("viem").Hex;
                        s: import("viem").Hex;
                        to: import("viem").Address | null;
                        transactionIndex: number | null;
                        typeHex: import("viem").Hex | null;
                        v: bigint;
                        value: bigint;
                        yParity: number;
                        accessList: import("viem").AccessList;
                        authorizationList?: undefined | undefined;
                        blobVersionedHashes: readonly import("viem").Hex[];
                        chainId: number;
                        type: "eip4844";
                        gasPrice?: undefined | undefined;
                        maxFeePerBlobGas: bigint;
                        maxFeePerGas: bigint;
                        maxPriorityFeePerGas: bigint;
                        isSystemTx?: undefined | undefined;
                        mint?: undefined | undefined;
                        sourceHash?: undefined | undefined;
                    } | {
                        blockHash: `0x${string}` | null;
                        blockNumber: bigint | null;
                        from: import("viem").Address;
                        gas: bigint;
                        hash: import("viem").Hash;
                        input: import("viem").Hex;
                        nonce: number;
                        r: import("viem").Hex;
                        s: import("viem").Hex;
                        to: import("viem").Address | null;
                        transactionIndex: number | null;
                        typeHex: import("viem").Hex | null;
                        v: bigint;
                        value: bigint;
                        yParity: number;
                        accessList: import("viem").AccessList;
                        authorizationList: import("viem").SignedAuthorizationList;
                        blobVersionedHashes?: undefined | undefined;
                        chainId: number;
                        type: "eip7702";
                        gasPrice?: undefined | undefined;
                        maxFeePerBlobGas?: undefined | undefined;
                        maxFeePerGas: bigint;
                        maxPriorityFeePerGas: bigint;
                        isSystemTx?: undefined | undefined;
                        mint?: undefined | undefined;
                        sourceHash?: undefined | undefined;
                    }) & {};
                    type: "transaction";
                };
                readonly transactionReceipt: {
                    exclude: [] | undefined;
                    format: (args: import("viem/chains").OpStackRpcTransactionReceipt) => {
                        blobGasPrice?: bigint | undefined;
                        blobGasUsed?: bigint | undefined;
                        blockHash: import("viem").Hash;
                        blockNumber: bigint;
                        contractAddress: import("viem").Address | null | undefined;
                        cumulativeGasUsed: bigint;
                        effectiveGasPrice: bigint;
                        from: import("viem").Address;
                        gasUsed: bigint;
                        logs: import("viem").Log<bigint, number, false>[];
                        logsBloom: import("viem").Hex;
                        root?: `0x${string}` | undefined;
                        status: "success" | "reverted";
                        to: import("viem").Address | null;
                        transactionHash: import("viem").Hash;
                        transactionIndex: number;
                        type: import("viem").TransactionType;
                        l1GasPrice: bigint | null;
                        l1GasUsed: bigint | null;
                        l1Fee: bigint | null;
                        l1FeeScalar: number | null;
                    } & {};
                    type: "transactionReceipt";
                };
            };
            serializers: {
                readonly transaction: typeof import("viem/chains").serializeTransactionOpStack;
            };
        };
        name: string;
        rpc: string;
    };
    11155111: {
        chain: {
            blockExplorers: {
                readonly default: {
                    readonly name: "Etherscan";
                    readonly url: "https://sepolia.etherscan.io";
                    readonly apiUrl: "https://api-sepolia.etherscan.io/api";
                };
            };
            blockTime?: number | undefined | undefined;
            contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 751532;
                };
                readonly ensUniversalResolver: {
                    readonly address: "0xeeeeeeee14d718c2b47d9923deab1335e144eeee";
                    readonly blockCreated: 8928790;
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 11155111;
            name: "Sepolia";
            nativeCurrency: {
                readonly name: "Sepolia Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://sepolia.drpc.org"];
                };
            };
            sourceId?: number | undefined | undefined;
            testnet: true;
            custom?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters?: undefined;
            serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
        };
        name: string;
        rpc: string;
    };
    421614: {
        chain: {
            blockExplorers: {
                readonly default: {
                    readonly name: "Arbiscan";
                    readonly url: "https://sepolia.arbiscan.io";
                    readonly apiUrl: "https://api-sepolia.arbiscan.io/api";
                };
            };
            blockTime: 250;
            contracts: {
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 81930;
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 421614;
            name: "Arbitrum Sepolia";
            nativeCurrency: {
                readonly name: "Arbitrum Sepolia Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://sepolia-rollup.arbitrum.io/rpc"];
                };
            };
            sourceId?: number | undefined | undefined;
            testnet: true;
            custom?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters?: undefined;
            serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
        };
        name: string;
        rpc: string;
    };
    84532: {
        chain: {
            blockExplorers: {
                readonly default: {
                    readonly name: "Basescan";
                    readonly url: "https://sepolia.basescan.org";
                    readonly apiUrl: "https://api-sepolia.basescan.org/api";
                };
            };
            blockTime: 2000;
            contracts: {
                readonly disputeGameFactory: {
                    readonly 11155111: {
                        readonly address: "0xd6E6dBf4F7EA0ac412fD8b65ED297e64BB7a06E1";
                    };
                };
                readonly l2OutputOracle: {
                    readonly 11155111: {
                        readonly address: "0x84457ca9D0163FbC4bbfe4Dfbb20ba46e48DF254";
                    };
                };
                readonly portal: {
                    readonly 11155111: {
                        readonly address: "0x49f53e41452c74589e85ca1677426ba426459e85";
                        readonly blockCreated: 4446677;
                    };
                };
                readonly l1StandardBridge: {
                    readonly 11155111: {
                        readonly address: "0xfd0Bf71F60660E2f608ed56e1659C450eB113120";
                        readonly blockCreated: 4446677;
                    };
                };
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 1059647;
                };
                readonly gasPriceOracle: {
                    readonly address: "0x420000000000000000000000000000000000000F";
                };
                readonly l1Block: {
                    readonly address: "0x4200000000000000000000000000000000000015";
                };
                readonly l2CrossDomainMessenger: {
                    readonly address: "0x4200000000000000000000000000000000000007";
                };
                readonly l2Erc721Bridge: {
                    readonly address: "0x4200000000000000000000000000000000000014";
                };
                readonly l2StandardBridge: {
                    readonly address: "0x4200000000000000000000000000000000000010";
                };
                readonly l2ToL1MessagePasser: {
                    readonly address: "0x4200000000000000000000000000000000000016";
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 84532;
            name: "Base Sepolia";
            nativeCurrency: {
                readonly name: "Sepolia Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://sepolia.base.org"];
                };
            };
            sourceId: 11155111;
            testnet: true;
            custom?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters: {
                readonly block: {
                    exclude: [] | undefined;
                    format: (args: import("viem/chains").OpStackRpcBlock) => {
                        baseFeePerGas: bigint | null;
                        blobGasUsed: bigint;
                        difficulty: bigint;
                        excessBlobGas: bigint;
                        extraData: import("viem").Hex;
                        gasLimit: bigint;
                        gasUsed: bigint;
                        hash: `0x${string}` | null;
                        logsBloom: `0x${string}` | null;
                        miner: import("viem").Address;
                        mixHash: import("viem").Hash;
                        nonce: `0x${string}` | null;
                        number: bigint | null;
                        parentBeaconBlockRoot?: `0x${string}` | undefined;
                        parentHash: import("viem").Hash;
                        receiptsRoot: import("viem").Hex;
                        sealFields: import("viem").Hex[];
                        sha3Uncles: import("viem").Hash;
                        size: bigint;
                        stateRoot: import("viem").Hash;
                        timestamp: bigint;
                        totalDifficulty: bigint | null;
                        transactions: `0x${string}`[] | import("viem/chains").OpStackTransaction<boolean>[];
                        transactionsRoot: import("viem").Hash;
                        uncles: import("viem").Hash[];
                        withdrawals?: import("viem").Withdrawal[] | undefined | undefined;
                        withdrawalsRoot?: `0x${string}` | undefined;
                    } & {};
                    type: "block";
                };
                readonly transaction: {
                    exclude: [] | undefined;
                    format: (args: import("viem/chains").OpStackRpcTransaction) => ({
                        blockHash: `0x${string}` | null;
                        blockNumber: bigint | null;
                        from: import("viem").Address;
                        gas: bigint;
                        hash: import("viem").Hash;
                        input: import("viem").Hex;
                        nonce: number;
                        r: import("viem").Hex;
                        s: import("viem").Hex;
                        to: import("viem").Address | null;
                        transactionIndex: number | null;
                        typeHex: import("viem").Hex | null;
                        v: bigint;
                        value: bigint;
                        yParity: number;
                        gasPrice?: undefined | undefined;
                        maxFeePerBlobGas?: undefined | undefined;
                        maxFeePerGas: bigint;
                        maxPriorityFeePerGas: bigint;
                        isSystemTx?: boolean;
                        mint?: bigint | undefined | undefined;
                        sourceHash: import("viem").Hex;
                        type: "deposit";
                    } | {
                        r: import("viem").Hex;
                        s: import("viem").Hex;
                        v: bigint;
                        value: bigint;
                        gas: bigint;
                        to: import("viem").Address | null;
                        from: import("viem").Address;
                        nonce: number;
                        blockHash: `0x${string}` | null;
                        blockNumber: bigint | null;
                        transactionIndex: number | null;
                        hash: import("viem").Hash;
                        input: import("viem").Hex;
                        typeHex: import("viem").Hex | null;
                        accessList?: undefined | undefined;
                        authorizationList?: undefined | undefined;
                        blobVersionedHashes?: undefined | undefined;
                        chainId?: number | undefined;
                        yParity?: undefined | undefined;
                        type: "legacy";
                        gasPrice: bigint;
                        maxFeePerBlobGas?: undefined | undefined;
                        maxFeePerGas?: undefined | undefined;
                        maxPriorityFeePerGas?: undefined | undefined;
                        isSystemTx?: undefined | undefined;
                        mint?: undefined | undefined;
                        sourceHash?: undefined | undefined;
                    } | {
                        blockHash: `0x${string}` | null;
                        blockNumber: bigint | null;
                        from: import("viem").Address;
                        gas: bigint;
                        hash: import("viem").Hash;
                        input: import("viem").Hex;
                        nonce: number;
                        r: import("viem").Hex;
                        s: import("viem").Hex;
                        to: import("viem").Address | null;
                        transactionIndex: number | null;
                        typeHex: import("viem").Hex | null;
                        v: bigint;
                        value: bigint;
                        yParity: number;
                        accessList: import("viem").AccessList;
                        authorizationList?: undefined | undefined;
                        blobVersionedHashes?: undefined | undefined;
                        chainId: number;
                        type: "eip2930";
                        gasPrice: bigint;
                        maxFeePerBlobGas?: undefined | undefined;
                        maxFeePerGas?: undefined | undefined;
                        maxPriorityFeePerGas?: undefined | undefined;
                        isSystemTx?: undefined | undefined;
                        mint?: undefined | undefined;
                        sourceHash?: undefined | undefined;
                    } | {
                        blockHash: `0x${string}` | null;
                        blockNumber: bigint | null;
                        from: import("viem").Address;
                        gas: bigint;
                        hash: import("viem").Hash;
                        input: import("viem").Hex;
                        nonce: number;
                        r: import("viem").Hex;
                        s: import("viem").Hex;
                        to: import("viem").Address | null;
                        transactionIndex: number | null;
                        typeHex: import("viem").Hex | null;
                        v: bigint;
                        value: bigint;
                        yParity: number;
                        accessList: import("viem").AccessList;
                        authorizationList?: undefined | undefined;
                        blobVersionedHashes?: undefined | undefined;
                        chainId: number;
                        type: "eip1559";
                        gasPrice?: undefined | undefined;
                        maxFeePerBlobGas?: undefined | undefined;
                        maxFeePerGas: bigint;
                        maxPriorityFeePerGas: bigint;
                        isSystemTx?: undefined | undefined;
                        mint?: undefined | undefined;
                        sourceHash?: undefined | undefined;
                    } | {
                        blockHash: `0x${string}` | null;
                        blockNumber: bigint | null;
                        from: import("viem").Address;
                        gas: bigint;
                        hash: import("viem").Hash;
                        input: import("viem").Hex;
                        nonce: number;
                        r: import("viem").Hex;
                        s: import("viem").Hex;
                        to: import("viem").Address | null;
                        transactionIndex: number | null;
                        typeHex: import("viem").Hex | null;
                        v: bigint;
                        value: bigint;
                        yParity: number;
                        accessList: import("viem").AccessList;
                        authorizationList?: undefined | undefined;
                        blobVersionedHashes: readonly import("viem").Hex[];
                        chainId: number;
                        type: "eip4844";
                        gasPrice?: undefined | undefined;
                        maxFeePerBlobGas: bigint;
                        maxFeePerGas: bigint;
                        maxPriorityFeePerGas: bigint;
                        isSystemTx?: undefined | undefined;
                        mint?: undefined | undefined;
                        sourceHash?: undefined | undefined;
                    } | {
                        blockHash: `0x${string}` | null;
                        blockNumber: bigint | null;
                        from: import("viem").Address;
                        gas: bigint;
                        hash: import("viem").Hash;
                        input: import("viem").Hex;
                        nonce: number;
                        r: import("viem").Hex;
                        s: import("viem").Hex;
                        to: import("viem").Address | null;
                        transactionIndex: number | null;
                        typeHex: import("viem").Hex | null;
                        v: bigint;
                        value: bigint;
                        yParity: number;
                        accessList: import("viem").AccessList;
                        authorizationList: import("viem").SignedAuthorizationList;
                        blobVersionedHashes?: undefined | undefined;
                        chainId: number;
                        type: "eip7702";
                        gasPrice?: undefined | undefined;
                        maxFeePerBlobGas?: undefined | undefined;
                        maxFeePerGas: bigint;
                        maxPriorityFeePerGas: bigint;
                        isSystemTx?: undefined | undefined;
                        mint?: undefined | undefined;
                        sourceHash?: undefined | undefined;
                    }) & {};
                    type: "transaction";
                };
                readonly transactionReceipt: {
                    exclude: [] | undefined;
                    format: (args: import("viem/chains").OpStackRpcTransactionReceipt) => {
                        blobGasPrice?: bigint | undefined;
                        blobGasUsed?: bigint | undefined;
                        blockHash: import("viem").Hash;
                        blockNumber: bigint;
                        contractAddress: import("viem").Address | null | undefined;
                        cumulativeGasUsed: bigint;
                        effectiveGasPrice: bigint;
                        from: import("viem").Address;
                        gasUsed: bigint;
                        logs: import("viem").Log<bigint, number, false>[];
                        logsBloom: import("viem").Hex;
                        root?: `0x${string}` | undefined;
                        status: "success" | "reverted";
                        to: import("viem").Address | null;
                        transactionHash: import("viem").Hash;
                        transactionIndex: number;
                        type: import("viem").TransactionType;
                        l1GasPrice: bigint | null;
                        l1GasUsed: bigint | null;
                        l1Fee: bigint | null;
                        l1FeeScalar: number | null;
                    } & {};
                    type: "transactionReceipt";
                };
            };
            serializers: {
                readonly transaction: typeof import("viem/chains").serializeTransactionOpStack;
            };
            readonly network: "base-sepolia";
        };
        name: string;
        rpc: string;
    };
    11155420: {
        chain: {
            blockExplorers: {
                readonly default: {
                    readonly name: "Blockscout";
                    readonly url: "https://optimism-sepolia.blockscout.com";
                    readonly apiUrl: "https://optimism-sepolia.blockscout.com/api";
                };
            };
            blockTime: 2000;
            contracts: {
                readonly disputeGameFactory: {
                    readonly 11155111: {
                        readonly address: "0x05F9613aDB30026FFd634f38e5C4dFd30a197Fa1";
                    };
                };
                readonly l2OutputOracle: {
                    readonly 11155111: {
                        readonly address: "0x90E9c4f8a994a250F6aEfd61CAFb4F2e895D458F";
                    };
                };
                readonly multicall3: {
                    readonly address: "0xca11bde05977b3631167028862be2a173976ca11";
                    readonly blockCreated: 1620204;
                };
                readonly portal: {
                    readonly 11155111: {
                        readonly address: "0x16Fc5058F25648194471939df75CF27A2fdC48BC";
                    };
                };
                readonly l1StandardBridge: {
                    readonly 11155111: {
                        readonly address: "0xFBb0621E0B23b5478B630BD55a5f21f67730B0F1";
                    };
                };
                readonly gasPriceOracle: {
                    readonly address: "0x420000000000000000000000000000000000000F";
                };
                readonly l1Block: {
                    readonly address: "0x4200000000000000000000000000000000000015";
                };
                readonly l2CrossDomainMessenger: {
                    readonly address: "0x4200000000000000000000000000000000000007";
                };
                readonly l2Erc721Bridge: {
                    readonly address: "0x4200000000000000000000000000000000000014";
                };
                readonly l2StandardBridge: {
                    readonly address: "0x4200000000000000000000000000000000000010";
                };
                readonly l2ToL1MessagePasser: {
                    readonly address: "0x4200000000000000000000000000000000000016";
                };
            };
            ensTlds?: readonly string[] | undefined;
            id: 11155420;
            name: "OP Sepolia";
            nativeCurrency: {
                readonly name: "Sepolia Ether";
                readonly symbol: "ETH";
                readonly decimals: 18;
            };
            experimental_preconfirmationTime?: number | undefined | undefined;
            rpcUrls: {
                readonly default: {
                    readonly http: readonly ["https://sepolia.optimism.io"];
                };
            };
            sourceId: 11155111;
            testnet: true;
            custom?: Record<string, unknown> | undefined;
            fees?: import("viem").ChainFees<undefined> | undefined;
            formatters: {
                readonly block: {
                    exclude: [] | undefined;
                    format: (args: import("viem/chains").OpStackRpcBlock) => {
                        baseFeePerGas: bigint | null;
                        blobGasUsed: bigint;
                        difficulty: bigint;
                        excessBlobGas: bigint;
                        extraData: import("viem").Hex;
                        gasLimit: bigint;
                        gasUsed: bigint;
                        hash: `0x${string}` | null;
                        logsBloom: `0x${string}` | null;
                        miner: import("viem").Address;
                        mixHash: import("viem").Hash;
                        nonce: `0x${string}` | null;
                        number: bigint | null;
                        parentBeaconBlockRoot?: `0x${string}` | undefined;
                        parentHash: import("viem").Hash;
                        receiptsRoot: import("viem").Hex;
                        sealFields: import("viem").Hex[];
                        sha3Uncles: import("viem").Hash;
                        size: bigint;
                        stateRoot: import("viem").Hash;
                        timestamp: bigint;
                        totalDifficulty: bigint | null;
                        transactions: `0x${string}`[] | import("viem/chains").OpStackTransaction<boolean>[];
                        transactionsRoot: import("viem").Hash;
                        uncles: import("viem").Hash[];
                        withdrawals?: import("viem").Withdrawal[] | undefined | undefined;
                        withdrawalsRoot?: `0x${string}` | undefined;
                    } & {};
                    type: "block";
                };
                readonly transaction: {
                    exclude: [] | undefined;
                    format: (args: import("viem/chains").OpStackRpcTransaction) => ({
                        blockHash: `0x${string}` | null;
                        blockNumber: bigint | null;
                        from: import("viem").Address;
                        gas: bigint;
                        hash: import("viem").Hash;
                        input: import("viem").Hex;
                        nonce: number;
                        r: import("viem").Hex;
                        s: import("viem").Hex;
                        to: import("viem").Address | null;
                        transactionIndex: number | null;
                        typeHex: import("viem").Hex | null;
                        v: bigint;
                        value: bigint;
                        yParity: number;
                        gasPrice?: undefined | undefined;
                        maxFeePerBlobGas?: undefined | undefined;
                        maxFeePerGas: bigint;
                        maxPriorityFeePerGas: bigint;
                        isSystemTx?: boolean;
                        mint?: bigint | undefined | undefined;
                        sourceHash: import("viem").Hex;
                        type: "deposit";
                    } | {
                        r: import("viem").Hex;
                        s: import("viem").Hex;
                        v: bigint;
                        value: bigint;
                        gas: bigint;
                        to: import("viem").Address | null;
                        from: import("viem").Address;
                        nonce: number;
                        blockHash: `0x${string}` | null;
                        blockNumber: bigint | null;
                        transactionIndex: number | null;
                        hash: import("viem").Hash;
                        input: import("viem").Hex;
                        typeHex: import("viem").Hex | null;
                        accessList?: undefined | undefined;
                        authorizationList?: undefined | undefined;
                        blobVersionedHashes?: undefined | undefined;
                        chainId?: number | undefined;
                        yParity?: undefined | undefined;
                        type: "legacy";
                        gasPrice: bigint;
                        maxFeePerBlobGas?: undefined | undefined;
                        maxFeePerGas?: undefined | undefined;
                        maxPriorityFeePerGas?: undefined | undefined;
                        isSystemTx?: undefined | undefined;
                        mint?: undefined | undefined;
                        sourceHash?: undefined | undefined;
                    } | {
                        blockHash: `0x${string}` | null;
                        blockNumber: bigint | null;
                        from: import("viem").Address;
                        gas: bigint;
                        hash: import("viem").Hash;
                        input: import("viem").Hex;
                        nonce: number;
                        r: import("viem").Hex;
                        s: import("viem").Hex;
                        to: import("viem").Address | null;
                        transactionIndex: number | null;
                        typeHex: import("viem").Hex | null;
                        v: bigint;
                        value: bigint;
                        yParity: number;
                        accessList: import("viem").AccessList;
                        authorizationList?: undefined | undefined;
                        blobVersionedHashes?: undefined | undefined;
                        chainId: number;
                        type: "eip2930";
                        gasPrice: bigint;
                        maxFeePerBlobGas?: undefined | undefined;
                        maxFeePerGas?: undefined | undefined;
                        maxPriorityFeePerGas?: undefined | undefined;
                        isSystemTx?: undefined | undefined;
                        mint?: undefined | undefined;
                        sourceHash?: undefined | undefined;
                    } | {
                        blockHash: `0x${string}` | null;
                        blockNumber: bigint | null;
                        from: import("viem").Address;
                        gas: bigint;
                        hash: import("viem").Hash;
                        input: import("viem").Hex;
                        nonce: number;
                        r: import("viem").Hex;
                        s: import("viem").Hex;
                        to: import("viem").Address | null;
                        transactionIndex: number | null;
                        typeHex: import("viem").Hex | null;
                        v: bigint;
                        value: bigint;
                        yParity: number;
                        accessList: import("viem").AccessList;
                        authorizationList?: undefined | undefined;
                        blobVersionedHashes?: undefined | undefined;
                        chainId: number;
                        type: "eip1559";
                        gasPrice?: undefined | undefined;
                        maxFeePerBlobGas?: undefined | undefined;
                        maxFeePerGas: bigint;
                        maxPriorityFeePerGas: bigint;
                        isSystemTx?: undefined | undefined;
                        mint?: undefined | undefined;
                        sourceHash?: undefined | undefined;
                    } | {
                        blockHash: `0x${string}` | null;
                        blockNumber: bigint | null;
                        from: import("viem").Address;
                        gas: bigint;
                        hash: import("viem").Hash;
                        input: import("viem").Hex;
                        nonce: number;
                        r: import("viem").Hex;
                        s: import("viem").Hex;
                        to: import("viem").Address | null;
                        transactionIndex: number | null;
                        typeHex: import("viem").Hex | null;
                        v: bigint;
                        value: bigint;
                        yParity: number;
                        accessList: import("viem").AccessList;
                        authorizationList?: undefined | undefined;
                        blobVersionedHashes: readonly import("viem").Hex[];
                        chainId: number;
                        type: "eip4844";
                        gasPrice?: undefined | undefined;
                        maxFeePerBlobGas: bigint;
                        maxFeePerGas: bigint;
                        maxPriorityFeePerGas: bigint;
                        isSystemTx?: undefined | undefined;
                        mint?: undefined | undefined;
                        sourceHash?: undefined | undefined;
                    } | {
                        blockHash: `0x${string}` | null;
                        blockNumber: bigint | null;
                        from: import("viem").Address;
                        gas: bigint;
                        hash: import("viem").Hash;
                        input: import("viem").Hex;
                        nonce: number;
                        r: import("viem").Hex;
                        s: import("viem").Hex;
                        to: import("viem").Address | null;
                        transactionIndex: number | null;
                        typeHex: import("viem").Hex | null;
                        v: bigint;
                        value: bigint;
                        yParity: number;
                        accessList: import("viem").AccessList;
                        authorizationList: import("viem").SignedAuthorizationList;
                        blobVersionedHashes?: undefined | undefined;
                        chainId: number;
                        type: "eip7702";
                        gasPrice?: undefined | undefined;
                        maxFeePerBlobGas?: undefined | undefined;
                        maxFeePerGas: bigint;
                        maxPriorityFeePerGas: bigint;
                        isSystemTx?: undefined | undefined;
                        mint?: undefined | undefined;
                        sourceHash?: undefined | undefined;
                    }) & {};
                    type: "transaction";
                };
                readonly transactionReceipt: {
                    exclude: [] | undefined;
                    format: (args: import("viem/chains").OpStackRpcTransactionReceipt) => {
                        blobGasPrice?: bigint | undefined;
                        blobGasUsed?: bigint | undefined;
                        blockHash: import("viem").Hash;
                        blockNumber: bigint;
                        contractAddress: import("viem").Address | null | undefined;
                        cumulativeGasUsed: bigint;
                        effectiveGasPrice: bigint;
                        from: import("viem").Address;
                        gasUsed: bigint;
                        logs: import("viem").Log<bigint, number, false>[];
                        logsBloom: import("viem").Hex;
                        root?: `0x${string}` | undefined;
                        status: "success" | "reverted";
                        to: import("viem").Address | null;
                        transactionHash: import("viem").Hash;
                        transactionIndex: number;
                        type: import("viem").TransactionType;
                        l1GasPrice: bigint | null;
                        l1GasUsed: bigint | null;
                        l1Fee: bigint | null;
                        l1FeeScalar: number | null;
                    } & {};
                    type: "transactionReceipt";
                };
            };
            serializers: {
                readonly transaction: typeof import("viem/chains").serializeTransactionOpStack;
            };
        };
        name: string;
        rpc: string;
    };
};
export declare const SUPPORTED_TOKENS: {
    WETH: {
        symbol: string;
        decimals: number;
        pythPriceId: string;
        addresses: {
            11155111: string;
            421614: string;
            84532: string;
            11155420: string;
        };
    };
    USDC: {
        symbol: string;
        decimals: number;
        pythPriceId: string;
        addresses: {
            11155111: string;
            421614: string;
            84532: string;
            11155420: string;
        };
    };
};
export interface MEVOpportunity {
    id: string;
    tokenSymbol: string;
    tokenAddress: string;
    sourceChain: number;
    targetChain: number;
    sourcePrice: number;
    targetPrice: number;
    priceDifference: number;
    profitPercentage: number;
    estimatedProfit: number;
    gasEstimate: number;
    confidence: number;
    timestamp: number;
    expiresAt: number;
}
export declare class DecentralizedMEVScanner {
    private clients;
    private isScanning;
    private opportunities;
    private subscribers;
    constructor();
    subscribe(callback: (opportunities: MEVOpportunity[]) => void): () => void;
    private notifySubscribers;
    startScanning(intervalMs?: number): Promise<(() => void) | undefined>;
    private scanOpportunities;
    private checkCrossChainArbitrage;
    private getTokenPrice;
    private getTokenSymbolByAddress;
    private estimateGasCosts;
    getValidOpportunities(): MEVOpportunity[];
    getOpportunityById(id: string): MEVOpportunity | null;
    stopScanning(): void;
}
export declare const mevScanner: DecentralizedMEVScanner;

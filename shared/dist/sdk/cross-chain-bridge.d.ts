export interface CrossChainMessage {
    sourceChain: number;
    targetChain: number;
    payload: string;
    gasLimit: number;
    value: bigint;
}
export interface BridgeQuote {
    estimatedGas: bigint;
    nativeFee: bigint;
    zroFee: bigint;
    totalCost: bigint;
    estimatedTime: number;
}
export declare class CrossChainBridge {
    private clients;
    constructor();
    getQuote(message: CrossChainMessage): Promise<BridgeQuote | null>;
    sendMessage(message: CrossChainMessage): Promise<string | null>;
    getMessageStatus(txHash: string, sourceChain: number): Promise<"pending" | "delivered" | "failed">;
    private getEstimatedTime;
}
export declare const crossChainBridge: CrossChainBridge;

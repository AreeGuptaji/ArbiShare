export interface IPFSConfig {
    gateway: string;
    apiEndpoint?: string;
    pinataApiKey?: string;
    pinataSecretKey?: string;
}
export interface MEVMetadata {
    version: string;
    timestamp: number;
    chainId: number;
    executionId: string;
    user: string;
    opportunity: {
        tokenIn: string;
        tokenOut: string;
        sourceChain: number;
        targetChain: number;
        expectedProfit: string;
        actualProfit?: string;
    };
    execution?: {
        txHash: string;
        blockNumber: number;
        gasUsed: string;
        success: boolean;
        errorReason?: string;
    };
    worldId: {
        nullifierHash: string;
        verified: boolean;
    };
}
export declare class DecentralizedStorage {
    private config;
    constructor(config?: IPFSConfig);
    storeExecutionMetadata(metadata: MEVMetadata): Promise<string | null>;
    getExecutionMetadata(ipfsHash: string): Promise<MEVMetadata | null>;
    storeUserProfile(userAddress: string, profile: any): Promise<string | null>;
    storeOpportunityAnalysis(opportunityId: string, analysis: any): Promise<string | null>;
    pinContent(ipfsHash: string): Promise<boolean>;
    getPinnedContent(): Promise<any[]>;
    private generateMockIPFSHash;
    private getMockDataFromHash;
}
export declare const ipfsStorage: DecentralizedStorage;

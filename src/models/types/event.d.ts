export interface Event {
    id: number;
    address: string;
    transactionHash: string;
    logId: string;
    blockNumber: number;
    topic: string;
    type: string;
}
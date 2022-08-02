export interface Post {
    hash: string;
    author: string;
    blockNumber: number;
    text: string;
    mediaUrl: string;
    parentHash?: string;
    childHash?: string;
    eventId?: number;
}
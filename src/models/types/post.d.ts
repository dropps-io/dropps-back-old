export interface Post {
    hash: string;
    author: string;
    date: Date;
    text: string;
    mediaUrl: string;
    parentHash?: string;
    childHash?: string;
    eventId?: number;
}
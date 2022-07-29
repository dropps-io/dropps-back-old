export interface Post {
    postHash: string;
    sender: string;
    date: Date;
    text: string;
    mediaUrl: string;
    parentHash?: string;
    childHash?: string;
    eventId?: number;
}
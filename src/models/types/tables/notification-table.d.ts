export interface NotificationTable {
  address: string;
  sender: string;
  date: Date;
  type: 'like' | 'follow' | 'comment' | 'repost';
  viewed: boolean;
  postHash?: string;
}

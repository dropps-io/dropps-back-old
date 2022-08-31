export interface Notification {
  address: string,
  sender: string,
  date: Date,
  type: 'like' | 'follow' | 'comment' | 'repost',
  viewed: boolean,
  postHash?: string
}

export interface NotificationWithSenderDetails {
  address: string,
  sender: {
    address: string,
    name: string,
    image: string,
  },
  date: Date,
  type: 'like' | 'follow' | 'comment' | 'repost',
  viewed: boolean,
  postHash?: string
}
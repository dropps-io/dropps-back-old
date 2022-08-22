export interface Notification {
  address: string,
  sender: string,
  date: Date,
  type: string,
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
  type: string,
  viewed: boolean,
  postHash?: string
}
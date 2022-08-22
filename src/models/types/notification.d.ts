export interface Notification {
  address: string,
  sender: string,
  date: Date,
  type: string,
  viewed: boolean,
  postHash?: string
}
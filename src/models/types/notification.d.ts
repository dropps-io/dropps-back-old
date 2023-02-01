import {NotificationTable} from './tables/notification-table';

export interface NotificationWithSenderDetails extends Omit<NotificationTable, 'sender'> {
  sender: {
    address: string,
    name: string,
    image: string,
  },
}
import { NotificationTable } from '../../../models/types/tables/notification-table';
import { executeQuery } from '../database';

export async function queryNotificationsOfAddress(
  address: string,
  limit: number,
  offset: number,
): Promise<NotificationTable[]> {
  const res = await executeQuery(
    'SELECT * FROM "notification" WHERE "address" = $1 ORDER BY date DESC LIMIT $2 OFFSET $3;',
    [address, limit, offset],
  );
  return res.rows as NotificationTable[];
}

export async function queryNotificationsCountOfAddress(address: string): Promise<number> {
  const res = await executeQuery('SELECT COUNT(*) FROM notification WHERE address = $1', [address]);
  return parseInt(res.rows[0].count);
}

export async function queryNotViewedNotificationsCountOfAddress(address: string): Promise<number> {
  const res = await executeQuery(
    'SELECT COUNT(*) FROM notification WHERE address = $1 AND viewed = false',
    [address],
  );
  return parseInt(res.rows[0].count);
}

export async function insertNotification(
  address: string,
  sender: string,
  date: Date,
  type: 'like' | 'follow' | 'comment' | 'repost' | 'tag',
  postHash?: string,
): Promise<void> {
  if (address === sender) return;
  await executeQuery('INSERT INTO "notification" VALUES ($1, $2, $3, $4, $5, $6)', [
    address,
    sender,
    date,
    false,
    type,
    postHash,
  ]);
}

export async function setViewedToAddressNotifications(address: string): Promise<void> {
  await executeQuery('UPDATE "notification" SET viewed = true WHERE address = $1', [address]);
}

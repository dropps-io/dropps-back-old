import {Notification} from '../../models/types/notification';
import {executeQuery} from './database';

export async function queryNotificationsOfAddress(address: string): Promise<Notification[]> {
	const res = await executeQuery('SELECT * FROM "notification" WHERE "address" = $1', [address]);
	return res.rows as Notification[];
}

export async function queryNotificationsCountOfAddress(address: string): Promise<number> {
	const res = await executeQuery('SELECT COUNT(*) FROM "notification" WHERE "address" = $1', [address]);
	return parseInt(res.rows[0].count);
}

export async function insertNotification(address: string, sender: string, date: Date, type: 'like' | 'follow' | 'comment' | 'repost', postHash?: string): Promise<void> {
	await executeQuery('INSERT INTO "notification" VALUES ($1, $2, $3, $4, $5, $6)', [address, sender, date, false, type, postHash]);
}

export async function setViewedToAddressNotifications(address: string): Promise<void> {
	await executeQuery('UPDATE "notification" SET viewed = true WHERE address = $1', [address]);
}

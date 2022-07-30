import {Event} from '../../models/types/event';
import {executeQuery} from './database';
import {ERROR_NOT_FOUND} from '../utils/error-messages';

export async function queryEvent(id: number): Promise<Event> {
	const res = await executeQuery('SELECT * FROM "event" WHERE "id" = $1', [id]);
	return res.rows[0] as Event;
}

export async function insertEvent(address: string, transactionHash: string, logId: string, blockNumber: string, topic: string, type: string): Promise<number> {
	const res = await executeQuery('INSERT INTO "event" ("address", "transactionHash", "logId", "blockNumber", "topic", "type") VALUES ($1, $2, $3, $4, $5, $6) RETURNING "id"', [address, transactionHash, logId, blockNumber, topic, type]);
	return res.rows[0].id;
}

export async function updateEvent(id: number, type: string): Promise<void> {
	const res = await executeQuery('UPDATE "event" SET "type" = $1 WHERE "id" = $2', [type, id]);
	if (res.rowCount === 0) throw ERROR_NOT_FOUND;
}

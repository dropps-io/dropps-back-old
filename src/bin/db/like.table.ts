import {Like} from '../../models/types/like';
import {executeQuery} from './database';
import {ERROR_NOT_FOUND} from '../utils/error-messages';

export async function queryLike(sender: string, postHash: string): Promise<boolean> {
	const res = await executeQuery('SELECT * FROM "like" WHERE "sender" = $1 AND "postHash" = $2', [sender, postHash]);
	return res.rows.length > 0;
}

export async function insertLike(sender: string, postHash: string): Promise<void> {
	await executeQuery('INSERT INTO "like" VALUES ($1, $2)', [sender, postHash]);
}

export async function removeLike(sender: string, postHash: string): Promise<void> {
	const res = await executeQuery('DELETE FROM "like" WHERE "sender" = $1 AND "postHash" = $2', [sender, postHash]);
	if (res.rowCount === 0) throw ERROR_NOT_FOUND;
}

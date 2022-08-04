import {Post} from '../../models/types/post';
import {executeQuery} from './database';

export async function queryPost(hash: string): Promise<Post> {
	const res = await executeQuery('SELECT * FROM "post" WHERE "hash" = $1', [hash]);
	return res.rows[0] as Post;
}

export async function insertPost(hash: string, author: string, date: Date, text: string, mediaUrl: string, parentHash: string | null, childHash: string | null, eventId: number | null): Promise<Post> {
	const res = await executeQuery('INSERT INTO "post" VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [hash, author, date, text, mediaUrl, parentHash, childHash, eventId]);
	return res.rows[0] as Post;
}

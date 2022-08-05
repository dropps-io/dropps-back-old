import {Post} from '../../models/types/post';
import {executeQuery} from './database';

export async function queryPost(hash: string): Promise<Post> {
	const res = await executeQuery('SELECT * FROM "post" WHERE "hash" = $1', [hash]);
	return res.rows[0] as Post;
}

export async function queryPostsOfUser(address: string, limit: number, offset: number): Promise<Post[]> {
	const res = await executeQuery('SELECT * FROM "post" WHERE "author" = $1 AND "parentHash" IS NULL ORDER BY "date" DESC LIMIT $2 OFFSET $3', [address, limit, offset]);
	return res.rows as Post[];
}

export async function insertPost(hash: string, author: string, date: Date, text: string, mediaUrl: string, parentHash: string | null, childHash: string | null, eventId: number | null): Promise<Post> {
	const res = await executeQuery('INSERT INTO "post" VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [hash, author, date, text, mediaUrl, parentHash, childHash, eventId]);
	return res.rows[0] as Post;
}

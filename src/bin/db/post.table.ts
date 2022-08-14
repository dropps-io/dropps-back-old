import {Post} from '../../models/types/post';
import {executeQuery} from './database';

export async function queryPost(hash: string): Promise<Post> {
	const res = await executeQuery('SELECT * FROM "post" WHERE "hash" = $1', [hash]);
	return res.rows[0] as Post;
}

export async function queryPostCommentsCount(hash: string): Promise<number> {
	const res = await executeQuery('SELECT COUNT(*) FROM "post" WHERE "parentHash" = $1', [hash]);
	return parseInt(res.rows[0].count);
}

export async function queryPostRepostsCount(hash: string): Promise<number> {
	const res = await executeQuery('SELECT COUNT(*) FROM "post" WHERE "childHash" = $1', [hash]);
	return parseInt(res.rows[0].count);
}

export async function queryPosts(limit: number, offset: number, type?: 'event' | 'post'): Promise<Post[]> {
	let query = 'SELECT * FROM "post" INNER JOIN "contract" ON post.author=contract.address WHERE "interfaceCode" = \'LSP0\' AND "parentHash" IS NULL';
	if (type) query +=  type === 'event' ? ' AND "eventId" IS NOT NULL' : ' AND "eventId" IS NULL';
	query += ' ORDER BY "date" DESC LIMIT $1 OFFSET $2';
	const res = await executeQuery(query, [limit, offset]);
	return res.rows as Post[];
}

export async function queryPostsOfUser(address: string, limit: number, offset: number, type?: 'event' | 'post'): Promise<Post[]> {
	let query = 'SELECT * FROM "post" WHERE "author" = $1 AND "parentHash" IS NULL';
	if (type) query +=  type === 'event' ? ' AND "eventId" IS NOT NULL' : ' AND "eventId" IS NULL';
	query += ' ORDER BY "date" DESC LIMIT $2 OFFSET $3';
	const res = await executeQuery(query, [address, limit, offset]);
	return res.rows as Post[];
}

export async function queryPostsOfUsers(addresses: string[], limit: number, offset: number,  type?: 'event' | 'post'): Promise<Post[]> {
	const params = addresses.map((a,i) => '$' + (i + 3).toString());
	let query = 'SELECT * FROM "post" WHERE "parentHash" IS NULL AND "author" IN (' + params.join(',') + ')';
	if (type) query +=  type === 'event' ? ' AND "eventId" IS NOT NULL' : ' AND "eventId" IS NULL';
	query += ' ORDER BY "date" DESC LIMIT $1 OFFSET $2';
	const res = await executeQuery(query, [limit, offset, ...addresses]);
	return res.rows as Post[];
}

export async function insertPost(hash: string, author: string, date: Date, text: string, mediaUrl: string, parentHash: string | null, childHash: string | null, eventId: number | null): Promise<Post> {
	const res = await executeQuery('INSERT INTO "post" VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [hash, author, date, text, mediaUrl, parentHash, childHash, eventId]);
	return res.rows[0] as Post;
}

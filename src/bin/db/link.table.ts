import {Link} from '../../models/types/link';
import {executeQuery} from './database';
import {ERROR_NOT_FOUND} from '../utils/error-messages';

export async function queryLinks(address: string): Promise<Link[]> {
	const res = await executeQuery('SELECT * FROM "link" WHERE "address" = $1', [address]);
	if (res.rows.length > 0) return res.rows as Link[];
	else return [];
}

export async function insertLink(address: string, title: string, url: string): Promise<Link> {
	const res = await executeQuery('INSERT INTO "link" VALUES ($1, $2, $3)', [address, title, url]);
	return res.rows[0] as Link;
}

export async function updateLink(address: string, title: string, url: string): Promise<void> {
	const res = await executeQuery('UPDATE "link" SET "url" = $3 WHERE "address" = $1 AND "title" = $2' , [address, title, url]);
	if (res.rowCount === 0) throw ERROR_NOT_FOUND;
}

export async function deleteLink(address: string, title: string, url: string): Promise<void> {
	const res = await executeQuery('DELETE FROM "link" WHERE "address" = $1 AND "title" = $2 AND "url" = $3', [address, title, url]);
	if (res.rowCount === 0) throw ERROR_NOT_FOUND;
}
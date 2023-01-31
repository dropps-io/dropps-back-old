import {TagTable} from '../../models/types/tables/tag-table';
import {executeQuery} from './database';
import {ERROR_NOT_FOUND} from '../utils/error-messages';

export async function queryTags(address: string): Promise<string[]> {
	const res = await executeQuery('SELECT * FROM "tag" WHERE "address" = $1', [address]);
	return res.rows.map((x: { title: string; }) => x.title);
}

export async function insertTag(address: string, title: string): Promise<TagTable> {
	const res = await executeQuery('INSERT INTO "tag" VALUES ($1, $2)', [address, title]);
	return res.rows[0] as TagTable;
}

export async function deleteTag(address: string, title: string): Promise<void> {
	const res = await executeQuery('DELETE FROM "tag" WHERE "address" = $1 AND "title" = $2' , [address, title]);
	if (res.rowCount === 0) throw ERROR_NOT_FOUND;
}
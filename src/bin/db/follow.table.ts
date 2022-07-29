import {Follow} from '../../models/types/follow';
import {executeQuery} from './database';
import {ERROR_NOT_FOUND} from '../utils/error-messages';

export async function queryFollowing(follower: string): Promise<string[]> {
	const res = await executeQuery('SELECT following FROM "follow" WHERE "follower" = $1', [follower]);
	return res.rows.map((x: { following: string; }) => x.following);
}

export async function insertFollow(follower: string, following: string): Promise<void> {
	await executeQuery('INSERT INTO "follow" VALUES ($1, $2)', [follower, following]);
}

export async function removeFollow(follower: string, following: string): Promise<void> {
	const res = await executeQuery('DELETE FROM "follow" WHERE "follower" = $1 AND "following" = $2', [follower, following]);
	if (res.rowCount === 0) throw ERROR_NOT_FOUND;
}

import {User} from '../../models/types/user';
import {executeQuery} from './database';
import {ERROR_USER_NOT_FOUND} from '../utils/error-messages';

export async function queryUser(address: string): Promise<User> {
	const res = await executeQuery('SELECT * FROM "users" WHERE "address" = $1', [address]);
	return res.rows[0] as User;
}

export async function insertUser(address: string, selectedProfile: string): Promise<User> {
	const res = await executeQuery('INSERT INTO "users" VALUES ($1, $2)', [address, selectedProfile]);
	return res.rows[0] as User;
}

export async function updateUser(address: string, newSelectedProfile: string): Promise<void> {
	const res = await executeQuery('UPDATE "users" SET "selectedProfile" = $1 WHERE "address" = $2', [newSelectedProfile, address]);
	if (res.rowCount === 0) throw ERROR_USER_NOT_FOUND;
}

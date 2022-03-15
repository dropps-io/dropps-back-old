import {User} from '../../lib/models/types/user';
import {executeQuery} from './mysql';
import {ERROR_USER_NOT_FOUND} from '../utils/error-messages';

export async function queryUser(address: string): Promise<User> {
	const res = await executeQuery('SELECT * FROM users WHERE address = ?;', [address]);
	return res[0] as User;
}

export async function insertUser(address: string, selectedProfile: string): Promise<User> {
	const res = await executeQuery('INSERT INTO users VALUES (?, ?);', [address, selectedProfile]);
	return res[0] as User;
}

export async function updateUser(address: string, newSelectedProfile: string): Promise<void> {
	const res = await executeQuery('UPDATE users SET selectedProfile = ? WHERE address = ?;', [newSelectedProfile, address]);
	if (res.changedRows === 0) throw ERROR_USER_NOT_FOUND;
}

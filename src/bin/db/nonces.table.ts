import {executeQuery} from './mysql';
import {ERROR_USER_NOT_FOUND} from '../utils/error-messages';
import {generateRandomNonce} from '../utils/nonce-generator';

export async function queryNonce(userAddress: string): Promise<string> {
	const res = await executeQuery('SELECT nonce FROM nonces WHERE userAddress = ?;', [userAddress]);
	if (!res[0]) return '';
	else return res[0].nonce;
}

export async function insertNonce(userAddress: string): Promise<string> {
	const nonce = generateRandomNonce();
	await executeQuery('INSERT INTO nonces VALUES (?, ?);', [userAddress, nonce])
	return nonce;
}

export async function updateNonce(userAddress: string): Promise<string> {
		const nonce = generateRandomNonce();
		const res = await executeQuery('UPDATE nonces SET nonce =  ? WHERE userAddress = ?;', [nonce, userAddress]);
		if (res.changedRows === 0) throw ERROR_USER_NOT_FOUND;
		else return nonce;
}

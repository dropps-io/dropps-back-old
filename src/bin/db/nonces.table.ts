import {executeQuery} from './database';
import {ERROR_USER_NOT_FOUND} from '../utils/error-messages';
import {generateRandomNonce} from '../utils/nonce-generator';

export async function queryNonce(userAddress: string): Promise<string> {
	const res = await executeQuery('SELECT "nonce" FROM "nonces" WHERE "userAddress" = $1', [userAddress]);
	if (!res.rows[0]) return '';
	else return res.rows[0].nonce;
}

export async function insertNonce(userAddress: string): Promise<string> {
	const nonce = generateRandomNonce();
	await executeQuery('INSERT INTO "nonces" VALUES ($1, $2)', [userAddress, nonce])
	return nonce;
}

export async function updateNonce(userAddress: string): Promise<string> {
	const nonce = generateRandomNonce();
	const res = await executeQuery('UPDATE "nonces" SET "nonce" = $1 WHERE "userAddress" = $2', [nonce, userAddress]);
	if (res.rowCount === 0) throw ERROR_USER_NOT_FOUND;
	else return nonce;
}

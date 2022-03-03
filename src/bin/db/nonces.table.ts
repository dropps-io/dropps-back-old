import {DB} from './mysql';
import {ERROR_USER_NOT_FOUND} from '../utils/error-messages';
import {generateRandomNonce} from '../utils/nonce-generator';

export async function queryNonce(userAddress: string): Promise<string> {
	return new Promise((resolve, reject) => {

		DB.query('SELECT nonce FROM nonces WHERE userAddress = \'' + userAddress +'\';', (err, res) => {
			if (err) reject(err);
			if (!res[0]) resolve('');
			else resolve(res[0].nonce);
		});

	});
}

export async function insertNonce(userAddress: string): Promise<string> {
	return new Promise((resolve, reject) => {

		const nonce = generateRandomNonce();
		DB.query('INSERT INTO nonces VALUES (\'' + userAddress + '\', \'' + nonce +'\');', (err) => {
			if (err) reject(err);
			resolve(nonce);
		});

	});
}

export async function updateNonce(userAddress: string): Promise<string> {
	return new Promise((resolve, reject) => {

		const nonce = generateRandomNonce();
		DB.query('UPDATE nonces SET nonce =  \'' + nonce +'\' WHERE userAddress = \'' + userAddress +'\';', (err, res) => {
			if (err) reject(err);
			if (res.changedRows === 0) reject(ERROR_USER_NOT_FOUND);
			else resolve(nonce);
		});

	});
}

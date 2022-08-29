import {Transaction} from '../../models/types/transaction';
import {executeQuery} from './database';

export async function queryTransaction(hash: string): Promise<Transaction> {
	const res = await executeQuery('SELECT * FROM "transaction" WHERE "hash" = $1', [hash]);
	return res.rows[0] as Transaction;
}

export async function insertTransaction(hash: string, from: string, to: string, value: string, input: string, blockNumber: number): Promise<void> {
	await executeQuery('INSERT INTO "transaction" VALUES ($1, $2, $3, $4, $5, $6, $7)', [hash, from, to, value, input, blockNumber, input.slice(0, 10)]);
}

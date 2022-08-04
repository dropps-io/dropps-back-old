import {DataChanged} from '../../models/types/data-changed';
import {executeQuery} from './database';

export async function insertDataChanged(address: string, key: string, value: string, blockNumber: number): Promise<void> {
	await executeQuery('INSERT INTO "data_changed" VALUES ($1, $2, $3, $4)', [address, key, value, blockNumber]);
}

export async function queryDataKeyValue(address: string, key: string): Promise<string> {
	const res = await executeQuery('SELECT * FROM "data_changed" WHERE "address" = $1 AND "key" = $2 ORDER BY "blockNumber" DESC LIMIT 1', [address, key]);
	return (res.rows[0] as DataChanged).value;
}

export async function queryDataKeyHistory(address: string, key: string): Promise<DataChanged[]> {
	const res = await executeQuery('SELECT * FROM "data_changed" WHERE "address" = $1 AND "key" = $2 ORDER BY "blockNumber"', [address, key]);
	return res.rows as DataChanged[];
}
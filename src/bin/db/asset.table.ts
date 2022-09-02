import {Asset} from '../../models/types/asset';
import {executeQuery} from './database';
import {ERROR_NOT_FOUND} from '../utils/error-messages';

export async function queryAssets(address: string): Promise<Asset[]> {
	const res = await executeQuery('SELECT * FROM "asset" WHERE "address" = $1', [address]);
	if (res.rows.length > 0) return res.rows as Asset[];
	else return [];
}

export async function queryAssetsByType(address: string, fileType: string): Promise<Asset[]> {
	const res = await executeQuery('SELECT * FROM "asset" WHERE "address" = $1 AND "fileType" = $2', [address, fileType]);
	if (res.rows.length > 0) return res.rows as Asset[];
	else return [];
}

export async function insertAsset(address: string, url: string, fileType: string, hash: string): Promise<Asset> {
	const res = await executeQuery('INSERT INTO "asset" VALUES ($1, $2, $3, $4)', [address, url, fileType, hash]);
	return res.rows[0] as Asset;
}

export async function deleteAsset(address: string, url: string): Promise<void> {
	const res = await executeQuery('DELETE FROM "asset" WHERE "address" = $1 AND "url" = $2', [address, url]);
	if (res.rowCount === 0) throw ERROR_NOT_FOUND;
}

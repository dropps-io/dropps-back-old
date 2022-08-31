import {ChainSync} from '../../models/types/chain-sync';
import {executeQuery} from './database';
import {ERROR_NOT_FOUND} from '../utils/error-messages';

export async function queryChainSync(address: string): Promise<ChainSync> {
	const res = await executeQuery('SELECT * FROM "chain_sync" WHERE "address" = $1', [address]);
	return res.rows[0] as ChainSync;
}

export async function insertChainSync(address: string): Promise<void> {
	await executeQuery('INSERT INTO "chain_sync" VALUES ($1, 0, 0)', [address]);
}

export async function incrementChainSyncFollows(address: string): Promise<void> {
	const res = await executeQuery('UPDATE "chain_sync" SET "followChanges" = "followChanges" + 1 WHERE "address" = $1', [address]);
	if (res.rowCount === 0) throw ERROR_NOT_FOUND;
}

export async function incrementChainSyncLikes(address: string): Promise<void> {
	const res = await executeQuery('UPDATE "chain_sync" SET "likeChanges" = "likeChanges" + 1 WHERE "address" = $1', [address]);
	if (res.rowCount === 0) throw ERROR_NOT_FOUND;
}

export async function resetChainSyncFollows(address: string): Promise<void> {
	const res = await executeQuery('UPDATE "chain_sync" SET "followChanges" = 0 WHERE "address" = $1', [address]);
	if (res.rowCount === 0) throw ERROR_NOT_FOUND;
}

export async function resetChainSyncLikes(address: string): Promise<void> {
	const res = await executeQuery('UPDATE "chain_sync" SET "likeChanges" = 0 WHERE "address" = $1', [address]);
	if (res.rowCount === 0) throw ERROR_NOT_FOUND;
}


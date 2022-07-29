import {ContractMetadata} from '../../models/types/contract-metadata';
import {executeQuery} from './database';
import {ERROR_NOT_FOUND} from '../utils/error-messages';

export async function queryContractMetadata(address: string): Promise<ContractMetadata> {
	const res = await executeQuery('SELECT * FROM "contract_metadata" WHERE "address" = $1', [address]);
	return res.rows[0] as ContractMetadata;
}

export async function insertContractMetadata(address: string, name: string, symbol: string, description: string): Promise<ContractMetadata> {
	const res = await executeQuery('INSERT INTO "contract_metadata" VALUES ($1, $2, $3, $4)', [address, name, symbol, description]);
	return res.rows[0] as ContractMetadata;
}

export async function updateContractMetadata(address: string, name: string, symbol: string, description: string): Promise<void> {
	const res = await executeQuery('UPDATE "contract_metadata" SET "name" = $2, "symbol" = $3, "description" = $4 WHERE "address" = $1', [address, name, symbol, description]);
	if (res.rowCount === 0) throw ERROR_NOT_FOUND;
}

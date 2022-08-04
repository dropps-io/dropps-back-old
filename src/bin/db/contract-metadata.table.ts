import {ContractMetadata} from '../../models/types/contract-metadata';
import {executeQuery} from './database';
import {ERROR_NOT_FOUND} from '../utils/error-messages';

export async function queryContractMetadata(address: string): Promise<ContractMetadata> {
	const res = await executeQuery('SELECT * FROM "contract_metadata" WHERE "address" = $1', [address]);
	return res.rows[0] as ContractMetadata;
}

export async function insertContractMetadata(address: string, name: string, symbol: string, description: string, isNFT: boolean, supply: string): Promise<ContractMetadata> {
	const res = await executeQuery('INSERT INTO "contract_metadata" VALUES ($1, $2, $3, $4, $5, $6)', [address, name, symbol, description, isNFT, supply]);
	return res.rows[0] as ContractMetadata;
}

export async function updateContractDescription(address: string, description: string): Promise<void> {
	const res = await executeQuery('UPDATE "contract_metadata" SET "description" = $2 WHERE "address" = $1', [address, description]);
	if (res.rowCount === 0) throw ERROR_NOT_FOUND;
}

export async function updateContractName(address: string, name: string): Promise<void> {
	const res = await executeQuery('UPDATE "contract_metadata" SET "name" = $2 WHERE "address" = $1', [address, name]);
	if (res.rowCount === 0) throw ERROR_NOT_FOUND;
}

export async function updateContractSymbol(address: string, symbol: string): Promise<void> {
	const res = await executeQuery('UPDATE "contract_metadata" SET "symbol" = $2 WHERE "address" = $1', [address, symbol]);
	if (res.rowCount === 0) throw ERROR_NOT_FOUND;
}

export async function updateContractSupply(address: string, supply: string): Promise<void> {
	const res = await executeQuery('UPDATE "contract_metadata" SET "supply" = $2 WHERE "address" = $1', [address, supply]);
	if (res.rowCount === 0) throw ERROR_NOT_FOUND;
}
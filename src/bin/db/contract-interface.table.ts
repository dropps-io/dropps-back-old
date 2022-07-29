import {ContractInterface} from '../../models/types/contract-interface';
import {executeQuery} from './database';
import {ERROR_NOT_FOUND} from '../utils/error-messages';

export async function queryContractInterface(code: string): Promise<ContractInterface> {
	const res = await executeQuery('SELECT * FROM "contract_interface" WHERE "code" = $1', [code]);
	return res.rows[0] as ContractInterface;
}

export async function insertContractInterface(code: string, name: string): Promise<ContractInterface> {
	const res = await executeQuery('INSERT INTO "contract_interface" VALUES ($1, $2)', [code, name]);
	return res.rows[0] as ContractInterface;
}

export async function updateContractInterface(code: string, name: string): Promise<void> {
	const res = await executeQuery('UPDATE "contract_interface" SET "name" = $1 WHERE "code" = $2', [name, code]);
	if (res.rowCount === 0) throw ERROR_NOT_FOUND;
}

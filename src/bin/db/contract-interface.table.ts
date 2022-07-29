import {ContractInterface} from '../../models/types/contract-interface';
import {executeQuery} from './database';
import {ERROR_NOT_FOUND} from '../utils/error-messages';

export async function queryContractInterface(code: string): Promise<ContractInterface> {
	const res = await executeQuery('SELECT * FROM "contract_interface" WHERE "code" = $1', [code]);
	return res.rows[0] as ContractInterface;
}

export async function queryContractInterfaces(): Promise<ContractInterface[]> {
	const res = await executeQuery('SELECT * FROM "contract_interface"');
	return res.rows as ContractInterface[];
}

export async function insertContractInterface(code: string, id: string, name: string): Promise<ContractInterface> {
	const res = await executeQuery('INSERT INTO "contract_interface" VALUES ($1, $2, $3)', [code, id, name]);
	return res.rows[0] as ContractInterface;
}

export async function updateContractInterface(id: string, name: string): Promise<void> {
	const res = await executeQuery('UPDATE "contract_interface" SET "name" = $1 WHERE "id" = $2', [name, id]);
	if (res.rowCount === 0) throw ERROR_NOT_FOUND;
}

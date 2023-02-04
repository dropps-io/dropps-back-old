import { ContractInterfaceTable } from '../../models/types/tables/contract-interface-table';
import { executeQuery } from './database';
import { ERROR_NOT_FOUND } from '../utils/error-messages';

export async function queryContractInterface(code: string): Promise<ContractInterfaceTable> {
  const res = await executeQuery('SELECT * FROM "contract_interface" WHERE "code" = $1', [code]);
  return res.rows[0] as ContractInterfaceTable;
}

export async function queryContractInterfaces(): Promise<ContractInterfaceTable[]> {
  const res = await executeQuery('SELECT * FROM "contract_interface"');
  return res.rows as ContractInterfaceTable[];
}

export async function insertContractInterface(
  code: string,
  id: string,
  name: string,
): Promise<ContractInterfaceTable> {
  const res = await executeQuery('INSERT INTO "contract_interface" VALUES ($1, $2, $3)', [
    code,
    id,
    name,
  ]);
  return res.rows[0] as ContractInterfaceTable;
}

export async function updateContractInterface(id: string, name: string): Promise<void> {
  const res = await executeQuery('UPDATE "contract_interface" SET "name" = $1 WHERE "id" = $2', [
    name,
    id,
  ]);
  if (res.rowCount === 0) throw ERROR_NOT_FOUND;
}

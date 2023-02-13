import { ContractTable } from '../../../models/types/tables/contract-table';
import { executeQuery } from '../database';
import { ERROR_NOT_FOUND } from '../../utils/error-messages';

export async function queryContract(address: string): Promise<ContractTable> {
  const res = await executeQuery('SELECT * FROM "contract" WHERE "address" = $1', [address]);
  if (res.rows[0]) return res.rows[0] as ContractTable;
  else throw 'No contract found';
}

export async function queryContracts(): Promise<ContractTable[]> {
  const res = await executeQuery('SELECT * FROM "contract"', []);
  return res.rows as ContractTable[];
}

export async function insertContract(address: string, interfaceCode: string | null): Promise<void> {
  await executeQuery('INSERT INTO "contract" VALUES ($1, $2)', [address, interfaceCode]);
}

export async function updateContract(address: string, interfaceCode: string | null): Promise<void> {
  const res = await executeQuery(
    'UPDATE "contract" SET "interfaceCode" = $1 WHERE "address" = $2',
    [interfaceCode, address],
  );
  if (res.rowCount === 0) throw ERROR_NOT_FOUND;
}

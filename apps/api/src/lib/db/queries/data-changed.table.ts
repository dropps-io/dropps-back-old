import { DataChangedTable } from '../../../models/types/tables/data-changed-table';
import { executeQuery } from './database';

export async function insertDataChanged(
  address: string,
  key: string,
  value: string,
  blockNumber: number,
): Promise<void> {
  await executeQuery('INSERT INTO "data_changed" VALUES ($1, $2, $3, $4)', [
    address,
    key,
    value,
    blockNumber,
  ]);
}

export async function queryDataKeyValue(address: string, key: string): Promise<string> {
  const res = await executeQuery(
    'SELECT * FROM "data_changed" WHERE "address" = $1 AND "key" = $2 ORDER BY "blockNumber" DESC LIMIT 1',
    [address, key],
  );
  if (res.rows.length > 0) return (res.rows[0] as DataChangedTable).value;
  else throw 'No value found for this key, address';
}

export async function queryDataKeyValueAtBlockNumber(
  address: string,
  key: string,
  blockNumber: number,
): Promise<string> {
  const res = await executeQuery(
    'SELECT * FROM "data_changed" WHERE "address" = $1 AND "key" = $2 AND "blockNumber" = $3',
    [address, key, blockNumber],
  );
  if (res.rows > 0) return (res.rows[0] as DataChangedTable).value;
  else throw 'No value found for this key, address, blockNumber';
}

export async function queryDataKeyHistory(
  address: string,
  key: string,
): Promise<DataChangedTable[]> {
  const res = await executeQuery(
    'SELECT * FROM "data_changed" WHERE "address" = $1 AND "key" = $2 ORDER BY "blockNumber"',
    [address, key],
  );
  return res.rows as DataChangedTable[];
}

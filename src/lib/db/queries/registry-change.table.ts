import { RegistryChangeTable } from '../../../models/types/tables/registry-change-table';
import { executeQuery } from '../database';

export async function queryRegistryChangesOfAddress(
  address: string,
): Promise<RegistryChangeTable[]> {
  const res = await executeQuery(
    'SELECT * FROM "registry_change" WHERE "address" = $1 ORDER BY date',
    [address],
  );
  return res.rows as RegistryChangeTable[];
}

export async function queryRegistryChangesCountOfAddress(address: string): Promise<number> {
  const res = await executeQuery('SELECT COUNT(*) FROM registry_change WHERE address = $1', [
    address,
  ]);
  return parseInt(res.rows[0].count);
}

export async function insertRegistryChange(
  address: string,
  type: 'like' | 'follow',
  action: 'add' | 'remove',
  value: string,
  date: Date,
): Promise<void> {
  await executeQuery('INSERT INTO "registry_change" VALUES ($1, $2, $3, $4, $5)', [
    address,
    type,
    action,
    value,
    date,
  ]);
}

export async function deleteAddressRegistryChanges(address: string): Promise<void> {
  await executeQuery('DELETE FROM "registry_change" WHERE address = $1', [address]);
}

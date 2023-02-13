import { MethodInterfaceTable } from '../../../models/types/tables/method-interface-table';
import { executeQuery } from '../database';
import { queryMethodParameters } from './method-parameter.table';
import { SolMethod } from '../../../models/types/sol-method';

export async function queryMethodInterface(id: string): Promise<MethodInterfaceTable> {
  const res = await executeQuery('SELECT * FROM "method_interface" WHERE "id" = $1', [id]);
  if (res.rows[0]) return res.rows[0] as MethodInterfaceTable;
  else throw 'No method interface found';
}

export async function queryMethodInterfaceWithParameters(id: string): Promise<SolMethod> {
  const method: SolMethod = { ...(await queryMethodInterface(id)), parameters: [] };
  const params = await queryMethodParameters(id);
  params.forEach((param) => method.parameters.push({ ...param }));
  return method;
}

export async function queryMethodInterfacesByType(
  type: 'function' | 'event',
): Promise<MethodInterfaceTable[]> {
  const res = await executeQuery('SELECT * FROM "method_interface" WHERE "type" = $1', [type]);
  return res.rows as MethodInterfaceTable[];
}

export async function insertMethodInterface(
  id: string,
  hash: string,
  name: string,
  type: 'function' | 'event',
): Promise<MethodInterfaceTable> {
  const res = await executeQuery('INSERT INTO "method_interface" VALUES ($1, $2, $3, $4)', [
    id,
    hash,
    name,
    type,
  ]);
  return res.rows[0] as MethodInterfaceTable;
}

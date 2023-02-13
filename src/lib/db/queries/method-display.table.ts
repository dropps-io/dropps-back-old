import { MethodDisplayTable } from '../../../models/types/tables/method-display-table';
import { executeQuery } from '../database';

export async function queryMethodDisplay(methodId: string): Promise<MethodDisplayTable> {
  const res = await executeQuery('SELECT * FROM "method_display" WHERE "methodId" = $1', [
    methodId,
  ]);
  return res.rows[0] as MethodDisplayTable;
}

export async function insertMethodDisplay(
  methodId: string,
  text: string,
  imageFrom: string,
  copiesFrom: string,
  standardFrom: string,
): Promise<MethodDisplayTable> {
  const res = await executeQuery('INSERT INTO "method_display" VALUES ($1, $2, $3, $4, $5)', [
    methodId,
    text,
    imageFrom,
    copiesFrom,
    standardFrom,
  ]);
  return res.rows[0] as MethodDisplayTable;
}

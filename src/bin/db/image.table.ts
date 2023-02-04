import { ImageTable, ImageType } from '../../models/types/tables/image-table';
import { executeQuery } from './database';
import { ERROR_NOT_FOUND } from '../utils/error-messages';

export async function queryImages(address: string): Promise<ImageTable[]> {
  const res = await executeQuery('SELECT * FROM "image" WHERE "address" = $1', [address]);
  if (res.rows.length > 0) return res.rows as ImageTable[];
  else return [];
}

export async function queryImagesByType(address: string, type: ImageType): Promise<ImageTable[]> {
  const res = await executeQuery('SELECT * FROM "image" WHERE "address" = $1 AND "type" = $2', [
    address,
    type,
  ]);
  if (res.rows.length > 0) return res.rows as ImageTable[];
  else return [];
}

export async function insertImage(
  address: string,
  url: string,
  width: number,
  height: number,
  type: ImageType,
  hash: string,
): Promise<ImageTable> {
  const res = await executeQuery('INSERT INTO "image" VALUES ($1, $2, $3, $4, $5, $6)', [
    address,
    url,
    width,
    height,
    type,
    hash,
  ]);
  return res.rows[0] as ImageTable;
}

export async function deleteImage(address: string, url: string): Promise<void> {
  const res = await executeQuery('DELETE FROM "image" WHERE "address" = $1 AND "url" = $2', [
    address,
    url,
  ]);
  if (res.rowCount === 0) throw ERROR_NOT_FOUND;
}

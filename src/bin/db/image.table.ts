import {Image, ImageType} from '../../models/types/image';
import {executeQuery} from './database';
import {ERROR_NOT_FOUND} from '../utils/error-messages';

export async function queryImages(address: string): Promise<Image[]> {
	const res = await executeQuery('SELECT * FROM "image" WHERE "address" = $1', [address]);
	return res.rows as Image[];
}

export async function queryImagesByType(address: string, type: ImageType): Promise<Image[]> {
	const res = await executeQuery('SELECT * FROM "image" WHERE "address" = $1 AND "type" = $2', [address, type]);
	return res.rows as Image[];
}

export async function insertImage(address: string, url: string, width: number, height: number, type: ImageType, hash: string): Promise<Image> {
	const res = await executeQuery('INSERT INTO "image" VALUES ($1, $2, $3, $4, $5, $6)', [address, url, width, height, type, hash]);
	return res.rows[0] as Image;
}

export async function deleteImage(address: string, url: string): Promise<void> {
	const res = await executeQuery('DELETE FROM "image" WHERE "address" = $1 AND "url" = $2', [address, url]);
	if (res.rowCount === 0) throw ERROR_NOT_FOUND;
}

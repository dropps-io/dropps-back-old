import {Image, ImageType} from '../../models/types/image';
import {executeQuery} from './database';
import {ERROR_NOT_FOUND} from '../utils/error-messages';

export async function queryImages(address: string): Promise<Image[]> {
	const res = await executeQuery('SELECT * FROM "image" WHERE "address" = $1', [address]);
	return res.rows as Image[];
}

export async function insertImage(address: string, url: string, width: string, height: string, type: ImageType): Promise<Image> {
	const res = await executeQuery('INSERT INTO "image" VALUES ($1, $2, $3, $4, $5)', [address, url, width, height, type]);
	return res.rows[0] as Image;
}

export async function updateImage(address: string, url: string, width: string, height: string, type: ImageType): Promise<void> {
	const res = await executeQuery('UPDATE "image" SET "url" = $2, "width" = $3, "height" = $4, "type" = $5 WHERE "address" = $1', [address, url, width, height, type]);
	if (res.rowCount === 0) throw ERROR_NOT_FOUND;
}

import {MethodInterface} from '../../models/types/method-interface';
import {executeQuery} from './database';
import {ERROR_NOT_FOUND} from '../utils/error-messages';

export async function queryMethodInterface(methodId: string): Promise<MethodInterface> {
	const res = await executeQuery('SELECT * FROM "method_interface" WHERE "methodId" = $1', [methodId]);
	return res.rows[0] as MethodInterface;
}

export async function insertMethodInterface(methodId: string, methodHash: string, name: string, type: string): Promise<MethodInterface> {
	const res = await executeQuery('INSERT INTO "method_interface" VALUES ($1, $2, $3, $4)', [methodId, methodHash, name, type]);
	return res.rows[0] as MethodInterface;
}

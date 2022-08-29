import {MethodDisplay} from '../../models/types/method-display';
import {executeQuery} from './database';

export async function queryMethodDisplay(methodId: string): Promise<MethodDisplay> {
	const res = await executeQuery('SELECT * FROM "method_display" WHERE "methodId" = $1', [methodId]);
	return res.rows[0] as MethodDisplay;
}

export async function insertMethodDisplay(methodId: string, text: string, imageFrom: string, copiesFrom: string, standardFrom: string): Promise<MethodDisplay> {
	const res = await executeQuery('INSERT INTO "method_display" VALUES ($1, $2, $3, $4, $5)', [methodId, text, imageFrom, copiesFrom, standardFrom]);
	return res.rows[0] as MethodDisplay;
}

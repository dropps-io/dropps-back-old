import {MethodParameter} from '../../models/types/method-parameter';
import {executeQuery} from './database';

export async function queryMethodParameters(methodId: string): Promise<MethodParameter[]> {
	const res = await executeQuery('SELECT * FROM "method_parameter" WHERE "methodId" = $1', [methodId]);
	return res.rows as MethodParameter[];
}

export async function insertMethodParameter(methodId: string, name: string, type: string, indexed?: boolean): Promise<MethodParameter> {
	const indexedValue = !!indexed;
	const res = await executeQuery('INSERT INTO "method_parameter" VALUES ($1, $2, $3, $4)', [methodId, name, type, indexedValue]);
	return res.rows[0] as MethodParameter;
}

import {MethodParameterTable} from '../../models/types/tables/method-parameter-table';
import {executeQuery} from './database';

export async function queryMethodParameters(methodId: string): Promise<MethodParameterTable[]> {
	const res = await executeQuery('SELECT * FROM "method_parameter" WHERE "methodId" = $1 ORDER BY position', [methodId]);
	return res.rows as MethodParameterTable[];
}

export async function queryMethodParameterDisplayType(methodId: string, name: string): Promise<string> {
	const res = await executeQuery('SELECT "displayType" FROM "method_parameter" WHERE "methodId" = $1 AND name = $2', [methodId, name]);
	if (res.rows.length > 0) return res.rows[0].displayType;
	else return '';
}

export async function insertMethodParameter(methodId: string, name: string, type: string, position: number, indexed?: boolean): Promise<MethodParameterTable> {
	const indexedValue = !!indexed;
	const res = await executeQuery('INSERT INTO "method_parameter" ("methodId", name, type, indexed, position) VALUES ($1, $2, $3, $4, $5)', [methodId, name, type, indexedValue, position]);
	return res.rows[0] as MethodParameterTable;
}

export async function insertMethodParameterDisplayType(methodId: string, name: string, displayType: string): Promise<void> {
	await executeQuery('UPDATE method_parameter SET "displayType" = $3 WHERE "methodId" = $1 AND name = $2', [methodId, name, displayType]);
}

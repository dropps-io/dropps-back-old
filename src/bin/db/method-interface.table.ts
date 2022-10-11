import {MethodInterface} from '../../models/types/method-interface';
import {executeQuery} from './database';
import {queryMethodParameters} from "./method-parameter.table";
import {SolMethod} from "../../models/types/sol-method";

export async function queryMethodInterface(id: string): Promise<MethodInterface> {
	const res = await executeQuery('SELECT * FROM "method_interface" WHERE "id" = $1', [id]);
	if (res.rows[0]) return res.rows[0] as MethodInterface;
	else throw 'No method interface found';
}

export async function queryMethodInterfaceWithParameters(id: string): Promise<SolMethod> {
	const method: SolMethod = {...await queryMethodInterface(id), parameters: []};
	const params = await queryMethodParameters(id);
	params.forEach(param => method.parameters.push({...param}));
	return method;
}

export async function queryMethodInterfacesByType(type: 'function' | 'event'): Promise<MethodInterface[]> {
	const res = await executeQuery('SELECT * FROM "method_interface" WHERE "type" = $1', [type]);
	return res.rows as MethodInterface[];
}

export async function insertMethodInterface(id: string, hash: string, name: string, type: 'function' | 'event'): Promise<MethodInterface> {
	const res = await executeQuery('INSERT INTO "method_interface" VALUES ($1, $2, $3, $4)', [id, hash, name, type]);
	return res.rows[0] as MethodInterface;
}

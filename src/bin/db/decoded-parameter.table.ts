import {DecodedParameter} from '../../models/types/decoded-parameter';
import {executeQuery} from './database';

export async function queryDecodedParameters(eventId: number): Promise<DecodedParameter[]> {
	const res = await executeQuery('SELECT * FROM "decoded_parameter" WHERE "eventId" = $1', [eventId]);
	return res.rows as DecodedParameter[];
}

export async function insertDecodedParameter(eventId: number, value: string, name: string, type: string): Promise<DecodedParameter> {
	const res = await executeQuery('INSERT INTO "decoded_parameter" VALUES ($1, $2, $3, $4)', [eventId, value, name, type]);
	return res.rows[0] as DecodedParameter;
}

import {DecodedParameter} from '../../models/types/decoded-parameter';
import {executeQuery} from './database';
import {ERROR_NOT_FOUND} from '../utils/error-messages';

export async function queryDecodedParameters(eventId: string): Promise<DecodedParameter[]> {
	const res = await executeQuery('SELECT * FROM "decoded_parameter" WHERE "eventId" = $1', [eventId]);
	return res.rows as DecodedParameter[];
}

export async function insertDecodedParameter(eventId: string, value: string, name: string, type: string): Promise<DecodedParameter> {
	const res = await executeQuery('INSERT INTO "decoded_parameter" VALUES ($1, $2, $3, $4)', [eventId, value, name, type]);
	return res.rows[0] as DecodedParameter;
}

import {DecodedParameter} from '../../models/types/decoded-parameter';
import {executeQuery} from './database';

export async function queryDecodedEventParameters(eventId: number): Promise<DecodedParameter[]> {
	const res = await executeQuery('SELECT * FROM "decoded_event_parameter" WHERE "eventId" = $1', [eventId]);
	return res.rows as DecodedParameter[];
}

export async function insertDecodedEventParameter(eventId: number, value: string, name: string, type: string): Promise<void> {
	await executeQuery('INSERT INTO "decoded_event_parameter" VALUES ($1, $2, $3, $4)', [eventId, value, name, type]);
}

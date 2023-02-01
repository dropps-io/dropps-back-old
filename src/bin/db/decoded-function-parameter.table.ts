import {executeQuery} from './database';
import {DecodedParameter} from '../../models/types/decoded-parameter';

export async function queryDecodedFunctionParameters(transactionHash: string): Promise<DecodedParameter[]> {
	const res = await executeQuery('SELECT * FROM "decoded_function_parameter" WHERE "transactionHash" = $1', [transactionHash]);
	return res.rows as DecodedParameter[];
}

export async function insertDecodedFunctionParameter(transactionHash: string, value: string, name: string, type: string, displayType?: string): Promise<DecodedParameter> {
	const res = await executeQuery('INSERT INTO "decoded_function_parameter" VALUES ($1, $2, $3, $4, $5)', [transactionHash, value, name, type, displayType]);
	return res.rows[0] as DecodedParameter;
}

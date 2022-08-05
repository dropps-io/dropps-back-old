import {DecodedFunctionParameter} from '../../models/types/decoded-function-parameter';
import {executeQuery} from './database';

export async function queryDecodedFunctionParameters(transactionHash: string): Promise<DecodedFunctionParameter[]> {
	const res = await executeQuery('SELECT * FROM "decoded_function_parameter" WHERE "transactionHash" = $1', [transactionHash]);
	return res.rows as DecodedFunctionParameter[];
}

export async function insertDecodedFunctionParameter(transactionHash: string, value: string, name: string, type: string, displayType?: string): Promise<DecodedFunctionParameter> {
	const res = await executeQuery('INSERT INTO "decoded_function_parameter" VALUES ($1, $2, $3, $4, $5)', [transactionHash, value, name, type, displayType]);
	return res.rows[0] as DecodedFunctionParameter;
}

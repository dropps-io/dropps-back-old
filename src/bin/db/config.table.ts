import {executeQuery} from './database';

export async function getValueFromConfig(key: string): Promise<string> {
	const res = await executeQuery('SELECT (value) FROM "config" WHERE key=$1', [key]);
	if (res.rows.length > 0) return res.rows[0].value;
	else throw 'No value found for this key';
}

export async function setValueOnConfig(key: string, value: string): Promise<void> {
	await executeQuery('UPDATE config SET value=$2 WHERE key=$1', [key, value]);
}
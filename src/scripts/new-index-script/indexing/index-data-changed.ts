import {insertDataChanged} from '../../../bin/db/data-changed.table';
import {INDEX_DATA} from '../config';
import {reportIndexingScriptError} from '../index-logger';

export async function indexDataChanged(address: string, key: string, value: string, blockNumber: number) {
	if (!INDEX_DATA) return;
	try {
		await insertDataChanged(address, key, value, blockNumber);
	} catch (e) {
		await reportIndexingScriptError('indexDataChanged', e);
	}
}
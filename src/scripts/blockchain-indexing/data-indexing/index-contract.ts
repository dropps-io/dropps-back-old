import {insertContract} from '../../../bin/db/contract.table';
import {INDEX_DATA} from '../config';
import {logError} from '../../../bin/logger';

export async function indexContract(address: string, code: string | null) {
	if (!INDEX_DATA) return;
	try {
		await insertContract(address, code);
	}
	catch (e) {
		logError(e);
	}
}
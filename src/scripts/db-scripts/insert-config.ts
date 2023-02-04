import {executeQuery} from '../../bin/db/database';

export async function insertConfig() {
	await executeQuery("INSERT INTO config VALUES ('latest_indexed_block', '60000')");
	await executeQuery("INSERT INTO config VALUES ('sleep_between_indexing_iteration', '7000')");
	await executeQuery("INSERT INTO config VALUES ('block_iteration', '5000')");
	await executeQuery("INSERT INTO config VALUES ('indexing', 'true')");
	await executeQuery("INSERT INTO config VALUES ('indexing_threads_amount', '20')");
}
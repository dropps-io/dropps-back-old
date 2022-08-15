import {executeQuery} from '../../bin/db/database';

const clearDBQueries = [
	'delete from "user_profile_relations"',
	'delete from "users"',
	'delete from "nonces"',
	'delete from "link"',
	'delete from "decoded_event_parameter"',
	'delete from "decoded_function_parameter"',
	'delete from "method_parameter"',
	'delete from "method_display"',
	'delete from "image"',
	'delete from "asset"',
	'delete from "like"',
	'delete from "tag"',
	'delete from "contract_metadata"',
	'delete from "follow"',
	'delete from "chain_sync"',
	'delete from "post"',
	'delete from "event"',
	'delete from "data_changed"',
	'delete from "contract"',
	'delete from "contract_interface"',
	'delete from "method_interface"',
	'delete from "transaction"',
	'delete from "key_display"',
	'delete from "erc725y_schema"',
];

// before(async () => {
//   logMessage('CLEAR DATABASE');
//   await clearDB();
// });

export async function clearDB(): Promise<void> {
	for(let query of clearDBQueries) {
		await executeQuery(query);
	}
}

import {executeQuery} from '../../bin/db/database';
import {DB_NAME} from '../../environment/endpoints';

const clearDBQueries = [
	'delete from "user_profile_relations"',
	'delete from "users"',
	'delete from "nonces"',
	'delete from "link"',
	'delete from "decoded_parameter"',
	'delete from "method_parameter"',
	'delete from "image"',
	'delete from "like"',
	'delete from "tag"',
	'delete from "contract_metadata"',
	'delete from "follow"',
	'delete from "chain_sync"',
	'delete from "contract"',
	'delete from "contract_interface"',
	'delete from "method_interface"',
	'delete from "post"',
	'delete from "event"',
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

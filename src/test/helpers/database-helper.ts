import {executeQuery} from '../../bin/db/database';
import {DB_NAME} from '../../environment/endpoints';

const clearDBQueries = ['use ' + DB_NAME,
	'SET SQL_SAFE_UPDATES = 0',
	'delete from user_profile_relations',
	'delete from users',
	'delete from nonces'];

// before(async () => {
//   logMessage('CLEAR DATABASE');
//   await clearDB();
// });

export async function clearDB(): Promise<void> {
	return new Promise((resolve) => {
		clearDBQueries.forEach(async query => {
			await executeQuery(query);
		});
		resolve();
	});
}

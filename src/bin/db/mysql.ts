import * as mysql from 'mysql';
import {DB_HOST, DB_NAME, DB_PASSWORD, DB_USER} from '../../environment/endpoints';
import {logError, logMessage} from "../logger";

export const DB = mysql.createConnection({
	host: DB_HOST,
	user: DB_USER,
	password: DB_PASSWORD,
	database: DB_NAME
});

DB.connect(function(err) {
	if (err) throw err;
	logMessage('Connected!');
});

export async function executeQuery(query: string): Promise<void> {
	return new Promise((resolve, reject) => {
		DB.query(query, () => {
			resolve();
		},err => {
			logError(err);
			reject(err);
		});
	});
}



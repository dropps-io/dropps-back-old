import { Client } from 'pg';

import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } from '../../../environment/endpoints';
import { logMessage } from '../../logger';

export const DB = new Client({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});

DB.connect(function (err) {
  if (err) throw err;
  logMessage('Connected!');
});

export async function executeQuery(query: string, values?: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    DB.query(query, values ? values : [], (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
}

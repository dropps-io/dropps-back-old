import { Pool, QueryResult } from 'pg';

import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } from '../../environment/endpoints';

const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});

export const poolConnect = async () => {
  // await pool.connect();
};

export const poolEnd = async () => {
  await pool.end();
};

export async function executeQuery(query: string, values?: any[]): Promise<QueryResult<any>> {
  return new Promise((resolve, reject) => {
    pool.connect((error, client, release) => {
      if (error) {
        reject(error);
      }
      client.query({ text: query, values }, (err, result) => {
        release();
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
  });
}

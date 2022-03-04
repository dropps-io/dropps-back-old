import {DB} from "../../bin/db/mysql";
import {logError} from "../../bin/logger";

const clearDBQueries = ['use dropps;',
  'SET SQL_SAFE_UPDATES = 0;',
  'delete from user_profile_relations;',
  'delete from users;',
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

async function executeQuery(query: string): Promise<void> {
  return new Promise((resolve, reject) => {
    DB.query(query, () => {
      resolve();
    },err => {
      logError(err);
      reject(err);
    });
  });
}

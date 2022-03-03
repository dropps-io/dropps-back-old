import {DB} from "../../bin/db/mysql";

const clearDBQueries = ['use dropps;',
  'SET SQL_SAFE_UPDATES = 0;',
  'delete from user_profile_relations;',
  'delete from users;',
  'delete from nonces'];

before(async () => {
  console.log('CLEAR DATABASE');
  await clearDB();
});

async function clearDB(): Promise<void> {
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
      console.error(err);
      reject(err);
    });
  });
}

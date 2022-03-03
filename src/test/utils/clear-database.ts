import {DB} from "../../bin/db/mysql";

const clearDBQuery = 'use dropps;' +
  'SET SQL_SAFE_UPDATES = 0;' +
  'delete from user_profile_relations;' +
  'delete from users;' +
  'delete from nonces';

before(async () => {
  console.log('CLEAR DATABASE');
  await clearDB();
});

async function clearDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    DB.query(clearDBQuery, () => {
      resolve();
    },err => {
      console.error(err);
      reject(err);
    });

  });
}

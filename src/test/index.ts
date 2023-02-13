import { DB } from '../lib/db/database';
import { clearDB } from './helpers/database-helper';

afterAll(async () => {
  await DB.end();
});

beforeEach(async () => {
  await clearDB();
});

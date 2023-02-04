import { after } from 'mocha';

import { UnitTests } from './unit/unit.test';
import { AuthTests } from './end-to-end/auth.test';
import { LooksoTests } from './end-to-end/lookso/lookso.test';
import { DB } from '../lib/db/queries/database';

after(async () => {
  await DB.end();
});

describe('Test', () => {
  UnitTests();
  AuthTests();
  LooksoTests();
});

// END TO END

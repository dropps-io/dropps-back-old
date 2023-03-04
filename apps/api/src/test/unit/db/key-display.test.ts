import { clearDB } from '../../helpers/database-helper';
import { shouldThrow } from '../../helpers/should-throw';
import { insertKeyDisplay, queryKeyDisplay } from '../../../lib/db/queries/key-display.table';
import { insertErc725ySchema } from '../../../lib/db/queries/erc725y-schema.table';

describe('Table Key Display', () => {
  beforeEach(async () => {
    await clearDB();
    await insertErc725ySchema('0x5f6c557f', 'text', 'text2', 'text3', 'text4');
  });

  it('should be able to insert values', async () => {
    expect(!(await shouldThrow(insertKeyDisplay('0x5f6c557f', 'text', 'text2')))).toBe(true);
  });

  it('should be able to query a key display', async () => {
    await insertKeyDisplay('0x5f6c557f', 'text', 'text2');
    const res = await queryKeyDisplay('0x5f6c557f');

    expect(res.display).toEqual('text');
    expect(res.displayWithoutValue).toEqual('text2');
  });
});

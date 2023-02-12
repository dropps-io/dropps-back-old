import { beforeEach, describe } from 'mocha';
import { assert, expect } from 'chai';

import { clearDB } from '../../helpers/database-helper';
import { shouldThrow } from '../../helpers/should-throw';
import { insertKeyDisplay, queryKeyDisplay } from '../../../lib/db/queries/key-display.table';
import { insertErc725ySchema } from '../../../lib/db/queries/erc725y-schema.table';

export const KeyDisplayTests = () => {
  describe('Table Key Display', () => {
    beforeEach(async () => {
      await clearDB();
      insertErc725ySchema('0x5f6c557f', 'text', 'text2', 'text3', 'text4');
    });

    it('should be able to insert values', async () => {
      assert(!(await shouldThrow(insertKeyDisplay('0x5f6c557f', 'text', 'text2'))));
    });

    it('should be able to query a key display', async () => {
      await insertKeyDisplay('0x5f6c557f', 'text', 'text2');
      const res = await queryKeyDisplay('0x5f6c557f');

      expect(res.display).to.equal('text');
      expect(res.displayWithoutValue).to.equal('text2');
    });
  });
};

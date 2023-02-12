import { beforeEach, describe } from 'mocha';
import { assert, expect } from 'chai';

import { clearDB } from '../../helpers/database-helper';
import { shouldThrow } from '../../helpers/should-throw';
import { insertMethodInterface } from '../../../lib/db/queries/method-interface.table';
import {
  insertMethodParameter,
  queryMethodParameters,
} from '../../../lib/db/queries/method-parameter.table';

export const MethodParameterTest = () => {
  describe('Table Method Parameter', () => {
    beforeEach(async () => {
      await clearDB();
      await insertMethodInterface(
        '0x5f6c557f',
        '0x5f6c557fc82516a035640cdf1be081cd918dca7b19367571f9da46b6e82ccfa2',
        'Execute',
        'function',
      );
    });

    it('should be able to insert values', async () => {
      assert(!(await shouldThrow(insertMethodParameter('0x5f6c557f', 'name', 'string', 0, true))));
    });

    it('should be able to query a method parameters', async () => {
      await insertMethodParameter('0x5f6c557f', 'name', 'string', 0, true);
      const parameters = await queryMethodParameters('0x5f6c557f');

      expect(parameters[0].name).to.equal('name');
      expect(parameters[0].type).to.equal('string');
      expect(parameters[0].indexed).to.equal(true);
      expect(parameters[0].methodId).to.equal('0x5f6c557f');
    });
  });
};

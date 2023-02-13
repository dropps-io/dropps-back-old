import { clearDB } from '../../helpers/database-helper';
import { shouldThrow } from '../../helpers/should-throw';
import { insertMethodInterface } from '../../../lib/db/queries/method-interface.table';
import {
  insertMethodParameter,
  queryMethodParameters,
} from '../../../lib/db/queries/method-parameter.table';

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
    expect(
      !(await shouldThrow(insertMethodParameter('0x5f6c557f', 'name', 'string', 0, true))),
    ).toBe(true);
  });

  it('should be able to query a method parameters', async () => {
    await insertMethodParameter('0x5f6c557f', 'name', 'string', 0, true);
    const parameters = await queryMethodParameters('0x5f6c557f');

    expect(parameters[0].name).toEqual('name');
    expect(parameters[0].type).toEqual('string');
    expect(parameters[0].indexed).toEqual(true);
    expect(parameters[0].methodId).toEqual('0x5f6c557f');
  });
});

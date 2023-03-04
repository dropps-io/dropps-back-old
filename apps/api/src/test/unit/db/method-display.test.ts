import { clearDB } from '../../helpers/database-helper';
import { shouldThrow } from '../../helpers/should-throw';
import {
  insertMethodDisplay,
  queryMethodDisplay,
} from '../../../lib/db/queries/method-display.table';
import { insertMethodInterface } from '../../../lib/db/queries/method-interface.table';

describe('Table Method Display', () => {
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
      !(await shouldThrow(
        insertMethodDisplay('0x5f6c557f', 'text', 'image', 'copies', 'standard'),
      )),
    ).toBe(true);
  });

  it('should not be able to insert values if no method interface linked', async () => {
    expect(
      await shouldThrow(insertMethodDisplay('0x4f6c557f', 'text', 'image', 'copies', 'standard')),
    ).toBe(true);
  });

  it('should be able to query a method display', async () => {
    await insertMethodDisplay('0x5f6c557f', 'text', 'image', 'copies', 'standard');
    const res = await queryMethodDisplay('0x5f6c557f');

    expect(res.methodId).toEqual('0x5f6c557f');
    expect(res.text).toEqual('text');
    expect(res.imageFrom).toEqual('image');
    expect(res.copiesFrom).toEqual('copies');
    expect(res.standardFrom).toEqual('standard');
  });
});

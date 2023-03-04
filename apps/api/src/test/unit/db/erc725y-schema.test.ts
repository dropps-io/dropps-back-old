import { clearDB } from '../../helpers/database-helper';
import { shouldThrow } from '../../helpers/should-throw';
import {
  insertErc725ySchema,
  queryErc725ySchema,
} from '../../../lib/db/queries/erc725y-schema.table';

describe('Table Key Display', () => {
  beforeEach(async () => {
    await clearDB();
  });

  it('should be able to insert values', async () => {
    expect(
      !(await shouldThrow(
        insertErc725ySchema(
          '0xdc780d75098db5d742b3667921413268882f3a5f26ae580ac9ad86443809ca23',
          'text',
          'text2',
          'text3',
          'text4',
        ),
      )),
    ).toBe(true);
  });

  it('should be able to query a key display', async () => {
    await insertErc725ySchema(
      '0xdc780d75098db5d742b3667921413268882f3a5f26ae580ac9ad86443809ca23',
      'text',
      'text2',
      'text3',
      'text4',
    );
    const res = await queryErc725ySchema(
      '0xdc780d75098db5d742b3667921413268882f3a5f26ae580ac9ad86443809ca23',
    );

    expect(res.key).toEqual('0xdc780d75098db5d742b3667921413268882f3a5f26ae580ac9ad86443809ca23');
    expect(res.name).toEqual('text');
    expect(res.keyType).toEqual('text2');
    expect(res.valueType).toEqual('text3');
    expect(res.valueContent).toEqual('text4');
  });
});

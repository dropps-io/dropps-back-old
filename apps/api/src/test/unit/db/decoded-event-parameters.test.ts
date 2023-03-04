import { clearDB } from '../../helpers/database-helper';
import { shouldThrow } from '../../helpers/should-throw';
import { insertEvent } from '../../../lib/db/queries/event.table';
import { UNIVERSAL_PROFILE_1 } from '../../helpers/constants';
import {
  insertDecodedEventParameter,
  queryDecodedEventParameters,
} from '../../../lib/db/queries/decoded-event-parameter.table';
import { insertContract } from '../../../lib/db/queries/contract.table';
import { insertTransaction } from '../../../lib/db/queries/transaction.table';

describe('Table Decoded Parameters', () => {
  let id: number;

  beforeEach(async () => {
    await clearDB();
    await insertContract(UNIVERSAL_PROFILE_1, null);
    await insertTransaction(
      '0x6cf76a6ded55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9822',
      '0xD692Ba892a902810a2EE3fA41C1D8DcD652D47Ab',
      '0xD692Ba892a902810a2EE3fA41C1D8DcD652D47Ab',
      '0',
      '0x6cf76a6d00000000000000000000ed55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9821',
      0,
    );
    id = await insertEvent(
      UNIVERSAL_PROFILE_1,
      '0x6cf76a6ded55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9822',
      '01234567',
      0,
      '',
      '',
    );
  });

  it('should be able to insert values', async () => {
    expect(
      !(await shouldThrow(insertDecodedEventParameter(id, 'SuperValue', 'key', 'string'))),
    ).toBe(true);
  });

  it('should be able to query decoded parameters', async () => {
    await insertDecodedEventParameter(id, 'SuperValue', 'key', 'string');
    const decodedParameters = await queryDecodedEventParameters(id);

    expect(decodedParameters[0].value).toEqual('SuperValue');
    expect(decodedParameters[0].name).toEqual('key');
    expect(decodedParameters[0].type).toEqual('string');
  });
});

import { clearDB } from '../../helpers/database-helper';
import { shouldThrow } from '../../helpers/should-throw';
import {
  insertDataChanged,
  queryDataKeyHistory,
  queryDataKeyValue,
} from '../../../lib/db/queries/data-changed.table';
import { UNIVERSAL_PROFILE_1 } from '../../helpers/constants';
import { DataChangedTable } from '../../../models/types/tables/data-changed-table';
import { insertContract } from '../../../lib/db/queries/contract.table';

describe('Table DataChangedTable', () => {
  beforeEach(async () => {
    await clearDB();
    await insertContract(UNIVERSAL_PROFILE_1, null);
  });

  it('should be able to insert data changed', async () => {
    expect(
      !(await shouldThrow(
        insertDataChanged(
          UNIVERSAL_PROFILE_1,
          '0x6cf76a6ded55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9821',
          '0x001',
          0,
        ),
      )),
    ).toBe(true);
  });

  it('should be able to query data key value', async () => {
    await insertDataChanged(
      UNIVERSAL_PROFILE_1,
      '0x6cf76a6ded55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9821',
      '0x002',
      500,
    );

    await insertDataChanged(
      UNIVERSAL_PROFILE_1,
      '0x6cf76a6ded55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9821',
      '0x003',
      1002,
    );

    await insertDataChanged(
      UNIVERSAL_PROFILE_1,
      '0x6cf76a6ded55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9821',
      '0x001',
      0,
    );

    const value = await queryDataKeyValue(
      UNIVERSAL_PROFILE_1,
      '0x6cf76a6ded55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9821',
    );

    expect(value).toEqual('0x003');
  });

  it('should be able to query data key history', async () => {
    await insertDataChanged(
      UNIVERSAL_PROFILE_1,
      '0x6cf76a6ded55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9821',
      '0x002',
      500,
    );

    await insertDataChanged(
      UNIVERSAL_PROFILE_1,
      '0x6cf76a6ded55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9821',
      '0x003',
      1002,
    );

    await insertDataChanged(
      UNIVERSAL_PROFILE_1,
      '0x6cf76a6ded55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9821',
      '0x001',
      0,
    );

    const dataChanged: DataChangedTable[] = await queryDataKeyHistory(
      UNIVERSAL_PROFILE_1,
      '0x6cf76a6ded55d828270d696eee6054e618dc3fc546434d3d4c68101dc25e9821',
    );

    expect(dataChanged[0].value).toEqual('0x001');
    expect(dataChanged[1].value).toEqual('0x002');
    expect(dataChanged[2].value).toEqual('0x003');
  });
});

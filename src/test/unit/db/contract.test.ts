import { clearDB } from '../../helpers/database-helper';
import { UNIVERSAL_PROFILE_1 } from '../../helpers/constants';
import {
  insertContract,
  queryContract,
  updateContract,
} from '../../../lib/db/queries/contract.table';
import { shouldThrow } from '../../helpers/should-throw';
import { insertContractInterface } from '../../../lib/db/queries/contract-interface.table';

describe('Table ContractTable', () => {
  beforeEach(async () => {
    await clearDB();
    await insertContractInterface('LSP0', '0x12345678', 'Universal Profile');
  });

  it('should be able to insert values', async () => {
    expect(!(await shouldThrow(insertContract(UNIVERSAL_PROFILE_1, 'LSP0')))).toBe(true);
  });

  it('should be able to query values', async () => {
    await insertContract(UNIVERSAL_PROFILE_1, 'LSP0');
    const res = await queryContract(UNIVERSAL_PROFILE_1);

    expect(res.address).toEqual(UNIVERSAL_PROFILE_1);
    expect(res.interfaceCode).toEqual('LSP0');
  });

  it('should be able to update values', async () => {
    await insertContract(UNIVERSAL_PROFILE_1, 'LSP0');
    await updateContract(UNIVERSAL_PROFILE_1, null);
    const res = await queryContract(UNIVERSAL_PROFILE_1);

    expect(res.address).toEqual(UNIVERSAL_PROFILE_1);
    expect(res.interfaceCode).toEqual(null);
  });
});

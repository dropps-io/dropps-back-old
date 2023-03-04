import { clearDB } from '../../helpers/database-helper';
import { shouldThrow } from '../../helpers/should-throw';
import {
  insertContractInterface,
  queryContractInterface,
  queryContractInterfaces,
  updateContractInterface,
} from '../../../lib/db/queries/contract-interface.table';

describe('Table ContractTable Interface', () => {
  beforeEach(async () => {
    await clearDB();
  });

  it('should be able to insert values', async () => {
    expect(
      !(await shouldThrow(insertContractInterface('LSP0', '0x12345678', 'Universal Profile'))),
    ).toBe(true);
  });

  it('should be able to query specific values', async () => {
    await insertContractInterface('LSP0', '0x12345678', 'Universal Profile');
    const res = await queryContractInterface('LSP0');

    expect(res.id).toEqual('0x12345678');
    expect(res.code).toEqual('LSP0');
    expect(res.name).toEqual('Universal Profile');
  });

  it('should be able to query values', async () => {
    await insertContractInterface('LSP0', '0x12345678', 'Universal Profile');
    const res = await queryContractInterfaces();

    expect(res[0].id).toEqual('0x12345678');
    expect(res[0].code).toEqual('LSP0');
    expect(res[0].name).toEqual('Universal Profile');
  });

  it('should be able to update values', async () => {
    await insertContractInterface('LSP0', '0x12345678', 'Universal Profile');
    await updateContractInterface('0x12345678', 'Profile');
    const res = await queryContractInterface('LSP0');

    expect(res.name).toEqual('Profile');
  });
});

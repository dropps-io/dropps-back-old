import { clearDB } from '../../helpers/database-helper';
import { shouldThrow } from '../../helpers/should-throw';
import { insertContract } from '../../../lib/db/queries/contract.table';
import { UNIVERSAL_PROFILE_1 } from '../../helpers/constants';
import {
  insertContractMetadata,
  queryContractMetadata,
  updateContractDescription,
  updateContractName,
  updateContractSupply,
  updateContractSymbol,
} from '../../../lib/db/queries/contract-metadata.table';

describe('Table ContractTable Metadata', () => {
  beforeEach(async () => {
    await clearDB();
    await insertContract(UNIVERSAL_PROFILE_1, null);
  });

  it('should be able to insert values', async () => {
    expect(
      !(await shouldThrow(
        insertContractMetadata(
          UNIVERSAL_PROFILE_1,
          'My Profile',
          'MP',
          'My Description',
          false,
          '0',
        ),
      )),
    ).toBe(true);
  });

  it('should be able to query values', async () => {
    await insertContractMetadata(
      UNIVERSAL_PROFILE_1,
      'My Profile',
      'MP',
      'My Description',
      false,
      '0',
    );
    const res = await queryContractMetadata(UNIVERSAL_PROFILE_1);

    expect(res.address).toEqual(UNIVERSAL_PROFILE_1);
    expect(res.name).toEqual('My Profile');
    expect(res.symbol).toEqual('MP');
    expect(res.description).toEqual('My Description');
  });

  it('should be able to update values', async () => {
    await insertContractMetadata(
      UNIVERSAL_PROFILE_1,
      'My Profile',
      'MP',
      'My Description',
      false,
      '0',
    );
    await updateContractSymbol(UNIVERSAL_PROFILE_1, 'P');
    await updateContractDescription(UNIVERSAL_PROFILE_1, 'Description');
    await updateContractSupply(UNIVERSAL_PROFILE_1, '1');
    await updateContractName(UNIVERSAL_PROFILE_1, 'Profile');
    const res = await queryContractMetadata(UNIVERSAL_PROFILE_1);

    expect(res.address).toEqual(UNIVERSAL_PROFILE_1);
    expect(res.name).toEqual('Profile');
    expect(res.symbol).toEqual('P');
    expect(res.description).toEqual('Description');
    expect(res.supply).toEqual('1');
  });
});

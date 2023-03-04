import { clearDB } from '../../helpers/database-helper';
import { UNIVERSAL_PROFILE_1 } from '../../helpers/constants';
import { insertContract } from '../../../lib/db/queries/contract.table';
import { shouldThrow } from '../../helpers/should-throw';
import { insertContractMetadata } from '../../../lib/db/queries/contract-metadata.table';
import { deleteLink, insertLink, queryLinks } from '../../../lib/db/queries/link.table';

describe('Table LinkTable', () => {
  beforeEach(async () => {
    await clearDB();
    await insertContract(UNIVERSAL_PROFILE_1, null);
    await insertContractMetadata(UNIVERSAL_PROFILE_1, '', '', '', false, '0');
  });

  it('should be able to insert values', async () => {
    expect(!(await shouldThrow(insertLink(UNIVERSAL_PROFILE_1, 'creator', 'url')))).toBe(true);
  });

  it('should be able to query values', async () => {
    await insertLink(UNIVERSAL_PROFILE_1, 'creator', 'url');
    const res = await queryLinks(UNIVERSAL_PROFILE_1);

    expect(res[0].title).toEqual('creator');
    expect(res[0].url).toEqual('url');
  });

  it('should be able to delete values', async () => {
    await insertLink(UNIVERSAL_PROFILE_1, 'creator', 'url');
    await deleteLink(UNIVERSAL_PROFILE_1, 'creator', 'url');
    const res = await queryLinks(UNIVERSAL_PROFILE_1);

    expect(res.length).toEqual(0);
  });
});

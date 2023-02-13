import { clearDB } from '../../helpers/database-helper';
import { UNIVERSAL_PROFILE_1 } from '../../helpers/constants';
import { insertContract } from '../../../lib/db/queries/contract.table';
import { shouldThrow } from '../../helpers/should-throw';
import { insertContractMetadata } from '../../../lib/db/queries/contract-metadata.table';
import {
  deleteImage,
  insertImage,
  queryImages,
  queryImagesByType,
} from '../../../lib/db/queries/image.table';

describe('Table ImageTable', () => {
  beforeEach(async () => {
    await clearDB();
    await insertContract(UNIVERSAL_PROFILE_1, null);
    await insertContractMetadata(UNIVERSAL_PROFILE_1, '', '', '', false, '0');
  });

  it('should be able to insert values', async () => {
    expect(!(await shouldThrow(insertImage(UNIVERSAL_PROFILE_1, '', 0, 0, '', '')))).toBe(true);
  });

  it('should be able to query images', async () => {
    await insertImage(UNIVERSAL_PROFILE_1, 'url', 1, 2, 'profile', '');
    const res = await queryImages(UNIVERSAL_PROFILE_1);

    expect(res[0].url).toEqual('url');
    expect(res[0].width).toEqual(1);
    expect(res[0].height).toEqual(2);
    expect(res[0].type).toEqual('profile');
  });

  it('should be able to query images by type', async () => {
    await insertImage(UNIVERSAL_PROFILE_1, 'url', 1, 2, 'background', '');
    await insertImage(UNIVERSAL_PROFILE_1, 'url2', 2, 1, 'profile', '');
    const res = await queryImagesByType(UNIVERSAL_PROFILE_1, 'profile');

    expect(res[0].url).toEqual('url2');
    expect(res[0].width).toEqual(2);
    expect(res[0].height).toEqual(1);
    expect(res[0].type).toEqual('profile');
  });

  it('should be able to delete an image', async () => {
    await insertImage(UNIVERSAL_PROFILE_1, 'url', 1, 2, 'background', '');
    await deleteImage(UNIVERSAL_PROFILE_1, 'url');
    const res = await queryImages(UNIVERSAL_PROFILE_1);

    expect(res.length).toEqual(0);
  });
});

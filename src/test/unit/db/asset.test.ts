import { beforeEach, describe } from 'mocha';
import { assert, expect } from 'chai';

import { clearDB } from '../../helpers/database-helper';
import { UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2 } from '../../helpers/constants';
import { insertContract } from '../../../lib/db/queries/contract.table';
import { shouldThrow } from '../../helpers/should-throw';
import {
  deleteAsset,
  insertAsset,
  queryAssets,
  queryAssetsByType,
} from '../../../lib/db/queries/asset.table';

export const AssetTests = () => {
  describe('Table AssetTable', () => {
    beforeEach(async () => {
      await clearDB();
      await insertContract(UNIVERSAL_PROFILE_1, null);
      await insertContract(UNIVERSAL_PROFILE_2, null);
    });

    it('should be able to insert values', async () => {
      assert(
        !(await shouldThrow(
          insertAsset(
            UNIVERSAL_PROFILE_1,
            'ipfs://123456789',
            'exe',
            '0x8fd18994f98161fbe679d007e2021635b11a6d3225b8528737ec9e8618c57103',
          ),
        )),
      );
    });

    it('should be able to query assets', async () => {
      await insertAsset(
        UNIVERSAL_PROFILE_1,
        'ipfs://123456789',
        'exe',
        '0x8fd18994f98161fbe679d007e2021635b11a6d3225b8528737ec9e8618c57103',
      );
      const res = await queryAssets(UNIVERSAL_PROFILE_1);

      expect(res[0].url).to.be.equal('ipfs://123456789');
      expect(res[0].address).to.be.equal(UNIVERSAL_PROFILE_1);
      expect(res[0].fileType).to.be.equal('exe');
      expect(res[0].hash).to.be.equal(
        '0x8fd18994f98161fbe679d007e2021635b11a6d3225b8528737ec9e8618c57103',
      );
    });

    it('should be able to query assets by type', async () => {
      await insertAsset(
        UNIVERSAL_PROFILE_1,
        'ipfs://123456789',
        'exe',
        '0x8fd18994f98161fbe679d007e2021635b11a6d3225b8528737ec9e8618c57103',
      );
      await insertAsset(
        UNIVERSAL_PROFILE_2,
        'ipfs://987654321',
        'c4d',
        '0x34d23994f98161fbe679d007e2021635b11a6d3225b8528737ec9e8618c57103',
      );
      const res = await queryAssetsByType(UNIVERSAL_PROFILE_1, 'exe');

      expect(res[0].url).to.be.equal('ipfs://123456789');
      expect(res[0].address).to.be.equal(UNIVERSAL_PROFILE_1);
      expect(res[0].fileType).to.be.equal('exe');
      expect(res[0].hash).to.be.equal(
        '0x8fd18994f98161fbe679d007e2021635b11a6d3225b8528737ec9e8618c57103',
      );
    });

    it('should be able to delete an asset', async () => {
      await insertAsset(
        UNIVERSAL_PROFILE_1,
        'ipfs://123456789',
        'exe',
        '0x8fd18994f98161fbe679d007e2021635b11a6d3225b8528737ec9e8618c57103',
      );
      await deleteAsset(UNIVERSAL_PROFILE_1, 'ipfs://123456789');
      const res = await queryAssets(UNIVERSAL_PROFILE_1);

      expect(res.length).to.be.equal(0);
    });
  });
};

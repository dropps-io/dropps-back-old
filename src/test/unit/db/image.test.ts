import {beforeEach, describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {assert, expect} from "chai";
import {UNIVERSAL_PROFILE_1} from "../../helpers/constants";
import {insertContract} from "../../../bin/db/contract.table";
import {shouldThrow} from "../../helpers/should-throw";
import {insertContractMetadata} from "../../../bin/db/contract-metadata.table";
import {deleteImage, insertImage, queryImages, queryImagesByType} from "../../../bin/db/image.table";

export const ImageTests = () => {
  describe('Table Image', () => {

      beforeEach(async () => {
          await clearDB();
          await insertContract(UNIVERSAL_PROFILE_1, null);
          await insertContractMetadata(UNIVERSAL_PROFILE_1, '', '', '', false, '0');
      });

      it ('should be able to insert values', async () => {
          assert(!await shouldThrow(insertImage(UNIVERSAL_PROFILE_1, '', 0, 0, '', '')));
      });

      it ('should be able to query images', async () => {
          await insertImage(UNIVERSAL_PROFILE_1, 'url', 1, 2, 'profile', '');
          const res = await queryImages(UNIVERSAL_PROFILE_1);

          expect(res[0].url).to.be.equal('url');
          expect(res[0].width).to.be.equal(1);
          expect(res[0].height).to.be.equal(2);
          expect(res[0].type).to.be.equal('profile');
      });

      it ('should be able to query images by type', async () => {
          await insertImage(UNIVERSAL_PROFILE_1, 'url', 1, 2, 'background', '');
          await insertImage(UNIVERSAL_PROFILE_1, 'url2', 2, 1, 'profile', '');
          const res = await queryImagesByType(UNIVERSAL_PROFILE_1, 'profile');

          expect(res[0].url).to.be.equal('url2');
          expect(res[0].width).to.be.equal(2);
          expect(res[0].height).to.be.equal(1);
          expect(res[0].type).to.be.equal('profile');
      });

      it ('should be able to delete an image', async () => {
          await insertImage(UNIVERSAL_PROFILE_1, 'url', 1, 2, 'background', '');
          await deleteImage(UNIVERSAL_PROFILE_1, 'url');
          const res = await queryImages(UNIVERSAL_PROFILE_1);

          expect(res.length).to.be.equal(0);
      });
  });
}
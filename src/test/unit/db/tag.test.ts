import {beforeEach, describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {assert, expect} from "chai";
import {UNIVERSAL_PROFILE_1} from "../../helpers/constants";
import {insertContract} from "../../../bin/db/contract.table";
import {shouldThrow} from "../../helpers/should-throw";
import {insertContractMetadata} from "../../../bin/db/contract-metadata.table";
import {deleteTag, insertTag, queryTags} from "../../../bin/db/tag.table";

export const TagTests = () => {
  describe('Table Tag', () => {

      beforeEach(async () => {
          await clearDB();
          await insertContract(UNIVERSAL_PROFILE_1, null);
          await insertContractMetadata(UNIVERSAL_PROFILE_1, '', '', '', false, 0);
      });

      it ('should be able to insert values', async () => {
          assert(!await shouldThrow(insertTag(UNIVERSAL_PROFILE_1, 'creator')));
      });

      it ('should be able to query values', async () => {
          await insertTag(UNIVERSAL_PROFILE_1, 'creator');
          const res = await queryTags(UNIVERSAL_PROFILE_1);

          expect(res[0]).to.be.equal('creator');
      });

      it ('should be able to delete values', async () => {
          await insertTag(UNIVERSAL_PROFILE_1, 'creator');
          await deleteTag(UNIVERSAL_PROFILE_1, 'creator');
          const res = await queryTags(UNIVERSAL_PROFILE_1);

          expect(res.length).to.be.equal(0);
      });
  });
}
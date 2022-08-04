import {beforeEach, describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {assert, expect} from "chai";
import {UNIVERSAL_PROFILE_1} from "../../helpers/constants";
import {insertContract} from "../../../bin/db/contract.table";
import {shouldThrow} from "../../helpers/should-throw";
import {insertContractMetadata} from "../../../bin/db/contract-metadata.table";
import {deleteLink, insertLink, queryLinks} from "../../../bin/db/link.table";

export const LinkTests = () => {
  describe('Table Link', () => {

      beforeEach(async () => {
          await clearDB();
          await insertContract(UNIVERSAL_PROFILE_1, null);
          await insertContractMetadata(UNIVERSAL_PROFILE_1, '', '', '', false, '0');
      });

      it ('should be able to insert values', async () => {
          assert(!await shouldThrow(insertLink(UNIVERSAL_PROFILE_1, 'creator', 'url')));
      });

      it ('should be able to query values', async () => {
          await insertLink(UNIVERSAL_PROFILE_1, 'creator', 'url');
          const res = await queryLinks(UNIVERSAL_PROFILE_1);

          expect(res[0].title).to.be.equal('creator');
          expect(res[0].url).to.be.equal('url');
      });

      it ('should be able to delete values', async () => {
          await insertLink(UNIVERSAL_PROFILE_1, 'creator', 'url');
          await deleteLink(UNIVERSAL_PROFILE_1, 'creator');
          const res = await queryLinks(UNIVERSAL_PROFILE_1);

          expect(res.length).to.be.equal(0);
      });
  });
}
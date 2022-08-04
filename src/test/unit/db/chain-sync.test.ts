import {beforeEach, describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {
    incrementChainSyncFollows,
    incrementChainSyncLikes,
    insertChainSync,
    queryChainSync, resetChainSyncFollows,
    resetChainSyncLikes
} from "../../../bin/db/chain-sync.table";
import {assert, expect} from "chai";
import {UNIVERSAL_PROFILE_1, UNIVERSAL_PROFILE_2} from "../../helpers/constants";
import {insertContract} from "../../../bin/db/contract.table";
import {shouldThrow} from "../../helpers/should-throw";

export const ChainSyncTests = () => {
  describe('Table chain-sync', () => {

      beforeEach(async () => {
          await clearDB();
          await insertContract(UNIVERSAL_PROFILE_1, null);
      });

      it ('should be able to insert values', async () => {
          assert(!await shouldThrow(insertChainSync(UNIVERSAL_PROFILE_1))) ;
      });

      it ('should not be able to insert values if contract does not exist', async () => {
          assert(await shouldThrow(insertChainSync(UNIVERSAL_PROFILE_2))) ;
      });

      it('should be able to query values', async () => {
          await insertChainSync(UNIVERSAL_PROFILE_1);
          const res = await queryChainSync(UNIVERSAL_PROFILE_1);

          expect(res.address).to.be.equal(UNIVERSAL_PROFILE_1);
          expect(res.followChanges).to.be.equal(0);
          expect(res.likeChanges).to.be.equal(0);
      });

      it('should be able to increment likes', async () => {
          await insertChainSync(UNIVERSAL_PROFILE_1);
          await incrementChainSyncLikes(UNIVERSAL_PROFILE_1);
          const res = await queryChainSync(UNIVERSAL_PROFILE_1);

          expect(res.likeChanges).to.be.equal(1);
      });

      it('should be able to reset likes', async () => {
          await insertChainSync(UNIVERSAL_PROFILE_1);
          await incrementChainSyncLikes(UNIVERSAL_PROFILE_1);
          await resetChainSyncLikes(UNIVERSAL_PROFILE_1);
          const res = await queryChainSync(UNIVERSAL_PROFILE_1);

          expect(res.likeChanges).to.be.equal(0);
      });

      it('should be able to increment follows', async () => {
          await insertChainSync(UNIVERSAL_PROFILE_1);
          await incrementChainSyncFollows(UNIVERSAL_PROFILE_1);
          const res = await queryChainSync(UNIVERSAL_PROFILE_1);

          expect(res.followChanges).to.be.equal(1);
      });

      it('should be able to reset follows', async () => {
          await insertChainSync(UNIVERSAL_PROFILE_1);
          await incrementChainSyncFollows(UNIVERSAL_PROFILE_1);
          await resetChainSyncFollows(UNIVERSAL_PROFILE_1);
          const res = await queryChainSync(UNIVERSAL_PROFILE_1);

          expect(res.followChanges).to.be.equal(0);
      });
  });
}